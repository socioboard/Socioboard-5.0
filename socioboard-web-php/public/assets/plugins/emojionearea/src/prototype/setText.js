define([
    'jquery',
    'function/emojioneReady',
    'function/htmlFromText',
    'function/trigger',
    'prototype/var/EmojioneArea'
],
function($, emojioneReady, htmlFromText, trigger, EmojioneArea) {
    EmojioneArea.prototype.setText = function (str, placeholder) {
        var self = this, args = arguments;

        emojioneReady(function () {
            if (self.standalone) {
                self.button.html(htmlFromText(str, self));
                self.content = self.button.html();
                self.button.toggleClass("placeholder", placeholder);
                if (args.length === 1) {
                    trigger(self, 'change', [self.button]);
                }
            } else {
                self.editor.html(htmlFromText(str, self));
                self.content = self.editor.html();
                if (args.length === 1) {
                    trigger(self, 'change', [self.editor]);
                }
            }
        });
    }
});