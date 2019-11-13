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
 * Class used to retrieve the PolylineGraphics from the user through
 * mouse input.
 * @class CesiumExt.interaction.GetPolylineGraphicsInteraction
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolylineGraphicsInteraction', {
    extend: 'CesiumExt.interaction.Interaction',
	
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
			//heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
		polyline : {
			material : Cesium.Color.RED,
			clampToGround: true,
			width: 3.0
		}
	},
	
	_entityLabel: null,
	
	_entityPolyline: null,
	
	_curCartesianPosition: new Cesium.Cartesian3(),
	
	_positions: [],
	
	_numberOfInputVertices: 0,
	
	getPositionsCallbackProperty: null,
	
	getPositionsCallbackFunction: function(me) {
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
		
		//create entity polyline
		me.getPolyline().show = false;
		me._entityPolyline = me.getViewer().entities.add({
			polyline : new Cesium.PolylineGraphics(me.getPolyline())
		});
		
		//set the callback property to force the visualization of the polyline during user interaction
		me.getPositionsCallbackProperty = new Cesium.CallbackProperty(me.getPositionsCallbackFunction(me), false);
		
		
		//register the mouse events
		
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.requestVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.getVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.LEFT_CLICK);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.endInputHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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
			me._curCartesianPosition = me.getViewer().camera.pickEllipsoid(movement.endPosition, 
				ellipsoid, me._curCartesianPosition);
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
		var cartesian = me.getViewer().camera.pickEllipsoid(movement.position, 
				ellipsoid);
		if (cartesian) {
			me._entityPolyline.polyline.positions =  me.getPositionsCallbackProperty;
			me._positions.pop();
			me._positions.push(cartesian);
			me._numberOfInputVertices += 1;
			me._entityPolyline.polyline.show = true;
		}
	},
	
	endInputHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me._numberOfInputVertices < 2) return;
		me._positions.pop();
		me._numberOfInputVertices -= 1;
		me._entityPolyline.polyline.positions =  me._positions;
		var data = me._entityPolyline.polyline.clone();
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
		me.callParent(arguments);
		//me.getViewer().scene.screenSpaceCameraController.enableInputs  = true;
		me._curCartesianPosition = new Cesium.Cartesian3();
		me._positions = [];
		me._numberOfInputVertices = 0;
		me.getPositionsCallbackProperty = null;
		
		//remove label
		if (me._entityLabel) {
			me.getViewer().entities.remove(me._entityLabel);
			me._entityLabel = null;
		}
		//remove rectangle
		if (me._entityPolyline) {
			me.getViewer().entities.remove(me._entityPolyline);
			me._entityPolyline = null;
		}
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
 });