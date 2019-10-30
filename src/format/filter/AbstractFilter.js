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
 * Abstract class normally only used for creating subclasses and not instantiated in apps.
 *
 * @class CesiumExt.format.filter.AbstractFilter
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.AbstractFilter', {
    extend: 'Ext.Base',
	requires: [
		'CesiumExt.format.WFSRequest'
	],
	
	config: {
		/**
		* The xml tag name
		* @cfg {String} tagName
		*/
		tagName: null
	},
	
	statics: {
		TPL: 
			'<Filter xmlns="{0}">' +
				'{1}' +
			'</Filter>'	
	},
	
	/**
	* The constructor method.
	*
	* @param {String} tagName The XML tag name for this filter.
	*/
	constructor: function(config) {
		var me = this;
		config = config || {};
		me.callParent([config]);
		me.initConfig(config);
    },
	
	/**
	* Encode the filter in a xml string format
	*/
	encodeFilterAsXmlString: function() {
		var me = this;
		var result = Ext.String.format(
			CesiumExt.format.filter.AbstractFilter.TPL,
			CesiumExt.format.WFSRequest.OGCNS,
			me.toString()
		);
		return encodeURIComponent(result);
	}
});