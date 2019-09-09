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
		if(!config.imageryLayers)
			Ext.raise('imageryLayers must be provided.');
		if(!config.message)
			config.message = me.config.message;
		me.initConfig(config);
		me.callParent([config]);
		console.log(me.viewer);
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
				
				//create panel
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
				
				var pickRay = me.getViewer().camera.getPickRay(windowPos);
				var featuresPromise = me.getViewer().imageryLayers.pickImageryLayerFeatures(pickRay, me.getViewer().scene);
				
				
				if (!Cesium.defined(featuresPromise)) {
					console.log('No features picked.');
				}
				else {
					Cesium.when(featuresPromise, function(features) {
						console.log('Number of features: ' + features.length);
						if (features.length > 0) {
							console.log('First feature properties: ' + features[0].properties);
							console.log('First feature layer: ' +  features[0].imageryLayer.imageryProvider.layers);
							
							
							
						
							//iterate over all the features to show the properties for each feature
							Ext.each(features, function(feature) {
								var featGrid = Ext.create('Ext.grid.property.Grid', {
									title: feature.imageryLayer.imageryProvider.layers,
									source: feature.properties,
									sortableColumns: false,
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
				
				getPosInteraction.un('positionRetrieved', showFeatureInfoBox);
				getPosInteraction.destroy();
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