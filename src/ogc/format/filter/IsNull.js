/**
 * @class
 * Represents a `<PropertyIsNull>` comparison operator.
 * @extends {CesiumExt.ogc.format.filter.Comparison}
 */
Ext.define('CesiumExt.ogc.format.filter.IsNull', {
    extend:'CesiumExt.ogc.format.filter.Comparison',
	
	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	*/
	constructor: function(propertyName) {
		this.callParent(['PropertyIsNull', propertyName]);
    },
});
