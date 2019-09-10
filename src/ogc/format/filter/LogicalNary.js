/**
 * @class
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature n-ary logical filters.
 * @extends {CesiumExt.ogc.format.filter.Filter}
 */
Ext.define('CesiumExt.ogc.format.filter.LogicalNary', {
    extend: 'CesiumExt.ogc.format.filter.Filter',
	requires: [
        'Ext'
    ],
	conditions: null,
	
	/**
	* @constructor
	* @param {!CesiumExt.ogc.format.filter.Filter} condition Filter condition.
	*/
	constructor: function(tagName, conditions) {
		this.callParent([tagName]);
		this.conditions = Array.prototype.slice.call(arguments, 1);
		if(this.conditions.length  < 2) {
			Ext.raise('At least 2 conditions are required');
		}
    },
});

