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
	
	_screenSpaceEventHandler: undefined,
	
	getScreenSpaceEventHandler: function() {
		var me = this;
		if(!me._screenSpaceEventHandler)
			me._screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(me.getViewer().scene.canvas);
		return me._screenSpaceEventHandler;
	},
	
	
	/**
	* @param {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		me.initConfig(config);
		this.mixins.observable.constructor.call(this, config);
		
		//Register event handle handler to listen <esc> key to cancel command
		document.addEventListener('keydown', function(evt) {me.handleEscKey(evt, me);});
    },
	
	/**
	* Event handler called once the user press the <esc> key.
	* As result, the system will cancel the operation
	*
	* @private
	*/
	handleEscKey: function(evt, context) {
		var me = (context ? context : this);
	    evt = evt || window.event;
	    if (evt.keyCode == 27) {
			me.fireEvent('cancelled');
	        me.cleanup();
	    }
	},
	
	
	/**
	* Cleanup the resources
	*/
	cleanup: function() {
		var me = this;
		me._screenSpaceEventHandler = me._screenSpaceEventHandler && me._screenSpaceEventHandler.destroy();
		//remove <esc> key event handler
		 document.removeEventListener('keydown', me.handleEscKey);
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
	
});