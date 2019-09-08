/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Sample to show how to use 'CesiumExt.data.store.EntityStore
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/

Ext.require([
	'Ext.container.Container',
	'Ext.Viewport',
    'Ext.panel.Panel',
    'Ext.grid.Panel',
	'Ext.grid.plugin.RowEditing',
	'CesiumExt.map.Map',
	'CesiumExt.data.store.EntityStore',
	'CesiumExt.data.model.EntityModel'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var mapComponent;
var tabPanel;
var idxEntities = 0;

Ext.application({
    name: 'Entity Store',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map');
		//as the are retrieved from cesium viewer, the entity panel will
		//be created after the viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			//get the entity collection from the default datasource viewer
			var entities = viewer.entities;
			//create grid panel
			createEntityGridPanel();
			
			//create two entities
			createNewEntity();
			createNewEntity();
			//zoom to entities
			viewer.zoomTo(entities);
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				{
					text : 'Open',
					menu : 
					[ 
						{
							text : 'Entity Panel',
							handler: createEntityGridPanel
						}
					]
				},
				{
					text : 'Entity',
					menu : 
					[ 
						{
							text : 'Add New Entity',
							handler: createNewEntity
						},
						{
							text : 'Update Name in the Last Entity',
							handler: updateLastEntityName,
						},
						{
							text : 'Remove Last Entity',
							handler: removeLastEntity
						},
						{
							text : 'Remove ALL Entities',
							handler: removeAllEntities,
						},
					]
				},
			]
		});
		
        mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'fit',
            items: [mapComponent]
        });

        descriptionPanel = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
			collapsible: true,
            border: true,
            bodyPadding: 5
        });
		
		tabPanel = Ext.create('Ext.tab.Panel', {
			bodyPadding: 5,
			tabPosition: 'bottom',
			height: 250,
			resizable: true,
			collapsible: true,
			region: 'south',
			items: []
		});

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
				toolbar,
                mapPanel,
                descriptionPanel,
				tabPanel
            ]
        });
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////
		
		function createNewEllipse() {
			//compute new longitude
			var longitude = -100 + (-5 * idxEntities);
			//create new entity
			var entity = new Cesium.Entity({
			  position: Cesium.Cartesian3.fromDegrees(longitude, 40.0),
			  ellipse : {
				semiMinorAxis : 250000.0,
				semiMajorAxis : 400000.0,
				material : Cesium.Color.RED.withAlpha(0.5)
			  }
			});
			entity.properties = new Cesium.PropertyBag({name: 'entity_' + idxEntities, owner:'Paulo Aragao'});
			idxEntities = idxEntities + 1;
			//add newly created entity in the viewer entity collection
			var entities = mapComponent.getViewer().entities;
			entities.add(entity);
			
			return entity;
		}
		
		function createNewEntity() {
			//compute new longitude
			var longitude = -100 + (-10 * idxEntities);
			//create new entity
			var entity = new Cesium.Entity({
				position: Cesium.Cartesian3.fromDegrees(longitude, 40.0),
				box : {
					dimensions : new Cesium.Cartesian3(400000.0, 300000.0, (500000.0 + 100000 * idxEntities )),
					material : Cesium.Color.RED.withAlpha(0.5),
					outline: true,
					outlineWidth: 5,
					zIndex: 0,
					
				}
			});
			entity.properties = new Cesium.PropertyBag({name: 'entity_' + idxEntities, owner:'Paulo Aragao'});
			idxEntities = idxEntities + 1;
			//add newly created entity in the viewer entity collection
			var entities = mapComponent.getViewer().entities;
			entities.add(entity);
			
			return entity;
		}
		
		function updateLastEntityName() {
			Ext.Msg.prompt('Change First DataSource Name', 'Please enter the new dataSource name:', function(btn, text) {
				if(btn === 'ok') {
					var dataSources = mapComponent.getViewer().dataSources;
					if(dataSources && dataSources.length > 0) {
						var dataSource = dataSources.get(dataSources.length -1);
						dataSource.name = text;
					}
				}
			});
		}
		
		function removeLastEntity() {
			var dataSources = mapComponent.getViewer().dataSources;
			if(dataSources && dataSources.length > 0) {
				var dataSource = dataSources.get(dataSources.length -1);
				dataSources.remove(dataSource, true);
			}
		}
		
		function removeAllEntities() {
			var entities =  mapComponent.getViewer().entities;
			entities.removeAll();
		}
		
		
		function createEntityGridPanel() {
			//retrieve the default entity collection from viewer
			var entities =  mapComponent.getViewer().entities;
			//create store
			var entityStore = Ext.create('CesiumExt.data.store.EntityStore', {
				cesiumEntityCollection: entities
			});
			//create plugin for row editing
			/*
			var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
				clicksToMoveEditor: 1,
				clicksToEdit: 2,
				autoCancel: false
			})
			*/
			var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
				//clicksToMoveEditor: 1,
				clicksToEdit: 2,
				//autoCancel: false
			})
			
			var entityGridPanel = Ext.create('Ext.grid.Panel', {
				title: 'Entity Grid Panel',
				border: true,
				closable: true,
				region: 'center',
				store: entityStore,
				columns: [
					{
						text: 'Name', 
						dataIndex: 'name', 
						sortable:true,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Owner', 
						dataIndex: 'owner', 
						sortable:true,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
				],
				listeners: {
					'selectionchange': function(grid, selected) {
						entityStore.each(function(rec) {
							rec.getCesiumEntity().box.material = Cesium.Color.RED.withAlpha(0.5);
							rec.getCesiumEntity().box.zIndex = 0;
						});
						//highlight selected
						Ext.each(selected, function(rec) {
							rec.getCesiumEntity().box.material = Cesium.Color.CYAN;
							rec.getCesiumEntity().box.zIndex = 100;
						});
					}
				},
					
					
					
					
				selModel: 'rowmodel',
				plugins: 
				[
					//rowEditing,
					cellEditing,
					'gridfilters'
				],

				tbar:[
				{
					text: 'Add Entity',
					handler: createNewEntity
				},
				{
					itemId: 'ZoomBtn',
					text: 'Zoom',
					 handler: function() {
						var sm = entityGridPanel.getSelectionModel();
						var record = sm.getSelection()[0];
						if(record) {
							var entity = record.getCesiumEntity();
							mapComponent.getViewer().zoomTo(entity);
						}
					},
				},
				
				/*
				{
					text:'Submit Changes',
					handler:function(){
						this.up('grid').getStore().sync()
					}
				}*/
				]
			});
			
			
			entityGridPanel.on('validateedit', function (editor, context) {
				
				/*
				var entity = context.record.getCesiumEntity();
				var properties = entity.properties;
				properties.addProperty('name',  context.newValues.name);
				properties.addProperty('owner',  context.newValues.owner);
				*/
				
				var newValue = context.value;
				var field = context.field;
				if(field === 'name' && newValue.length > 10) {
					context.cancel = true;
					Ext.Msg.alert('Alert', 'string has length > 10', Ext.emptyFn);
					return false;
				}
 
				var entity = context.record.getCesiumEntity();
				var properties = entity.properties;
				properties.addProperty(field,  newValue);
				return true;
				
			});
			
			tabPanel.setCollapsed(false);
			tabPanel.add(entityGridPanel).show();
			tabPanel.setActiveTab(entityGridPanel);
		}
    }
});
