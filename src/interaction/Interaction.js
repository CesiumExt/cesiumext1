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
	mixins: {
        observable : 'Ext.util.Observable'
    },
	
	config: {
		viewer: null
	},
	
	
	_screenSpaceEventHandler: undefined,
	
	_isActive: true,
	
	_rayScratch: new Cesium.Ray(),
	
	getScreenSpaceEventHandler: function() {
		var me = this;
		if(!me._screenSpaceEventHandler)
			me._screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(me.getViewer().scene.canvas);
		return me._screenSpaceEventHandler;
	},
	
	/**
	* Return whether the interaction is currently active.
	* @return {Boolean} `true` if the interaction is active, `false` otherwise.
	*/
	getActive: function() {
		return this._isActive;
	},
	
	/**
    * Activate or deactivate the interaction.
    * @param {Boolean} active Active.
    */
	setActive: function(active) {
		this._isActive = active;
	},
	
	statics: {
		TOOLTIP_TPL: 
			'<p style="color:white;' + 
				'background:rgba(0, 0, 0, 0.5);' + 
				'border-radius: 4px;' + 
				'padding: 4px 8px;' +
				'opacity: 0.7;' +
				//'white-space:nowrap;' +
				'white-space: pre-wrap;' +
				'position:absolute;' +
				'left:{0}px;' +
				'top:{1}px"' + 
			'>' + 
				'{2}<br/>' +
			'</p>'
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
		//not show selectionIndicator and infoBox during interaction
		me.getViewer().selectionIndicator.viewModel.selectionIndicatorElement.style.visibility = 'hidden';
        document.getElementsByClassName('cesium-infoBox')[0].style.visibility = "hidden";
    },
	
	getPositionFromMouse: function(windowPosition, cartesianResult) {
		var me = this;
		var scene = me.getViewer().scene;
		var pickedObject = scene.pick(windowPosition);
		var position;
		if (Cesium.defined(pickedObject) && (pickedObject instanceof Cesium.Cesium3DTileFeature || pickedObject.primitive instanceof Cesium.Cesium3DTileset)) {
			scene.render();
			position = scene.pickPosition(windowPosition, cartesianResult);
			return position;
		} else {
			me._rayScratch = scene.camera.getPickRay(windowPosition, me._rayScratch);
			position = scene.globe.pick(me._rayScratch, scene, cartesianResult);
			return position;
		}
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
	* Show the tooltip message on screen
	*
	* @param {Cesium.Cartesian2} windowPosition The window position where the tooltip will be shown
	* @param {String} message The message tooltip
	*/
	showTooltip: function(windowPosition, message) {
		//var innerhtml = `<p style="color:white;background:rgba(0, 0, 0, 0.5);border-radius: 4px;padding: 4px 8px;opacity: 0.7;white-space:nowrap;position:absolute;top:${windowPosition.y}px;left:${windowPosition.x}px"/>${message}<br/><p/>`
		var innerhtml =  Ext.String.format(CesiumExt.interaction.Interaction.TOOLTIP_TPL, windowPosition.x, windowPosition.y, message);
		document.getElementById('cesiumTooltip').innerHTML = innerhtml;
	},
	
	/**
	* Method to hide the tooltip
	*/
	hideTooltip: function() {
		document.getElementById('cesiumTooltip').innerHTML = '';
	},

	
	/**
	* Cleanup the resources
	*/
	cleanup: function() {
		var me = this;
		me._screenSpaceEventHandler = me._screenSpaceEventHandler && me._screenSpaceEventHandler.destroy();
		//reset visibility for selectionIndicator and infoBox after interaction
		me.getViewer().selectionIndicator.viewModel.selectionIndicatorElement.style.visibility = 'visible';
        document.getElementsByClassName('cesium-infoBox')[0].style.visibility = "visible";
		//remove <esc> key event handler
		document.removeEventListener('keydown', me.handleEscKey);
		me.hideTooltip();
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
	
});