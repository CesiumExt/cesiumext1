/**
 * @classdesc
 * Represents a logical `<Or>` operator between two or more filter conditions.
 * @extends {Geo3dExt.ogc.format.filter.LogicalNary}
 */
Ext.define('Geo3dExt.ogc.format.filter.Or', {
    extend: 'Geo3dExt.ogc.format.filter.LogicalNary',
	
	/**
	* @constructor
	* @param {...ol.format.filter.Filter} conditions Conditions.
	*/
	constructor: function(conditions) {
		var params = ['Or'].concat(Array.prototype.slice.call(arguments));
		this.callParent(params);
    },
});

