/* Copyright (c) 2019-Today CesiumExt
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
 * Abstract Class used to implement the 'get' operation for linear entity
 * through user interaction
 * @class CesiumExt.interaction.GetPolylineGraphics
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolylineGraphics', {
    extend: 'CesiumExt.interaction.GetInteraction',
	
	config: {
		firstVertexMessage: 'Select the first vertex or <esc> to cancel',
		secondVertexMessage: 'Select the second vertex or <esc> to cancel',
		nextVertexMessage: 'Select next vertex or right click to finish or <esc> to cancel',
		label : {
            show : false,
            showBackground : true,
			font : '14px Helvetica',
            fillColor : Cesium.Color.YELLOW,
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(15, 0),
			disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
		polyline : {
			material : Cesium.Color.RED,
			clampToGround: true,
			width: 3.0
		}
	},
	
	_entityLabel: null,
	
	//_entityPolyline: null,
	
	_curCartesianPosition: new Cesium.Cartesian3(),
	
	_positions: [],
	
	_numberOfInputVertices: 0,
	
	_getPositionsCallbackProperty: null,
	
	_getPositionsCallbackFunction: function(me) {
		var callbackFunction =  function(time, result) {
			//result = me._positions.slice(0); //clone array
			result = me._positions;
			return result;
		};
		return callbackFunction;
	},
	
	
	
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		me.initConfig(config);
		
		me._positions = []; //<-- shoud be specified. bug??
		
		//disable zoom/pan, etc.
		//me.getViewer().scene.screenSpaceCameraController.enableInputs  = false;
		
		
		//create entity label to show the message
		me.getLabel().show = false;
		me._entityLabel = me.viewer.entities.add({
			label : me.getLabel()
		});
		
		//create linear entity
		me.createDragEntity();
		
		//set the callback property to force the visualization of the polyline during user interaction
		me._getPositionsCallbackProperty = new Cesium.CallbackProperty(me._getPositionsCallbackFunction(me), false);
		
		
		//register the mouse events
		
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.requestVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.getVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.LEFT_CLICK);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.endInputHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	},
	
	/**
	 * @inheritdoc
	*/
	createDragEntity: function() {
		var me = this;
		//create entity polyline
		me.getPolyline().show = false;
		var entity = me.getDataSource().entities.add({
			polyline : new Cesium.PolylineGraphics(me.getPolyline())
		});
		me.setDragEntity(entity);
		return entity;
	},
	
	/**
	* Method to return the Graphics for the linear entity
	* @return {Cesium.PolylineGraphics}
	*/
	getLinearEntityGraphics: function() {
		var me = this;
		return me.getDragEntity().polyline;
	},
	
	
	requestVertexHandler: function(movement, context) {
		var me = (context ? context : this);
		
		
		if(me._numberOfInputVertices == 0) {
			requestVertex(movement, context, me.getFirstVertexMessage());
		}
		else if(me._numberOfInputVertices == 1) {
			requestVertex(movement, context, me.getSecondVertexMessage());
		}
		else if(me._numberOfInputVertices > 1) {
			requestVertex(movement, context, me.getNextVertexMessage());
		}
		
		function requestVertex(movement, me, message) {
			var ellipsoid = me.getViewer().scene.globe.ellipsoid;
			me._curCartesianPosition = me.getPositionFromMouse(movement.endPosition, me._curCartesianPosition);
			if (me._curCartesianPosition) {
				//update label and its position based on mouse position
				me._entityLabel.position = me._curCartesianPosition;
				me._entityLabel.label.show = true;
				me._entityLabel.label.text = message;
				//add polyline vertex based on mouse position
				if(me._positions.length == me._numberOfInputVertices)
					me._positions.push(me._curCartesianPosition);
				
			} else {
				me._entityLabel.label.show = false;
			}
		}
	},
	
	getVertexHandler: function(movement, context) {
		var me = (context ? context : this);
		var ellipsoid = me.getViewer().scene.globe.ellipsoid;
		//var cartesian = me.getViewer().camera.pickEllipsoid(movement.position, ellipsoid);
		var cartesian = me.getPositionFromMouse(movement.position);
		if (cartesian) {
			me.getDragEntity().polyline.positions =  me._getPositionsCallbackProperty;
			me._positions.pop();
			me._positions.push(cartesian);
			me._numberOfInputVertices += 1;
			me.getDragEntity().polyline.show = true;
		}
	},
	
	endInputHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me._numberOfInputVertices < 2) return;
		me._positions.pop();
		me._numberOfInputVertices -= 1;
		me.getDragEntity().polyline.positions =  me._positions;
		var data = me.getDragEntity().polyline.clone();
		//cleanup
		me.cleanup();
		//fire event
		me.fireEvent('drawend', data);
	},
	
	/**
	* Cleanup the resources
	* @private
	*/
	cleanup: function() {
		var me = this;
		me.getViewer().scene.screenSpaceCameraController.enableInputs  = true;
		me._curCartesianPosition = new Cesium.Cartesian3();
		me._positions = [];
		me._numberOfInputVertices = 0;
		me._getPositionsCallbackProperty = null;
		
		//remove label
		if (me._entityLabel) {
			me.getViewer().entities.remove(me._entityLabel);
			me._entityLabel = null;
		}
		
		me.callParent(arguments);
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
 });