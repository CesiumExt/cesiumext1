/* Copyright (c) 2019-Today CesiumExt
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
 * Class used to get the Cesium PolylineGraphics
 * through user interaction
 * @class CesiumExt.interaction.GetPolylineGraphics
 *
 * @author Paulo Sergio SAMPAIO de ARAGAO
 */
 
 Ext.define('CesiumExt.interaction.GetDistance', {
    extend: 'CesiumExt.interaction.GetPolylineGraphics',
	
	endInputHandler: function(movement, context) {
		var me = (context ? context : this);
		if(me._numberOfInputVertices < 2) return;
		if(me._numberOfInputVertices < me._positions.length) {
			me._positions.pop();
		}
		me.getDragEntity().polyline.positions =  me._positions;
		var data = me.calculateTotalDistance();
		//cleanup
		me.cleanup();
		//fire event
		me.fireEvent('drawend', data);
	},
	
	 /**
     * @inheritdoc
     */
    destroy: function() { 
		this.callParent(arguments);
	}
	
 });
	