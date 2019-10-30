/* Copyright (c) 2019-Present CesiumExtJS
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
 * Base for WFS GetFeature property BBox filter.
 *
 * @class CesiumExt.format.filter.BBox
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.BBox', {
    extend:'CesiumExt.format.filter.AbstractFilter',
	requires: [
		'CesiumExt.format.WFSRequest'
	],
	config: {
		/**
		* The xml geometry name
		* @cfg {String} geometryName
		*/
		geometryName: 'geometry',
		
		/**
		* The bbox extents (in radians)
		* @cfg {Cesium.Rectangle} extent
		*/
		extent: null,
		
		/**
		* The srs name
		* @cfg {String} srsName
		*/
		srsName: 'EPSG:4326'
	},
	
	statics: {
		TPL: 
			'<{0}>' + 
				'<PropertyName>{1}</PropertyName>' +
				'<Envelope xmlns="{2}" srsName="{3}">' +
					'<lowerCorner>{4} {5}</lowerCorner>' +
					'<upperCorner>{6} {7}</upperCorner>' +
				'</Envelope>' +
			'</{0}>'
		
	},
	
	/**
	* Constructor method
	* @param {String} tagName The XML tag name for this filter.
	* @param {String} propertyName Name of the context property to compare.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'BBOX';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.BBox.TPL,
			me.getTagName(),
			me.getGeometryName().toString(),
			CesiumExt.format.WFSRequest.GMLNS,
			me.getSrsName(),
			Cesium.Math.toDegrees(me.getExtent().west),
			Cesium.Math.toDegrees(me.getExtent().south),
			Cesium.Math.toDegrees(me.getExtent().east),
			Cesium.Math.toDegrees(me.getExtent().north)
		);
	}
});

