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
	
	proxy: {
		type: 'memory',
		reader: 'json'
    },
	
	fields: [],
	
	/**
	* The `CesiumExt.data.model.DataSourceModel` Constructor.
	*
	* @param {Cesium.Entity | Object} data. The Cesium.DataSource instance or
	* 	json object configuration to create a new Cesium.Entity instance
	* @inheritdoc
	*/
    constructor: function(data) {
        var me = this;
		var cesiumEntity;
      
        data = data || {};

        // instantiate Cesium.Entity if plain data is handed over
        if (!(data instanceof Cesium.Entity)) {
            cesiumEntity = new Cesium.Entity(data);
        }
		else {
			cesiumEntity = data;
		}

        // init record with properties of underlying cesium entities
		var jsonProperties = {};
		var properties = cesiumEntity.properties;
		if(properties) {
			jsonProperties = cesiumEntity.properties.getValue(Cesium.JulianDate.now());
		}
        me.callParent([jsonProperties, cesiumEntity]);
		//add listener to handle the change in a entity property
		if(properties)
			me.getCesiumEntity().properties.definitionChanged.addEventListener(me.onCesiumEntityPropertiesChanged, me);
    },
	
	/**
     * Returns the `Cesium.Entity` object used in this model instance.
     *
     * @return {Cesium.Entity} The `Cesium.DataSource` object.
     */
    getCesiumEntity: function() {
		return this.cesiumObject;
    },
	
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
			var properties = me.getCesiumEntity().properties;
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
		me.getCesiumEntity().properties.definitionChanged.removeEventListener(me.onCesiumEntityPropertiesChanged, me);
        this.callParent(arguments);
    },
});