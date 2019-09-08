/**
 * @classdesc
 * presents a `<PropertyIsGreaterThanOrEqualTo>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.ComparisonBinary}
 */
Ext.define('Geo3dExt.ogc.format.filter.GreaterThanOrEqualTo', {
    extend:'Geo3dExt.ogc.format.filter.ComparisonBinary',

	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!number} expression The value to compare.
	*/
	constructor: function(propertyName, expression) {
		this.callParent(['PropertyIsGreaterThanOrEqualTo', propertyName, expression]);
    },
});

