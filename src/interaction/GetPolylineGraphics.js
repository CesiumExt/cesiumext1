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
 * Class used to get the Cesium PolylineGraphics
 * through user interaction
 * @class CesiumExt.interaction.GetPolylineGraphics
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolylineGraphics', {
    extend: 'CesiumExt.interaction.GetInteraction',
	
	config: {
		firstVertexMessage: 'Select the first vertex or &lt;esc&gt; to cancel',
		secondVertexMessage: 'Select the second vertex or &lt;esc&gt; to cancel',
		nextVertexMessage: 'Select next vertex or right click to finish or &lt;esc&gt; to cancel',
		polyline : {
			material : Cesium.Color.RED,
			clampToGround: true,
			width: 2.0
		}
	},
	
	_curCartesianPosition: new Cesium.Cartesian3(),
	
	_ellipsoidGeodesic: null,
	
	_ellipsoid: null,
	
	_startCartographicPosition: new Cesium.Cartographic(),
	
	_endCartographicPosition: new Cesium.Cartographic(),
	
	_positions: [],
	
	_distances: [],
	
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
		me._distances = [];
		me._ellipsoid =  me.getViewer().scene.globe.ellipsoid;
		me._ellipsoidGeodesic = new Cesium.EllipsoidGeodesic(me._startCartographicPosition, me._endCartographicPosition, me._ellipsoid);
		
		//disable zoom/pan, etc.
		//me.getViewer().scene.screenSpaceCameraController.enableInputs  = false;
		
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
	
	calculateTotalDistance: function() {
		var me = this;
		var distance = 0;
		var len = me._positions.length;
		if(len >= 2) {
			for(var i = 1; i < len; ++i) {
				me._startCartographicPosition = Cesium.Cartographic.fromCartesian(me._positions[i - 1],
					me._ellipsoid, me._startCartographicPosition);
				me._endCartographicPosition = Cesium.Cartographic.fromCartesian(me._positions[i],
					me._ellipsoid, me._endCartographicPosition);
				me._ellipsoidGeodesic.setEndPoints(me._startCartographicPosition, me._endCartographicPosition);
				distance += me._ellipsoidGeodesic.surfaceDistance;
			}
		}
		return distance;
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
			var dist = 0;
			me._curCartesianPosition = me.getPositionFromMouse(movement.endPosition, me._curCartesianPosition);
			if (me._curCartesianPosition) {
				//add polyline vertex based on mouse position
				if(me._positions.length == me._numberOfInputVertices) {
					me._positions.push(me._curCartesianPosition);
				}
				//dist = me.calculateTotalDistance();
				strDist = Ext.util.Format.number(me.calculateTotalDistance(), '0.000')
				var msgTemplate = '{0}\nDistance: {1}m';
				var msg = Ext.String.format(msgTemplate, message, strDist);
				//show tooltip message
				me.showTooltip(movement.endPosition, msg);
				
			} else {
				me.hideTooltip();
			}
		}
	},
	
	getVertexHandler: function(movement, context) {
		var me = (context ? context : this);
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
		if(me._numberOfInputVertices < me._positions.length) {
			me._positions.pop();
		}
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