//from: https://www.sencha.com/forum/showthread.php?306540-How-to-define-custom-event-on-custom-class-and-listening-those-events-in-controller
// https://fiddle.sencha.com/#fiddle/10m1&view/editor

Ext.application({
    name: 'Fiddle',

    launch: function() {
        Ext.define('Employee', {
            mixins: ['Ext.mixin.Observable'],

            config: {
                name: ''
            },

            constructor: function(config) {
                this.mixins.observable.constructor.call(this, config);
            }
        });

        var newEmployee = new Employee({
            name: 'John',
            testFireEvent: function() {
                this.fireEvent('testevent');
            },
            listeners: {
                testevent: function() {
                    alert(this.getName() + " fired test event!");
                }
            }
        });

        Ext.create('Ext.Button', {
            text: 'Click me',
            renderTo: Ext.getBody(),
            handler: function() {
                newEmployee.testFireEvent();
            }
        });
    }
});