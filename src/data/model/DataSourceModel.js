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
 * The Cesium DataSource Model class used by the stores.
 * This Model definition represents all the concrete instances of Cesium.DataSource
 * @class CesiumExt.data.model.DataSourceModel
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.data.model.DataSourceModel', {
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
	
	
	fields: [
		{
            name: 'name',
            type: 'string',
			persist: false,
			defaultValue: 'Unnamed',
            convert: function(v, record) {
                return record.getCesiumDataSource().name;
            }
        },
		{
            name: 'show',
            type: 'boolean',
			defaultValue: true,
			persist: false,
            convert: function(v, record) {
                return record.getCesiumDataSource().show;
            }
        },
	],
	
	
	/**
	* The `CesiumExt.data.model.DataSourceModel` Constructor.
	*
	* @param {Cesium.DataSource | Object} data. The Cesium.DataSource instance or
	* 	json object configuration to create a new Cesium.DataSource instance
	* @inheritdoc
	*/
	constructor: function(data) {
		var me = this;

		data = data || {};
		var cesiumObject;

		// instantiate Cesium.DataSource object if plain data is handed over
		if (!(data instanceof Cesium.CustomDataSource ||
			  data instanceof Cesium.CzmlDataSource ||
			  data instanceof Cesium.GeoJsonDataSource ||
			  data instanceof Cesium.KmlDataSource)) {
			cesiumObject = new Cesium.CustomDataSource(data.name);
			cesiumObject.show = data.show;
		}
		else {
			cesiumObject = data;
		}
		
		data = {
			name: cesiumObject.name,
			show: cesiumObject.show
		}

		// init record with configuration properties of underlying Cesium.DataSource instance
		me.callParent([data, cesiumObject]);

		//add listener to forward changes from Cesium.DataSource to CesiumExt.data.model.DataSourceModel
		me.getCesiumDataSource().changedEvent.addEventListener(me.onCesiumDataSourceChanged, me);
    },
	
	/**
     * Returns the `Cesium.Datasource` object used in this model instance.
     *
     * @return {Cesium.DataSource} The `Cesium.DataSource` object.
     */
    getCesiumDataSource: function() {
		return this.cesiumObject;
    },
	
	/**
     * Listener to changedEvent events of the underlying `Cesium.DataSource`. All
     * changes on the Cesium.DataSource object will be forwarded changes to the CesiumExt.data.model.DataSourceModel.
     * @param  {Cesium.DataSource} dataSource The `Cesium.dataSource` on which the property was changed.
     * @private
     */
    onCesiumDataSourceChanged: function(dataSource) {
		
		var me = this;
        if (!me.__updating) {
			me.set({name: dataSource.name, show: dataSource.show});
        }
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
        var o = {};

        this.callParent(arguments);

        // forward changes to Cesium.DataSource object
        this.__updating = true;

        // wrap simple set operations into an object
        if (Ext.isString(key)) {
            o[key] = newValue;
        } else {
            o = key;
        }

        // iterate over object setting changes to Cesium.DataSource
        Ext.Object.each(o, function(k, v) {
			this.getCesiumDataSource()[k] = v;
        }, this);

        this.__updating = false;
    },
	
	/**
     * Overriden to unregister all added event listeners on the Cesium.DataSource.
     *
     * @inheritdoc
     */
    destroy: function() {
        var me = this;
		me.cesiumDataSource.changedEvent.removeEventListener(me.onCesiumDataSourceChanged, me);

        this.callParent(arguments);
    }
	
});