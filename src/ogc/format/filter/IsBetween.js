/**
 * @class
 * Represents a `<PropertyIsBetween>` comparison operator.
 * @extends {CesiumExt.ogc.format.filter.Comparison}
 */
Ext.define('CesiumExt.ogc.format.filter.IsBetween', {
    extend:'CesiumExt.ogc.format.filter.Comparison',
	
  /**
   * @type {!number}
   */
	lowerBoundary: null,
	
  /**
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
