/**
 * @class
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature property comparison filters.
 * @extends {CesiumExt.ogc.format.filter.Filter}
 */
Ext.define('CesiumExt.ogc.format.filter.Comparison', {
    extend:'CesiumExt.ogc.format.filter.Filter',
	propertyName: null,
	
	/**
	* @constructor
	* @abstract
	* @param {!string} tagName The XML tag name for this filter.
	* @param {!string} propertyName Name of the context property to compare.
	*/
	constructor: function(tagName, propertyName) {
		this.callParent([tagName]);
		this.propertyName = propertyName;
    },
	
});

