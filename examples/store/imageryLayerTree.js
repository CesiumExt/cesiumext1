/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Sample to show how to use 'CesiumExt.data.store.ImageryLayerStore
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/

Ext.require([
	'Ext.container.Container',
	'Ext.Viewport',
    'Ext.panel.Panel',
    'Ext.grid.Panel',
	'Ext.tree.Panel',
	'Ext.grid.plugin.RowEditing',
	'CesiumExt.map.Map',
	'CesiumExt.data.model.GroupTreeModel',
	'CesiumExt.data.store.ImageryLayerTreeStore',
	'CesiumExt.data.model.ImageryLayerTreeModel'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var eastPanel;
var mapComponent;
var tabPanel;
var imageryLayerTreeStore;

Ext.application({
    name: 'ImageryLayer',
    launch: function() {
		//create  CesiumExt.map.Map map component
		//mapComponent = Ext.create('CesiumExt.map.Map');
		mapComponent = Ext.create('CesiumExt.map.Map', {
			viewerConfig: {
				infoBox: false,
				//selectionIndicator: false,
				//baseLayerPicker: false
			}
		});
		//as the imageryLayers are retrieved from cesium viewer, the imageryLayer panel will
		//be created after the viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			var imageryLayers = viewer.imageryLayers;
			imageryLayers.removeAll();
			//create initial Group Tree model to store all the imagery layers
			var imageryLayerGroupTreeModel = Ext.create('CesiumExt.data.model.GroupTreeModel', {
				name: 'Imagery Layers',
			});
			//create tree store
			imageryLayerTreeStore = Ext.create('CesiumExt.data.store.ImageryLayerTreeStore', {
				imageryLayerTreeModel: imageryLayerGroupTreeModel,
				cesiumImageryLayerCollection: imageryLayers
			});
			//create tree panel
			var treePanel = createImageryLayerTreePanel(imageryLayerTreeStore);
			
			//create grid panel
			//createImageryLayerGridPanel();
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				/*
				{
					text : 'Open',
					menu : 
					[ 
						{
							text : 'ImageryLayers',
							handler: createImageryLayerGridPanel
						}
					]
				},
				*/
				{
					text : 'ImageryLayer',
					menu : 
					[ 
						{
							text : 'Add New ArcGIS MapServer Imagery Layer',
							handler: createArcGisMapServerImageryLayer
						},
						{
							text : 'Add New OpenStreet Map Imagery Layer',
							handler: createOpenStreetMapImageryLayer
						},
						{
							text : 'Add New Tile MapService Imagery Layer',
							handler: createTileMapServiceImageryLayer
						},
						{
							text : 'Add New GoogleEarth Enterprise Imagery Layer',
							handler: createGoogleEarthEnterpriseImageryLayer
						},
						{
							text : 'Add New GoogleEarth Enterprise Maps Imagery Layer',
							handler: createGoogleEarthEnterpriseMapsImageryLayer
						},
						{
							text : 'Add New Mapbox Streets Imagery Layer',
							handler: createMapboxImageryLayer
						},
						{
							text : 'Add New Mapbox Style Imagery Layer',
							handler: createMapboxStyleImageryLayer
						},
						{
							text : 'Add Belgium WMS Imagery Layers (PICC, URBIS, GRB)',
							handler: createBelgiumWMSImageryLayers
						},
						{
							text : 'Add Web MapTile Service Imagery Layer (USGS shaded relief tiles)',
							handler: createWebMapTileServiceImageryLayer
						},
						'-',
						{
							text : 'Remove Last ImageryLayer',
							handler: removeLastImageryLayer
						},
						{
							text : 'Remove ALL ImageryLayers',
							handler: removeAllImageryLayers,
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
			flex: 1,
            border: false,
            bodyPadding: 5,
            autoScroll: true
        });
		
		eastPanel = Ext.create('Ext.panel.Panel', {
			xtype: 'panel',
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
				descriptionPanel,
			]
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
                eastPanel,
				tabPanel
            ]
        });
		
	
		function createArcGisMapServerImageryLayer() {
			var viewer = mapComponent.getViewer();
			var data = {
				name: 'ArcGIS World Imagery',
				//data.iconUrl = '',
				tooltip: 'REST Service for ArcGIS World Imagery',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.ArcGisMapServerImageryProvider({
						url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			///imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
			imageryLayerTreeStore.addNode(treeNode, imageryLayerTreeStore.getRoot());
			
		}
		
		function createBelgiumWMSImageryLayers() {
			var data;
			var rec;
			var viewer = mapComponent.getViewer()
			var imageryLayers = viewer.imageryLayers;
			
			//add URBIS Imagery Layer from WMS related to Brussels/Belgium Region
			data = {
				name: 'URBIS layer for Brussels/Belgium Region',
				//data.iconUrl = '',
				tooltip: 'URBIS layer for Brussels/Belgium Region through Cesium.WebMapServiceImageryProvider',
				//imageryLayers: viewer.imageryLayers,
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
			
			rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
			
			//add PICC Imagery Layer from WMS related to Brussels/Belgium Region
			data = {
				name: 'PICC layer for Wallon/Belgium Region',
				//data.iconUrl = '',
				tooltip: 'PICC layer for Wallon/Belgium Region through Cesium.WebMapServiceImageryProvider',
				//imageryLayers: viewer.imageryLayers,
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
			
			rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
			
			
			
			//add GRB Imagery Layer from WMS related to Flemish Belgium Region
			data = {
				name: 'GRB layer for Flemish/Belgium Region',
				//data.iconUrl = '',
				tooltip: 'GRB layer for Flemish/Belgium Region through Cesium.WebMapServiceImageryProvider',
				//imageryLayers: viewer.imageryLayers,
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
			
			rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
			
			//add CRAB Address Imagery Layer from WMS related to Flemish Belgium Region
			data = {
				name: 'CRAB Address layer for Flemish/Belgium Region',
				//data.iconUrl = '',
				tooltip: 'CRAB Address layer for Flemish/Belgium Region through Cesium.WebMapServiceImageryProvider',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.WebMapServiceImageryProvider({
						url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adressen/wms',        
						layers: 'Adrespos',
						parameters : {
							transparent : true,
							format : 'image/png'
						}
					});
					return provider;
				}
			};
			
			rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
			
			//Zoom to Belgium
			viewer.camera.flyTo({
				destination : Cesium.Cartesian3.fromDegrees(4.35, 50.84, 500000)
			});
			
			
		}
		
		
		function createOpenStreetMapImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			var data = {
				name: 'OpenStreetMap',
				//data.iconUrl = '',
				tooltip: 'OpenStreetMap Imagery',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = Cesium.createOpenStreetMapImageryProvider({
						url : 'https://a.tile.openstreetmap.org/'
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createTileMapServiceImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			var data = {
				name: 'Cesium Logo',
				//data.iconUrl = '',
				tooltip: 'Tile MapService Imagery for Cesium Logo',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider =Cesium.createTileMapServiceImageryProvider({
					   url: '../images/cesium_maptiler/Cesium_Logo_Color',
					   fileExtension: 'png',
					   maximumLevel: 4,
					   rectangle: new Cesium.Rectangle(
						   Cesium.Math.toRadians(-120.0),
						   Cesium.Math.toRadians(20.0),
						   Cesium.Math.toRadians(-60.0),
						   Cesium.Math.toRadians(40.0))
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createGoogleEarthEnterpriseImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			var data = {
				name: 'GoogleEarth Enterprise Imagery',
				//data.iconUrl = '',
				tooltip: 'GoogleEarth Enterprise Imagery Layer',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var metadata = new Cesium.GoogleEarthEnterpriseMetadata('http://www.earthenterprise.org/3d');
					var provider = new Cesium.GoogleEarthEnterpriseImageryProvider({
						metadata : metadata
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createGoogleEarthEnterpriseMapsImageryLayer() {
			var viewer = mapComponent.getViewer();
			
			//Add layer
			var data = {
				name: 'GoogleEarth Enterprise Maps',
				//data.iconUrl = '',
				tooltip: 'GoogleEarth Enterprise Maps Layer',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.GoogleEarthEnterpriseMapsProvider({
						url : 'https://earth.localdomain',
						channel : 1008
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createMapboxImageryLayer() {
			var viewer = mapComponent.getViewer();
			
			//Add layer
			var data = {
				name: 'MapBox Streets',
				//data.iconUrl = '',
				tooltip: 'MapBox Streets through Cesium.MapboxImageryProvider',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.MapboxImageryProvider({
						mapId: 'mapbox.streets',
						//remark: create your own token in the mapbox web page
						accessToken: 'pk.eyJ1IjoiY2VzaXVtZXh0IiwiYSI6ImNrMDZza3BzaDNibGozbnBrdmlxamU1c3EifQ.z-Vii2yB3-6nSSFVvaodNA'
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createMapboxStyleImageryLayer() {
			var viewer = mapComponent.getViewer();
		
			//Add layer
			var data = {
				name: 'MapBox Streets-v11',
				//data.iconUrl = '',
				tooltip: 'MapBox Streets-v11 through Cesium.MapboxStyleImageryProvider',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.MapboxStyleImageryProvider({
						styleId: 'streets-v11',
						//remark: create your own token in the mapbox web page
						accessToken: 'pk.eyJ1IjoiY2VzaXVtZXh0IiwiYSI6ImNrMDZza3BzaDNibGozbnBrdmlxamU1c3EifQ.z-Vii2yB3-6nSSFVvaodNA'
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		function createWebMapTileServiceImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			// USGS shaded relief tiles (KVP)
			var data = {
				name: 'USGS Shaded Relief',
				//data.iconUrl = '',
				tooltip: 'USGS Shaded Relief through Cesium.WebMapTileServiceImageryProvider',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.WebMapTileServiceImageryProvider({
						url : 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS',
						layer : 'USGSShadedReliefOnly',
						style : 'default',
						format : 'image/jpeg',
						tileMatrixSetID : 'default028mm',
						// tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
						maximumLevel: 19,
						credit : new Cesium.Credit('U. S. Geological Survey')
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.insert(imageryLayerTreeStore.getCount(), rec);
		}
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////
		
		
		function removeLastImageryLayer() {
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			if(imageryLayers && imageryLayers.length > 0) {
				var imageryLayer = imageryLayers.get(imageryLayers.length -1);
				imageryLayers.remove(imageryLayer, true);
			}
		}
		
		function removeAllImageryLayers() {
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			if(imageryLayers)
				imageryLayers.removeAll(true);
		}
		
		function createImageryLayerTreePanel(treeStore) {
			
			 var treePanel = Ext.create('Ext.tree.Panel', {
				title: 'Tree Example',
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
		
		
		function createImageryLayerGridPanel() {
			var viewer = mapComponent.getViewer();
			//retrieve cesium ImageryLayerCollection from viewer
			var imageryLayers = viewer.imageryLayers;
			/*
			//create store
			imageryLayerTreeStore = Ext.create('CesiumExt.data.store.ImageryLayerStore', {
				cesiumImageryLayerCollection: imageryLayers
			});
			*/
			//create plugin for row editing
			var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
				clicksToMoveEditor: 1,
				clicksToEdit: 2,
				autoCancel: false
			})
			
			var imageryLayerGridPanel = Ext.create('Ext.grid.Panel', {
				title: 'ImageryLayers',
				border: true,
				closable: true,
				region: 'center',
				store: imageryLayerTreeStore,
				columns: [
					{
						text: 'Name', 
						dataIndex: 'name', 
						sortable:false,
						flex: 4,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						},
						//to show tooltip
						renderer: function(val, meta, rec, rowIndex, colIndex, store) {
							 //meta.tdAttr = 'data-qtip="' + val + '"';
							 meta.tdAttr = 'data-qtip="' + rec.data.tooltip + '"';
							 return val;
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
					},
					{
						text: 'Alpha', 
						dataIndex: 'alpha', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Brightness', 
						dataIndex: 'brightness', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Contrast', 
						dataIndex: 'contrast', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Hue', 
						dataIndex: 'hue', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Saturation', 
						dataIndex: 'saturation', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
					{
						text: 'Gamma', 
						dataIndex: 'gamma', 
						sortable:false,
						flex: 1,
						editor: {
							xtype: 'textfield',
							allowBlank: false,
						}
					},
				],
				selModel: 'rowmodel',
				plugins: 
				[
					rowEditing,
					'gridfilters'
				],

				tbar:[
				{
					text: '▲',
					handler: function() {
						var imageryLayers = imageryLayerGridPanel.store.getCesiumImageryLayerCollection();
						var sm = imageryLayerGridPanel.getSelectionModel();
						var record = sm.getSelection()[0];
						if(record) {
							var imageryLayer = record.getCesiumImageryLayer();
							imageryLayers.lower(imageryLayer);
						}
					}
				},
				{
					text: '▼',
					handler: function() {
						var imageryLayers = imageryLayerGridPanel.store.getCesiumImageryLayerCollection();
						var sm = imageryLayerGridPanel.getSelectionModel();
						var record = sm.getSelection()[0];
						if(record) {
							var imageryLayer = record.getCesiumImageryLayer();
							imageryLayers.raise(imageryLayer);
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
			imageryLayerGridPanel.on('validateedit', function (editor, context) {
				var imageryLayer = context.record.getCesiumImageryLayer();
				imageryLayer.alpha = context.newValues.alpha;
				imageryLayer.brightness = context.newValues.brightness;
				imageryLayer.contrast = context.newValues.contrast;
				imageryLayer.hue = context.newValues.hue;
				imageryLayer.saturation = context.newValues.saturation;
				imageryLayer.gamma = context.newValues.gamma;
				imageryLayer.show = context.newValues.show;
			});
			tabPanel.setCollapsed(false);
			tabPanel.add(imageryLayerGridPanel).show();
			tabPanel.setActiveTab(imageryLayerGridPanel);
		}
    }
});
