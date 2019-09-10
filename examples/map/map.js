/* Copyright (c) 2019 - Today. CesiumExt

*/

/**
* Sample to show how to use CesiumExt.map.OverviewMap
*
*@author Paulo Sergio SAMPAIO de ARAGAO
*/


Ext.require([
	'CesiumExt.map.Map',
    'Ext.panel.Panel',
    'Ext.Viewport'
]);

var mapComponent;
var mapPanel;

Ext.application({
    name: 'MapComponent',
    launch: function() {
        var descriptionPanel;
		mapComponent = Ext.create('CesiumExt.map.Map');
		/*
		lom3d.mainPanel.mapComponent = Ext.create('CesiumExt.map.Map', {
			viewerConfig: {
				scene3DOnly: true,
				selectionIndicator: false,
				baseLayerPicker: false
			}
		});
		*/
        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'CesiumExt.map.Map Example',
            region: 'center',
            layout: 'fit',
            items: [mapComponent]
        });

        var descriptionPanel = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
			collapsible: true,
            border: true,
            bodyPadding: 5
        });
		
		var bottomPanel1 = Ext.create('Ext.panel.Panel', {
            contentEl: 'descriptionBottomPanel1',
            title: 'Bottom Panel 1',
            border: true,
            bodyPadding: 5
        });
		
		var bottomPanel2 = Ext.create('Ext.panel.Panel', {
            contentEl: 'descriptionBottomPanel2',
            title: 'Bottom Panel 2',
            border: true,
            bodyPadding: 5
        });
		
		tabPanel = Ext.create('Ext.tab.Panel', {
			title: 'Tab Panel',
			bodyPadding: 5,
			tabPosition: 'bottom',
			height: 250,
			resizable: true,
			collapsible: true,
			region: 'south',
			items: [
				bottomPanel1,
				bottomPanel2
			]
		});

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                descriptionPanel,
				tabPanel
            ]
        });
    }
});
