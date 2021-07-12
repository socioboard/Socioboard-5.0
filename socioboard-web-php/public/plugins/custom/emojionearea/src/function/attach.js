define([
    'jquery',
    'var/slice',
    'function/trigger'
],
function($, slice, trigger) {
    return function(self, element, events, target) {
        target = target || function (event, callerEvent) { return $(callerEvent.currentTarget) };

        $.each($.isArray(element) ? element : [element], function(i, el) {
            $.each(events, function(event, handler) {
                $(el).on(event = $.isArray(events) ? handler : event, function() {
                    var _target = $.isFunction(target) ? target.apply(self, [event].concat(slice.call(arguments))) : target;
                    if (_target) {
                        trigger(self, handler, [_target].concat(slice.call(arguments)));
                    }
                });
            });
        });
    }
});