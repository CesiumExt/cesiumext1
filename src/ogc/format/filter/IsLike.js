/**
 * @classdesc
 * Represents a `<PropertyIsLike>` comparison operator.
 * @extends {Geo3dExt.ogc.format.filter.Comparison}
 */
Ext.define('Geo3dExt.ogc.format.filter.IsLike', {
    extend:'Geo3dExt.ogc.format.filter.Comparison',
	
  /**
   * @public
   * @type {!string}
   */
	pattern: null,
	
  /**
   * @public
   * @type {!string}
   */
	wildCard: null,
	
	/**
   * @public
   * @type {!string}
   */
	singleChar: null,
	
	/**
   * @public
   * @type {!string}
   */
	escapeChar: null,
	
	/**
   * @public
   * @type {!boolean|undefined}
   */
	matchCase: null,
	
	
	/**
	* @constructor
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!string} pattern Text pattern.
	* @param {string=} opt_wildCard Pattern character which matches any sequence of
	*    zero or more string characters. Default is '*'.
	* @param {string=} opt_singleChar pattern character which matches any single
	*    string character. Default is '.'.
	* @param {string=} opt_escapeChar Escape character which can be used to escape
	*    the pattern characters. Default is '!'.
	* @param {boolean=} opt_matchCase Case-sensitive?
	*/
	constructor: function(propertyName, pattern,
	  opt_wildCard, opt_singleChar, opt_escapeChar, opt_matchCase) {
		this.callParent(['PropertyIsLike', propertyName]);
		
		 this.pattern = pattern;
		 this.wildCard = (opt_wildCard !== undefined) ? opt_wildCard : '*';
		 this.singleChar = (opt_singleChar !== undefined) ? opt_singleChar : '.';
		 this.escapeChar = (opt_escapeChar !== undefined) ? opt_escapeChar : '!';
		 this.matchCase = opt_matchCase;
    },
});
