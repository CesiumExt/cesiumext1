/**
 * @classdesc
 * Represents a logical `<Not>` operator for a filter condition.
 * @extends {Geo3dExt.ogc.format.filter.Filter}
 */
Ext.define('Geo3dExt.ogc.format.filter.Not', {
    extend: 'Geo3dExt.ogc.format.filter.Filter',
	condition: null,
	
	/**
	* @constructor
	* @param {!Geo3dExt.ogc.format.filter.Filter} condition Filter condition.
	*/
	constructor: function(condition) {
		this.callParent(['Not']);
		this.condition = condition;
    },
});

