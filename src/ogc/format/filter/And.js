/**
 * @classdesc
 * Represents a logical `<And>` operator between two or more filter conditions.
 * @extends {Geo3dExt.ogc.format.filter.LogicalNary}
 */
Ext.define('Geo3dExt.ogc.format.filter.And', {
    extend: 'Geo3dExt.ogc.format.filter.LogicalNary',
	
	/**
	* @constructor
	* @param {...ol.format.filter.Filter} conditions Conditions.
	*/
	constructor: function(conditions) {
		var params = ['And'].concat(Array.prototype.slice.call(arguments));
		this.callParent(params);
    },
});

