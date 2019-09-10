/**
 * presents a `<PropertyIsLessThan>` comparison operator.
 * @class CesiumExt.ogc.format.filter.LessThan
 * @extends {CesiumExt.ogc.format.filter.ComparisonBinary}
 */
Ext.define('CesiumExt.ogc.format.filter.LessThan', {
    extend:'CesiumExt.ogc.format.filter.ComparisonBinary',

	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!number} expression The value to compare.
	*/
	constructor: function(propertyName, expression) {
		this.callParent(['PropertyIsLessThan', propertyName, expression]);
    },
});

