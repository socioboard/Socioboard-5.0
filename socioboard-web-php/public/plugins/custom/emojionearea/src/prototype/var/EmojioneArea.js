define([
    'var/unique',
    'var/eventStorage',
    'function/emojioneReady',
    'function/init',
    'block/loadEmojione'
],
function(unique, eventStorage, emojioneReady, init) {
    return function(element, options) {
        var self = this;
        eventStorage[self.id = ++unique] = {};
        emojioneReady(function() {
            init(self, element, options);
        });
    };
});