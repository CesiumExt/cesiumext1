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
 * Abstract class only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature property binary comparison filters.
 *
 * @class CesiumExt.format.filter.ComparisonBinary
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.ComparisonBinary', {
    extend:'CesiumExt.format.filter.Comparison',
	
	config: {
		
		/**
		 * The property name
		 *
		 * @cfg {String} propertyName
		*/
		propertyName: null,
		/**
		 * The expression
		 *
		 * @cfg {String | Number} expression
		*/
		expression: null,
		
		/**
		 * Case-sensitive?
		 * @cfg {Boolean|undefined} matchCase
		*/
		matchCase: null,
	},
	
	statics: {
		TPL: 
			'<{0}>' + 
				'<PropertyName>{1}</PropertyName>' +
				'<Literal>{2}</Literal>' +
			'</{0}>'
	},

	/**
	* The constructor method
	*
	* @param {Object} config A configuration object having the
	*	following attributes:
	* 	 tagName {String}: The XML tag name for this filter.
	* 	 propertyName {String}: Name of the context property to compare.
	* 	 expression {String | Number}: The value to compare.
	*    matchCase {Boolean}: is Case-sensitive?
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.ComparisonBinary.TPL,
			this.getTagName(),
			this.getPropertyName(),
			this.getExpression()
		);
	}
});

