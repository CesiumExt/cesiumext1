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
 * Represents a `<PropertyIsNull>` comparison operator.
 *
 * @class CesiumExt.format.filter.IsNull
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.IsNull', {
    extend:'CesiumExt.format.filter.Comparison',
	
	statics: {
		TPL: 
			'<{0}>' + 
				'<PropertyName>{1}</PropertyName>' +
			'</{0}>'
	},
	
	/**
	 * The constructor method
	 * @param {String} propertyName Name of the context property to compare.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'PropertyIsNull';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.IsNull.TPL,
			me.getTagName(),
			me.getPropertyName()
		);
	}
});
