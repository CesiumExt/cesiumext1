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
 * Represents a `<PropertyIsNotEqualTo>` binary comparison operator.
 *
 * @class CesiumExt.format.filter.NotEqualTo
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.NotEqualTo', {
    extend:'CesiumExt.format.filter.ComparisonBinary',

	
	/**
	 * The constructor method.
	 *
	 * @param {String} propertyName Name of the context property to compare.
	 * @param {String | number} expression The value to compare.
	 * @param {Boolean} matchCase Case-sensitive?
	 */
	
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'PropertyIsNotEqualTo';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	statics: {
		TPL: 
			'<{0}>' + 
				'<PropertyName>{1}</PropertyName>' +
				'<Literal>{2}</Literal>' +
			'</{0}>'
	},
	
	toString: function(){
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.NotEqualTo.TPL,
			this.getTagName(),
			this.getPropertyName(),
			this.getExpression()
		);
	}
});