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
 * Abstract base class for the model.
 *
 * @class CesiumExt.data.store.BaseStore
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.store.BaseStore', {
    extend: 'Ext.data.Store',
    requires: [
		'Ext.data.Store'
    ],

    mixins: [
        
    ],

    // <debug>
    symbols: [
	
    ],
    // </debug>
	
	/**
     * The underlying Cesium Collection Object.
	 *
	 * @private
     */
    cesiumCollection: null,
	
	/**
     * Constructs a new instance of base store.
     *
     * @param {Object} config. The configuration object.
     */
    constructor: function(config, cesiumCollection) {
		var me = this;
        config = config || {};
		me.cesiumCollection = cesiumCollection;
		me.callParent([config]);
    },
	
	/**
     * An abstract utility method which binds change events fired FROM this store
     *
     * @private
     */
	bindStoreEvents: function() {
		Ext.raise('CesiumExt.data.store.BaseStore.bindStoreEvents() must be implemented.');
	},
	
	/**
     * An abstract utility method which unbinds events fired FROM this store
     *
     * @private
     */
	unbindStoreEvents: function() {
		Ext.raise('CesiumExt.data.store.BaseStore.unbindStoreEvents() must be implemented.');
	},
	
	/**
     * An abstract utility method which binds collection events fired FROM the 
     * Cesium Collection associated to this store
     *
     * @private
     */
    bindCesiumCollectionEvents: function() {
		Ext.raise('CesiumExt.data.store.BaseStore.bindCesiumCollectionEvents() must be implemented.');
	},
	
	/**
     * An abstract utility method which unbinds collection events fired FROM the 
     * Cesium Collection associated to this store
     *
     * @private
     */
    unbindCesiumCollectionEvents: function() {
		Ext.raise('CesiumExt.data.store.BaseStore.unbindCesiumCollectionEvents() must be implemented.');
	},
	
	/**
     * Get the record for the related Cesium Object.
     *
     * @param {Object} cesiumObject The CesiumObject to get a model instance for.
     * @return {Ext.data.Model} The corresponding model instance or undefined if
     *     not found.
     */
    getRecordByCesiumObject: function(cesiumObject) {
        var index = this.findBy(function(r) {
            return r.cesiumObject === cesiumObject;
        });
        if (index > -1) {
            return this.getAt(index);
        }
    },
	
	/**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData).
     */
	 
    loadRawData: function(data, append) {
        var me = this;
        var result = me.proxy.reader.read(data);
        var records = result.records;

        if (result.success) {
            me.totalCount = result.total;
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    },
	
	/**
     * Overload loadRecords to set a flag if `addRecords` is `true` in the load
     * options. ExtJS does not pass the load options to "load" callbacks, so
     * this is how we provide that information to `onLoad`.
     *
     * @param {Ext.data.Model[]} records The array of records to load.
     * @param {Object} options The loading options.
     * @param {Boolean} [options.addRecords=false] Pass `true` to add these
     *     records to the existing records, `false` to remove the Store's
     *     existing records first.
     * @private
     */
    loadRecords: function(records, options) {
        if (options && options.addRecords) {
            this._addRecords = true;
        }
        this.callParent(arguments);
    },
	
	
	 /**
     * @inheritdoc
     */
    destroy: function() {
		var me = this;
		//unbind events
		unbindCesiumCollectionEvents
		unbindStoreEvents();
		
		delete this.cesiumCollection;
	}
});