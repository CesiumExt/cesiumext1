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


Ext.application({
    name: 'Interaction',
    launch: function() {
		//create  CesiumExt.map.Map map component
		mapComponent = Ext.create('CesiumExt.map.Map');
		//start code to be executed once the viewer is created
		mapComponent.on('viewercreated', function(viewer) {
			
		});
		
		//create main menu toolbar
		toolbar = Ext.create('Ext.toolbar.Toolbar', {
			region : 'north',
			items: [ 
				{
					text : 'Interaction',
					menu : 
					[ 
						{
							text : 'Get Position',
							handler: getPosition
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
		
		function getPosition() {
			var viewer = mapComponent.getViewer();
			//create GetPosition Interaction
			var getPosInteraction = Ext.create('CesiumExt.interaction.GetPositionInteraction',
			{
				viewer: viewer
			});
			
			getPosInteraction.on('positionRetrieved', showPosition);
			
			function showPosition(data) {
				getPosInteraction.un('positionRetrieved', showPosition);
				var cartesianPos = data.cartesianPosition;
				console.log('position' + cartesianPos);
			}
		}
    }
});
