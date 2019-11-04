/**
 * A plugin for Ext.grid.column.Column s that overwrites the internal cellTpl to
 * support legends.
 */
Ext.define('CesiumExt.tree.plugin.TreeColumnIcon', {
    extend: 'Ext.AbstractPlugin',
    alias: 'cesiumExt.plugin.tree_column_icon',
	requires: [
		'Ext.grid.column.Column',
		'Ext.tree.Column'
	],

    /**
     * @private
     */
    originalCellTpl: Ext.clone(Ext.tree.Column.prototype.cellTpl).join(''),

    /**
     * The Xtemplate strings that will be used instead of the plain {value}
     * when rendering
     */
    valueReplacementTpl: [
        '{value}',
        '<tpl if="this.hasIconUrl(values.record)"><br />',
        '<tpl for="lines">',
        '<img src="{parent.blankUrl}"',
        ' class="{parent.childCls} {parent.elbowCls}-img ',
        '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>"',
        ' role="presentation"/>',
        '</tpl>',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '{[this.getIconUrl(values.record)]}',
        '</tpl>'
    ],

    /**
     * The context for methods available in the template
     */
    valueReplacementContext: {
        hasIconUrl: function(rec) {
            var isChecked = rec.get('checked');
			return isChecked && rec.data['iconUrl'];
        },
        getIconUrl: function(rec) {
			var iconUrl = rec.data['iconUrl'];
            if (!iconUrl) {
				/*
                iconUrl = 'https://geoext.github.io/geoext2/' +
                    'website-resources/img/CesiumExt-logo.png';
				*/
				return undefined;
            }
            return '<img class="legend" src="' + iconUrl + '" height="32" />';
        }
    },

    init: function(column) {
        var me = this;
        if (!(column instanceof Ext.grid.column.Column)) {
            Ext.log.warn('Plugin shall only be applied to instances of' +
                    ' Ext.grid.column.Column');
            return;
        }
        var valuePlaceHolderRegExp = /\{value\}/g;
        var replacementTpl = me.valueReplacementTpl.join('');
        var newCellTpl = me.originalCellTpl.replace(
            valuePlaceHolderRegExp, replacementTpl
        );

        column.cellTpl = [
            newCellTpl,
            me.valueReplacementContext
        ];
    }
});
