/**
 * @classdesc
 * Represents a `<PropertyIsNull>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.Comparison}
 */
Ext.define('Geo3dExt.ogc.format.filter.IsNull', {
    extend:'Geo3dExt.ogc.format.filter.Comparison',
	
	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	*/
	constructor: function(propertyName) {
		this.callParent(['PropertyIsNull', propertyName]);
    },
});
