/* Copyright (c) 2019 CesiumExtJS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * An CesiumExt.map.OverviewMap displays an overview map of a parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     @example preview
 *     var mapComponent = Ext.create('CesiumExt.map.Map');
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *        title: 'Map',
 *        region: 'center',
 *        layout: 'fit',
 *        items: mapComponent
 *     });
 *	   var overviewMapComponent = Ext.create('CesiumExt.map.OverviewMap', {
            parentMap: mapComponent
       });
 *     var overviewMapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'OverviewMap',
 *         region: 'west',
 *         layout: 'fit',
 *         width: 160,
 *         // create the overview by passing the ol.Map:
 *         items: overviewMapComponent
 *         })
 *     });
 *     Ext.create('Ext.panel.Panel', {
 *        height: 300,
 *        layout: 'border',
 *        items: [mapPanel, overviewMapPanel],
 *        renderTo: Ext.getBody()
 *     });
 *
 * @class CesiumExt.map.OverviewMap
 *
 * @author Paulo Sergio SAMPAIO DE ARAGAO
 */
 
 
 
Ext.define('CesiumExt.map.OverviewMap', {
    extend: 'Ext.Component',
    alias: [
        'widget.cesiumext_overview',
        'widget.cesiumext_overviewmap',
        'widget.cesiumext_component_overviewmap'
    ],
    requires: [
        
    ],
    mixins: [
        'Ext.mixin.Observable',
    ],

    // <debug>
    symbols: [
        
    ],
    // </debug>

	config: {
		
		/**
         * The style for the overview rectangle.
         *
         * @cfg {Object} Object describing the graphics for 
		 * the overview rectangle
         */
        boxStyle: {
			material: Cesium.Color.RED.withAlpha(0.4),
            fill : true,
            outline : true,
            outlineColor : Cesium.Color.BLACK,
			height: 0,
			outlineWidth: 4
        },
		
		/**
         * The magnification is the relationship in which the resolution of the
         * overviewmaps view is bigger then resolution of the parentMaps view.
         *
         * @cfg {Number} magnification
         */
        magnification: 1.2,

        /**
         * A configuration object for the Cesium Viewer constructor
         * of the Overview Map.
         *
         * @cfg {Object} viewerConfig
         */
        viewerConfig: {
			 navigationHelpButton: false,
			 animation: false,
			 timeline: false,
			 homeButton: false,
			 infoBox: false,
			 geocoder: false,
			 fullscreenButton: false,
			 infoBox: false,
			 vrButton: false,
			 selectionIndicator:false,
			 sceneModePicker: false,
			 scene3DOnly: true,
			 automaticallyTrackDataSourceClocks: false
		},
		
		/**
         * if true, all the zoom/pan in the overview map triggered
		 * by change in the parent map will achived with the
		 * flight effect.
         *
         * @cfg {Boolean} enableFlight
         */
		enableFlight: false,

        /**
         * A configured Map.
         *
         * **This should be the parent map the overviewMap is bound to.**
         *
         * @cfg {CesiumExt.map.Map} parentMap
         */
        parentMap: null,
		html: null
	},
	
	/**
     * The `Cesium.Viewer` that represents the viewer for
     * the Overview Map.
     * @type {Cesium.Viewer}
     * @private
     */
	viewer: null,
	
	
	/**
     * The `Cesium.Entity` that represents the extent of the parent map.
     *
     * @type {Cesium.Entity}
     * @private
     */
    boxEntity: null,
	

    /**
     * The `Cesium.Entity` that represents the top left corner of the parent map.
     *
     * @type {Cesium.Entity}
     * @private
     */
    anchorEntity: null,
	
	/**
     * Whether we already rendered an Cesium.Viewer in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    viewerRendered: false,
	
	screenSpaceEventHandler: null,
	
	
	/**
     * Returns the Cesium Viewer for the Overview Map.
     *
     * @return {Cesium.Viewer} The Cesium Viewer.
     */
    getViewer: function() {
        return this.viewer;
    },
	
	getBoxEntity: function() {
        return this.boxEntity;
    },
	
	boxRectangle:  new Cesium.Rectangle(),
	
	// callback to retrieve the new rectangle based on the current mouse
	// position
	getBoxRectangleCallbackProperty: null,
	getBoxRectangleCallbackFunction: function(me) {
		var callbackFunction =  function(time, result) {
			console.log('callback called!!!');
			return Cesium.Rectangle.clone(me.boxRectangle, result);
		};
		return callbackFunction;
	},
	
	mouseDown: false,
	firstPoint: new Cesium.Cartographic(),
	endPoint: new Cesium.Cartographic(),
	cartesian: new Cesium.Cartesian3(),
	tempCartographic: new Cesium.Cartographic(),
	tempCartesianPanPosition1: new Cesium.Cartesian3(),
	tempCartesianPanPosition2: new Cesium.Cartesian3(),
	firstCartesianPanPosition: new Cesium.Cartesian3(),
	startCartesianPanPosition: new Cesium.Cartesian3(),
	endCartesianPanPosition: new Cesium.Cartesian3(),
	
	/**
     * The constructor of the OverviewMap component.
     */
    constructor: function(config) {
		var me = this;
		me.callParent([config]);
		me.setHtml('<div id="cesiumContainer1"></div>');
		me.on('resize', me.onResize, me);
    },
	
	/**
     * Initializes the CesiumExt.map.OverviewMap.
     */
    //initComponent: function() {
	startComponent: function() {
        var me = this;

        if (!me.getParentMap()) {
            Ext.Error.raise('No parentMap defined for overviewMap');
        } else if (!(me.getParentMap() instanceof CesiumExt.map.Map)) {
            Ext.Error.raise('parentMap is not an instance of CesiumExt.map.Map');
        }

        me.initOverviewMap();
    },
	
	 /**
     * Creates the Cesium Entities we need: two entities for the box and the
     * anchor.
     *
     * @private
     */
    initOverviewEntities: function() {
        var me = this;
        me.boxEntity = new Cesium.Entity();
        me.anchorEntity = new Cesium.Entity();
    },
	
	 /**
     * Initializes the #viewer from the configuration and the #parentViewer.
     *
     * @private
     */
    initOverviewMap: function() {
        var me = this;
		var viewer = me.getViewer();
        var parentViewer = me.getParentMap().getViewer();
        var parentLayers;
	
		//create the box entity
		me.initOverviewEntities();
		
		//disable zoom and pan in the overview map
		viewer.scene.screenSpaceCameraController.enableZoom = false;
		viewer.scene.screenSpaceCameraController.enableTranslate = false;
		viewer.scene.screenSpaceCameraController.enableRotate = false;
		viewer.scene.screenSpaceCameraController.enableTilt = false;
		viewer.scene.screenSpaceCameraController.enableLook = false;
		
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
		
		me.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
			this.getViewer().scene.canvas);
		
		
		//if viewer does not have imagery layer, add all 
		//imagery layers from parent map
		if(viewer.imageryLayers.length < 1) {
			parentLayers = parentViewer.imageryLayers;
			parentLayers.forEach(function(layer) {
				viewer.imageryLayers.add(layer);
			});	
		}
		
		// enable the update the box after rendering a new frame of the parentMap.
        me.enableBoxUpdate();
		

		//set the box style to be showed in the Overview Map
		me.boxEntity.rectangle = me.getBoxStyle();
		//set the callback property to force the visualization of the box during dragging
		me.getBoxRectangleCallbackProperty = new Cesium.CallbackProperty(me.getBoxRectangleCallbackFunction(me), false);
		me.boxEntity.rectangle.coordinates = me.getBoxRectangleCallbackProperty;
		//add box and anchor entities to Overview Map (anchor entity still to be implemented)
		viewer.entities.add(me.boxEntity);
		viewer.entities.add(me.anchorEntity);
		//update the view of the overview map based on the 
		//current pan/zoom in the parent map.
		me.updateBoxHandler();
		
		//add event handler to update the box position in the overview map
		//each time occurs a zoom/pan in the parent map
		parentViewer.camera.moveEnd.addEventListener(me.updateBoxHandler, me); 
		//Add listeners to setup drag behaviour in the overview map
		me.setupDragBehaviour();
		//Listener to clean un all the listeners once the
		//overview map will be destroyed
		me.on('beforedestroy', me.onBeforeDestroy, me);
    },
	
	/**
     * Enable everything we need to be able to drag the extent box on the
     * overview map, and to properly handle drag events (e.g. recenter on
     * finished dragging).
     */
    setupDragBehaviour: function() {
		var me = this;
		var viewer = me.getViewer();
		var camera = viewer.camera;
		
		me.screenSpaceEventHandler.setInputAction(function(movement){ me.recenterHandler(movement, me);},
			Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
			
		me.screenSpaceEventHandler.setInputAction(function(movement){ me.startPanHandler(movement, me);},
			Cesium.ScreenSpaceEventType.LEFT_DOWN/*, Cesium.KeyboardEventModifier.ALT*/);
			
		me.screenSpaceEventHandler.setInputAction(function(movement){ me.panningHandler(movement, me);},
			Cesium.ScreenSpaceEventType.MOUSE_MOVE/*, Cesium.KeyboardEventModifier.ALT*/);
			
		me.screenSpaceEventHandler.setInputAction(function(movement){ me.endPanHandler(movement, me);},
			Cesium.ScreenSpaceEventType.LEFT_UP/*, Cesium.KeyboardEventModifier.ALT*/);
	},
	
	 /**
     * Disable / destroy everything we need to be able to drag the extent box on
     * the overview map. Unregisters any events we might have added
     */
    destroyDragBehaviour: function() {
        var me = this;
		me.mouseDown = false;
        screenSpaceEventHandler = screenSpaceEventHandler
				&& screenSpaceEventHandler.destroy();
    },
	
	 /**
     * Enables the update of the box by binding the updateBoxHandler function
     * to the moveEnd event of the parent viewer camera.
     */
    enableBoxUpdate: function(context) {
       var me;
		if(context) 
			me = context;
		else
			me = this;
        var parentViewer = me.getParentMap().getViewer();
        if (parentViewer) {
			parentViewer.camera.moveEnd.addEventListener(me.updateBoxHandler, me); 
        }
    },
	
	/**
     * Disables the update of the box by unbinding the updateBoxHandler function
     * from the moveEnd event of the parent viewer camera.
     */
    disableBoxUpdate: function(context) {
        var me;
		if(context) 
			me = context;
		else
			me = this;
        var parentViewer = me.getParentMap().getViewer();
        if (parentViewer) {
			parentViewer.camera.moveEnd.removeEventListener(me.updateBoxHandler, me); 
        }
    },
	
	
	recenterByCartesianPosition(newCartesianPosition)
	{
		//initialize variables
		var me = this;
		var parentViewer = me.getParentMap().getViewer();
		var parentCamera = parentViewer.camera;
		var parentEllipsoid = parentViewer.scene.globe.ellipsoid;
		var viewer = me.getViewer();
		var camera = viewer.camera;
		var ellipsoid = viewer.scene.globe.ellipsoid;
		//retrieve the cartesian coordinate where the mouse was clicked
		var newParentCartesianPosition = newCartesianPosition.clone(newParentCartesianPosition);
		
		if(newCartesianPosition)
		{
			var newCartographicPosition = ellipsoid.cartesianToCartographic(newCartesianPosition);
			//keep the same camera heigt for the new position
			var cammeraHeight = viewer.camera.positionCartographic.height;
			newCartographicPosition.height = cammeraHeight;
			//convert back to cartesian to fit with the camera height
			ellipsoid.cartographicToCartesian(newCartographicPosition, newCartesianPosition);
			//re-center parent camera (with his parent camera height)
			//this action will re-draw the box by the event
			var parentCammeraHeight = parentViewer.camera.positionCartographic.height;
			var newParentCartographicPosition = parentEllipsoid.cartesianToCartographic(newParentCartesianPosition);
			newParentCartographicPosition.height = parentCammeraHeight;
			parentEllipsoid.cartographicToCartesian(newParentCartographicPosition, newParentCartesianPosition);
			
			parentViewer.camera.setView({
				//destination : newCartesianPosition
				destination: newParentCartesianPosition
			});
		}
		else
			console.log('Globe was not picked');
	},
	
	recenterHandler: function(movement, context) {
		console.log('recenter called!!!');
		var me = (context ? context : this);
		//retrieve the cartesian coordinate where the mouse was clicked
		var viewer = me.getViewer();
		var newCartesianPosition = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		//re-center camera
		me.recenterByCartesianPosition(newCartesianPosition);
	},
	
	startPanHandler: function(movement, context) {
		var me = (context ? context : this);
		var viewer = me.getViewer();
		me.firstCartesianPanPosition = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid, me.firstCartesianPanPosition);
		if(me.firstCartesianPanPosition) {
			me.disableBoxUpdate();
			me.mouseDown = true;
			me.boxEntity.rectangle.coordinates = me.getBoxRectangleCallbackProperty;
			//initialize start and end point (both having same value)
			me.firstCartesianPanPosition.clone(me.startCartesianPanPosition);
			me.firstCartesianPanPosition.clone(me.endCartesianPanPosition);
		}
	},
	
	panningHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me.mouseDown) {
			var viewer = me.getViewer();
			me.tempCartesianPanPosition1 = viewer.camera.pickEllipsoid(movement.startPosition, viewer.scene.globe.ellipsoid, me.tempCartesianPanPosition1);
			me.tempCartesianPanPosition2 = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid, me.tempCartesianPanPosition2);
			if(me.tempCartesianPanPosition1 && me.tempCartesianPanPosition2) {
				//convert the start and end position of the mouse to cartesian
				me.startCartesianPanPosition = me.tempCartesianPanPosition1.clone(me.startCartesianPanPosition);
				me.endCartesianPanPosition = me.tempCartesianPanPosition2.clone(me.endCartesianPanPosition);
				//translate the box rectangle
				me.updateBoxByCartesianPosition(me.startCartesianPanPosition, me.endCartesianPanPosition);
			}
		}
	},
	
	endPanHandler: function(movement, context) {
		var me = (context ? context : this);
		me.enableBoxUpdate();
		if(me.mouseDown == false) return;
		me.mouseDown = false;
		me.boxEntity.rectangle.coordinates = me.boxRectangle;
		var viewer = me.getViewer();
		var ellipsoid = viewer.scene.globe.ellipsoid;
		//get end point
		me.endCartesianPanPosition = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid, me.endCartesianPanPosition);
		//adjust the height for start and end point cartesian positions
		var firstCartographicPanPosition = ellipsoid.cartesianToCartographic(me.firstCartesianPanPosition, firstCartographicPanPosition);
		firstCartographicPanPosition.height = viewer.camera.positionCartographic.height;
		ellipsoid.cartographicToCartesian(firstCartographicPanPosition, me.firstCartesianPanPosition);
		
		var endCartographicPanPosition = ellipsoid.cartesianToCartographic(me.endCartesianPanPosition, endCartographicPanPosition);
		endCartographicPanPosition.height = viewer.camera.positionCartographic.height;
		ellipsoid.cartographicToCartesian(endCartographicPanPosition, me.endCartesianPanPosition);
		//calculate the overall offset translation (from first point until the end)
		var offset = new Cesium.Cartesian3();
		Cesium.Cartesian3.subtract(me.endCartesianPanPosition, 	me.firstCartesianPanPosition, offset);
		console.log('offset subtract: x=' + offset.x + ', y=' + offset.y + ', z=' + offset.z);
		//apply offset to camera position
		var cameraPosition = viewer.camera.position.clone(cameraPosition);
		Cesium.Cartesian3.add(cameraPosition, offset, cameraPosition);
		//re-center camera
		me.recenterByCartesianPosition(cameraPosition);
	},
	

    /**
     * (Re-)render the map when size changes.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if (!me.viewerRendered) {
			me.viewer = new Cesium.Viewer('cesiumContainer1', me.getViewerConfig());
            me.viewerRendered = true;
			me.startComponent();
			me.fireEvent('viewercreated', me.viewer);
        } 
		else {
			me.getViewer().resize();
        }
    },
	/**
	* Update the Box given a vector translation defined by start and end point
	* No zoom is applied after this operation
	*/
	updateBoxByCartesianPosition: function(startCartesianPanPosition, endCartesianPanPosition) {
		var me = this;
		var parentViewer = me.getParentMap().getViewer();
		var parentViewerCamera = parentViewer.camera;
		//var parentEllipsoid = parentViewer.scene.mapProjection.ellipsoid;
		//var parentEllipsoid = parentViewer.scene.globe.ellipsoid;
		var parentEllipsoid =  Cesium.Ellipsoid.WGS84;
		var parentRectangle = parentViewerCamera.computeViewRectangle(parentEllipsoid);
		if(! parentRectangle) return;
		var cameraPos = parentViewerCamera.getRectangleCameraCoordinates(parentRectangle);
		var viewer = me.getViewer();
		var ellipsoid = viewer.scene.globe.ellipsoid;
		
		//adjust the height for start and end point cartesian positions
		var startCartographicPanPosition = parentEllipsoid.cartesianToCartographic(startCartesianPanPosition, startCartographicPanPosition);
		var endCartographicPanPosition = parentEllipsoid.cartesianToCartographic(endCartesianPanPosition, endCartographicPanPosition);
		if(startCartographicPanPosition && endCartographicPanPosition) {
			startCartographicPanPosition.height = parentViewer.camera.positionCartographic.height;
			parentEllipsoid.cartographicToCartesian(startCartographicPanPosition, me.tempCartesianPanPosition1);
			
			endCartographicPanPosition.height = parentViewer.camera.positionCartographic.height;
			parentEllipsoid.cartographicToCartesian(endCartographicPanPosition, me.tempCartesianPanPosition2);
			
			//calculate offset translation
			var offset = new Cesium.Cartesian3();
			Cesium.Cartesian3.subtract(me.tempCartesianPanPosition2, me.tempCartesianPanPosition1, offset);
			console.log('offset Panning: x=' + offset.x + ', y=' + offset.y + ', z=' + offset.z);
			
			//apply offset to camera position
			var cameraPosition = parentViewer.camera.position.clone(cameraPosition);
			Cesium.Cartesian3.add(cameraPosition, offset, cameraPosition);
			
			//me.disableBoxUpdate();
			parentRectangle = parentViewerCamera.computeViewRectangle(parentEllipsoid);
			me.boxRectangle.west = parentRectangle.west;
			me.boxRectangle.south = parentRectangle.south;
			me.boxRectangle.east = parentRectangle.east;
			me.boxRectangle.north = parentRectangle.north;
			parentViewer.camera.position = cameraPosition;
			//me.enableBoxUpdate();
			return;
			
		}
	},
	
	 /**
     * Updates the Geometry of the box extentLayer
	 * based on the parent viewer's camera position and zoom
     */
    updateBoxHandler: function() {
        var me = this;
		var viewer = me.getViewer();
        var parentViewer = me.getParentMap().getViewer();
		//get the parent viewer camera
		var parentViewerCamera = parentViewer.camera;
		//compute the rectangle extent from the parent view camera
		//var ellipsoid = Cesium.Ellipsoid.WGS84;
		//var parentEllipsoid = parentViewer.scene.mapProjection.ellipsoid;
		//var parentEllipsoid = parentViewer.scene.globe.ellipsoid;
		var parentEllipsoid =  Cesium.Ellipsoid.WGS84;
		var parentRectangle = parentViewerCamera.computeViewRectangle(parentEllipsoid);
		if(! parentRectangle) return;
		var cameraPos = parentViewerCamera.getRectangleCameraCoordinates(parentRectangle);
		//see: https://cesiumjs.org/Cesium/Build/Apps/Sandcastle/#c=lVNNb9swDP0rWnaIgwYKtt7yhW1ethXLtqIOdjIwqDLTCpMlT5bcOoH/+6g4duxkO9SXhBT5+PhIFsyQQsATGLIgCp5ICLlwKf158AVDfjBDrSwTCsxwTPYG/jjI7R2oBMw3ncCUWOOgGs1iFasCASXL7a3OhRVazU4uj3kH3DL1IKENfmQqkeflI24AVJQxDqsClP1SBwU1VZpzUEA5Q4Dclz1i0Bzsjcqcfc996WDrVP1nRPaxIvj5grxpBksmmrsU8Sm2ZMoIJNLT2Pbr8759lQYgO7aG+Uc+nKVgGM1OPTex2lnkg5HNG30mVwRlHOJP6yv/4dsdFPI4XTkRaU+epx24MSk7Zjkmu465I9XsBNIbwAV7rlOkCr2goOk7VtX4f8PZlBnQ9erT5le4vgm/1nsQqwiHwrGqBMqSZKO1vGfmg7MWBzL8rMlGkzU+k7XmzJNFAS4HJrYkeNUVoH3xnwHrTCN31RkxMxa5MtXfqrBxXwddSK9hzy7P7N2onYXn01vCFA+ALBaLkzjo9VdBo3D1ffX2Y49wX/GtLDc62Cd4TUIdNJhezqlqRlARkDm8mMH1Sxm04p0qtzswmg3Gg3luSwnL2vlOpJk2ljgjA0onFtJMMsyf3Dv+Gyzl+eFC55MmaZ6IgohkEQ/ObiweEI7d5/iydVJGYgfxYDmfYHwvTWqWCPXwowAjWelDHt8s17WTUjqfoHmZZev96yD+BQ
		
		if(cameraPos) {
			//change the position (height) of the camera based on the magnification:
			//get the camera position in lat/long
			var cartographic = new Cesium.Cartographic();
			parentEllipsoid.cartesianToCartographic(cameraPos, cartographic);
			//set the height for the camera (in meters)
			cartographic.height = cartographic.height * me.magnification;
			parentEllipsoid.cartographicToCartesian(cartographic, cameraPos);
			//set the new box coordinate in the overview map.
			me.boxEntity.rectangle.coordinates = parentRectangle;

			if(me.enableFlight) {
				viewer.camera.flyTo({
					destination: cameraPos,
				});
			}
			else {
				viewer.camera.setView({
					destination : cameraPos
				});
			}
		}
    },
	
	/**
     * Cleanup any listeners we may have bound.
     */
    onBeforeDestroy: function() {
        var me = this;
        var parentMap = me.getParentMap();

        me.destroyDragBehaviour();

        if (parentMap) {
            // unbind parent listeners
            me.disableBoxUpdate();
            //parentView.un('propertychange', me.onParentViewPropChange, me);
        }
    },
	
	/*
	setHeightKm(heightInKilometers, camera, viewer) {
		var camera = viewer.camera;
		var ellipsoid = viewer.scene.mapProjection.ellipsoid;
		var cartographic = new Cesium.Cartographic();
		var cartesian = new Cesium.Cartesian3();
		
		//get the camera position in lat/long
		ellipsoid.cartesianToCartographic(camera.position, cartographic);
		//set the height for the camera (in meters)
		cartographic.height = heightInKilometers * 1000;  // convert to meters
		ellipsoid.cartographicToCartesian(cartographic, cartesian);
		camera.position = cartesian;
	}
	*/
	
	/*
	Camera.prototype.clone = function() {
        var camera = new Camera(this._scene);
        camera.position = Cartesian3.clone(this.position);
        camera.direction = Cartesian3.clone(this.direction);
        camera.up = Cartesian3.clone(this.up);
        camera.right = Cartesian3.clone(this.right);
        camera.transform = Matrix4.clone(this.transform);
        camera.frustum = this.frustum.clone();
        return camera;
    };
	*/
});

