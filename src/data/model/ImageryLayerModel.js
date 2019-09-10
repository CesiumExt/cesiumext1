/* Copyright (c) 2019 CesiumExtJS
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
        //'CesiumExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
    
    ],
    // </debug>
	
	proxy: {
		type: 'memory',
		reader: 'json'
    },
	
	cesiumImageryLayer: null,
	
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
            name: 'alpha',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().alpha;
            }
        },
		{
            name: 'brightness',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().brightness;
            }
        },
		{
            name: 'contrast',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().contrast;
            }
        },
		{
            name: 'hue',
			defaultValue: 0.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().hue;
            }
        },
		{
            name: 'saturation',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().saturation;
            }
        },
		{
            name: 'gamma',
			defaultValue: 1.0,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().gamma;
            }
        },
		{
            name: 'splitDirection',
			defaultValue: Cesium.ImagerySplitDirection.NONE,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().splitDirection;
            }
        },
		{
            name: 'minificationFilter',
			defaultValue: Cesium.TextureMinificationFilter.LINEAR,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().minificationFilter;
            }
        },
		{
            name: 'magnificationFilter',
			defaultValue: Cesium.TextureMagnificationFilter.LINEAR,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().magnificationFilter;
            }
        },
		{
            name: 'show',
            type: 'boolean',
			defaultValue: true,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().show;
            }
        },
		{
            name: 'cutoutRectangle',
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().cutoutRectangle;
            }
        },
		{
            name: 'colorToAlpha',
			defaultValue: true,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().colorToAlpha;
            }
        },
		{
            name: 'colorToAlphaThreshold',
            type: 'number',
			defaultValue: 	0.004,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumImageryLayer().colorToAlphaThreshold;
            }
        },
	],
	
	addFieldAfterProviderIsReady: function(isReady) {
		var me = this;
		if(isReady) {
			var field = new Ext.data.field.Field({
				name: 'rectangle',
				persist: false,
				defaultValue: me.getCesiumImageryLayer().imageryProvider.rectangle,
				convert: function(v, record) {
					return record.getCesiumImageryLayer().name;
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
		data = me.createCesiumImageryLayer(data);
		//add field once data provider is ready
		if(me.getCesiumImageryLayer().imageryProvider.ready) {
			me.addFieldAfterProviderIsReady(true);
		}
		else {
			me.getCesiumImageryLayer().imageryProvider.readyPromise.then(me.addFieldAfterProviderIsReady);
		}
		// init record with configuration properties of underlying Cesium.DataSource instance
		me.callParent([data]);

		//add listener to forward changes from Cesium.DataSource to CesiumExt.data.model.DataSourceModel
		//me.cesiumImageryLayer.changedEvent.addEventListener(me.onCesiumDataSourceChanged, me);
    },
	
	
	/**
	* Function to create a instance of Cesium.ImageryLayer based on the config object
	* @param {Cesium.ImageryLayer | Object} The Cesium.ImageryLayer instance or the
	* 	json object configuration to create a new Cesium.ImageryLayer instance
	* @private
	*/
	createCesiumImageryLayer: function(data) {
		var me = this;
		data = data || {};
		
		var newData = {};
		// instantiate Cesium.ImageryLayer if object if plain data is handed over
		if (data instanceof Cesium.ImageryLayer) {
			me.cesiumImageryLayer = data;
		}
		else {
			//retrieve all the fields not belonging to ImageryLayer
			var name = data.name;
			var iconUrl = data.iconUrl;
			var tooltip = data.tooltip;	
			//retrieve function to create the ImageryLayer Provider
			var creationFunction;
			if(data.creationFunction)
				creationFunction = data.creationFunction;
			//create the ImageryLayer provider
			var provider = creationFunction();
			//clean the fields that should not be used to create ImageryLayer
			delete data.name;
			delete data.iconUrl;
			delete data.tooltip;
			delete data.creationFunction;
			//Create Imagery Layer
			me.cesiumImageryLayer = new Cesium.ImageryLayer(provider, data);
		}
		//configure the data to be passed later to the base class
		var new_data = {
			name: name,
			iconUrl: iconUrl,
			tooltip: tooltip,
			rectangle: me.cesiumImageryLayer.rectangle,	//read-only
			alpha: me.cesiumImageryLayer.alpha,
			brightness: me.cesiumImageryLayer.brightness,
			contrast: me.cesiumImageryLayer.contrast,
			hue: me.cesiumImageryLayer.hue,
			saturation: me.cesiumImageryLayer.saturation,
			gamma: me.cesiumImageryLayer.gamma,
			splitDirection: me.cesiumImageryLayer.splitDirection,
			minificationFilter: me.cesiumImageryLayer.minificationFilter,
			magnificationFilter: me.cesiumImageryLayer.magnificationFilter,
			show: me.cesiumImageryLayer.show,
			cutoutRectangle: me.cesiumImageryLayer.cutoutRectangle,
			colorToAlpha: me.cesiumImageryLayer.colorToAlpha,
			colorToAlphaThreshold: me.cesiumImageryLayer.colorToAlphaThreshold,
		}
		
		return new_data;
	},
	
	
	/**
     * Returns the `Cesium.ImageryLayer` object used in this model instance.
     *
     * @return {Cesium.ImageryLayer} The `Cesium.ImageryLayer` object.
     */
    getCesiumImageryLayer: function() {
		return this.cesiumImageryLayer;
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
			//skip field 'name' not belonging to cesium imagery layer
			if(k !== 'name')
				me.cesiumImageryLayer[k] = v;
        }, me);

        this.__updating = false;
    }
});