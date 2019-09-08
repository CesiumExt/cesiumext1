/* Copyright (c) 2019 CesiumExtJS
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
 * A component that renders Cesium Viewer  and that can be used in any ExtJS
 * layout.
 *
 * An example: A map component rendered insiide of a panel:
 *
 *     @example preview
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: new ol.Map({
 *             layers: [
 *                 new ol.layer.Tile({
 *                     source: new ol.source.OSM()
 *                 })
 *             ],
 *             view: new ol.View({
 *                 center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *                 zoom: 12
 *             })
 *         })
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.Map Example',
 *         height: 200,
 *         items: [mapComponent],
 *         renderTo: Ext.getBody()
 *     });
 *
 * @class CesiumExt.map.Map
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
Ext.define('CesiumExt.map.Map', {
    extend: 'Ext.Component',
    alias: [
        'widget.cesiumext_map',
        'widget.cesiumext_component_map'
    ],
    requires: [
	/*
        'GeoExt.data.store.Layers',
        'GeoExt.util.Version'
	*/
    ],
    mixins: [
		'Ext.mixin.Observable',
       // 'GeoExt.mixin.SymbolCheck'
    ],
	
    config: {
        /**
         * A configuration object for the viewer.
         *
         * @cfg {Cesium.Viewer} viewer configuration
         */
		viewerConfig:null,
		html: null
    },
	
	viewer: null,
	
	/**
     * Whether we already rendered an Cesium.Viewer in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} viewerRendered
     * @private
     */
    viewerRendered: false,

    /**
     * @inheritdoc
     */
    constructor: function(config) {
        var me = this;
        me.callParent([config]);
		me.setHtml('<div id="cesiumContainer"></div>');
        me.on('resize', me.onResize, me);
		
		//me.viewer = new Cesium.Viewer('cesiumContainer', me.getViewerConfig());
        //me.viewerRendered = true;
    },

    /**
     * (Re-)render the map when size changes.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if (!me.viewerRendered) {
			me.viewer = new Cesium.Viewer('cesiumContainer', me.getViewerConfig());
            me.viewerRendered = true;
			me.fireEvent('viewercreated', me.viewer);
        } 
		else {
			me.getViewer().resize();
        }
    },
	
	/**
     * Returns the Cesium Viewer.
     *
     * @return {Cesium.Viewer} The Cesium Viewer.
     */
    getViewer: function() {
        return this.viewer;
    },
});
