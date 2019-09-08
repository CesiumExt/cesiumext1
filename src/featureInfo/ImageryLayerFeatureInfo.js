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
 * Class used to retrieve the Feature Information from the user input.
 * The features are retrieved based on the mouse position where the 
 * user clicked in the canvas
 * @class CesiumExt.featureInfo.ImageryLayerFeatureInfo
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.featureInfo.ImageryLayerFeatureInfo', {
	extend: 'Ext.Base',
	requires: [
        'CesiumExt.interaction.GetPositionInteraction'
    ],
	
	config: {
		viewer: null,
		message: 'Click Position to Select Features',
		imageryLayers: null
	},
	
	
	/**
	* @parameter {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
		if(!config.viewer)
			Ext.raise('viewer must be provided.');
		me.viewer = config.viewer;
		if(!config.imageryLayers)
			Ext.raise('imageryLayers must be provided.');
		else
		//delete config.imageryLayers;
		if(!config.message)
			config.message = me.config.message;
		me.initConfig(config);
		me.callParent([config]);
		console.log(me.viewer);
    },
	
	getFeatures: function()
	{
		var me = this;
		//create interaction to get position
		var getPosInteraction = Ext.create('CesiumExt.interaction.GetPositionInteraction',
		{
			viewer: me.viewer,
			message: me.getMessage()
		});
		
		getPosInteraction.on('positionRetrieved', function(data) {
			showFeatureInfoBox(data, me);
			
			//function to show the FeatureInfo Box
			function showFeatureInfoBox(data, context)
			{
				var me = context;
				var windowPos = data.windowPosition;
				
				getPosInteraction.un('positionRetrieved', showFeatureInfoBox);
				console.log('FeatureInfoBox:' + windowPos);
			}
		});
	},
	
	
	
	 /**
     * @inheritdoc
     */
	 /*
    destroy: function() { 
		this.cleanup();
		this.callParent(arguments);
	}
	*/
	
});