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
 * The Cesium GroupTreeNode Model class used by the stores in trees.
 * This class represents a generic node with possible child nodes.
 * @class CesiumExt.data.model.GroupTreeModel
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.data.model.GroupTreeModel', {
    extend: 'Ext.data.Model',
    mixins: [
        
    ],

    // <debug>
    symbols: [
    
    ],
    // </debug>
	
	fields: 
	[
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
			defaultValue: 'Unnamed',
		},
		{
			name: 'iconUrl',
			type: 'string',
			persist: false,
			defaultValue: null,
		},
		{
			name: 'leaf',
			type: 'boolean',
			persist: false,
			defaultValue: false
		}, 
		{
            name: 'isGroup',
            type: 'boolean',
            persist: false,
            defaultValue: true
        },
		{
			/**
			 * auxiliar property to avoid recursion
			 * This should be set via tree panel.
			 */
			name: '__toggleMode',
			type: 'string',
			defaultValue: 'classic'
		}, 
	],
	
	proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
	
	/**
     * @inheritDoc
     */
    constructor: function() {
		var me = this;
        me.callParent(arguments);
    },
	
	
	/**
     * Overriden to forward changes to the underlying `Cesium.ImageryLayer`. All changes
     * on the {Ext.data.Model} properties will be set on the `Cesium.ImageryLayer` as
     * well.
     *
     * @param {String} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var me = this;
        var classicMode = (me.get('__toggleMode') === 'classic');

        me.callParent(arguments);
		
        // forward changes to child nodes
        if (key === 'checked') {
            me.__updating = true;
            if (classicMode) {
                //me.getCesiumImageryLayer().show = newValue;
                if (me.childNodes) {
                    me.eachChild(function(child) {
						child.set('checked', newValue);
                    });
                }
            }
            me.__updating = false;

            if (classicMode) {
                me.toggleParentNodes(newValue);
            }
        }
    },
	
	/**
     * Handles parent behaviour of checked nodes: Checks parent Nodes if node
     * is checked or unchecks parent nodes if the node is unchecked and no
     * sibling is checked.
     *
     * @param {Boolean} newValue The newValue to pass through to the parent.
     * @private
     */
    toggleParentNodes: function(newValue) {
        var me = this;
        // Checks parent Nodes if node is checked.
        if (newValue === true) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    parent.set('__toggleMode', 'cesium'); // prevents recursion
                    parent.set('checked', true);
                    parent.set('__toggleMode', 'classic');
                }
            });
            me.__updating = false;
        }

        // Unchecks parent Nodes if the node is unchecked and no sibling is
        // checked.
        if (newValue === false) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    var allUnchecked = true;
                    parent.eachChild(function(child) {
                        if (child.get('checked')) {
                            allUnchecked = false;
                        }
                    });
                    if (allUnchecked) {
                        parent.set('__toggleMode', 'cesium'); // prevents recursion
                        parent.set('checked', false);
                        parent.set('__toggleMode', 'classic');
                    }
                }
            });
            me.__updating = false;
        }
    },
	
	 /**
     * @inheritdoc
     */
    getRefItems: function() {
        return this.childNodes;
    },
	
	/**
     * @inheritdoc
     */
    getRefOwner: function() {
        return this.parentNode;
    }
	
 }, function() {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});