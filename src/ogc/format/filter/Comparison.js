/**
 * @classdesc
 * Abstract class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for WFS GetFeature property comparison filters.
 * @extends {Geo3dExt.ogc.format.filter.Filter}
 */
Ext.define('Geo3dExt.ogc.format.filter.Comparison', {
    extend:'Geo3dExt.ogc.format.filter.Filter',
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

