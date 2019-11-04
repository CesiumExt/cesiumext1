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
	'CesiumExt.data.store.ImageryLayerTreeStore',
	'CesiumExt.data.model.ImageryLayerTreeModel',
	'CesiumExt.tree.plugin.TreeColumnIcon'   
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var eastPanel;
var mapComponent;
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
			//remove all default imagery layers in the viewer
			viewer.imageryLayers.removeAll();
			//create tree store having imagery layer collection from the viewer
			imageryLayerTreeStore = Ext.create('CesiumExt.data.store.ImageryLayerTreeStore', {
				cesiumImageryLayerCollection: viewer.imageryLayers
			});
			imageryLayerTreeStore.getRoot().set('expanded', true);
			//create tree panel
			var treePanel = createImageryLayerTreePanel(imageryLayerTreeStore);
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
							text : 'Add Bing Maps Aerial',
							handler: createBingImageryLayer
						},
						{
							text : 'Add ESRI World Imagery Layer',
							handler: createArcGisMapServerImageryLayer
						},
						{
							text : 'Add OpenStreet Imagery Layer',
							handler: createOpenStreetMapImageryLayer
						},
						{
							text : 'Add Belgium WMS Imagery Layers (PICC, URBIS, GRB)',
							handler: createBelgiumWMSImageryLayers
						},
						'-',
						{
							text : 'Raise Bottom Layer',
							handler: raiseBottomLayer
						},
						{
							text : 'Raise Bottom Layer to Top',
							handler: raiseBottomLayerToTop
						},
						'-',
						{
							text : 'Lower Top Layer',
							handler: lowerTopLayer
						},
						{
							text : 'Lower Top Layer To Bottom',
							handler: lowerTopLayerToBottom
						},
						'-',
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

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
				toolbar,
                mapPanel,
                eastPanel,
            ]
        });
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////
		function createArcGisMapServerImageryLayer() {
			var viewer = mapComponent.getViewer();
			var data = {
				name: 'ESRI World Imagery',
				iconUrl: '../images/imageryProviders/esriWorldImagery.png',
				tooltip: 'REST Service for ESRI World Imagery',
				//imageryLayers: viewer.imageryLayers,
				creationFunction: function() {
					var provider = new Cesium.ArcGisMapServerImageryProvider({
						url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode, imageryLayerTreeStore.getRoot());
			
		}
		
		function createBingImageryLayer() {
			var viewer = mapComponent.getViewer();
			var data = {
				name: 'Bing Maps Aerial',
				iconUrl: '../images/imageryProviders/bingAerial.png',
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
		
		function createOpenStreetMapImageryLayer() {
			var viewer = mapComponent.getViewer();
			//Add layer
			var data = {
				name: 'OpenStreetMap',
				iconUrl: '../images/imageryProviders/openStreetMap.png',
				tooltip: 'OpenStreetMap Imagery',
				creationFunction: function() {
					var provider = new Cesium.OpenStreetMapImageryProvider({
						url : 'https://a.tile.openstreetmap.org/'
					});
					return provider;
				}
			};
			
			var treeNode = Ext.create('CesiumExt.data.model.ImageryLayerTreeModel', data);
			imageryLayerTreeStore.addNode(treeNode,imageryLayerTreeStore.getRoot());
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
			
			//Zoom to Belgium
			viewer.camera.flyTo({
				destination : Cesium.Cartesian3.fromDegrees(4.35, 50.84, 500000)
			});
		}
		
		function removeAllImageryLayers() {
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			if(imageryLayers)
				imageryLayers.removeAll();	
		}
		
		function createImageryLayerTreePanel(treeStore) {
			//create the plugin to show the icon in the tree panel
			var iconPlugin = Ext.create('CesiumExt.tree.plugin.TreeColumnIcon');
			//create tree panel
			var treePanel = Ext.create('Ext.tree.Panel', {
				title: 'ImageryLayer Tree Example',
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
		
		function raiseBottomLayer()
		{
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			var imageryLayer = imageryLayers.get(0);
			imageryLayers.raise(imageryLayer);
		}
		
		function raiseBottomLayerToTop()
		{
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			var imageryLayer = imageryLayers.get(0);
			imageryLayers.raiseToTop(imageryLayer);
		}
		
		function lowerTopLayer()
		{
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			var imageryLayer = imageryLayers.get(imageryLayers.length -1);
			imageryLayers.lower(imageryLayer);
		}
		
		function lowerTopLayerToBottom()
		{
			var imageryLayers = mapComponent.getViewer().imageryLayers;
			var imageryLayer = imageryLayers.get(imageryLayers.length -1);
			imageryLayers.lowerToBottom(imageryLayer);
		}
    }
});
