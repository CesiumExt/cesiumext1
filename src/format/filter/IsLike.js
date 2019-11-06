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
	
	config: {
		/**
		* The Text Pattern
		* @cfg {String} pattern
		*/
		pattern: undefined,
		
		/**
		* The pattern character which matches any sequence of
		*    zero or more string characters. Default is '*'.
		* @cfg {String} wildCard
		*/
		wildCard: '*',
		
		/**
		* The pattern character which matches any single
		*    string character. Default is '.'.
		* @cfg {String} singleChar
		*/
		singleChar: '.',
		
		/**
		* Escape character which can be used to escape
		*    the pattern characters. Default is '!'.
		* @cfg {String} escapeChar
		*/
		escapeChar: '!',
		
		/**
		* Case-sensitive?
		* @cfg {Boolean | undefined} pattern
		*/
		matchCase: undefined,
		
	},
	
	statics: {
		TPL: 
			'<{0} {1}>' + 
				'<PropertyName>{2}</PropertyName>' +
				'<Literal>{3}</Literal>' +
			'</{0}>'
	},
	
	
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
	constructor: function(config) {
		var me = this;
		config = config || {};
		config.tagName = 'PropertyIsLike';
		me.callParent([config]);
		me.initConfig(config);
    },
	
	toString: function() {
		var me = this;
		//build attributes
		var atts = [];
		if(me.getWildCard())
			atts.push('wildCard="' + me.getWildCard() + '"');
		if(me.getSingleChar())
			atts.push('singleChar="' + me.getSingleChar() + '"');
		if(me.getEscapeChar())
			atts.push('escapeChar="' + me.getEscapeChar() + '"');
		if(me.getMatchCase() !== null && me.getMatchCase() !== undefined) {
			if(me.getMatchCase())
				atts.push('matchCase="true"');
			else
				atts.push('matchCase="false"');
		}
		
		return Ext.String.format(
			CesiumExt.format.filter.IsLike.TPL,
			this.getTagName(),
			atts.join(' '),
			this.getPropertyName(),
			this.getPattern()
		);
	}
});
