/**
 * @class
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature property binary comparison filters.
 * @abstract
 * @extends {CesiumExt.ogc.format.filter.Comparison}
 */
Ext.define('CesiumExt.ogc.format.filter.ComparisonBinary', {
    extend:'CesiumExt.ogc.format.filter.Comparison',
	
	/**
   * @type {!(string|number)}
   */
	expression: null,
	
	/**
   * @type {boolean|undefined}
   */
	matchCase: null,
	
	/**
	* @constructor
	* @param {!string} tagName The XML tag name for this filter.
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!(string|number)} expression The value to compare.
	* @param {boolean=} opt_matchCase Case-sensitive?
	*/
	constructor: function(tagName, propertyName, expression, opt_matchCase) {
		this.callParent([tagName, propertyName]);
		this.expression = expression;
		this.matchCase = opt_matchCase;
    },
});

