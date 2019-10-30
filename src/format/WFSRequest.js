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
 * Abstract Class that represents the WFS Request
 *
 * @class CesiumExt.format.WFSRequest
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.WFSRequest', {
	extend: 'Ext.Base',
	
	inheritableStatics: {
		DEFAULT_VERSION: '1.1.0',
		OGCNS: 'http://www.opengis.net/ogc',
		WFSNS: 'http://www.opengis.net/wfs',
		FESNS: 'http://www.opengis.net/fes',
		GMLNS: 'http://www.opengis.net/gml'
	},
	
	constructor: function(config) {
		var me = this;
		config = config || {};
		me.callParent([config]);
		me.initConfig(config);
    }
});