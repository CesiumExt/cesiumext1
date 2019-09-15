/* Copyright (c) 2019-Present CesiumExt
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
 * The Cesium ImageryLayer Model class used by the stores.
 * This Model definition represents all the concrete instances of Cesium.ImageryLayer
 * @class CesiumExt.data.model.ImageryLayerModel
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.data.model.ImageryLayerModel', {
    extend: 'CesiumExt.data.model.Base',
    mixins: [
       
    ],

    // <debug>
    symbols: [
    
    ],
    // </debug>
	
	proxy: {
		type: 'memory',
		reader: 'json'
    },
	
	
	fields: [
	
		/*
		{
            name: 'rectangle',
			persist: false,
			//defaultValue: Ext.up('CesiumExt.data.model.ImageryLayerModel').getCesiumImageryLayer().imageryProvider.rectangle,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().name;
            }
        },
		*/
		{
			name: 'name',
			type: 'string',
			persist: false,
			defaultValue: 'Unnamed',
		},
		{
			name: 'tooltip',
			type: 'string',
			persist: false,
			defaultValue: 'Unnamed Layer',
		},
		{
			name: 'iconUrl',
			type: 'string',
			persist: false,
			defaultValue: null,
		},
		{
            name: 'alpha',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().alpha;
            }
        },
		{
            name: 'brightness',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().brightness;
            }
        },
		{
            name: 'contrast',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().contrast;
            }
        },
		{
            name: 'hue',
			defaultValue: 0.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().hue;
            }
        },
		{
            name: 'saturation',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().saturation;
            }
        },
		{
            name: 'gamma',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().gamma;
            }
        },
		{
            name: 'splitDirection',
			defaultValue: Cesium.ImagerySplitDirection.NONE,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().splitDirection;
            }
        },
		{
            name: 'minificationFilter',
			defaultValue: Cesium.TextureMinificationFilter.LINEAR,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().minificationFilter;
            }
        },
		{
            name: 'magnificationFilter',
			defaultValue: Cesium.TextureMagnificationFilter.LINEAR,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().magnificationFilter;
            }
        },
		{
            name: 'show',
            type: 'boolean',
			defaultValue: true,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().show;
            }
        },
		{
            name: 'cutoutRectangle',
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().cutoutRectangle;
            }
        },
		{
            name: 'colorToAlpha',
			defaultValue: true,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().colorToAlpha;
            }
        },
		{
            name: 'colorToAlphaThreshold',
            type: 'number',
			defaultValue: 	0.004,
			persist: false,
            convert: function(v, record) {
				if(record.getCesiumImageryLayer())
					return record.getCesiumImageryLayer().colorToAlphaThreshold;
            }
        },
	],
	
	addFieldAfterProviderIsReady: function(isReady, cesiumImageryLayer) {
		var me = this;
		if(isReady) {
			var field = new Ext.data.field.Field({
				name: 'rectangle',
				persist: false,
				defaultValue: cesiumImageryLayer.imageryProvider.rectangle,
				convert: function(v, record) {
					return record.cesiumImageryLayer.name;
				}
			});
			me.getFields().push(field);
		}
	},
	
	
	/**
	* The `CesiumExt.data.model.ImageryLayerModel` Constructor.
	*
	* @param {Cesium.ImageryLayer | Object} data. The Cesium.ImageryLayer instance or
	* 	json object configuration to create a new Cesium.ImageryLayer instance
	* @inheritdoc
	*/
	constructor: function(data) {
		var me = this;		
		var result = me.createCesiumImageryLayer(data);
		if(result) {
			var cesiumImageryLayer = result[1];
			//add field once data provider is ready
			if(cesiumImageryLayer.imageryProvider.ready) {
				me.addFieldAfterProviderIsReady(true, cesiumImageryLayer);
			}
			else {
				cesiumImageryLayer.imageryProvider.readyPromise.then(function(isReady) {
					me.addFieldAfterProviderIsReady(isReady, cesiumImageryLayer);
				});
			}
			// init record with configuration properties of underlying Cesium.DataSource instance
			me.callParent([result[0], result[1]]);
		}
		else {
			me.callParent(data);
		}

    },
	
	
	/**
	* Function to create a instance of Cesium.ImageryLayer based on the config object
	* @param {Cesium.ImageryLayer | Object} The Cesium.ImageryLayer instance or the
	* 	json object configuration to create a new Cesium.ImageryLayer instance
	* @private
	*/
	createCesiumImageryLayer: function(data) {
		var me = this;
		var cesiumImageryLayer;
		data = data || {};
		
		var newData = {};
		// instantiate Cesium.ImageryLayer if object if plain data is handed over
		if (data instanceof Cesium.ImageryLayer) {
			cesiumImageryLayer = data;
		}
		else {
			if(!data.creationFunction)
				return;
			//retrieve all the fields not belonging to ImageryLayer
			var name = data.name;
			var iconUrl = data.iconUrl;
			var tooltip = data.tooltip;	
			//retrieve function to create the ImageryLayer Provider
			var creationFunction = data.creationFunction;
			//create the ImageryLayer provider
			var provider = creationFunction();
			//clean the fields that should not be used to create ImageryLayer
			delete data.name;
			delete data.iconUrl;
			delete data.tooltip;
			delete data.creationFunction;
			//Create Imagery Layer
			cesiumImageryLayer = new Cesium.ImageryLayer(provider, data);
		}
		//configure the data to be passed later to the base class
		var new_data = {
			name: name,
			iconUrl: iconUrl,
			tooltip: tooltip,
			rectangle: cesiumImageryLayer.rectangle,	//read-only
			alpha: cesiumImageryLayer.alpha,
			brightness: cesiumImageryLayer.brightness,
			contrast: cesiumImageryLayer.contrast,
			hue: cesiumImageryLayer.hue,
			saturation: cesiumImageryLayer.saturation,
			gamma: cesiumImageryLayer.gamma,
			splitDirection: cesiumImageryLayer.splitDirection,
			minificationFilter: cesiumImageryLayer.minificationFilter,
			magnificationFilter: cesiumImageryLayer.magnificationFilter,
			show: cesiumImageryLayer.show,
			cutoutRectangle: cesiumImageryLayer.cutoutRectangle,
			colorToAlpha: cesiumImageryLayer.colorToAlpha,
			colorToAlphaThreshold: cesiumImageryLayer.colorToAlphaThreshold,
		}
		
		return [new_data, cesiumImageryLayer];
	},
	
	
	/**
     * Returns the `Cesium.ImageryLayer` object used in this model instance.
     *
     * @return {Cesium.ImageryLayer} The `Cesium.ImageryLayer` object.
     */
    getCesiumImageryLayer: function() {
		return this.cesiumObject;
    },
	
	/**
     * Overriden to forward changes to the underlying `Cesium.DataSource`. So, all 
	 * changes on the CesiumExt.data.model.DataSourceModel properties will be set 
	 * on the `Cesium.DataSource` as well.
     *
     * @param {String|Object} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
		var me = this;
        var o = {};

        me.callParent(arguments);

        // forward changes to Cesium.DataSource object
        me.__updating = true;

        // wrap simple set operations into an object
        if (Ext.isString(key)) {
			o[key] = newValue;
        } else {
            o = key;
        }

        // iterate over object setting changes to Cesium.ImageryLayer
        Ext.Object.each(o, function(k, v) {
			//skip fields not belonging to cesium imagery layer
			if(k !== 'name' || k!== 'iconUrl' || k!= 'tooltip')
				if(me.getCesiumImageryLayer())
					me.getCesiumImageryLayer()[k] = v;
        }, me);

        this.__updating = false;
    }
});