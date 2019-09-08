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
	'Ext.grid.plugin.RowEditing',
	'CesiumExt.map.Map',
	'CesiumExt.data.store.ImageryLayerStore',
	'CesiumExt.data.model.ImageryLayerModel'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var mapComponent;
var tabPanel;
var imageryLayerStore;

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
			createImageryLayerGridPanel();
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
							text : 'ImageryLayers',
							handler: createImageryLayerGridPanel
						}
					]
				},
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
							text : 'Add New Mapbox Imagery Layer',
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
		
		
		function createArcGisMapServerImageryLayer() {
			var viewer = mapComponent.getViewer();
			var data = {
				name: 'ArcGIS World Imagery',
				//data.iconUrl = '',
				tooltip: 'REST Service for ArcGIS World Imagery',
				imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.ArcGisMapServerImageryProvider({
						url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
					});
					return provider;
				}
			};
			
			var rec = Ext.create('CesiumExt.data.model.ImageryLayerModel', data);
			imageryLayerStore.insert(imageryLayerStore.getCount(), rec);
			
			/*
			//Add layer
			viewer.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
				url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
			}));
			*/
			
		}
		
		function createOpenStreetMapImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			viewer.imageryLayers.addImageryProvider(Cesium.createOpenStreetMapImageryProvider({
				url : 'https://a.tile.openstreetmap.org/'
			}));
		}
		
		function createTileMapServiceImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			viewer.imageryLayers.addImageryProvider(Cesium.createTileMapServiceImageryProvider({
			   url: '../images/cesium_maptiler/Cesium_Logo_Color',
			   fileExtension: 'png',
			   maximumLevel: 4,
			   rectangle: new Cesium.Rectangle(
				   Cesium.Math.toRadians(-120.0),
				   Cesium.Math.toRadians(20.0),
				   Cesium.Math.toRadians(-60.0),
				   Cesium.Math.toRadians(40.0))
			}));
		}
		
		function createGoogleEarthEnterpriseImageryLayer() {
			var viewer = mapComponent.getViewer();
			var metadata = new Cesium.GoogleEarthEnterpriseMetadata('http://www.earthenterprise.org/3d');
			var provider = new Cesium.GoogleEarthEnterpriseImageryProvider({
				metadata : metadata
			});
			//Add layer
			viewer.imageryLayers.addImageryProvider(provider);
		}
		
		function createGoogleEarthEnterpriseMapsImageryLayer() {
			var viewer = mapComponent.getViewer();
			var provider = new Cesium.GoogleEarthEnterpriseMapsProvider({
				url : 'https://earth.localdomain',
				channel : 1008
			});
			//Add layer
			viewer.imageryLayers.addImageryProvider(provider);
		}
		
		function createMapboxImageryLayer() {
			var viewer = mapComponent.getViewer();
			
			var provider = new Cesium.MapboxImageryProvider({
				mapId: 'mapbox.streets',
				//remark: create your own token in the mapbox web page
				accessToken: 'pk.eyJ1IjoiY2VzaXVtZXh0IiwiYSI6ImNrMDZza3BzaDNibGozbnBrdmlxamU1c3EifQ.z-Vii2yB3-6nSSFVvaodNA'
			});
			//Add layer
			viewer.imageryLayers.addImageryProvider(provider);
		}
		
		function createMapboxStyleImageryLayer() {
			var viewer = mapComponent.getViewer();
			
			var provider = new Cesium.MapboxStyleImageryProvider({
				styleId: 'streets-v11',
				//remark: create your own token in the mapbox web page
				accessToken: 'pk.eyJ1IjoiY2VzaXVtZXh0IiwiYSI6ImNrMDZza3BzaDNibGozbnBrdmlxamU1c3EifQ.z-Vii2yB3-6nSSFVvaodNA'
			});
			//Add layer
			viewer.imageryLayers.addImageryProvider(provider);
		}
		
		function createWebMapTileServiceImageryLayer() {
			var viewer = mapComponent.getViewer();
			
			// USGS shaded relief tiles (KVP)
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
			//Add layer
			viewer.imageryLayers.addImageryProvider(provider);
		}
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////
		function createBelgiumWMSImageryLayers() {
			var viewer = mapComponent.getViewer()
			//remove all default imagery layers from the viewer
			var imageryLayers = viewer.imageryLayers;
			//imageryLayers.removeAll();
			
			//add Imagery Layer from WMS related to Wallonie Belgium Region (PICC: street, buildings, etc.)
			imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.wallonie.be/arcgis/services/TOPOGRAPHIE/PICC_VDIFF/MapServer/WMSServer',        
				layers: '1,3,4,5,7,9,10,11,12,14,15,16,17,19,20,21,23,24,25,26,27,28,29',
				parameters : {
					transparent : true,
					format : 'image/png'
				}
			}));
			
			//add Imagery Layer from WMS related to Flemish Belgium Region (GRB: street, buildings, etc.)
			imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB-selectie/wms',        
				layers: 'GRB_BSK',
				parameters : {
					transparent : true,
					tiled: true,
					format : 'image/png'
				}
			}));
			
			//add Address Imagery Layer from WMS related to Flemish Belgium Region (CRAB Addresses)
			imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adressen/wms',        
				layers: 'Adrespos',
				parameters : {
					transparent : true,
					format : 'image/png'
				}
			}));
			
			//add Address Imagery Layer from WMS related to Flemish Belgium Region (CRAB Addresses)
			imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adressen/wms',        
				layers: 'Adrespos',
				parameters : {
					transparent : true,
					format : 'image/png'
				}
			}));
		}
		
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
		
		
		function createImageryLayerGridPanel() {
			var viewer = mapComponent.getViewer();
			//retrieve cesium ImageryLayerCollection from viewer
			var imageryLayers = viewer.imageryLayers;
			//create store
			imageryLayerStore = Ext.create('CesiumExt.data.store.ImageryLayerStore', {
				cesiumImageryLayerCollection: imageryLayers
			});
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
				store: imageryLayerStore,
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
