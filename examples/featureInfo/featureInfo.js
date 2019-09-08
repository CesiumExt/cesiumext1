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
	'CesiumExt.data.store.ImageryLayerStore',
	'CesiumExt.data.model.ImageryLayerModel',
	'CesiumExt.interaction.GetPositionInteraction',
	'CesiumExt.featureInfo.ImageryLayerFeatureInfo'
]);

var toolbar;
var mapPanel;
var descriptionPanel;
var mapComponent;


Ext.application({
    name: 'FeatureInfo',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map', {
			viewerConfig: {
				infoBox: false,
				//selectionIndicator: false,
				//baseLayerPicker: false
			}
		});
		
		mapComponent.on('viewercreated', function(viewer) {
			var imageryLayers = viewer.imageryLayers;
			//imageryLayers.removeAll();
			//createImageryLayerGridPanel();
			createBelgiumWMSImageryLayers();
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				{
					text : 'Feature Info',
					menu : 
					[ 
						{
							text : 'FeatureInfo for all the Imagery Layers',
							handler: getFeatureInfoForAllLayers
						}
					]
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
            region: 'east',
            width: 300,
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
		
		function getFeatureInfoForAllLayers() {
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
    }
});
