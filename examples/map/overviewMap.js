/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Sample to show how to use CesiumExt.map.OverviewMap
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/


Ext.require([
	'CesiumExt.map.Map',
	'CesiumExt.map.OverviewMap',
    'Ext.panel.Panel',
    'Ext.Viewport'
]);

var mapComponent;
var overviewMapComponent;
var mapPanel;
var ovMapPanel1;
var descriptionPanel;
var bottomPanel1;
var bottomPanel2;


Ext.application({
    name: 'OverviewMapComponent',
    launch: function() {
		mapComponent = Ext.create('CesiumExt.map.Map');
        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'CesiumExt.map.OverviewMap Example',
            region: 'center',
            layout: 'fit',
			border: false,
            items: [mapComponent]
        });
		
		
		overviewMapComponent = Ext.create('CesiumExt.map.OverviewMap', {
            parentMap: mapComponent
        });
		
		//set the camera position once the cesium viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			// Create an initial camera view
			var initialPosition = new Cesium.Cartesian3.fromDegrees(-73.998114468289017509, 40.674512895646692812, 2631.082799425431);
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
		});
        
        descriptionPanel = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
			flex: 1,
            border: false,
            bodyPadding: 5,
            autoScroll: true
        });
		
		ovMapPanel1 = Ext.create('Ext.panel.Panel', {
            title: 'OverviewMap (default)',
            flex: 1,
            layout: 'fit',
			resizable: true,
            items: overviewMapComponent
        });
		
		Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                {
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
                        ovMapPanel1,
                        descriptionPanel,
                    ]
                }
            ]
        });
    }
});
