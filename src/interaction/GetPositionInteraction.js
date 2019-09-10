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
 * Class used to retrieve the coordinate position from the user.
 * The coordinate retrieved is the mouse position where the user clicked
 * in the canvas
 * @class CesiumExt.interaction.GetPositionInteraction
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.interaction.GetPositionInteraction', {
    extend: 'CesiumExt.interaction.Interaction',
	//mixins: ['Ext.mixin.Observable'],
	
	config: {
		viewer: null,
		message: 'Pick Point to retrieve Coordinate',
		showCartographicCoordinate: false,
		label : {
            show : false,
            showBackground : true,
            //font : '14px monospace',
			//font : '10px monospace',
			font : '14px Helvetica',
            fillColor : Cesium.Color.YELLOW,
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(15, 0),
        }
	},
	
	_entityLabel : null,
	
	_screenSpaceEventHandler: null,
	
	
	/**
	* @param {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		if(!config.viewer)
			config.viewer = me.config.viewer;
		else
			me.config.viewer = config.viewer;
		if(!config.message)
			config.message = me.config.message;
		if(!config.showCartographicCoordinate)
			config.showCartographicCoordinate = me.config.showCartographicCoordinate;
		if(!config.label)
			config.label = me.config.label;
		config.label.show = false;
		
		me.callParent([config]);
		
		//create entity label
		me.label.show = false;
		me._entityLabel = me.viewer.entities.add({
			label : me.label
		});
		//register screen space event handlers
		me._screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(me.viewer.scene.canvas);
		me._screenSpaceEventHandler.setInputAction(function(movement) {me.mouseMoveHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		me._screenSpaceEventHandler.setInputAction(function(movement) {me.getCoordinateHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.LEFT_CLICK);
		//me.on('beforedestroy', me.onBeforeDestroy, me);
    },
	
	/**
	* Event handler to show the label (tooltip) during the mouse movement
	*
	* @private
	*/
	mouseMoveHandler: function(movement, context) {
		var me = (context ? context : this);
        var cartesian = me.viewer.camera.pickEllipsoid(movement.endPosition, me.viewer.scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

            me._entityLabel.position = cartesian;
            me._entityLabel.label.show = true;
            me._entityLabel.label.text = me.message;
			/*
                'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
                '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
			*/
        } else {
            me._entityLabel.label.show = false;
        }
	},
	
	/**
	*
	* @private
	*/
	getCoordinateHandler: function(movement, context) {
		var me = (context ? context : this);
		var cartesianPosition = me.viewer.camera.pickEllipsoid(movement.position, me.viewer.scene.globe.ellipsoid);
		if(cartesianPosition) {
			var cartographicPosition = Cesium.Cartographic.fromCartesian(cartesianPosition);
			var data = {
				viewer: me.viewer,
				cartesianPosition: cartesianPosition,
				cartographicPosition: cartographicPosition,
				windowPosition: movement.position
			};
			me.fireEvent('positionRetrieved', data);
			//cleanup label entity and all the registered events
			me.cleanup();
		}
	},
	
	/**
	*
	* @private
	*/
	cleanup: function() {
		//remove label
		var me = this;
		if (me._entityLabel) {
			me.viewer.entities.remove(me._entityLabel);
			me._entityLabel = null;
		}
		//destroy screen space event handlers
		 me._screenSpaceEventHandler = me._screenSpaceEventHandler && me._screenSpaceEventHandler.destroy();
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
	
});