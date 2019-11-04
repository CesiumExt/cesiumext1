/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Main Example to show some functionalities present
* in CesiumExt.
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/

Ext.require([
	'Ext.container.Container',
	'Ext.Viewport',
	'Ext.toolbar.Toolbar',
    'Ext.panel.Panel',
    'Ext.form.Panel',
	'Ext.window.Window',
	'CesiumExt.map.Map',
	'CesiumExt.map.OverviewMap',
	'CesiumExt.data.store.ImageryLayerTreeStore',
	'CesiumExt.data.model.ImageryLayerTreeModel',
	'CesiumExt.format.filter.EqualTo',
	'CesiumExt.format.filter.NotEqualTo',
	'CesiumExt.format.filter.BBox',
	'CesiumExt.format.WFSGetFeature',
	'CesiumExt.tree.plugin.TreeColumnIcon'
]);

var toolbar;
var mapPanel;
var overviewMapPanel;
var descriptionPanel;
var tabPanel;
var mapComponent;
var overviewMapComponent;
var buildingsDataSource;
var addressesDataSource;
var imageryLayerTreeStore;
var previousSelectedBuilding;
var previousSelectedBuildingMaterial;
var previousSelectedAddress;
var previousSelectedAddressColor;
var addressesGridPanel;
var buildingsGridPanel;


Ext.application({
    name: 'Example',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map');
		//create overview panel
		overviewMapComponent = Ext.create('CesiumExt.map.OverviewMap', {
            parentMap: mapComponent
        });
		//start code to be executed once the viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			Cesium.GeoJsonDataSource.clampToGround = true;
			//create initial layer, layer tree store and its grid
			
			viewer.imageryLayers.removeAll();
			imageryLayerTreeStore = Ext.create('CesiumExt.data.store.ImageryLayerTreeStore', {
				cesiumImageryLayerCollection: viewer.imageryLayers
			});
			imageryLayerTreeStore.getRoot().set('expanded', true);
			var treePanel = createImageryLayerTreePanel(imageryLayerTreeStore);
			createBingImageryLayer();
			
			// Create an initial camera view
			var initialPosition = new Cesium.Cartesian3.fromDegrees(4.350906408753716, 50.84736692347859, 2631.082799425431);
			var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
			var homeCameraView = {
				destination : initialPosition,
				orientation : {
					heading : initialOrientation.heading,
					pitch : initialOrientation.pitch,
					roll : initialOrientation.roll
				}
			};
			// Set the initial view
			viewer.scene.camera.setView(homeCameraView);
			
			// Load Cesium World Terrain
			viewer.terrainProvider = Cesium.createWorldTerrain({
				 requestWaterMask : true, // required for water effects
				 //requestVertexNormals : true // required for terrain lighting
			});
			// Enable depth testing so things behind the terrain disappear.
			viewer.scene.globe.depthTestAgainstTerrain = true;
			
			// Enable lighting based on sun/moon positions
			viewer.scene.globe.enableLighting = true;
			//create the datasources to store the entities loaded from WFS
			buildingsDataSource = new Cesium.GeoJsonDataSource('Buildings');
			viewer.dataSources.add(buildingsDataSource);
			addressesDataSource = new Cesium.GeoJsonDataSource('Addresses');
			viewer.dataSources.add(addressesDataSource);
			//create Building and Address Grid Panel
			buildingsGridPanel = createBuildingFeatureGridPanel();
			addressesGridPanel = createAddressFeatureGridPanel();
			
			
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				{
					text : 'WFS GetFeature Request',
					menu : 
					[ 
						{
							text: 'Get Addresses at "Rue du Midi"',
							handler: getAddressesAtMidiStreet
						},
						{
							text: 'Get Buildings by BBox',
							handler: getBuildingsByBbox
						},
					]
				},
				{
					text : 'Belgium WMS Layers',
					menu : 
					[ 
						{
							text : 'Add Belgium WMS Layers',
							handler: createBelgiumWMSImageryLayers
						}
					]
				},
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
            width: 400,
			collapsible: true,
            border: true,
            bodyPadding: 5
        });
		
		overviewMapPanel = Ext.create('Ext.panel.Panel', {
            flex: 1,
            layout: 'fit',
			resizable: true,
            items: overviewMapComponent
        });
		
		var eastPanel = Ext.create('Ext.panel.Panel', {
            region: 'east',
			width: 400,
			border: false,
			resizable: true,
			collapsible: true,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [
				overviewMapPanel,
				descriptionPanel,
            ]
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
                eastPanel,
				tabPanel
            ]
        });
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////

		
		function createBingImageryLayer() {
			var viewer = mapComponent.getViewer();
			var data = {
				name: 'Bing Imagery Layer',
				iconUrl: 'images/imageryProviders/bingAerial.png',
				tooltip: 'Bing Aerial Imagery Layer',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.BingMapsImageryProvider({
						url : 'https://dev.virtualearth.net',
						//please, get your key at https://www.bingmapsportal.com/
						key : 'AtHWMiyTPaBDwL-QVJCZXTenvrg6_bSVMUbdOPQRnvS20WguqV5ON-BRQLfVCKlb', 
						mapStyle : Cesium.BingMapsStyle.AERIAL
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode, imageryLayerTreeStore.getRoot());
		}
		
		function createImageryLayerTreePanel(treeStore) {
			//create the plugin to show the icon in the tree panel
			var iconPlugin = Ext.create('CesiumExt.tree.plugin.TreeColumnIcon');
			var treePanel = Ext.create('Ext.tree.Panel', {
				//title: 'ImageryLayer Tree Example',
				columns: {
					header: false,
					items: [
						{
							xtype: 'treecolumn',
							dataIndex: 'text',
							flex: 1,
							plugins: [
								iconPlugin
							]
						}
					]
				},
				viewConfig: {
					plugins: {ptype: 'treeviewdragdrop'}
				},
				store: treeStore,
				//rootVisible: false,
				flex: 1,
				border: false
			});
			
			eastPanel.add(treePanel).show();
			
			return treePanel;
		}
		
		function createBelgiumWMSImageryLayers() {
			var data;
			var rec;
			var viewer = mapComponent.getViewer()
			var imageryLayers = viewer.imageryLayers;
			
			//create group node to group all the belgium layers
			data = {
				name: 'Belgium WMS Layers',
				checked: 'true',
				tooltip: 'Belgium WMS Layer (PICC, URBIS and GRB)',
			};
			var belgiumGroupNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(belgiumGroupNode, imageryLayerTreeStore.getRoot());
			
			//add URBIS Imagery Layer from WMS related to Brussels/Belgium Region
			data = {
				name: 'URBIS layer for Brussels/Belgium Region',
				iconUrl: 'https://urbisonline.brussels/assets/images/urbisonline-logo.png',
				tooltip: 'URBIS layer for Brussels/Belgium Region through Cesium.WebMapServiceImageryProvider',
				creationFunction: function() {
					var provider = new Cesium.WebMapServiceImageryProvider({
						url : 'https://geoservices-urbis.irisnet.be/geoserver/ows',        
						layers: 'urbisFR',
						parameters : {
							transparent : true,
							tiled: true,
							format : 'image/png'
						}
					});
					return provider;
				}
			};
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode,belgiumGroupNode);
			
			//add PICC Imagery Layer from WMS related to Brussels/Belgium Region
			data = {
				name: 'PICC layer for Wallon/Belgium Region',
				iconUrl: 'http://geoportail.wallonie.be/modules/templates-geoportail/img/icons/rooster-red.png',
				tooltip: 'PICC layer for Wallon/Belgium Region through Cesium.WebMapServiceImageryProvider',
				creationFunction: function() {
					var provider = new Cesium.WebMapServiceImageryProvider({
						url : 'https://geoservices.wallonie.be/arcgis/services/TOPOGRAPHIE/PICC_VDIFF/MapServer/WMSServer',        
						layers: '1,3,4,5,7,9,10,11,12,14,15,16,17,19,20,21,23,24,25,26,27,28,29',
						parameters : {
							transparent : true,
							format : 'image/png'
						}
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode,belgiumGroupNode);
			
			//add GRB Imagery Layer from WMS related to Flemish Belgium Region
			data = {
				name: 'GRB layer for Flemish/Belgium Region',
				iconUrl: 'https://ui.vlaanderen.be/3.latest/icons/app-icon/touch-icon-iphone-precomposed.png',
				tooltip: 'GRB layer for Flemish/Belgium Region through Cesium.WebMapServiceImageryProvider',
				creationFunction: function() {
					var provider = new Cesium.WebMapServiceImageryProvider({
						url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB-selectie/wms',        
						layers: 'GRB_BSK',
						parameters : {
							transparent : true,
							tiled: true,
							format : 'image/png'
						}
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode,belgiumGroupNode);
		}
		
		function getAddressesAtMidiStreet() {
			var viewer = mapComponent.getViewer();
			
			//create filter to retrieve addresses at street 'Rue du Midi'
			var filter1 = Ext.create('CesiumExt.format.filter.EqualTo', {
				propertyName: 'PN_NAME_FRE',
				expression: 'Rue du Midi'
			});
			//create filter to retrieve addresses at postal code 1000
			var filter2 = Ext.create('CesiumExt.format.filter.EqualTo', {
				propertyName: 'PZ_NATIONAL_CODE',
				expression: '1000'
			});
			//create filter to retrieve address at Brussels municipality (bruxelles in french)
			var filter3= Ext.create('CesiumExt.format.filter.EqualTo', {
				propertyName: 'MU_NAME_FRE',
				expression: 'Bruxelles'
			});
			//create the final "AND" filter to retrieve addresses at street = 'Rue du Midi' AND
			//postal code = 1000 AND municipality = bruxelles
			var filter = Ext.create('CesiumExt.format.filter.And', {
				conditions: [filter1, filter2, filter3]
			});
			//build WFS GetFeature Request
			var wfsGetFeature = Ext.create('CesiumExt.format.WFSGetFeature', {
				url: 'https://geoservices-urbis.irisnet.be/geoserver/ows',
				featurePrefix: 'UrbisAdm',
				typeNames: ['Adpt'],
				filter: filter,
				maxFeatures: 1000
			});
			//get the url with parameters
			var url = wfsGetFeature.writeURL();
			console.log(url);
			//set options
			var geojsonOptions = {
				 clampToGround : true,
			};
			//clean the addresses, if already loaded 
			addressesDataSource.entities.removeAll();
			var name = addressesDataSource.name;
			//send a wfs GetFeature Request to load the buildings
			var promise = addressesDataSource.load(url, geojsonOptions);
			promise.then(function(dataSource) {
				//zoom to entities
				viewer.zoomTo(dataSource.entities);
				var entities = dataSource.entities.values;
				//set the house number as text label for each address
				for (var i = 0; i < entities.length; i++) {
					var address = entities[i];
					address.label = new Cesium.LabelGraphics({
						text: address.properties.ADPT_ADRN,
						font: '12px sans-serif',
						heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
						disableDepthTestDistance: Number.POSITIVE_INFINITY
					});
				}
				dataSource.name = name;
				//automatically activate addresses grid panel
				tabPanel.setActiveTab(addressesGridPanel);
			}).otherwise(function(error){
				// handle error
			});
			
		}
		
		//retrieves the Building by the BBOX provided by user
		function getBuildingsByBbox() {
			//get Cesium Viewer
			var viewer = mapComponent.getViewer();
			//retrieve Bbox throug user input
			var getRectangleInteraction = Ext.create('CesiumExt.interaction.GetRectangleInteraction',
			{
				viewer: viewer
			});
			//call callback to load the buildings by WFS GetFeature request
			getRectangleInteraction.on('drawend', getBuildingsByBboxHandler);
			
			function getBuildingsByBboxHandler(rectangle) {
				//create wfs get feature
				var wfsGetFeature = Ext.create('CesiumExt.format.WFSGetFeature', {
					url: 'https://geoservices-urbis.irisnet.be/geoserver/ows',
					bbox: rectangle,
					geometryName: 'GEOM',
					featurePrefix: 'UrbisAdm',
					typeNames: ['Bu'],
					maxFeatures: 1000
				});
				//get the url for WFS GetFeature request
				var url = wfsGetFeature.writeURL();
				console.log(url);
				//set options
				var geojsonOptions = {
					 clampToGround : true,
				};
				//clean the buildings, if already loaded 
				buildingsDataSource.entities.removeAll();
				var name = buildingsDataSource.name;
				//send a wfs GetFeature Request to load the buildings
				var promise = buildingsDataSource.load(url, geojsonOptions);
				promise.then(function(dataSource) {
					var entities = dataSource.entities.values;
					for (var i = 0; i < entities.length; i++) {
						var building = entities[i];
						//building.polygon.outlineColor = Cesium.Color.RED;
						building.polygon.outline = false;
						building.polygon.material = Cesium.Color.fromRandom({
							red : 0.1,
							maximumGreen : 0.5,
							minimumBlue : 0.5,
							alpha : 1.0
						});
						building.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
						//we are generating some random value for the building height. If the building layer had the height
						//attribute, we could use it to generate the correct height.
						var height = Math.floor(Math.random() * 100)/5.0
						if(height < 3) height = 3.0
						building.polygon.extrudedHeight = height;
					}
					dataSource.name = name;
					//automatically activate buildings grid panel
					tabPanel.setActiveTab(buildingsGridPanel);
				}).otherwise(function(error){
					// handle error
				});   
			}
		}
		
		//create the building grid panel
		function createBuildingFeatureGridPanel() {
			//retrieve the entities from the building datasource
			var entities = buildingsDataSource.entities
			//create store
			var entityStore = Ext.create('CesiumExt.data.store.EntityStore', {
				cesiumEntityCollection: entities
			});
			
			var entityGridPanel = Ext.create('Ext.grid.Panel', {
				title: 'Building Feature Grid Panel',
				border: true,
				region: 'center',
				store: entityStore,
				columns: [
					{
						text: 'BU_ID', 
						dataIndex: 'BU_ID', 
						sortable:true,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'BU_CATEGORY', 
						dataIndex: 'BU_CATEGORY', 
						sortable:true,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'BU_STATUS', 
						dataIndex: 'BU_STATUS', 
						sortable:true,
						flex:1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'BU_CAPAKEY', 
						dataIndex: 'BU_CAPAKEY', 
						sortable:true,
						flex: 3,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'BU_INSPIRE_ID', 
						dataIndex: 'BU_INSPIRE_ID', 
						sortable:true,
						flex: 4,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
				],
				listeners: {
					'selectionchange': function(grid, selected) {
						//unhighlight previous selected
						if(previousSelectedBuilding) {
							previousSelectedBuilding.polygon.material = previousSelectedBuildingMaterial;
						}
						
						//highlight selected
						Ext.each(selected, function(rec) {
							previousSelectedBuilding = rec.getCesiumEntity();
							previousSelectedBuildingMaterial = rec.getCesiumEntity().polygon.material;
							rec.getCesiumEntity().polygon.material = Cesium.Color.RED;
						});
					}
				},
					
				selModel: 'rowmodel',
				plugins: 
				[
					'gridfilters'
				],

				tbar:[
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
					{
						itemId: 'Clear All',
						text: 'Clear',
						 handler: function() {
							buildingsDataSource.entities.removeAll();
						},
					},
				]
			});
			tabPanel.setCollapsed(false);
			tabPanel.add(entityGridPanel).show();
			tabPanel.setActiveTab(entityGridPanel);
			return entityGridPanel;
		}
		
		function createAddressFeatureGridPanel() {
			//retrieve the entities from the address datasource
			var entities = addressesDataSource.entities;
			//create store
			var entityStore = Ext.create('CesiumExt.data.store.EntityStore', {
				cesiumEntityCollection: entities
			});
			
			var entityGridPanel = Ext.create('Ext.grid.Panel', {
				title: 'Address Feature Grid Panel',
				border: true,
				region: 'center',
				store: entityStore,
				columns: [
					{
						text: 'ADPT_ID', 
						dataIndex: 'ADPT_ID', 
						sortable:true,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'ADPT_ADRN', 
						dataIndex: 'ADPT_ADRN', 
						sortable:true,
						flex: 2,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'PN_NAME_FRE', 
						dataIndex: 'PN_NAME_FRE', 
						sortable:true,
						flex:4,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'MU_NAME_FRE', 
						dataIndex: 'MU_NAME_FRE', 
						sortable:true,
						flex: 4,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'PZ_NATIONAL_CODE', 
						dataIndex: 'PZ_NATIONAL_CODE', 
						sortable:true,
						flex: 3,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'ADPT_INSPIRE_ID', 
						dataIndex: 'ADPT_INSPIRE_ID', 
						sortable:true,
						flex: 5,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
				],
				listeners: {
					'selectionchange': function(grid, selected) {
						//unhighlight previous selected
						if(previousSelectedAddress) {
							previousSelectedAddress.billboard.color = previousSelectedAddressColor;
						}
						
						//highlight selected
						Ext.each(selected, function(rec) {
							previousSelectedAddress = rec.getCesiumEntity();
							previousSelectedAddressColor = rec.getCesiumEntity().billboard.color;
							rec.getCesiumEntity().billboard.color = Cesium.Color.RED;
						});
					}
				},
					
				selModel: 'rowmodel',
				plugins: 
				[
					'gridfilters'
				],

				tbar:[
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
					{
						itemId: 'Clear All',
						text: 'Clear',
						 handler: function() {
							addressesDataSource.entities.removeAll();
						},
					},
				]
			});
			tabPanel.setCollapsed(false);
			tabPanel.add(entityGridPanel).show();
			tabPanel.setActiveTab(entityGridPanel);
			return entityGridPanel;
		}
		
		
		//create datasource grid panel
		function createDataSourceGridPanel() {
			//retrieve cesium DataSourceCollection from viewer
			var dataSources = mapComponent.getViewer().dataSources;
			//create store
			var dataSourceStore = Ext.create('CesiumExt.data.store.DataSourceStore', {
				cesiumDataSourceCollection: dataSources
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
		//
    }
});
