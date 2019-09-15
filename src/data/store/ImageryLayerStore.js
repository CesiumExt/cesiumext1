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
 * Simple store that maps a Cesium.ImageryLayerCollection to a Ext.data.Store.
 *
 * @class CesiumExt.data.store.ImageryLayerStore
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.store.ImageryLayerStore', {
    extend: 'Ext.data.Store',
    requires: [
        'CesiumExt.data.model.ImageryLayerModel'
    ],

    mixins: [
        //'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
	
    ],
    // </debug>
	
	model: 'CesiumExt.data.model.ImageryLayerModel',
	
	config: {
		/**
         * A configured Cesium ImageryLayerCollection
         *
         * @cfg {Cesium.ImageryLayerCollection} cesiumImageryLayerCollection
         */
		cesiumImageryLayerCollection: null
	},
	
	/**
     * Constructs a new instance of ImageryLayers store.
     *
     * @param {Object} config. The configuration object.
     */
    constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		
		me.initImageryLayerCollection(config);
		me.addCesiumToStoreListeners();
		me.addStoreToCesiumListeners();
    },
	
	/**
	* Method to initialize the Cesium ImageryLayerCollection based on the
	* config object.
	*
	* @param {Object} config. The configuration object.
	* @private
	*/
	initImageryLayerCollection: function(config) {
		var me = this;
		config = config || {};
		
		//initialize the Cesium ImageryLayerCollection
		if(config.cesiumImageryLayerCollection) {
			me.cesiumImageryLayerCollection = config.cesiumImageryLayerCollection;
		}
		//load raw Cesium.ImageryLayer data in the store
		if(me.cesiumImageryLayerCollection) {
			for(var i = 0; i < me.cesiumImageryLayerCollection.length; ++i) {
				 me.loadRawData(me.cesiumImageryLayerCollection.get(i), true);
			}
		}
	},
	
	/**
	* Add listeners to forward changes FROM Cesium TO ImageryLayer Store
	*/
	addCesiumToStoreListeners: function() {
		var me = this;
		
		if(me.getCesiumImageryLayerCollection()) {
			// add listeners to forward changes(add/remove Imagery Layer) from the cesium imageryLayerCollection to ImageryLayer Store
			me.cesiumImageryLayerCollection.layerAdded.addEventListener(me.onCesiumImageryLayerAdded, me);
			me.cesiumImageryLayerCollection.layerRemoved.addEventListener(me.onCesiumImageryLayerRemoved, me);
			me.cesiumImageryLayerCollection.layerMoved.addEventListener(me.onCesiumImageryLayerMoved, me);
			me.cesiumImageryLayerCollection.layerShownOrHidden.addEventListener(me.onCesiumImageryLayerShownOrHidden, me);
		}
	},
	
	/**
	* Add listeners to forward changes FROM DataStore TO Cesium.
	*/
	addStoreToCesiumListeners: function() {
		var me = this;
		
		 me.on({
            'load': me.onLoad,
            'clear': me.onClear,
            'add': me.onAdd,
            'remove': me.onRemove,
            'update': me.onUpdate,
            'scope': me
        });

        me.data.on({
            'replace': me.onReplace,
            'scope': me
        });
        //me.fireEvent('bind', me, map);
	},
	
	
	/**
     * Forwards changes from the `Cesium.ImageryLayerCollection` to the Ext.data.Store.
     *
	 * @param {Cesium.ImageryLayer} imageryLayer. The added ImageryLayer
	 * @param {Number} index. The index where the layer was added
     * @private
     */
    onCesiumImageryLayerAdded: function(imageryLayer, index) {
		var me = this;
		if(!me._adding) {
			me._adding = true;
			var result = me.proxy.reader.read(imageryLayer);
			me.insert(index, result.records);
			delete me._adding;
		}
    },
	
	/**
     * Forwards changes from the `Cesium.ImageryLayerCollection` to the Ext.data.Store.
     *
	 * @param {Cesium.ImageryLayer} imageryLayer. The removed ImageryLayer
	 * @param {Number} index. The index where the layer was removed in the collection
     * @private
     */
    onCesiumImageryLayerRemoved: function(imageryLayer, index) {
        var me = this;
		if (!me._removing) {
			var record = me.getRecordByCesiumImageryLayer(imageryLayer);
			if(record) {
				me._removing = true;
				me.remove(record);
                delete me._removing;
			}
		}
    },
	
	/**
     * Forwards changes from the `Cesium.ImageryLayerCollection` to the Ext.data.Store if
	 * datasource change postition.
     *
     * @param {Cesium.ImageryLayerCollection} imageryLayerCollection. The ImageryLayerCollection 
	 * 		where an imageryLayer was added.
	 * @param {Cesium.ImageryLayer} imageryLayer. The moved ImageryLayer
	 * @param {Number} newIdx. The new position for the input imageryLayer
	 * @param {Number} oldIdx. The old position for the input imageryLayer
     * @private
     */
    onCesiumImageryLayerMoved: function(imageryLayer, newIdx, oldIdx) {
		if(newIdx === oldIdx) return;
        var me = this;
		var imageryLayerCollection = me.cesiumImageryLayerCollection;
		if(!me._removing) {
			me._removing = true;
			var record = me.getAt(oldIdx);
			if(record) me.remove(record);
			delete me._removing;
			if(!me._adding) {
				me._adding = true;
				me.insert(newIdx, record);
				delete me._adding;
			}
			me.fireEvent('update', this, record, Ext.data.Record.EDIT, null, {});
		}
    },
	
	/**
     * Forwards changes from the `Cesium.ImageryLayerCollection` to the Ext.data.Store if
	 * the visibility of the layer changes.
     *
	 * @param {Cesium.ImageryLayer} imageryLayer. The moved ImageryLayer
	 * @param {Number} index. The index of the changed imageryLayer
	 * @param {Boolean} show. The new visibility for the imageryLayer
     * @private
     */
	onCesiumImageryLayerShownOrHidden: function(imageryLayer, index, show) {
		var me = this;
		var record = me.getAt(index);
		
		if(!me._updating) {
			me._updating = true;
			record.set('show', show);
			delete me._updating;
		}
	},
	
	 /**
     * Handler for a store's `load` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
     *
     * @param {Ext.data.Store} store The store that loaded.
     * @param {Ext.data.Model[]} records An array of loades model instances.
     * @param {Boolean} successful Whether loading was successful or not.
     * @private
     */
    onLoad: function(store, records, successful) {
        var me = store;
        if (successful) {
            if (!Ext.isArray(records)) {
                records = [records];
            }
			//remove existing datasources
            if (!me._addRecords) {
                me._removing = true;
				me.getCesiumImageryLayerCollection().removeAll(/*true*/);
                delete me._removing;
            }
			//add new datasources
            var len = records.length;
            if (len > 0) {
                var imageryLayers = new Array(len);
				me._adding = true;
                for (var i = 0; i < len; i++) {
                    imageryLayers[i] = records[i].getCesiumImageryLayer();
					me.getCesiumImageryLayerCollection().add(imageryLayers[i]);
                }
                delete me._adding;
            }
        }
        delete me._addRecords;
    },
	
	/**
     * Handler for a store's `clear` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
     *
     * @private
     */
    onClear: function() {
        var me = this;
		
        me._removing = true;
		me.getCesiumImageryLayerCollection().removeAll(/*true*/);
        delete me._removing;
    },
	
	/**
     * Handler for a store's `add` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
	 *
     * @param {Ext.data.Store} store The store to which a model instance was
     *     added.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     added.
     * @param {Number} index The index at which the model instances were added.
     * @private
     */
    onAdd: function(store, records, index) {
        var me = store;
        if (!me._adding) {
            me._adding = true;
            var imageryLayer;
            for (var i = 0, ii = records.length; i < ii; ++i) {
                imageryLayer = records[i].getCesiumImageryLayer();
				if(imageryLayer) {
					//REMARK: imageryLayer added at the end. Code must be modified to re-order
					//the inserted datSources in the imageryLayer Collection
					//also to handle the promise.
					me.cesiumImageryLayerCollection.add(imageryLayer, index);
				}
            }
            delete me._adding;
        }
    },
	
	/**
     * Handler for a store's data collections' `replace` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
     *
     * @param {String} key The associated key.
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @private
     */
    onReplace: function(key, oldRecord) {
		var me = this;
		var imageryLayer = oldRecord.getCesiumImageryLayer();
		
		me.getCesiumImageryLayerCollection.remove(imageryLayer, true);
    },
	
	/**
     * Handler for a store's `remove` event.
     * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
	 *
     * @param {Ext.data.Store} store The store from which a model instances
     *     were removed.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     removed.
     * @private
     */
    onRemove: function(store, records) {
        var me = store;
        var record;
        var imageryLayer;
        var i;
        var ii;

        if (!me._removing) {
            for (i = 0, ii = records.length; i < ii; ++i) {
                record = records[i];
                imageryLayer = record.getCesiumImageryLayer();
				if(me.getCesiumImageryLayerCollection().contains(imageryLayer)) {
					me._removing = true;
					me.getCesiumImageryLayerCollectiom.remove(imageryLayer, true);
					delete me._removing;
				}
            }
        }
    },
	
	/**
     * Handler for a store's `update` event.
     * Forwards change FROM Ext.data.Store TO Cesium.ImageryLayerCollection.
	 *
     * @param {Ext.data.Store} store The store which was updated.
     * @param {Ext.data.Model} record The model instance that was updated.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     * @private
     */
    onUpdate: function(record, operation, modifiedFieldNames, details, eOpts) {
		var me = this;
		if(!me._updating) {
			me._updating = true;
			if (operation === Ext.data.Record.EDIT) {
				if (record.modified && (record.modified.name || record.modified.show)) {
					var imageryLayer = record.getCesiumImageryLayer();
					var fields = record.getFields();
					for(var i = 0; i < modifiedFieldNames.length; ++i) {
						var newValue = record.get(modifiedFieldNames[i]);
						imageryLayer[modifiedFieldNames[i]] = newValue;
					}
				}
			}
			delete me._updating;
		}
    },
	
	 /**
     * @inheritdoc
     */
    destroy: function() {
		var me = this;
		
		me.cesiumImageryLayerCollection.layerAdded.removeEventListener(me.onCesiumImageryLayerAdded);
		me.cesiumImageryLayerCollection.layerRemoved.removeEventListener(me.onCesiumImageryLayerRemoved);
		me.cesiumImageryLayerCollection.layerMoved.removeEventListener(me.onCesiumImageryLayerMoved, me);
		me.cesiumImageryLayerCollection.layerShownOrHidden.removeEventListener(me.onCesiumImageryLayerShownOrHidden, me);
		
		me.un('load', me.onLoad, me);
        me.un('clear', me.onClear, me);
        me.un('add', me.onAdd, me);
        me.un('remove', me.onRemove, me);
        me.un('update', me.onUpdate, me);

        me.data.un('replace', me.onReplace, me);
		
        delete this.cesiumImageryLayerCollection;
        this.callParent(arguments);
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
     * Get the record for the specified Cesium.ImageryLayer.
     *
     * @param {Cesium.ImageryLayer} imageryLayer. The Cesium ImageryLayer to get a model instance for.
     * @return {Ext.data.Model} The corresponding model instance or undefined if
     * 		not found.
     */
    getRecordByCesiumImageryLayer: function(imageryLayer) {
        var index = this.findBy(function(r) {
            return r.getCesiumImageryLayer() === imageryLayer;
        });
        if (index > -1) {
            return this.getAt(index);
        }
    },
});
