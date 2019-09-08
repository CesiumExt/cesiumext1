/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Sample to show how to use 'CesiumExt.data.store.DataSourceStore
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
	'CesiumExt.data.store.DataSourceStore',
	'CesiumExt.data.model.DataSourceModel'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var mapComponent;
var tabPanel;

Ext.application({
    name: 'MapComponent',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map');
		//as the datasources are retrieved from cesium viewer, the datasource panel will
		//be created after the viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			//create 2 datasources and add to the cesium viewer
			var dataSource1 = new Cesium.CustomDataSource('dataSource_1');
			var dataSource2 = new Cesium.CustomDataSource('dataSource_2');
			viewer.dataSources.add(dataSource1);
			viewer.dataSources.add(dataSource2);
			//create grid panel
			createDataSourceGridPanel();
			
			//create two entities
			var entity1 = new Cesium.Entity({
			  position: Cesium.Cartesian3.fromDegrees(-103.0, 40.0),
			  ellipse : {
				semiMinorAxis : 250000.0,
				semiMajorAxis : 400000.0,
				material : Cesium.Color.BLUE
			  }
			});
			
			var entity2 = new Cesium.Entity({
			  position: Cesium.Cartesian3.fromDegrees(-104.0, 41.0),
			  ellipse : {
				semiMinorAxis : 250000.0,
				semiMajorAxis : 400000.0,
				material : Cesium.Color.RED
			  }
			});
			//add each entity in one datasource
			dataSource1.entities.add(entity1);
			dataSource2.entities.add(entity2);
			//zoom to entities on dataSource1
			viewer.zoomTo(dataSource1.entities);
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
							text : 'DataSource Panel',
							handler: createDataSourceGridPanel
						}
					]
				},
				{
					text : 'DataSource',
					menu : 
					[ 
						{
							text : 'Add New DataSource',
							handler: createNewDataSource
						},
						{
							text : 'Update Name in the Last DataSource',
							handler: updateLastDataSourceName,
						},
						{
							text : 'Remove Last DataSource',
							handler: removeLastDataSource
						},
						{
							text : 'Remove ALL DataSources',
							handler: removeAllDataSources,
						},
						'-',
						{
							text : 'Move Last DataSource TO Bottom',
							handler: moveDataSourceToBottom,
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
			//title: 'Tab Panel',
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
		
		function createNewDataSource() {
			Ext.Msg.prompt('DataSource Name', 'Please enter dataSource name:', function(btn, text) {
				if(btn === 'ok') {
					var datasourceName = text;
					//retrieve cesium DataSourceCollection from viewer
					var dataSources = mapComponent.getViewer().dataSources;
					//create a new custom Cesium DataSource
					var dataSource = new Cesium.CustomDataSource(datasourceName);
					//add new Cesium DataSource to DataSourceCollection
					dataSources.add(dataSource);
				}
			});
		}
		
		function updateLastDataSourceName() {
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
		
		function removeLastDataSource() {
			var dataSources = mapComponent.getViewer().dataSources;
			if(dataSources && dataSources.length > 0) {
				var dataSource = dataSources.get(dataSources.length -1);
				dataSources.remove(dataSource, true);
			}
		}
		
		function removeAllDataSources() {
			var dataSources = mapComponent.getViewer().dataSources;
			if(dataSources)
				dataSources.removeAll(true);
		}
		
		function moveDataSourceToBottom() {
			var dataSources = mapComponent.getViewer().dataSources;
			if(dataSources) {
				var dataSource = dataSources.get(dataSources.length - 1);
				dataSources.lowerToBottom(dataSource);
			}
		}
		
		function createDataSourceGridPanel() {
			//retrieve cesium DataSourceCollection from viewer
			var dataSources = mapComponent.getViewer().dataSources;
			//create store
			var dataSourceStore = Ext.create('CesiumExt.data.store.DataSourceStore', {
				cesiumMap: mapComponent
			});
			//create plugin for row editing
			var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
				clicksToMoveEditor: 1,
				clicksToEdit: 2,
				autoCancel: false
			})
			
			var dataSourceGridPanel = Ext.create('Ext.grid.Panel', {
				title: 'DataSource Grid Panel',
				border: true,
				closable: true,
				region: 'center',
				store: dataSourceStore,
				columns: [
					{
						text: 'Name', 
						dataIndex: 'name', 
						sortable:false,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Show',
						dataIndex: 'show',
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'combobox',
							store: [true, false ],
							allowBlank: false
						}
					}
				],
				selModel: 'rowmodel',
				plugins: 
				[
					rowEditing,
					'gridfilters'
				],

				tbar:[
				{
					text: 'Add DataSource',
					handler: function() {
						var rec = Ext.create('CesiumExt.data.model.DataSourceModel');
						rec.setCesiumDataSource(new Cesium.CustomDataSource('unnamed'));
						//this.up('grid').store.insert(0, rec);
						this.up('grid').store.insert(dataSourceGridPanel.store.getCount(), rec);
						this.up('grid').findPlugin('rowediting').startEdit(rec);
					}
				},
				'-',
				{
					text: '▲',
					handler: function() {
						var dataSources = dataSourceGridPanel.store.getCesiumDataSourceCollection();
						var sm = dataSourceGridPanel.getSelectionModel();
						var record = sm.getSelection()[0];
						if(record) {
							var dataSource = record.getCesiumDataSource();
							dataSources.lower(dataSource);
						}
					}
				},
				{
					text: '▼',
					handler: function() {
						var dataSources = dataSourceGridPanel.store.getCesiumDataSourceCollection();
						var sm = dataSourceGridPanel.getSelectionModel();
						var record = sm.getSelection()[0];
						if(record) {
							var dataSource = record.getCesiumDataSource();
							dataSources.raise(dataSource);
						}
					}
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
			dataSourceGridPanel.on('validateedit', function (editor, context) {
				var dataSource = context.record.getCesiumDataSource();
				dataSource.name = context.newValues.name;
				dataSource.show = context.newValues.show;
			});
			tabPanel.setCollapsed(false);
			tabPanel.add(dataSourceGridPanel).show();
			tabPanel.setActiveTab(dataSourceGridPanel);
		}
    }
});
