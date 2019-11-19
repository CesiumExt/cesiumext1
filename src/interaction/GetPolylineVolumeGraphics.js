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
 * Class to draw an Cesium Entity Polyline through user interaction 
 * @class CesiumExt.interaction.DrawPolyline
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolylineVolumeGraphics', {
    extend: 'CesiumExt.interaction.GetPolylineGraphics',
	
	config: {
		polylineVolume : {
			material : Cesium.Color.RED,
			width: 3.0,
			//shape: CesiumExt.interaction.GetPolylineVolumeGraphics.computeCircle(1.0)
		}
	},
	
	statics: 
	{
		computeCircle: function(radius) {
			var positions = [];
			for (var i = 0; i < 360; i++) {
				var radians = Cesium.Math.toRadians(i);
				positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
			}
			return positions;
		}
	},

	
	/**
	* @param {Object} config The configuration object for this Interaction.
	* @param {Cesium.PolylineVolumeGraphics} polyline the polyline to associate
	*	with the entity
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		me.initConfig(config);
    },
	
	endInputHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me._numberOfInputVertices < 2) return;
		me._positions.pop();
		me._numberOfInputVertices -= 1;
		me.getDragEntity().polyline.positions =  me._positions;
		var polylineVolume = new Cesium.PolylineVolumeGraphics(me.getPolylineVolume());
		polylineVolume.positions = me._positions;
		
		var data = polylineVolume.clone();
		//cleanup
		me.cleanup();
		//fire event
		me.fireEvent('drawend', data);
	},
	
	/**
	* Cleanup the resources
	*/
	cleanup: function() {
		var me = this;
		me.callParent(arguments);
	},
	
	/**
     * @inheritdoc
    */
    destroy: function() { 
		this.callParent(arguments);
	}
	
});