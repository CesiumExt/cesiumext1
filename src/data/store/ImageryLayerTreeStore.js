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

    model: 'CesiumExt.data.model.ImageryLayerTreeModel',
	
	config: {
        /**
         * The Cesium Imagery Layer Collection to be binded to this store 
         * @cfg {Cesium.ImageryLayerCollection}
         */
		cesiumImageryLayerCollection: null,

        /**
         * Configures the behaviour of the checkbox of an `imageryLayerStore`
         * (folder). Possible values are `'classic'` or `'cesium'`.
         *
         * * `'classic'` forwards the checkstate to the children of the folder.
         *   * Check a leaf => all parent nodes are checked
         *   * Uncheck all leafs in a folder => parent node is unchecked
         *   * Check a folder Node => all children are checked
         *   * Uncheck a folder Node => all children are unchecked
         * * `'cesium'` emulates the behaviour of `ol.layer.Group`. So a layerGroup
         *   can be invisible but can have visible children.
         *   * Emulates the behaviour of an `CesiumExt.data.store.ImageryLayerStore,` 
		 *	   so a parentfolder can be unchecked but still contain checked leafs 
		 *     and vice versa.
         *
         * @cfg
         */
        folderToggleMode: 'classic'
    },
	
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
     * Constructs a ImageryLayerTreeStore.
     */
    constructor: function(config) {
        var me = this;
		
		//retrieve the cesium imagery layer collection
		var cesiumImageryLayerCollection = config.cesiumImageryLayerCollection;
		if(!cesiumImageryLayerCollection)
			Ext.raise('cesiumImageryLayerCollection must be provided.');
		
        me.callParent([config]);
		me.initConfig(config);
		
		//bind handler events from Cesium.ImageryLayerCollection
        me.bindCesiumCollectionEvents();
		
		//bind handler events from the store
		me.bindStoreEvents();
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
     * A utility method which binds collection change events FROM the 
     * cesium ImageryLayerCollection related to this store
     *
     * @private
     */
    bindCesiumCollectionEvents: function() {
		 var me = this;
		// add listeners to forward changes(add/remove Imagery Layer) from the cesium imageryLayerCollection to ImageryLayer Store
		if(me.getCesiumImageryLayerCollection()) {
			me.getCesiumImageryLayerCollection().layerAdded.addEventListener(me.onCesiumImageryLayerAdded, me);
			me.getCesiumImageryLayerCollection().layerRemoved.addEventListener(me.onCesiumImageryLayerRemoved, me);
			me.getCesiumImageryLayerCollection().layerMoved.addEventListener(me.onCesiumImageryLayerMoved, me);
			me.getCesiumImageryLayerCollection().layerShownOrHidden.addEventListener(me.onCesiumImageryLayerShownOrHidden, me);
		}
    },
	
	/**
     * Applies the #folderToggleMode to the treenodes.
     *
     * @param {String} folderToggleMode The folderToggleMode that was set.
     * @return {String} The folderToggleMode that was set.
     * @private
     */
    applyFolderToggleMode: function(folderToggleMode) {
        if (folderToggleMode === 'classic' || folderToggleMode === 'cesium') {
            var rootNode = this.getRootNode();
            if (rootNode) {
                rootNode.cascadeBy({
                    before: function(child) {
                        child.set('__toggleMode', folderToggleMode);
                    }
                });
            }
            return folderToggleMode;
        }

        Ext.raise('Invalid folderToggleMode set in ' + this.self.getName()
            + ': ' + folderToggleMode + '; \'classic\' or \'cesium\' are valid.');
    },
	
	/**
     * Listens to the `remove` event and syncs the attached cesium Imagery Layer
	 * Collection.
     *
     * @param {CesiumExt.data.store.ImageryLayerTreeStore} store The layer store.
     * @param {CesiumExt.data.model.ImageryLayerTreeModel[]} records An array of the
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
			//remove cesium imagery layer(s)
			if(record.getCesiumImageryLayer()) {
				//retrieve cesium imagery layer
				var cesiumImageryLayer = record.getCesiumImageryLayer();
				var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
				if(isMove)
					cesiumImageryLayerColl.remove(cesiumImageryLayer, false);
				else
					cesiumImageryLayerColl.remove(cesiumImageryLayer, true);
			}
			if(record.hasChildNodes()) {
				var childNodes = record.childNodes;
				me.handleRemove(store, childNodes, index, isMove, eOpts);
			}
        });
        me.resumeCollectionEvents();
    },
	
	/**
     * Listens to the `nodemove` event and update the position of the cesium imagery
	 * layers based on the new relative position of these layers in the nodes
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
		//get all the layers
		var lyrs = [];
		var imageryLayerCollection = me.getCesiumImageryLayerCollection();
		//cache all layers in a array
		for(var i = 0; i < imageryLayerCollection.length; ++i) {
			lyrs.push(imageryLayerCollection.get(i));
		}
		//re-order all the layers based on its position in the tree node
		for(var i = 0; i < lyrs.length; ++i) {
			var curImageryLayer = lyrs[i];
			//retrieve the node for that layer
			var curNode = me.getRootNode().findChildBy(function(candidate) {
				return (candidate.getCesiumImageryLayer() === curImageryLayer);
			}, me, true);
			if(curNode) {
				var result = me.getOverallNodeIndex(me.getRoot(), curNode);
				var isFound = result[1];
				var newIdx = result[0];
				if(isFound) { 
					var curIdx = imageryLayerCollection.indexOf(curImageryLayer);
					if(curIdx !== newIdx) {
						//move layer
						me.suspendCollectionEvents();
						var isRemoved = imageryLayerCollection.remove(curImageryLayer, false);
						imageryLayerCollection.add(curImageryLayer, newIdx);
						me.resumeCollectionEvents();
					}
				}		
			}
		}
	},
	
	
	 /**
     * Listens to the `noderemove` event. Updates the tree with the current
     * map state.
     *
     * @param {CesiumExt.data.model.ImageryLayerTreeModel} parentNode The parent node.
     * @param {CesiumExt.data.model.ImageryLayerTreeModel} removedNode The removed node.
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
		if(removedNode.getCesiumImageryLayer()) {
			var cesiumImageryLayer = removedNode.getCesiumImageryLayer();
			var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
			if(isMove)
				cesiumImageryLayerColl.remove(cesiumImageryLayer, false);
			else
				cesiumImageryLayerColl.remove(cesiumImageryLayer, true);
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
		
		//if it is a group node, no imagery layer is associated
		if(!appendedNode.getCesiumImageryLayer())
			return;
		
		var imageryLayer = appendedNode.getCesiumImageryLayer();
		var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
		 // check if the imageryLayer is possibly already in the collection
		if(cesiumImageryLayerColl.contains(imageryLayer))
			return;
		//add the imagery layer in the collection
		me.suspendCollectionEvents();
		cesiumImageryLayerColl.add(imageryLayer);
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
		if(!insertedNode.getCesiumImageryLayer())
			return;
		
		var beforeImagerylayer = insertedBeforeNode.getCesiumImageryLayer();
		var imageryLayer = insertedNode.getCesiumImageryLayer();
		var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
		
		var beforeIdx = CesiumExt.util.TreeNode.getIndex(beforeImagerylayer, parentNode);
		var insertIdx = beforeIdx;
		
		 // check if the imageryLayer is possibly already in the collection
		if(cesiumImageryLayerColl.contains(imageryLayer))
			return;
		
		 // check if the layer is possibly already at the desired index:
        var currentLayerInGroupIdx = CesiumExt.util.TreeNode.getIndex(
            insertedNode, parentNode
        );
		
		if (currentLayerInGroupIdx !== insertIdx) {
			if(!cesiumImageryLayerColl.contains(imageryLayer)) {
				me.suspendCollectionEvents();
				cesiumImageryLayerColl.add(imageryLayer, insertIdx);
				me.resumeCollectionEvents();
			}
		}
    },
	
	/**
     * Adds a layer as a node to the store.
     *
     * @param {Ext.data.NodeInterface} node The node to add.
     */
    addNode: function(node, parentNode) {
		var me = this;
		if(!node.getCesiumImageryLayer()) {
			parentNode.appendChild(node);
			node.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
            node.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
			
		}
		else {
			var imagerylayer = node.getCesiumImageryLayer();
			var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
			
			var idx = cesiumImageryLayerColl.indexOf(imagerylayer);
			node = parentNode.insertChild(idx, node);
			if(parentNode.isRoot()) {
				//remove and re-insert events to avoid to register multiple times
				parentNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
				parentNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
				
				parentNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
				parentNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
			}
		}
    },
	
	insertBeforeNode: function(node, afterNode) {
		var me = this;
		var parentNode =  afterNode.parentNode;
		
		if(!node.getCesiumImageryLayer()) {
			parentNode.insertBefore(node, afterNode);
			node.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
            node.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
			
		}
		else {
			var imagerylayer = node.getCesiumImageryLayer();
			var cesiumImageryLayerColl = me.getCesiumImageryLayerCollection();
			
			node = parentNode.insertBefore(node, afterNode);
			if(parentNode.isRoot()) {
				//remove and re-insert events to avoid to register multiple times
				parentNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
				parentNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
				
				parentNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
				parentNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
			}
		}
    },
	
	 /**
     * Bound as an eventlistener for layer nodes which are a folder / group on
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
     * @param {Cesium.ImageryLayer} imageryLayer The added Cesium Imagery Layer in the 
     *     Imagery Layer Collection for `this` store.
	 * @param {Number} index The index in the collection for the added Imagery Layer.
     * @private
     */
    onCesiumImageryLayerAdded: function(imageryLayer, index) {
		var me = this;
		if (me.collectionEventsSuspended) {
            return;
        }
		
		me.suspendCollectionEvents();
		var node = me.proxy.reader.read(imageryLayer);
		me.addNode(node, me.getRoot());
		me.resumeCollectionEvents();
    },
	
	/**
     * Handles the `remove` event of a managed `Cesium.ImageryLayerCollection` and eventually
     * removes the appropriate node.
     *
     * @param {Cesium.ImageryLayer} imageryLayer The removed Cesium Imagery Layer from
     *     the Imagery Layer Collection for `this` store.
	 * @param {Number} index The index in the collection for the removed Imagery Layer.
     * @private
     */
    onCesiumImageryLayerRemoved: function(imageryLayer, index) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        
		me.suspendCollectionEvents();
		
        // 1. find the node that existed for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return (candidate.getCesiumImageryLayer() === imageryLayer);
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
	 * Find the node after the node related to imageryLayer
     *
	 * @param {Cesium.ImageryLayer} imageryLayer. The imagery layer for the node
	 * @return {Ext.data.NodeInterface} the node after this `node`
     * @private
     */
	findAfterNodeByLayer: function(imageryLayer) {
		var me = this;
		var imageryLayerCollection = me.cesiumImageryLayerCollection;
		var idx = imageryLayerCollection.indexOf(imageryLayer);
		var afterIdx = idx + 1;
		var afterNode;
		
		if(afterIdx === imageryLayerCollection.length)
			afterNode = null;
		else {
			var afterImageryLayer = imageryLayerCollection.get(afterIdx);
			 afterNode = me.getRootNode().findChildBy(function(candidate) {
				return (candidate.getCesiumImageryLayer() === afterImageryLayer);
			}, me, true);
			if(!afterNode) afterNode = null;
		}
		return afterNode;
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
		var me = this;
		if(newIdx === oldIdx) return;
       
		var imageryLayerCollection = me.cesiumImageryLayerCollection;
		if (me.collectionEventsSuspended) {
            return;
        }
		
		me.suspendCollectionEvents();
		
		// 1. find the node for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return (candidate.getCesiumImageryLayer() === imageryLayer);
        }, me, true);
        if (!node) {
            return;
        }
		
		// 2. find the node after it
		var afterNode = me.findAfterNodeByLayer(imageryLayer);
		
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
	
	
	getOverallNodeIndex: function(startNode, node,  startIndex/*= -1*/) {
		
		var me = this;
		if(!startIndex)  startIndex = -1;
		//just search index for the node having layer
		if(!node.getCesiumImageryLayer && !node.getCesiumImageryLayer())
			return [-1, false];
			
		var isFound = false;
		if(startNode.getCesiumImageryLayer && startNode.getCesiumImageryLayer()) {
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
     * A utility method which unbinds collection change events FROM the passed
     * cesium ImageryLayerCollection.
     *
     * @private
     */
    unbindCesiumCollectionEvents: function() {
        var me = this;
		if(me.getCesiumImageryLayerCollection()) {
			me.getCesiumImageryLayerCollection().layerAdded.removeEventListener(me.onCesiumImageryLayerAdded);
			me.getCesiumImageryLayerCollection().layerRemoved.removeEventListener(me.onCesiumImageryLayerRemoved);
			me.getCesiumImageryLayerCollection().layerMoved.removeEventListener(me.onCesiumImageryLayerMoved, me);
			me.getCesiumImageryLayerCollection().layerShownOrHidden.removeEventListener(me.onCesiumImageryLayerShownOrHidden, me);
		}
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
     * @inheritdoc
     */
    destroy: function() {
		var me = this;
		unbindCesiumCollectionEvents();

		me.un('remove', me.handleRemove, me);
        me.un('noderemove', me.handleNodeRemove, me);
		me.un('nodemove', me.handleNodeMove, me);
        me.un('nodeappend', me.handleNodeAppend, me);
        me.un('nodeinsert', me.handleNodeInsert, me);
	}

 });
 
 