define([
    'jquery',
    'var/eventStorage',
    'prototype/var/EmojioneArea'
],
function($, eventStorage, EmojioneArea) {
    EmojioneArea.prototype.on = function(events, handler) {
        if (events && $.isFunction(handler)) {
            var id = this.id;
            $.each(events.toLowerCase().split(' '), function(i, event) {
                (eventStorage[id][event] || (eventStorage[id][event] = [])).push(handler);
            });
        }
        return this;
    };
});