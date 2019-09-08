/**
 * @classdesc
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature filters.
 *
 */
Ext.define('Geo3dExt.ogc.format.filter.Filter', {
    extend: 'Ext.Base',
	
	/**
	* @private
	* @type {!string}
	*/
	tagName_: null,
	
	/**
	* @constructor
	* @abstract
	* @param {!string} tagName The XML tag name for this filter.
	* @struct
	* @api
	*/
	constructor: function(tagName) {
        this.tagName_ = tagName;
    },
	
	/**
	 * The XML tag name for a filter.
	 * @returns {!string} Name.
	*/
	getTagName: function() {
		return this.tagName;
	},
});