/* Copyright (c) 2019-Present CesiumExtJS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Represents a `<PropertyIsLike>` comparison operator.
 *
 * @class CesiumExt.format.filter.IsLike
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.filter.IsLike', {
    extend:'CesiumExt.format.filter.Comparison',
	
	/**
     * @property {String} pattern
	 * @private
	*/
	pattern: null,
	
	/**
     * @property {String} wildCard
     * @private
	*/
	wildCard: null,
	
	/**
     * @property {String} singleChar
	 * @private
	*/
	singleChar: null,
	
	/**
     * @property {String} escapeChar
	 * @private
	*/
	escapeChar: null,
	
	/**
	 * @property {Boolean | undefined} matchCase
	 * @private
	*/
	matchCase: null,
	
	
	/**
	 * The constructor method
	 *
	 * @param {String} propertyName Name of the context property to compare.
	 * @param {String} pattern Text pattern.
	 * @param {String} opt_wildCard Pattern character which matches any sequence of
	 *    zero or more string characters. Default is '*'.
	 * @param {String} opt_singleChar pattern character which matches any single
	 *    string character. Default is '.'.
	 * @param {String} opt_escapeChar Escape character which can be used to escape
	 *    the pattern characters. Default is '!'.
	 * @param {Boolean} opt_matchCase Case-sensitive?
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
