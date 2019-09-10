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
	},
	
	
	/**
	* @param {Object} The configuration object for this Interaction.
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
		if(!config.viewer)
			Ext.raise('viewer must be provided.');
		if(!config.message)
			config.message = me.config.message;
		me.initConfig(config);
		me.callParent([config]);
    },
	
	/**
	* Method to retrieve the feature information from the imagery layer based
	* on the position indicated by the user through the mouse click in the canvas
	**/
	getFeatures: function()
	{
		var me = this;
		//create interaction to get position
		var getPosInteraction = Ext.create('CesiumExt.interaction.GetPositionInteraction',
		{
			viewer: me.getViewer(),
			message: me.getMessage()
		});
		
		getPosInteraction.on('positionRetrieved', function(data) {
			showFeatureInfoBox(data, me);
			
			//function to show the FeatureInfo Box
			function showFeatureInfoBox(data, context)
			{
				var me = context;
				var windowPos = data.windowPosition;
				//send the feature info request to imagery layers
				var pickRay = me.getViewer().camera.getPickRay(windowPos);
				var featuresPromise = me.getViewer().imageryLayers.pickImageryLayerFeatures(pickRay, me.getViewer().scene);
				
				//get the response for the feature info request and load in the property grid
				if (!Cesium.defined(featuresPromise)) {
					Ext.Msg.alert('Message', 'No features picked.!!!', Ext.emptyFn);
				}
				else {
					Cesium.when(featuresPromise, function(features) {
						if (features.length > 0) {
							//create an accordion panel
							var accordion = Ext.create('Ext.Panel', {
								layout: 'accordion',
								items: []
							});
							//create and show popup window
							var popupWindow = Ext.create('Ext.window.Window', {
								title: "Feature Info",
								height: 600,
								width: 450,
								scrollable: true,
								constrainHeader: true,
								items: [accordion]
							});
							popupWindow.show();
							
							//iterate over all the features to show the properties for each feature
							Ext.each(features, function(feature) {
								var featGrid = Ext.create('Ext.grid.property.Grid', {
									title: feature.imageryLayer.imageryProvider.layers,
									source: feature.properties,
									sortableColumns: true,
									collapsible: true
								});
								accordion.add(featGrid);
							});
							popupWindow.items.getAt(0).updateLayout();
						}
						else {
							Ext.Msg.alert('Message', 'No feature found!!!', Ext.emptyFn);
						}
					});
				}
				//unregister and destroy the interaction component
				getPosInteraction.un('positionRetrieved', showFeatureInfoBox);
				getPosInteraction.destroy();
			}
		});
	},
	
});