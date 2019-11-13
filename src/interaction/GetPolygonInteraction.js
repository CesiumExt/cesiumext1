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
 * Class used to retrieve the Polygon from the user through
 * mouse input.
 * @class CesiumExt.interaction.GetPolygonInteraction
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetPolygonInteraction', {
    extend: 'CesiumExt.interaction.Interaction',
	
	config: {
		firstVertexMessage: 'Select the first vertex or <esc> to cancel',
		secondVertexMessage: 'Select the second vertex or <esc> to cancel',
		thirdVertexMessage: 'Select the third vertex or <esc> to cancel',
		nextVertexMessage: 'Select next vertex or right click to finish or <esc> to cancel',
		label : {
            show : false,
            showBackground : true,
			font : '12px Helvetica',
            fillColor : Cesium.Color.YELLOW,
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(15, 0),
			//heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
		polygon : {
			material : Cesium.Color.RED.withAlpha(0.5),
			height: 0,
			outline : true // height is required for outline to display
		}
	},
	
	_entityLabel: null,
	
	_entityPolygon: null,
	
	_polygonHierarchy: null
	
	getPolygonHierarchyCallbackProperty: null,
	
	getPolygonHierarchyCallbackFunction: function(me) {
		var callbackFunction =  function(time, result) {
			//return Cesium.Rectangle.clone(me._rectangleSelector, result);
			return me._polygonHierarchy;
		};
		return callbackFunction;
	},
	
	
 });
 
 