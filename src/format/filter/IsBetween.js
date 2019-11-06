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
 * Represents a `<PropertyIsBetween>` comparison operator.
 *
 * @class CesiumExt.format.filter.IsBetween
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.IsBetween', {
    extend:'CesiumExt.format.filter.Comparison',
	
	config: {
		
		/**
		 * The lower  boundary of the range
		 *
		 * @cfg {Number} lowerBoundary
		*/
		lowerBoundary: null,
		
		/**
		 * The upper  boundary of the range
		 *
		 * @cfg {Number} upperBoundary
		*/
		upperBoundary: null
	},
	
	statics: {
		TPL: 
			'<{0}>' + 
				'<PropertyName>{1}</PropertyName>' +
				'<LowerBoundary>{2}</LowerBoundary>' +
				'<UpperBoundary>{3}</UpperBoundary>' +
			'</{0}>'
	},
	
	/**
	* The constructor method
	*
	* @param {String} propertyName Name of the context property to compare.
	* @param {Number} lowerBoundary The lower bound of the range.
	* @param {Number} upperBoundary The upper bound of the range.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'PropertyIsBetween';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.IsBetween.TPL,
			me.getTagName(),
			me.getPropertyName(),
			me.getLowerBoundary(),
			me.getUpperBoundary()
		);
	}
});
