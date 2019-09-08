/**
 * @classdesc
 * Represents a `<PropertyIsEqualTo>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.ComparisonBinary}
 */
Ext.define('Geo3dExt.ogc.format.filter.EqualTo', {
    extend:'Geo3dExt.ogc.format.filter.ComparisonBinary',

	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!(string|number)} expression The value to compare.
	* @param {boolean=} opt_matchCase Case-sensitive?
	*/
	constructor: function(propertyName, expression, opt_matchCase) {
		this.callParent(['PropertyIsEqualTo', propertyName, expression, opt_matchCase]);
    },
});