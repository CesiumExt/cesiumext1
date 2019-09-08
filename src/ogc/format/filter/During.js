/**
 * @classdesc
 * Represents a `<During>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.Comparison}
 */
Ext.define('Geo3dExt.ogc.format.filter.During', {
    extend:'Geo3dExt.ogc.format.filter.Comparison',
	
  /**
   * @public
   * @type {!string}
   */
	begin: null,
	
  /**
   * @public
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

