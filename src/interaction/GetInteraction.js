/* Copyright (c) 2019-Today CesiumExt
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
 * Abstract class used for the 'get' interactions 
 * @class CesiumExt.interaction.GetInteraction
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetInteraction', {
    extend: 'CesiumExt.interaction.Interaction',
	
	config: {
		/**
		* The datasource where the entity will be stored
		*/
		dataSource: null
	},
	
	_dragEntity: null,
	
	getDragEntity: function() {
		return this._dragEntity;
	},
	
	setDragEntity: function(entity) {
		this._dragEntity = entity
	},
	
	/**
	* @param {Object} config The configuration object for this Interaction.
	* @param {Cesium.DataSource} config.dataSource The Cesium DataSource
	*	where the entity will be stored
	* @inheritdoc
	*/
	constructor: function(config) {
		var me = this;
        config = config || {};
		me.callParent([config]);
		me.initConfig(config);
		
		if(!me.getDataSource()) {
			var dataSource = me.getViewer().dataSourceDisplay.defaultDataSource;
			me.setDataSource(dataSource);
		}
		me._dragEntity = null;
    },
	
	/**
	 * Abstract Method to create the drag entity
	 * @return {Cesium.Entity} the newly created entity
	*/
	createDragEntity: function() {
		Ext.raise('CesiumExt.interaction.GetInteraction.createEntity() must be implemented');
	},
	
	/**
	* Cleanup the resources
	*/
	cleanup: function() {
		var me = this;
		if (me._dragEntity) {
			me.getDataSource().entities.remove(me._dragEntity);
			me._dragEntity = null;
		}
		me.callParent(arguments);
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.callParent(arguments);
	}
});