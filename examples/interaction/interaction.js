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
	'Ext.toolbar.Toolbar',
    'Ext.panel.Panel',
    'Ext.form.Panel',
	'Ext.window.Window',
	'CesiumExt.map.Map',
	'CesiumExt.interaction.GetPositionInteraction',
	'CesiumExt.interaction.GetRectangleInteraction',
	'CesiumExt.interaction.GetPolylineGraphicsInteraction'
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
						},
						{
							text : 'Draw Rectangle',
							handler: drawRectangle
						},
						{
							text : 'Draw Polyline',
							handler: drawPolyline
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
            width: 400,
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
		
		function drawPolyline() {
			var viewer = mapComponent.getViewer();
			//create GetRectangle Interaction
			var getPolylineGraphicsInteraction = Ext.create('CesiumExt.interaction.GetPolylineGraphicsInteraction',
			{
				viewer: viewer
			});
			getPolylineGraphicsInteraction.on('drawend', drawPolylineHandler);
			
			function drawPolylineHandler(polylineGraphics) {
				polylineGraphics.material = Cesium.Color.BLUE;
				viewer.entities.add({
					polyline: polylineGraphics
				});
			}
		}
		
		function drawRectangle() {
			var viewer = mapComponent.getViewer();
			//create GetRectangle Interaction
			var getRectangleInteraction = Ext.create('CesiumExt.interaction.GetRectangleInteraction',
			{
				viewer: viewer
			});
			getRectangleInteraction.on('drawend', drawRectangleHandler);
			
			function drawRectangleHandler(rectangleCoords) {
				viewer.entities.add({
					rectangle: {
						material: Cesium.Color.YELLOW.withAlpha(0.3),
						outline: true,
						outlineColor: Cesium.Color.BLUE,
						height: 0,
						outlineWidth: 3,
						coordinates: rectangleCoords
					}
				});
			}
		}
		
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
				showCoordinateWindow(data.cartesianPosition, data.cartographicPosition, data.windowPosition);
			}
		}
		
		function showCoordinateWindow(cartesianPos, cartographicPos, windowPos)
		{
			var panel = Ext.create('Ext.form.Panel', {
				width: 300,
				bodyPadding: 10,
				items: [
					{
						xtype: 'textfield',
						itemId: 'cartesianField',
						name: 'Cartesian',
						value: cartesianPos.x + ',' + cartesianPos.y,
						width: 500,
						fieldLabel: 'Cartesian ',
						hideTrigger:true,
					}, 
					{
						xtype: 'textfield',
						itemId: 'cartographicField',
						name: 'cartographic',
						value: Cesium.Math.toDegrees(cartographicPos.latitude) + ',' + Cesium.Math.toDegrees(cartographicPos.longitude),
						width: 500,
						fieldLabel: 'Lat/Long ',
						hideTrigger:true,
						allowBlank: false  // requires a non-empty value
					}, 
					{
						xtype: 'textfield',
						itemId: 'windowField',
						name: 'Window',
						value: windowPos.x + ',' + windowPos.y,
						width: 500,
						fieldLabel: 'Window ',
						hideTrigger:true,
						allowBlank: false  // requires a non-empty value
					}, 
					
				]
			});
			
			var popupWindow = Ext.create('Ext.window.Window', {
				title: 'Show Coordinate',
				height: 200,
				width: 600,
				scrollable: true,
				constrainHeader: true,
				layout: 'fit',
				items: [panel]
			});
			popupWindow.show();
		}
		
		
    }
});
