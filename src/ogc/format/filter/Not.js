/**
 * @class
 * Represents a logical `<Not>` operator for a filter condition.
 * @extends {CesiumExt.ogc.format.filter.Filter}
 */
Ext.define('CesiumExt.ogc.format.filter.Not', {
    extend: 'CesiumExt.ogc.format.filter.Filter',
	condition: null,
	
	/**
	* @constructor
	* @param {!CesiumExt.ogc.format.filter.Filter} condition Filter condition.
	*/
	constructor: function(condition) {
		this.callParent(['Not']);
		this.condition = condition;
    },
});

