/* Copyright (c) 2019-Today CesiumExt
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
 * Abstract class; normally only used for creating subclasses 
 * and not instantiated in the application.
 * Base class for the Interaction functionalities.
 * @class CesiumExt.interaction.Interaction
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.interaction.Interaction', {
    extend: 'Ext.Base',
	//mixins: ['Ext.mixin.Observable'],
	mixins: {
        observable : 'Ext.util.Observable'
    },
	
	config: {
		viewer: null
	},
	
	
	/**
	* @param {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		this.mixins.observable.constructor.call(this, config);
    },
	
});