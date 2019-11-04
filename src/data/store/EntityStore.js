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
 * Simple store that maps a Cesium.EntityCollection to a Ext.data.Store.
 *
 * @class CesiumExt.data.store.EntityStore
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.store.EntityStore', {
    extend: 'CesiumExt.data.store.BaseStore',
    requires: [
        'CesiumExt.data.model.EntityModel'
    ],

    mixins: [
        
    ],

    // <debug>
    symbols: [
	
    ],
    // </debug>
	
	model: 'CesiumExt.data.model.EntityModel',
	
	config: {
		/**
         * A configured Cesium EntityCollection
         *
         * @cfg {Cesium.EntityCollection} cesiumEntityCollection
         */
		cesiumEntityCollection: null
	},
	
	getCesiumEntityCollection: function() {
		return this.cesiumCollection;
	},
	
	
	/**
     * Constructs a new instance of Entity Store.
     *
     * @param {Object} config. The configuration object.
     */
    constructor: function(config) {
		var me = this;
        config = config || {};
		
		var cesiumCollection = config.cesiumEntityCollection;
		delete config.cesiumEntityCollection;
		
		me.callParent([config, cesiumCollection]);
		
		me.initEntityCollection(config);
		
		me.bindCesiumCollectionEvents();
		me.bindStoreEvents();
    },
	
	/**
	* Method to initialize the Cesium EntityCollection based on the
	* config object.
	*
	* @param {Object} config. The configuration object.
	* @private
	*/
	initEntityCollection: function(config) {
		var me = this;
		config = config || {};
		
		//load raw Cesium.DataSource data in the store
		if(me.getCesiumEntityCollection()) {
			for(var i = 0; i < me.getCesiumEntityCollection().values.length; ++i) {
				 me.loadRawData(me.getCesiumEntityCollection().values[i], true);
			}
		}
	},
	
	/**
     * A utility method which binds the events fired FROM the 
     * Cesium EntityCollection associated TO this store
     *
     * @private
     */
	bindCesiumCollectionEvents: function() {
		var me = this;
		
		if(me.getCesiumEntityCollection()) {
			// add listeners to forward changes(add/remove entity) from the cesium entityCollection to DataStore
			me.getCesiumEntityCollection().collectionChanged.addEventListener(me.onCesiumEntityCollectionChanged, me)
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
	
	onCesiumEntityCollectionChanged: function(entityCollection, addedArray, removedArray, changedArray) {
		var me = this;
		
		if(addedArray.length > 0)
			me.onCesiumEntitiesAdded(entityCollection, addedArray);
		if(removedArray.length > 0)
			me.onCesiumEntitiesRemoved(entityCollection, removedArray);
	},
	
	
	/**
     * Forwards changes from the `Cesium.EntityCollection` to the Ext.data.Store.
     *
     * @param {Cesium.EntityCollection} entityCollection. The entityCollection 
	 * where where entity(ies) was/were added.
	 * @param {Cesium.Entity[]} addedArray. The array of cesium entities added in the
	 *	in the entity collection
     * @private
     */
    onCesiumEntitiesAdded: function(entityCollection, addedArray) {
		var me = this;
		if(!me._adding) {
			for(var i = 0; i < addedArray.length; ++i) {
				var cesiumEntity = addedArray[i];
				var result = me.proxy.reader.read(cesiumEntity);
				me._adding = true;
				me.insert(me.getCount(), result.records);
				delete me._adding;
			}
		}
    },
	
	/**
     * Forwards changes from the `Cesium.EntityCollection` to the Ext.data.Store.
     *
     * @param {Cesium.EntityCollection} entityCollection. The Entity Collection 
	 * 		where entity/entities was/were added.
	 * @param {Cesium.Entity[]} removedArray. The array of removed entities
     * @private
     */
    onCesiumEntitiesRemoved: function(entityCollection, removedArray) {
        var me = this;
		if (!me._removing) {
			for(var i = 0; i < removedArray.length; ++i) {
				var cesiumEntity = removedArray[i];
				var record = me.getRecordByCesiumObject(cesiumEntity);
				if(record) {
					me._removing = true;
					me.remove(record);
					delete me._removing;
				}
			}
		}
    },
	
	 /**
     * Handler for a store's `load` event.
	 * Forwards change FROM Ext.data.Store TO Cesium.EntityCollection.
     *
     * @param {Ext.data.Store} store The store that loaded.
     * @param {Ext.data.Model[]} records An array of loaded model instances.
     * @param {Boolean} successful Whether loading was successful or not.
     * @private
     */
    onLoad: function(store, records, successful) {
        var me = store;
        if (successful) {
            if (!Ext.isArray(records)) {
                records = [records];
            }
			//remove existing entities
            if (!me._addRecords) {
                me._removing = true;
				me.getCesiumEntityCollection().removeAll();
                delete me._removing;
            }
			//add new entities
            var len = records.length;
            if (len > 0) {
				me._adding = true;
                for (var i = 0; i < len; i++) {
                    var entity = records[i].getCesiumEntity();
					me.getCesiumEntityCollection().add(entity);
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
		me.getCesiumEntityCollection().removeAll();
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
            var entity;
            for (var i = 0, ii = records.length; i < ii; ++i) {
                entity = records[i].getCesiumEntity();
				if(entity) {
					me.cesiumDataSourceCollection.add(entity);
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
		var entity = oldRecord.getCesiumEntity();
		me.getCesiumEntityCollection.remove(entity);
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
        var entity;
        var i;
        var ii;

        if (!me._removing) {
            for (i = 0, ii = records.length; i < ii; ++i) {
                record = records[i];
                entity = record.getCesiumEntity();
				if(me.getCesiumEntityCollection().contains(entity)) {
					me._removing = true;
					me.getCesiumEntityCollectiom.remove(entity);
					delete me._removing;
				}
            }
        }
    },
	
	//onUpdate: function(store, record, operation, modifiedFieldNames, details, eOpts) 
	
	/**
     * Handler for a store's `update` event.
     * Forwards change FROM Ext.data.Store TO Cesium.DataSourceCollection.
	 *
     * @param {Ext.data.Model} record The model instance that was updated.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     * @private
     */
    
	onUpdate: function(store, record, operation, modifiedFieldNames, details, eOpts) {
		var me = this;
		if(me !== store) return;
		if(!me._updating) {
			me._updating = true;
			if (operation === Ext.data.Record.EDIT) {
				if (record.modified) {
					var entity = record.getCesiumEntity();
					var properties = entity.properties;
					var fields = record.getFields();
					for(var i = 0; i < modifiedFieldNames.length; ++i) {
						var newValue = record.get(modifiedFieldNames[i]);
						properties.addProperty(modifiedFieldNames[i],  newValue);
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
	 * FROM the Cesium Collection associated to this store
     *
     * @private
     */
    unbindCesiumCollectionEvents: function() {
		var me = this;
		me.getCesiumEntityCollection().collectionChanged.removeEventListener(me.onCesiumEntityCollectionChanged, me)
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() {
		this.callParent(arguments);
    }
});
