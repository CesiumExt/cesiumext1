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
 * Abstract base class for the Tree Store.
 *
 * @class CesiumExt.data.store.BaseStore
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.store.BaseTreeStore', {
    extend: 'Ext.data.TreeStore',
    requires: [
		'CesiumExt.util.TreeNode'
    ],

    mixins: [
        
    ],

    // <debug>
    symbols: [
	
    ],
    // </debug>
	
	statics: {
        /**
         * A string which we'll us for child nodes to detect if they are removed
         * because their parent collapsed just recently. See the private
         * method #onBeforeGroupNodeToggle for an explanation.
         *
         * @private
         */
        KEY_COLLAPSE_REMOVE_OPT_OUT: '__remove_by_collapse__'
    },
	
	/**
     * Whether the treestore currently shall handle Cesium collection
     * change events.
     *
     * @property
     * @private
     */
    collectionEventsSuspended: false,
	
	folderToggleMode: 'classic',
	
	/**
     * @cfg
     * @inheritdoc Ext.data.TreeStore
     */
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    root: {
        expanded: true
    },
	
	/**
     * The underlying Cesium Collection Object.
	 *
	 * @private
     */
    cesiumCollection: null,
	
	/**
	 * Constructs a new instance of base store.
     * @param {Object} config. The configuration object.
     */
    constructor: function(config, cesiumCollection) {
		var me = this;
        config = config || {};
		me.cesiumCollection = cesiumCollection;
		me.callParent([config]);
    },
	
	/**
	 * helper function
     *
     * remark: to be removed. To be use node.appendChild 
	 * and node.insertChid instead of
     * Adds a cesium object as a node to the store.
     *
     * @param {Ext.data.NodeInterface} node The node to add.
     */
    addNode: function(node, parentNode) {
		var me = this;
		//if node is a group
		if(!node.cesiumObject) {
			parentNode.appendChild(node);
		}
		else {
			var cesiumObject = node.cesiumObject;
			var cesiumCollection = me.cesiumCollection;
			
			var idx = cesiumCollection.indexOf(cesiumObject);
			node = parentNode.insertChild(idx, node);
		}
    },
	
	/**
	* Helper function
	* remark: to be removed. to be used node.insertBefore 
	* instead of
	* @private
	*/
	insertBeforeNode: function(node, afterNode) {
		var me = this;
		var parentNode =  afterNode.parentNode;
		parentNode.insertBefore(node, afterNode);
    },
	
	/**
     * A utility method which binds change events FROM this store
     * TO cesium ImageryLayerCollection
     *
     * @private
     */
	bindStoreEvents: function() {
		var me = this;
		
		//bind handler events from the store
        me.on({
            remove: me.handleRemove,
            noderemove: me.handleNodeRemove,
			nodemove: me.handleNodeMove,
            nodeappend: me.handleNodeAppend,
            nodeinsert: me.handleNodeInsert,
            scope: me
        });
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
     * Listens to the `remove` event and syncs the attached cesium
	 * Collection.
     *
     * @param {CesiumExt.data.store.BaseTreeStore} store The layer store.
     * @param {CesiumExt.data.model.Base[]} records An array of the
     *     removed nodes.
     * @private
     */
    handleRemove: function(store, records, index, isMove, eOpts) {
		if(isMove) return;
        var me = this;
        var keyRemoveOptOut = me.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
		
		if (me.collectionEventsSuspended) {
            return;
        }
        
        me.suspendCollectionEvents();
        Ext.each(records, function(record) {
            if (keyRemoveOptOut in record && record[keyRemoveOptOut] === true) {
                delete record[keyRemoveOptOut];
                return;
            }
			//remove cesium object
			if(record.cesiumObject) {
				//retrieve cesium imagery layer
				var cesiumObject = record.cesiumObject;
				var cesiumCollection = me.cesiumCollection;
				if(isMove)
					cesiumCollection.remove(cesiumObject, false);
				else
					cesiumCollection.remove(cesiumObject, true);
			}
			if(record.hasChildNodes()) {
				var childNodes = record.childNodes;
				me.handleRemove(store, childNodes, index, isMove, eOpts);
			}
        });
        me.resumeCollectionEvents();
    },
	
	/**
     * Listens to the `nodemove` event and update the position of the cesium objects
	 * based on the new relative position of these objects in the cesium collection
     *
     * @param {Ext.data.NodeInterface} node The moved node.
	 * @param {Ext.data.NodeInterface} oldParent The old parent of this node.
	 * @param {Ext.data.NodeInterface} newParent The new parent of this node.
	 * @param {Number} index The index it was moved to
     * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
     * @private
    */
	handleNodeMove: function(node, oldParent, newParent, index, eOpts) {
		var me = this;
		var cesiumCollection = me.cesiumCollection;
		//Retrieve all the cesium nodes ordered => the new
		//positions of the node after drag&drop
		var orderedCesiumObjects = [];
		me.getRoot().cascadeBy(function(child) {
            if(child.cesiumObject) {
				orderedCesiumObjects.push(child.cesiumObject);
			}
        });
		//implements insert sort to re-order the Cesium Collection
		//based on the order of the nodes
		for(var i = 1; i < cesiumCollection.length; ++ i) {
			var curCesiumObject = cesiumCollection.get(i);
			var curIdx = orderedCesiumObjects.findIndex(function(x) {
				return x == curCesiumObject;
			});
			for(var j = i-1; j>= 0; --j) {
				var leftCesiumObject = cesiumCollection.get(j);
				var leftIdx = orderedCesiumObjects.findIndex(function(x) {
					return x == leftCesiumObject;
				});
				if(leftIdx > curIdx) {
					me.suspendCollectionEvents();
					cesiumCollection.lower(curCesiumObject);
					me.resumeCollectionEvents();
				}
			}
		}
	},
	
	/**
     * Listens to the `noderemove` event. Updates the tree with the current
     * map state.
     *
     * @param {Ext.data.NodeInterface} parentNode The parent node.
     * @param {Ext.data.NodeInterface} removedNode The removed node.
     * @private
     */
	handleNodeRemove: function(parentNode, removedNode, isMove, context, eOpts) {
		if(isMove) return;
		var me = this;
		
		//remove parent node if it is an empty folder
		if(!parentNode.hasChildNodes() && !parentNode.isRoot()) {
			var grandParentNode = parentNode.parentNode;
			grandParentNode.removeChild(parentNode);
		}
		
		if (me.collectionEventsSuspended) {
            return;
        }
		
		me.suspendCollectionEvents();
		if(removedNode.cesiumObject) {
			var cesiumObject = removedNode.cesiumObject;
			var cesiumCollection = me.cesiumCollection;
			if(isMove)
				cesiumCollection.remove(cesiumObject, false);
			else
				cesiumCollection.remove(cesiumObject, true);
		}
		else {
			if(!isMove) {
				removedNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
				removedNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
				
				var childNodes = removedNode.childNodes;
				for(var i = 0; i < childNodes.length; ++i) {
					me.handleNodeRemove(parentNode, childNodes[i], isMove, context, eOpts);
				}
			}
		}
		me.resumeCollectionEvents();
	},
	
	/**
     * Listens to the `nodeappend` event. Updates the tree with the current
     * map state.
     *
	 * REMARK: code to be improved to handle the insert in any position:
	 *         for the case we consider to have internal group nodes
     * @param {Ext.data.NodeInterface} parentNode The parent node.
     * @param {Ext.data.NodeInterface} appendedNode The appended node.
     * @private
     */
    handleNodeAppend: function(parentNode, appendedNode, index, eOpts) {
        var me = this;
		
		//make sure the parent node has the handler
		if(parentNode.isRoot()) {
			//remove and re-insert events to avoid to register multiple times
			
			parentNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
			parentNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
			
			parentNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
			parentNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
		}
		//if it is a group node, no imagery layer is associated
		if(!appendedNode.cesiumObject) {
			appendedNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
            appendedNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
			return;
		}
		
		var cesiumObject = appendedNode.cesiumObject;
		var cesiumCollection = me.cesiumCollection;
		 // check if the cesiumObject is possibly already in the collection
		if(cesiumCollection.contains(cesiumObject))
			return;
		//add the imagery layer in the collection
		me.suspendCollectionEvents();
		cesiumCollection.add(cesiumObject);
		me.resumeCollectionEvents();
    },
	
	/**
     * Listens to the `nodeinsert` event. Updates the tree with the current
     * map state.
     *
	 * REMARK: code to be improved to handle the insert in any position
	 *         even if it is possible to have internal group nodes
     * @param {Ext.data.NodeInterface} parentNode The parent node.
     * @param {Ext.data.NodeInterface} insertedNode The inserted node.
     * @param {Ext.data.NodeInterface} insertedBefore The node we were
     *     inserted before.
     * @private
     */
    handleNodeInsert: function(parentNode, insertedNode, insertedBeforeNode) {
		var me = this;
		
		//if it is a group node, no imagery layer is associated
		if(!insertedNode.cesiumObject)
			return;
		
		var beforeCesiumObject = insertedBeforeNode.cesiumObject;
		var cesiumObject = insertedNode.cesiumObject;
		var cesiumCollection = me.cesiumCollection;
		
		var beforeIdx = CesiumExt.util.TreeNode.getIndex(beforeCesiumObject, parentNode);
		var insertIdx = beforeIdx;
		
		 // check if the cesiumObject is possibly already in the collection
		if(cesiumCollection.contains(cesiumObject))
			return;
		
		 // check if the layer is possibly already at the desired index:
        var currentCesiumObjectInGroupIdx = CesiumExt.util.TreeNode.getIndex(
            insertedNode, parentNode
        );
		
		if (currentCesiumObjectInGroupIdx !== insertIdx) {
			if(!cesiumCollection.contains(cesiumObject)) {
				me.suspendCollectionEvents();
				cesiumCollection.add(cesiumObject, insertIdx);
				me.resumeCollectionEvents();
			}
		}
    },
	
	/**
     * Bound as an eventlistener for nodes which are a folder / group on
     * the beforecollapse event. Whenever a folder gets collapsed, ExtJS seems
     * to actually remove the children from the store, triggering the removal
     * of the actual layers in the map. This is an undesired behaviour. We handle
     * this as follows: Before the collapsing happens, we mark the childNodes,
     * so we effectively opt-out in #handleRemove.
     *
     * @param {Ext.data.NodeInterface} node The collapsible folder node.
     * @private
     */
    onBeforeGroupNodeToggle: function(node) {
        var keyRemoveOptOut = this.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
        node.cascadeBy(function(child) {
            child[keyRemoveOptOut] = true;
        });
    },
	
	/**
     * Handles the `add` event of a managed `Cesium.ImageryLayerCollection` and eventually
     * adds the appropriate node in the tree store
     *
     * @param {Cesium object} cesiumObject The added Cesium Object in the 
     *     Cesium Collection for `this` store.
	 * @param {Number} index The index in the collection for the added Cesium Object.
     * @private
     */
    onCesiumObjectAdded: function(cesiumObject, index) {
		var me = this;
		if (me.collectionEventsSuspended) {
            return;
        }
		
		me.suspendCollectionEvents();
		var node = me.proxy.reader.read(cesiumObject);
		me.addNode(node, me.getRoot());
		me.resumeCollectionEvents();
    },
	
	/**
     * Handles the `remove` event of a managed `Cesium Collection` and eventually
     * removes the appropriate node.
     *
     * @param {Cesium Object} cesiumObject The removed Cesium Object from
     *     the Cesium Collection for `this` store.
	 * @param {Number} index The index in the collection for the removed Cesium Object.
     * @private
     */
    onCesiumObjectRemoved: function(cesiumObject, index) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        
		me.suspendCollectionEvents();
		
        // 1. find the node that existed for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return (candidate.cesiumObject === cesiumObject);
        }, me, true);
        if (!node) {
            return;
        }
        // 2. find the parent
        var parent = node.parentNode;
        // 3. remove the node from the parent
        parent.removeChild(node);
		
		me.resumeCollectionEvents();
    },
	
	/**
     * Forwards changes from the `Cesium Collection` to the Ext.data.Store if
	 * datasource change postition.
     *
	 * @param {Cesium Object} cesiumObject. The moved cesiumObject
	 * @param {Number} newIdx. The new position for the input cesiumObject
	 * @param {Number} oldIdx. The old position for the input cesiumObject
     * @private
     */
    onCesiumObjectMoved: function(cesiumObject, newIdx, oldIdx) {
		var me = this;
		if(newIdx === oldIdx) return;
       
		var cesiumCollection = me.cesiumCollection;
		if (me.collectionEventsSuspended) {
            return;
        }
		
		me.suspendCollectionEvents();
		
		// 1. find the node for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return (candidate.cesiumObject === cesiumObject);
        }, me, true);
        if (!node) {
            return;
        }
		// 2. find the node after it
		var afterNode = me.findAfterNodeByLayer(cesiumObject);
		// 3. find its  parent node
        var parent = node.parentNode;
        // 4. remove the node from the parent
        parent.removeChild(node);
		// 5. re-add the node in the new position
		if(afterNode)
			me.insertBeforeNode(node, afterNode);
		else
			me.addNode(node, parent);
		//me.addNode(node, me.getRoot());
		
		me.resumeCollectionEvents();
		
		//TODO: to check if it is needed to update the row column values:
		//me.fireEvent('update', this, record, Ext.data.Record.EDIT, null, {});
    },
	
	/**
	* Helper function
	* @private
	*/
	insertBeforeNode: function(node, afterNode) {
		var me = this;
		var parentNode =  afterNode.parentNode;
		parentNode.insertBefore(node, afterNode);
    },
	
	/**
	 * Helper function to find the node after the node related to cesiumObject
     *
	 * @param {Cesium object} cesiumObject. The cesium object for the node
	 * @return {Ext.data.NodeInterface} the node after this `node`
     * @private
     */
	findAfterNodeByLayer: function(cesiumObject) {
		var me = this;
		var cesiumCollection = me.cesiumCollection;
		var idx = cesiumCollection.indexOf(cesiumObject);
		var afterIdx = idx + 1;
		var afterNode;
		
		if(afterIdx === cesiumCollection.length)
			afterNode = null;
		else {
			var afterCesiumObject = cesiumCollection.get(afterIdx);
			 afterNode = me.getRootNode().findChildBy(function(candidate) {
				return (candidate.cesiumObject === afterCesiumObject);
			}, me, true);
			if(!afterNode) afterNode = null;
		}
		return afterNode;
	},
	
	
	/**
	* Helper function
	*
	*/
	getOverallNodeIndex: function(startNode, node,  startIndex/*= -1*/) {
		var me = this;
		if(!startIndex)  startIndex = -1;
		//just search index for the node having layer
		if(!node.cesiumObject)
			return [-1, false];
			
		var isFound = false;
		if(startNode.cesiumObject) {
			startIndex = startIndex + 1;
			if(startNode === node) {
				return [startIndex, true];
			}
		}
		var childNodes = startNode.childNodes;
		for(var i = 0; i < childNodes.length; ++i) {
			var result = me.getOverallNodeIndex(childNodes[i], node, startIndex);
			startIndex = result[0];
			isFound = result[1];
			if(isFound) break;
		}
		return [startIndex, isFound];
	},
	
	/**
     * Allows for temporarily unlistening to change events on the underlying
     * OpenLayers collections. Use #resumeCollectionEvents to start listening
     * again.
     */
    suspendCollectionEvents: function() {
        this.collectionEventsSuspended = true;
    },
	
	/**
     * Undoes the effect of #suspendCollectionEvents; so that the store is now
     * listening to change events on the underlying OpenLayers collections
     * again.
     */
    resumeCollectionEvents: function() {
        this.collectionEventsSuspended = false;
    },

	/**
     * A utility method which unbinds change events FROM store
     *
     * @private
     */
	unbindStoreEvents: function() {
		var me = this;
		
		me.un('remove', me.handleRemove, me);
        me.un('noderemove', me.handleNodeRemove, me);
		me.un('nodemove', me.handleNodeMove, me);
        me.un('nodeappend', me.handleNodeAppend, me);
        me.un('nodeinsert', me.handleNodeInsert, me);
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
		me.unbindCesiumCollectionEvents
		me.unbindStoreEvents();
		
		delete this.cesiumCollection;
	}
});