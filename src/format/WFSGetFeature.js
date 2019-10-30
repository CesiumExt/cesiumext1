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
 * Represents the WFS GetFeature Service
 *
 * @class CesiumExt.format.WFSGetFeature
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.format.WFSGetFeature', {
	extend: 'CesiumExt.format.WFSRequest',
	requires: [
		'CesiumExt.format.filter.BBox',
		'CesiumExt.format.filter.And',
		'CesiumExt.format.WFSRequest'
	],
	config: {
		
		/**
		 * The WFS URL
		 *
		 * @cfg {String} url
		*/
		url: null,
		/**
		 * The WFS Version
		 *
		 * @cfg {String} version
		*/
		version: '1.1.0', //CesiumExt.format.WFSRequest.DEFAULT_VERSION,
		//version: CesiumExt.format.WFSRequest.DEFAULT_VERSION,
		
		/**
		 * The namespace URI used for features
		 *
		 * @cfg {String} featureNS
		*/
		featureNS: null,
		/**
		 * The prefix for the feature namespace
		 *
		 * @cfg {String} featurePrefix
		*/
		featurePrefix: '',
		
		/**
		 * The feature type names
		 * @cfg {[String]} typeNames
		*/
		typeNames: null,
		
		/**
		 * 	The SRS name. No srsName attribute will be set on
		 *	geometries when this is not provided.
		 * @cfg {String} srsName
		*/
		srsName: 'EPSG:4326',
		
		/**
		 * The Handle
		 * @cfg {String} handle
		*/
		handle: null,
		
		/**
		 * The Feature identification
		 * @cfg {String} featureID
		*/
		featureID: null,
		
		/**
		 * The Output format.
		 * @cfg {String} outputFormat
		*/
		outputFormat: 'application/json',
		
		/**
		 * The maximum number of features to fetch.
		 * @cfg {Number} maxFeatures
		*/
		maxFeatures: 100,
		
		/**
		 * The Geometry name to use in a BBOX filter.
		 * @cfg {String} geometryName
		*/
		geometryName: null,
		
		/**
		 * The optional list of property names to serialize.
		 * @cfg {[String]} propertyNames
		*/
		propertyNames: null,
		
		/**
		 * The viewParams GeoServer vendor parameter.
		 * @cfg {String} viewParams
		*/
		viewParams: null,
		
		/**
		 * The Start index to use for WFS paging. 
		 * This is a WFS 2.0 feature backported to WFS 1.1.0 by 
		 * some Web Feature Services.
		 * @cfg {Number} startIndex
		*/
		startIndex: null,
		
		/**
		 * Number of features to retrieve when paging. 
		 * This is a WFS 2.0 feature backported to WFS 1.1.0 by 
		 * some Web Feature Services. Please note that some 
		 * Web Feature Services have repurposed maxfeatures instead.
		 * @cfg {Number} count
		*/
		count: null,
		
		/**
		 * The Extent to use for the BBOX filter.
		 * @cfg {Cesium.Rectangle} bbox
		*/
		bbox: null,
		
		/**
		 * The Filter condition. See namespace 
		 * CesiumExt.format.filter for more info
		 * @cfg {CesiumExt.format.filter.AbstractFilter} filter
		*/
		filter: null,
		
		/**
		 * Indicates what response should be returned, E.g. hits 
		 * only includes the numberOfFeatures attribute in the 
		 * response and no features.
		 * @cfg {String} resultType
		*/
		resultType: null,
	},
	
	constructor: function(config) {
		var me = this;
		config = config || {};
		me.callParent([config]);
		me.initConfig(config);
    },
	
	/**
	* Encode a WFS GetFeature URL request with its 
	* parameters (GET Method)
	*/
	writeURL: function(){
		var me = this;
		var parts = [me.getUrl() + '?service=wfs&request=GetFeature'];
		//add version parameter
		parts.push('&version=' + me.getVersion());
		//add featureTypes parameter
		if(!Array.isArray(me.getTypeNames()))
			Ext.raise('typeNames parameter must be an array');
		if(me.getTypeNames() && me.getTypeNames().length > 0) {
			var clone = me.getTypeNames().slice(0);
			for(var i = 0; i < clone.length; ++i) {
				clone[i] = me.getFeaturePrefix() + ':' + clone[i];
			}
			parts.push('&typeNames=' + clone.join(','));
		}
		//add srsName parameter
		if(me.getSrsName())
			parts.push('&srsName=' + me.getSrsName());
		//add handle parameter
		if(me.getHandle())
			parts.push('&handle=' + me.getHandle());
		//add feature id parameter
		if(me.getFeatureID())
			parts.push('&featureID=' + me.getFeatureID());
		//add outputFormat parameter
		parts.push('&outputFormat=' + me.getOutputFormat());
		//add maxFeatures parameter
		if(me.getMaxFeatures())
			parts.push('&maxFeatures=' + me.getMaxFeatures());
		//add propertyNames parameter
		if(me.getPropertyNames() && me.getPropertyNames().length > 0 )
			parts.push('&propertyNames=' + me.getPropertyNames().join(','));
		//add viewParams parameter
		if(me.getViewParams())
			parts.push('&viewParams=' + me.getViewParams());
		//add startIndex parameter
		if(me.getStartIndex())
			parts.push('&startIndex=' + me.getStartIndex());
		//add count parameter
		if(me.getCount())
			parts.push('&count=' + me.getCount());
		//add resultType parameter
		if(me.getResultType())
			parts.push('&resultType=' + me.getResultType());
		
		var filter = me.getFilter();
		//Add BBox and Filter Parameter
		if(me.getBbox()) {
			if(!me.getGeometryName())
				Ext.raise('geometryName parameter must be provided');
			//create box filter
			var bboxFilter = Ext.create('CesiumExt.format.filter.BBox', {
				geometryName: me.getGeometryName(),
				extent: me.getBbox(),
				srsName: me.getSrsName()
			});
			//if filter, combine with bbox using AND Filter
			if(filter) {
				filter = Ext.create('CesiumExt.format.filter.And', {
					conditions: [filter, bboxFilter]
				});
			}
			else {
				filter = bboxFilter;
			}
		}
		if(filter) {
			//add filter parameter
			parts.push('&filter=' + filter.encodeFilterAsXmlString());
		}
		return parts.join('');
	}

});