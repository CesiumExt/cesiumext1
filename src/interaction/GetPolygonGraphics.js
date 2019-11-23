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
 * Class used to get the Cesium PolygonGraphics
 * through user interaction
 * @class CesiumExt.interaction.GetPolygonGraphics
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolygonGraphics', {
    extend: 'CesiumExt.interaction.GetInteraction',
	
	config: {
		firstVertexMessage: 'Select the first vertex or &lt;esc&gt; to cancel',
		secondVertexMessage: 'Select the second vertex or &lt;esc&gt; to cancel',
		thirdVertexMessage: 'Select the third vertex or &lt;esc&gt; to cancel',
		nextVertexMessage: 'Select next vertex or right click to finish or &lt;esc&gt; to cancel',
		polyline : {
			material : Cesium.Color.RED,
			width: 2.0,
			clampToGround: true,
		},
		polygon: {
			material: Cesium.Color.RED.withAlpha(0.3),
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
		}
	},
	
	_curCartesianPosition: new Cesium.Cartesian3(),
	
	_positions: [],
	
	_numberOfInputVertices: 0,
	
	_getPositionsCallbackProperty: null,
	
	_getPolygonPositionsCallbackProperty: null,
	
	_getPolylinePositionsCallbackFunction: function(me) {
		var callbackFunction =  function(time, result) {
			result = me._positions;
			return result;
		};
		return callbackFunction;
	},
	
	_getPolygonPositionsCallbackFunction: function(me) {
		var callbackFunction =  function(time, result) {
			return new Cesium.PolygonHierarchy(me._positions)
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
		
		//create scratch entity
		me.createDragEntity();
		//set the callback property to force the visualization of the polyline during user interaction
		me._getPolylinePositionsCallbackProperty = new Cesium.CallbackProperty(me._getPolylinePositionsCallbackFunction(me), false);
		me._getPolygonPositionsCallbackProperty = new Cesium.CallbackProperty(me._getPolygonPositionsCallbackFunction(me), false);
		//register the mouse events
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.requestVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.getVertexHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.LEFT_CLICK);
			
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.endInputHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	},
	
	/**
	 * create the scratch entity
	*/
	createDragEntity: function() {
		var me = this;
		//create entity polyline
		//me.getPolyline().show = false;
		me.getPolygon().show = false;
		var polygonGraphics = new Cesium.PolygonGraphics(me.getPolygon());
		var entity = me.getDataSource().entities.add({
			polyline : new Cesium.PolylineGraphics(me.getPolyline()),
			polygon: polygonGraphics
		});
		me.setDragEntity(entity);
		return entity;
	},
	
	requestVertexHandler: function(movement, context) {
		var me = (context ? context : this);

		if(me._numberOfInputVertices == 0) {
			requestVertex(movement, context, me.getFirstVertexMessage());
		}
		else if(me._numberOfInputVertices == 1) {
			requestVertex(movement, context, me.getSecondVertexMessage());
		}
		else if(me._numberOfInputVertices == 2) {
			requestVertex(movement, context, me.getThirdVertexMessage());
		}
		else if(me._numberOfInputVertices > 2) {
			requestVertex(movement, context, me.getNextVertexMessage());
		}
		
		function requestVertex(movement, me, message) {
			me._curCartesianPosition = me.getPositionFromMouse(movement.endPosition, me._curCartesianPosition);
			if (me._curCartesianPosition) {
				me.showTooltip(movement.endPosition, message);
				//add polyline/polygon vertex based on mouse position
				if(me._positions.length == me._numberOfInputVertices)
					me._positions.push(me._curCartesianPosition);
			} else {
				me.hideTooltip();
			}
		}
	},
	
	/**
	* Method called once the user left click to define a new vertex
	*
	* @private
	*/
	getVertexHandler: function(movement, context) {
		var me = (context ? context : this);
		var cartesian = me.getPositionFromMouse(movement.position);
		if (cartesian) {
			me.getDragEntity().polyline.positions =  me._getPolylinePositionsCallbackProperty;
			me.getDragEntity().polygon.hierarchy =  me._getPolygonPositionsCallbackProperty;
			me._positions.pop();
			me._positions.push(cartesian);
			me._numberOfInputVertices += 1;
			me.getDragEntity().polyline.show = true;
			me.getDragEntity().polygon.show = true;
		}
	},
	
	endInputHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me._numberOfInputVertices <= 2) return;
		me._positions.pop();
		me._numberOfInputVertices -= 1;
		me.getDragEntity().polyline.positions =  me._positions;
		me.getDragEntity().polygon.hierarchy =  new Cesium.PolygonHierarchy(me._positions);
		var data = me.getDragEntity().polygon.clone();
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