/**
 * @classdesc
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature n-ary logical filters.
 * @extends {Geo3dExt.ogc.format.filter.Filter}
 */
Ext.define('Geo3dExt.ogc.format.filter.LogicalNary', {
    extend: 'Geo3dExt.ogc.format.filter.Filter',
	requires: [
        'Ext'
    ],
	conditions: null,
	
	/**
	* @constructor
	* @param {!Geo3dExt.ogc.format.filter.Filter} condition Filter condition.
	*/
	constructor: function(tagName, conditions) {
		this.callParent([tagName]);
		this.conditions = Array.prototype.slice.call(arguments, 1);
		if(this.conditions.length  < 2) {
			Ext.raise('At least 2 conditions are required');
		}
    },
});

