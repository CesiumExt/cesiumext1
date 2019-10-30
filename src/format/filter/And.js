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
 * Class representing the logical `<And>` operator between two or more 
 * filter conditions.
 *
 * @class CesiumExt.format.filter.And
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.And', {
    extend: 'CesiumExt.format.filter.LogicalNary',
	
	/**
	* The constructor method.
	* @constructor
	* @param {Object} conditions The config 
	*	object having the filter conditions.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'And';
		
		me.callParent([config]);
		me.initConfig(config);
    },
});

