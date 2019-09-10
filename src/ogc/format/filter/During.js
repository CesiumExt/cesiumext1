/**
 * @class
 * Represents a `<During>` comparison operator.
 * @extends {CesiumExt.ogc.format.filter.Comparison}
 */
Ext.define('CesiumExt.ogc.format.filter.During', {
    extend:'CesiumExt.ogc.format.filter.Comparison',
	
  /**
   * @type {!string}
   */
	begin: null,
	
  /**
   * @type {!string}
   */
	end: null,
	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!string} begin The begin date in ISO-8601 format.
	* @param {!string} end The end date in ISO-8601 format.
	*/
	constructor: function(propertyName, begin, end) {
		this.callParent(['During', propertyName]);
		this.begin = begin;
		this.end = end;
    },
});

