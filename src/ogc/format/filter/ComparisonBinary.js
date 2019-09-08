/**
 * @classdesc
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature property binary comparison filters.
 * @abstract
 * @extends {Geo3dExt.ogc.format.filter.Comparison}
 */
Ext.define('Geo3dExt.ogc.format.filter.ComparisonBinary', {
    extend:'Geo3dExt.ogc.format.filter.Comparison',
	
	/**
   * @public
   * @type {!(string|number)}
   */
	expression: null,
	
	/**
   * @public
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

