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
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for OGC n-ary logical filters.
 *
 * @class CesiumExt.format.filter.LogicalNary
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.LogicalNary', {
    extend: 'CesiumExt.format.filter.AbstractFilter',
	requires: [
        'Ext'
    ],
	
	config: {
		/**
		* The conditions for the n-ary logical operator
		* @cfg {[CesiumExt.format.filter.AbstractFilter]} conditions
		*/
		conditions: null
	},
	
	/**
	* The constructor method.
	*
	* @param {Object} config Configuration object with the 
	*	array of conditions.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		if(!config.conditions || config.conditions.length < 2)
			Ext.raise('At least 2 conditions are required');
		me.callParent([config]);
		me.initConfig(config);
    },
	
	/**
	* Returns the xml string of the filter
	*/
	toString: function() {
		var me = this;
		var parts = ['<'+ me.getTagName() + '>'];
		for(var i = 0; i < me.getConditions().length; ++i) {
			var condition =  me.getConditions()[i];
			parts.push(condition.toString());
		}
		parts.push('</'+ me.getTagName() + '>');
		return parts.join('');
	}
});
