/* Copyright (c) 2019 - Present. CesiumExt

*/

/**
* Sample to show how to use 'CesiumExt.featureInfo.ImageryLayerFeatureInfo
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/

Ext.require([
	'Ext.container.Container',
	'Ext.Viewport',
    'Ext.panel.Panel',
	'CesiumExt.map.Map',
	'CesiumExt.featureInfo.ImageryLayerFeatureInfo'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var mapComponent;
var picc_layer;
var grb_layer;
var crab_address_layer;
var urbis_layer


Ext.application({
    name: 'FeatureInfo',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map', {
			viewerConfig: {
				infoBox: false,
				selectionIndicator: false,
			}
		});
		
		mapComponent.on('viewercreated', function(viewer) {
			var imageryLayers = viewer.imageryLayers;
			createBelgiumWMSImageryLayers();
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				{
					text : 'Zoom',
					menu : 
					[ 
						{
							text: 'Zoom to Belgium GRB Layer(Flemish Region)',
							handler: function() {
								mapComponent.getViewer().camera.flyTo({
									destination : Cesium.Cartesian3.fromDegrees(4.3, 51, 350000)
								});
							}
						},
						{
							text: 'Zoom to Belgium PICC Layer (Walloon Region)',
							handler: function() {
								mapComponent.getViewer().camera.flyTo({
									destination : Cesium.Cartesian3.fromDegrees(4.9, 50, 200000)
								});
							}
						},
						{
							text: 'Zoom to Belgium URBIS Layer (Brussels Region)',
							handler: function() {
								mapComponent.getViewer().camera.flyTo({
									destination : Cesium.Cartesian3.fromDegrees(4.35, 50.84, 20000)
								});
							}
						}
					]
				},
				{
					xtype: 'button',
					icon: 'info-16.png',
					tooltip: 'Imagery Layer Features Info',
					handler: getFeatureInfo,
				}
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
			resizable: true, 
            region: 'east',
            width: 350,
			collapsible: true,
            border: true,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
				toolbar,
                mapPanel,
                descriptionPanel,
            ]
        });
		
		/////////// Utility functions ////////////////////////////////////////////////////////////////
		
		function getFeatureInfo() {
			var viewer = mapComponent.getViewer();
			var imageryLayers = viewer.imageryLayers;
			//create feature info
			var featureInfo = Ext.create('CesiumExt.featureInfo.ImageryLayerFeatureInfo',
			{
				viewer: viewer,
				imageryLayers: imageryLayers
			});
			//retrieve feature information by asking user to select the position
			featureInfo.getFeatures();
		}
		
		function createBelgiumWMSImageryLayers() {
			var viewer = mapComponent.getViewer()
			//remove all default imagery layers from the viewer
			var imageryLayers = viewer.imageryLayers;
			//imageryLayers.removeAll();
			
			//add Imagery Layer from WMS related to Brussels Belgium Region (URBIS: street, buildings, etc.)
			urbis_layer = imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices-urbis.irisnet.be/geoserver/ows',        
				layers: 'urbisFR',
				parameters : {
					transparent : true,
					tiled: true,
					format : 'image/png'
				}
			}));
			
			//add Imagery Layer from WMS related to Wallonie Belgium Region (PICC: street, buildings, etc.)
			picc_layer = imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.wallonie.be/arcgis/services/TOPOGRAPHIE/PICC_VDIFF/MapServer/WMSServer',        
				layers: '1,3,4,5,7,9,10,11,12,14,15,16,17,19,20,21,23,24,25,26,27,28,29',
				parameters : {
					transparent : true,
					format : 'image/png'
				}
			}));
			
			//add Imagery Layer from WMS related to Flemish Belgium Region (GRB: street, buildings, etc.)
			grb_layer = imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB-selectie/wms',        
				layers: 'GRB_BSK',
				parameters : {
					transparent : true,
					tiled: true,
					format : 'image/png'
				}
			}));
			
			//add Address Imagery Layer from WMS related to Flemish Belgium Region (CRAB Addresses)
			crab_address_layer = imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adressen/wms',        
				layers: 'Adrespos',
				parameters : {
					transparent : true,
					format : 'image/png'
				}
			}));
		}
    }
});
