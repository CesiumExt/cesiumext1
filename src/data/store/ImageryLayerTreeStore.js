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
 * A store that is synchronized with a CesiumExt.data.store.ImageryLayerStore. It can be
 * used by an {Ext.tree.Panel}.
 *
 * @class CesiumExt.data.store.ImageryLayerTreeStore
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.data.store.ImageryLayerTreeStore', {
    extend: 'CesiumExt.data.store.BaseTreeStore',

    requires: [
       'CesiumExt.util.TreeNode',
	   'CesiumExt.data.model.ImageryLayerTreeModel'
    ],

    mixins: [
        
    ],

    // <debug>
    symbols: [
        
    ],
    // </debug>

    model: 'CesiumExt.data.model.ImageryLayerTreeModel',
	
	config: {
        /**
         * The Cesium Imagery Layer Collection to be binded to this store 
         * @cfg {Cesium.ImageryLayerCollection}
         */
		cesiumImageryLayerCollection: null,
    },
	
	getCesiumImageryLayerCollection: function() {
		return this.cesiumCollection;
	},
	
	
	/**
     * Constructs a ImageryLayerTreeStore.
     */
    constructor: function(config) {
        var me = this;
		config = config || {};
		
		var cesiumCollection = config.cesiumImageryLayerCollection;
		if(!cesiumCollection)
			Ext.raise('cesiumImageryLayerCollection must be provided.');
		delete config.cesiumImageryLayerCollection;
		
		me.callParent([config, cesiumCollection]);
		
		me.bindCesiumCollectionEvents();
		me.bindStoreEvents();
    },
	
	
	/**
     * A utility method which binds collection change events FROM the 
     * cesium ImageryLayerCollection related to this store
     *
     * @private
     */
    bindCesiumCollectionEvents: function() {
		 var me = this;
		// add listeners to forward changes(add/remove Imagery Layer) from the cesium imageryLayerCollection to ImageryLayer Store
		if(me.getCesiumImageryLayerCollection()) {
			me.getCesiumImageryLayerCollection().layerAdded.addEventListener(me.onCesiumObjectAdded, me);
			me.getCesiumImageryLayerCollection().layerRemoved.addEventListener(me.onCesiumObjectRemoved, me);
			me.getCesiumImageryLayerCollection().layerMoved.addEventListener(me.onCesiumObjectMoved, me);
			me.getCesiumImageryLayerCollection().layerShownOrHidden.addEventListener(me.onCesiumImageryLayerShownOrHidden, me);
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
		
		if (me.collectionEventsSuspended) {
            return;
        }
		
		// 1. find the node for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return (candidate.getCesiumImageryLayer() === imageryLayer);
        }, me, true);
        if (!node) {
            return;
        }
		//set the visibility (implementation for 'set' will updated the 'show' property)
		node.set('checked', show);
	},
	
	/**
     * A utility method which unbinds collection change events FROM the passed
     * cesium ImageryLayerCollection.
     *
     * @private
     */
    unbindCesiumCollectionEvents: function() {
        var me = this;
		if(me.getCesiumImageryLayerCollection()) {
			me.getCesiumImageryLayerCollection().layerAdded.removeEventListener(me.onCesiumObjectAdded);
			me.getCesiumImageryLayerCollection().layerRemoved.removeEventListener(me.onCesiumObjectRemoved);
			me.getCesiumImageryLayerCollection().layerMoved.removeEventListener(me.onCesiumObjectMoved, me);
			me.getCesiumImageryLayerCollection().layerShownOrHidden.removeEventListener(me.onCesiumImageryLayerShownOrHidden, me);
		}
    },
	
	/**
     * @inheritdoc
     */
    destroy: function() {
		 this.callParent(arguments);
	}

 });
 
 