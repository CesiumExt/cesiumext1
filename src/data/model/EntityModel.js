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
 * Data model holding an Cesium Entity (`Cesium.Entity`).
 *
 * @class CesiumExt.data.model.EntityModel
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.data.model.EntityModel', {
    extend: 'CesiumExt.data.model.Base',
	
	mixins: [
        //'CesiumExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
    
    ],
	
	
	/**
     * The underlying Cesium.Entity.
     *
     * @property {Cesium.Entity}
     */
    cesiumEntity: null,

    /**
     * Returns the underlying `Cesium.Entity` of this record.
     *
     * @return {Cesium.Entity} The underlying `Cesium.Entity`.
     */
    getCesiumEntity: function() {
        return this.cesiumEntity;
    },
	
	proxy: {
		type: 'memory',
		reader: 'json'
    },
	
	fields: [],
	
	/**
	* The `CesiumExt.data.model.DataSourceModel` Constructor.
	*
	* @parameter {Cesium.Entity | Object}. The Cesium.DataSource instance or
	* 	json object configuration to create a new Cesium.Entity instance
	* @inheritdoc
	*/
    constructor: function(data) {
        var me = this;
      
        data = data || {};

        // instantiate Cesium.Entity if plain data is handed over
        if (!(data instanceof Cesium.Entity)) {
            me.cesiumEntity = new Cesium.Entity(data);
        }
		else {
			me.cesiumEntity = data;
		}

        // init record with properties of underlying cesium entities
		//me.buildFields(me.cesiumEntity);
		
		var jsonProperties = {};
		var properties = me.cesiumEntity.properties;
		if(properties) {
			jsonProperties = me.cesiumEntity.properties.getValue(Cesium.JulianDate.now());
		}
        me.callParent([jsonProperties]);
		//add listener to handle the change in a entity property
		if(properties)
			me.cesiumEntity.properties.definitionChanged.addEventListener(me.onCesiumEntityPropertiesChanged, me);
    },
	
	/*
	buildFields: function(entity) {
		var me = this;
		if(me.fields.length > 0) return;
		var properties = entity.properties;
		if(!properties) return;
		var propertyNames = entity.properties.propertyNames;
		var jsonProperties = properties.getValue(Cesium.JulianDate.now());
		for (var i = 0; i < propertyNames.length; i++) {
			var field = {};
			field.name = propertyNames[i];
			field.persist = false;
			
			field.convert = function(v, record) {
				var entity = record.getCesiumEntity();
				var jsonProps = entity.properties.getValue(Cesium.JulianDate.now());
				return jsonProps[field.name];
			};
			
			me.fields.push(field);
		}
		
		return jsonProperties;
	},
	*/
	
	/**
     * Listener to definitionChanged events of the underlying `Cesium.Entity`. All
     * changes on the object will be forwarded to the Ext.data.Model.
     *
     * @param  {Cesium.Entity} entity The `Cesium.Entity` on which the property was changed.
	 * @param  {string} propertyName. The changed property name.
	 * @param  {*} newValue. The new value of the changed property.
	 * @param  {*} oldValue. The old value of the changed property.
     * @private
     */
    onCesiumEntityPropertiesChanged: function(propertyBag) {
		var me = this;
		
        if (!me.__updating) {
			me.__updating = true;
			var propertyNames = me.getCesiumEntity().properties.propertyNames;
			var jsonProperties = propertyBag.getValue(Cesium.JulianDate.now());
			me.set(jsonProperties);
			me.__updating = false;
        }
    },
	
	/**
     * Overriden to forward changes to the underlying `Cesium.Entity`. All changes on
     * the Ext.data.Models properties will be set on the `Cesium.Entity` as well.
     *
     * @param {String|Object} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
		var me = this;
        var o = {};

        me.callParent(arguments);

        // forward changes to Cesium Entity
		if (!me.__updating) {
			me.__updating = true;
			// wrap simple set operations into an object
			if (Ext.isString(key)) {
				o[key] = newValue;
			} else {
				o = key;
			}
			// iterate over object setting changes to Cesium.Entity
			var properties = me.cesiumEntity.properties;
			//var entityValues = properties.getValue(Cesium.JulianDate.now());
			Ext.Object.each(o, function(k, v) {
				properties.addProperty(k,  v);
			}, me);
			me.__updating = false;
		}
    },
	
	/**
     * Overriden to unregister all added event listeners on the Cesium.Entity.
     *
     * @inheritdoc
     */
    destroy: function() {
        var me = this;
		me.cesiumEntity.properties.definitionChanged.removeEventListener(me.onCesiumEntityPropertiesChanged, me);
        this.callParent(arguments);
    },
});