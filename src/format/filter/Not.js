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
 * Represents a logical `<Not>` operator for a filter condition.
 *
 * @class CesiumExt.format.filter.Not
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.Not', {
    extend: 'CesiumExt.format.filter.AbstractFilter',
	config: {
		/**
		* The Filter condition
		* @cfg {CesiumExt.format.filter.AbstractFilter} condition
		*/
		condition: null
	},
	
	statics: {
		TPL: 
			'<{0}>' + 
				'{1}' +
			'</{0}>'
	},
	
	/**
	 * The constructor method
	 * @param {CesiumExt.format.filter.AbstractFilter} condition Filter condition.
	 */
	
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'Not';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		return Ext.String.format(
			CesiumExt.format.filter.Not.TPL,
			me.getTagName(),
			me.getCondition().toString()
		);
	}
});

