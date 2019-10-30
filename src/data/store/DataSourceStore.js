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
 * Simple store that maps a Cesium.DataSourceCollection to a Ext.data.Store.
 *
 * @class CesiumExt.data.store.DataSourceStore
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.store.DataSourceStore', {
    extend: 'CesiumExt.data.store.BaseStore',
    requires: [
		'CesiumExt.data.store.BaseStore',
        'CesiumExt.data.model.DataSourceModel'
    ],

    mixins: [
        
    ],

    // <debug>
    symbols: [
	
    ],
    // </debug>
	
	model: 'CesiumExt.data.model.DataSourceModel',
	
	config: {
		/**
         * A configured Cesium DataSourceCollection
         *
         * @cfg {Cesium.DataSourceCollection} cesiumDataSourceCollection
         */
		cesiumDataSourceCollection: null,
	},
	
	getCesiumDataSourceCollection: function() {
		return this.cesiumCollection;
	},
	
	
	/**
     * Constructs a new instance of DataSources store.
     *
     * @param {Object} config. The configuration object.
     */
    constructor: function(config) {
		var me = this;
        config = config || {};
		
		var cesiumCollection = config.cesiumDataSourceCollection;
		delete config.cesiumDataSourceCollection;
		me.callParent([config, cesiumCollection]);
		
		me.initDataSourceCollection(config);
		me.bindCesiumCollectionEvents();
		me.bindStoreEvents();
    },
	
	/**
	* Method to initialize the Cesium DataSourceCollection based on the
	* config object.
	*
	* @param {Object} config. The configuration object.
	* @private
	*/
	initDataSourceCollection: function(config) {
		var me = this;
		config = config || {};
		
		//load raw Cesium.DataSource data in the store
		if(me.getCesiumDataSourceCollection()) {
			for(var i = 0; i < me.getCesiumDataSourceCollection().length; ++i) {
				 me.loadRawData(me.getCesiumDataSourceCollection().get(i), true);
			}
		}
	},
	
	
	/**
     * A utility method which binds the events fired FROM the 
     * Cesium ImageryLayerCollection associated TO this store
     *
     * @private
     */
	bindCesiumCollectionEvents: function() {
		var me = this;
		
		if(me.getCesiumDataSourceCollection()) {
			// add listeners to forward changes(add/remove dataSource) from the cesium dataSourceCollection to DataStore
			me.getCesiumDataSourceCollection().dataSourceAdded.addEventListener(me.onCesiumDataSourceAdded, me);
			me.getCesiumDataSourceCollection().dataSourceRemoved.addEventListener(me.onCesiumDataSourceRemoved, me);
			me.getCesiumDataSourceCollection().dataSourceMoved.addEventListener(me.onCesiumDataSourceMoved, me);
		}
	},
	
	/**
     * An utility method which binds change events fired FROM this store
     *
     * @private
     */
	bindStoreEvents: function() {
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
     * Forwards changes from the `Cesium.DataSourceCollection` to the Ext.data.Store.
     *
     * @param {Cesium.DataSourceCollection} dataSourceCollection. The DataSourceCollection 
	 * where an dataSource was added.
	 * @param {Cesium.DataSource} dataSource. The added DataSource
     * @private
     */
    onCesiumDataSourceAdded: function(dataSourceCollection, dataSource) {
		var idx = dataSourceCollection.indexOf(dataSource);
		var me = this;
		if(!me._adding) {
			me._adding = true;
			var result = me.proxy.reader.read(dataSource);
			me.insert(idx, result.records);
			//me.insert(idx, [dataSource]);
			//var model = new CesiumExt.data.model.DataSourceModel(dataSource);
			//me.insert(idx, model);
			delete me._adding;
		}
    },
	
	/**
     * Forwards changes from the `Cesium.DataSourceCollection` to the Ext.data.Store.
     *
     * @param {Cesium.DataSourceCollection} dataSourceCollection. The DataSourceCollection 
	 * 		where an dataSource was added.
	 * @param {Cesium.DataSource} dataSource. The removed DataSource
     * @private
     */
    onCesiumDataSourceRemoved: function(dataSourceCollection, dataSource) {
        var me = this;
		if (!me._removing) {
			var record = me.getRecordByCesiumObject(dataSource);
			if(record) {
				me._removing = true;
				me.remove(record);
                delete me._removing;
			}
		}
    },
	
	/**
     * Forwards changes from the `Cesium.DataSourceCollection` to the Ext.data.Store if
	 * datasource change postition.
     *
     * @param {Cesium.DataSourceCollection} dataSourceCollection. The DataSourceCollection 
	 * 		where an dataSource was added.
	 * @param {Cesium.DataSource} dataSource. The moved DataSource
	 * @param {Number} newIdx. The new position for the input dataSource
	 * @param {Number} oldIdx. The old position for the input dataSource
     * @private
     */
    onCesiumDataSourceMoved: function(dataSource, newIdx, oldIdx) {
		if(newIdx === oldIdx) return;
        var me = this;
		var dataSourceCollection = me.getCesiumDataSourceCollection();
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
     * Handler for a store's `load` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
     *
     * @param {Ext.data.Store} store. The store that loaded.
     * @param {Ext.data.Model[]} records. An array of loaded model instances.
     * @param {Boolean} successful. Whether loading was successful or not.
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
				me.getCesiumDataSourceCollection().removeAll(/*true*/);
                delete me._removing;
            }
			//add new datasources
            var len = records.length;
            if (len > 0) {
                var dataSources = new Array(len);
				me._adding = true;
                for (var i = 0; i < len; i++) {
                    dataSources[i] = records[i].getCesiumDataSource();
					me.getCesiumDataSourceCollection().add(dataSources[i]);
                }
                delete me._adding;
            }
        }
        delete me._addRecords;
    },
	
	/**
     * Handler for a store's `clear` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
     *
     * @private
     */
    onClear: function() {
        var me = this;
		
        me._removing = true;
		me.getCesiumDataSourceCollection().removeAll(true);
        delete me._removing;
    },
	
	/**
     * Handler for a store's `add` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
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
            var dataSource;
            for (var i = 0, ii = records.length; i < ii; ++i) {
                dataSource = records[i].getCesiumDataSource();
				if(dataSource) {
					//REMARK: datasource added at the end. Code must be modified to re-order
					//the inserted datSources in the dataSource Collection
					//also to handle the promise.
					me.getCesiumDataSourceCollection().add(dataSource);
				}
            }
            delete me._adding;
        }
    },
	
	/**
     * Handler for a store's data collections' `replace` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
     *
     * @param {String} key The associated key.
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @private
     */
    onReplace: function(key, oldRecord) {
		var me = this;
		var dataSource = oldRecord.getCesiumDataSource();
		
		me.getCesiumDataSourceCollection().remove(dataSource, true);
    },
	
	/**
     * Handler for a store's `remove` event.
     * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
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
        var dataSource;
        var i;
        var ii;

        if (!me._removing) {
            for (i = 0, ii = records.length; i < ii; ++i) {
                record = records[i];
                dataSource = record.getCesiumDataSource();
				if(me.getCesiumDataSourceCollection().contains(dataSource)) {
					me._removing = true;
					me.getCesiumDataSourceCollection().remove(dataSource, true);
					delete me._removing;
				}
            }
        }
    },
	
	/**
     * Handler for a store's `update` event.
     * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
	 *
     * @param {Ext.data.Store} store The store which was updated.
     * @param {Ext.data.Model} record The model instance that was updated.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     * @private
     */
    onUpdate: function(store, record, operation) {
		var me = store;
		if(!me._updating) {
			me._updating = true;
			if (operation === Ext.data.Record.EDIT) {
				if (record.modified && (record.modified.name || record.modified.show)) {
					var dataSource = record.getCesiumDataSource();
					var name = record.get('name');
					var show = record.get('show');
					if (name !== dataSource.name) {
						dataSource.name = name;
					}
					if (show !== dataSource.show) {
						dataSource.show = show;
					}
				}
			}
			delete me._updating;
		}
    },
	
	/**
     * An implementation for the abstract method which unbinds events fired 
	 * FROM this store
     *
     * @private
     */
	unbindStoreEvents: function() {
		var me = this;
		
		me.un('load', me.onLoad, me);
        me.un('clear', me.onClear, me);
        me.un('add', me.onAdd, me);
        me.un('remove', me.onRemove, me);
        me.un('update', me.onUpdate, me);

        me.data.un('replace', me.onReplace, me);
	},
	
	/**
     * An implementation for the abstract method which unbinds collection events fired 
	 * FROM the Cesium ImageryLayerCollection associated to this store
     *
     * @private
     */
    unbindCesiumCollectionEvents: function() {
		var me = this;
		
		me.getCesiumDataSourceCollection().dataSourceAdded.removeEventListener(me.onCesiumDataSourceAdded);
		me.getCesiumDataSourceCollection().dataSourceRemoved.removeEventListener(me.onCesiumDataSourceRemoved);
		me.getCesiumDataSourceCollection().dataSourceMoved.removeEventListener(me.onCesiumDataSourceMoved, me);
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() {
        this.callParent(arguments);
    }
	
	
});
