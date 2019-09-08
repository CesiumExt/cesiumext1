/**
 * @classdesc
 * Represents a `<PropertyIsBetween>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.Comparison}
 */
Ext.define('Geo3dExt.ogc.format.filter.IsBetween', {
    extend:'Geo3dExt.ogc.format.filter.Comparison',
	
  /**
   * @public
   * @type {!number}
   */
	lowerBoundary: null,
	
  /**
   * @public
   * @type {!number}
   */
	upperBoundary: null,
	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!number} lowerBoundary The lower bound of the range.
	* @param {!number} upperBoundary The upper bound of the range.
	*/
	constructor: function(propertyName, lowerBoundary, upperBoundary) {
		this.callParent(['PropertyIsBetween', propertyName]);
		this.lowerBoundary = lowerBoundary;
		this.upperBoundary = upperBoundary;
    },
});
