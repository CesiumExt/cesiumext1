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
 * Represents a `<During>` comparison operator.
 *
 * @class CesiumExt.format.filter.During
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.During', {
    extend:'CesiumExt.format.filter.Comparison',
	
	
	/**
	 * @type {String}
	*/
	begin: null,
	
	/**
     * @type {String}
	*/
	end: null,
	
	/**
	* @constructor
	* @param {String} propertyName Name of the context property to compare.
	* @param {String} begin The begin date in ISO-8601 format.
	* @param {String} end The end date in ISO-8601 format.
	*/
	constructor: function(propertyName, begin, end) {
		this.callParent(['During', propertyName]);
		this.begin = begin;
		this.end = end;
    },
});

