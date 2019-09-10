/**
 * @class
 * Represents a logical `<Or>` operator between two or more filter conditions.
 * @extends {CesiumExt.ogc.format.filter.LogicalNary}
 */
Ext.define('CesiumExt.ogc.format.filter.Or', {
    extend: 'CesiumExt.ogc.format.filter.LogicalNary',
	
	/**
	* @constructor
	* @param {CesiumExt.ogc.format.filter.Filter} conditions Conditions.
	*/
	constructor: function(conditions) {
		var params = ['Or'].concat(Array.prototype.slice.call(arguments));
		this.callParent(params);
    },
});

