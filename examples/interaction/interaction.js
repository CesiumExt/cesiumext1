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
	'CesiumExt.interaction.GetPosition',
	'CesiumExt.interaction.GetDistance',
	'CesiumExt.interaction.GetRectangleInteraction',
	'CesiumExt.interaction.GetPolylineGraphics',
	'CesiumExt.interaction.GetPolylineVolumeGraphics',
	'CesiumExt.interaction.GetPolygonGraphics'
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
					text : 'Tools',
					menu : 
					[ 
						{
							text : 'Get Position',
							handler: getPosition
						},
						{
							text : 'Get Distance',
							handler: getDistance
						},
					]
				},
				{
					text : 'Draw',
					menu : 
					[ 
						{
							text : 'Draw Rectangle',
							handler: drawRectangle
						},
						{
							text : 'Draw Polyline',
							handler: drawPolyline
						},
						{
							text : 'Draw Polyline Volume',
							handler: drawPolylineVolume
						},
						{
							text : 'Draw Polygon',
							handler: drawPolygon
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
			//var getPolylineGraphicsInteraction = Ext.create('CesiumExt.interaction.GetPolylineGraphicsInteraction',
			var getPolylineGraphicsInteraction = Ext.create('CesiumExt.interaction.GetPolylineGraphics',
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
		
		function drawPolygon() {
			var viewer = mapComponent.getViewer();
			//create GetPolygonGraphics Interaction
			var getPolygonGraphicsInteraction = Ext.create('CesiumExt.interaction.GetPolygonGraphics',
			{
				viewer: viewer
			});
			getPolygonGraphicsInteraction.on('drawend', drawPolygonHandler);
			
			function drawPolygonHandler(polygonGraphics) {
				polygonGraphics.material = Cesium.Color.BLUE.withAlpha(0.3);
				var entity = viewer.entities.add({
					polygon: polygonGraphics
				});
			}
		}
		
		function drawPolylineVolume() {
			var viewer = mapComponent.getViewer();
			var polylineVolume = {
				material : Cesium.Color.RED,
				clampToGround: true,
				width: 3.0,
				shape: CesiumExt.interaction.GetPolylineVolumeGraphics.computeCircle(1.0),
			};
			//create Interaction
			var getPolylineVolumeGraphics = Ext.create('CesiumExt.interaction.GetPolylineVolumeGraphics',
			{
				viewer: viewer,
				polylineVolume: polylineVolume
			});
			getPolylineVolumeGraphics.on('drawend', drawPolylineVolumeHandler);
			
			function drawPolylineVolumeHandler(polylineVolumeGraphics) {
				polylineVolumeGraphics.material = Cesium.Color.BLUE;
				viewer.entities.add({
					polylineVolume: polylineVolumeGraphics
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
		
		function getDistance() {
			var viewer = mapComponent.getViewer();
			//create GetPosition Interaction
			var getDistInteraction = Ext.create('CesiumExt.interaction.GetDistance',
			{
				viewer: viewer
			});
			
			getDistInteraction.on('drawend', showDistance);
			
			function showDistance(distance) {
				getDistInteraction.un('drawend', showDistance);
				showDistanceWindow(distance);
			}
			
			function showDistanceWindow(distance)
			{
				var panel = Ext.create('Ext.form.Panel', {
					width: 300,
					bodyPadding: 10,
					items: [
						{
							xtype: 'numberfield',
							value: distance,
							width: 500,
							fieldLabel: 'Distance ',
							hideTrigger:true,
						}, 
					]
				});
				
				var popupWindow = Ext.create('Ext.window.Window', {
					title: 'Show Distance',
					height: 200,
					width: 500,
					scrollable: true,
					constrainHeader: true,
					layout: 'fit',
					items: [panel]
				});
				popupWindow.show();
			}
		}
		
		
		function getPosition() {
			var viewer = mapComponent.getViewer();
			//create GetPosition Interaction
			var getPosInteraction = Ext.create('CesiumExt.interaction.GetPosition',
			{
				viewer: viewer
			});
			
			getPosInteraction.on('positionRetrieved', showPosition);
			
			function showPosition(data) {
				getPosInteraction.un('positionRetrieved', showPosition);
				showCoordinateWindow(data.cartesianPosition, data.cartographicPosition, data.windowPosition);
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
    }
});
