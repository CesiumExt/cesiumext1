/**
 * @classdesc
 * presents a `<PropertyIsLessThanOrEqualTo>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.ComparisonBinary}
 */
Ext.define('Geo3dExt.ogc.format.filter.LessThanOrEqualTo', {
    extend:'Geo3dExt.ogc.format.filter.ComparisonBinary',

	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!number} expression The value to compare.
	*/
	constructor: function(propertyName, expression) {
		this.callParent(['PropertyIsLessThanOrEqualTo', propertyName, expression]);
    },
});

