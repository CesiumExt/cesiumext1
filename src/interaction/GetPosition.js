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
 * @class CesiumExt.interaction.GetPosition
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.interaction.GetPosition', {
    extend: 'CesiumExt.interaction.Interaction',
	
	config: {
		viewer: null,
		message: 'Pick Point to retrieve Coordinate or &lt;esc&gt; to cancel',
	},
	
	_curCartesianPosition: new Cesium.Cartesian3(),
	
	/**
	* @param {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		me.initConfig(config);
		
		//register screen space event handlers
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.mouseMoveHandler(movement, me);}, 
			Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		me.getScreenSpaceEventHandler().setInputAction(function(movement) {me.getCoordinateHandler(movement, me);}, 
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
		me._curCartesianPosition = me.getPositionFromMouse(movement.endPosition, me._curCartesianPosition);
        if (me._curCartesianPosition) {
            var cartographic = Cesium.Cartographic.fromCartesian(me._curCartesianPosition);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
			
			var longitude = longitudeString.slice(-9) + '\u00B0';
			var latitude = latitudeString.slice(-9) + '\u00B0'
			var msgTemplate = '{0}\nLon: {1}\nLat: {2}';
			var msgTemplate = '{0}\nLat\\Long: {1}, {2}';
			var msg = Ext.String.format(msgTemplate, me.getMessage(), latitude, longitude);
			me.showTooltip(movement.endPosition, msg);
			
        } else {
            me.hideTooltip();
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