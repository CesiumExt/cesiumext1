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
 * A utility class for working with TreeNode Model/Store.
 *
 * @class CesiumExt.util.TreeNode
 */
Ext.define('CesiumExt.util.TreeNode', {
    inheritableStatics: {
        /**
         * A utility method to find the non-leaf node which is the direct
         * parent of the passed node. Searching starts at the passed
         * startNode. If `undefined` is returned, the child node is not a child of
         * the `startNode`.
         *
         * @param {Ext.data.NodeInterface} childNode The node whose group we want to find.
         * @param {Ext.data.NodeInterface} startGroup The group Node that we will start
         *     searching in.
         * @return {ol.layer.Group} The direct parent group or undefined if the
         *     group cannot be determined.
         */
        findParentGroup: function(childNode, startNode) {
            var parentGroup = undefined;
            var findParentGroup = CesiumExt.util.TreeNode.findParentGroup;
            var getIndex = CesiumExt.util.TreeNode.getIndex;

            if (getIndex(childNode, startNode) !== -1) {
                parentGroup = startNode;
            } else {
				var childNodes = startNode.childNodes;
				for(var i = 0; i < childNodes.length; ++i) {
					if(childNodes[i].get('isGroup') === true) {
						parentGroup = findParendGroup(childNode, childNodes[i]);
						if(parentGroup) 
							break;
					}
				}
            }

            return parentGroup;
        },

        /**
         * A utility method to determine the zero based index of a Node in a
         * node group. Will return `-1` if the node isn't a direct child of
         * the group.
         *
         * @param {Ext.data.NodeInterface} node The node whose index we want.
         * @param {Ext.data.NodeInterface} group The group to search in.
         * @return {Number} The index or `-1` if the node isn't a direct child
         *     of the group.
         */
        getIndex: function(node, group) {
            var index = -1;
			var childNodes = group.childNodes;
			for(var idx = 0; idx < childNodes.length; ++ idx) {
				if(childNodes[idx] === node) {
					index = idx;
					break;
				}
			}
            return index;
        }
    }
});
