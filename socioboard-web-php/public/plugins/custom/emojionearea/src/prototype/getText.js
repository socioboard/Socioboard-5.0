define([
    'jquery',
    'function/textFromHtml',
    'prototype/var/EmojioneArea'
],
function($, textFromHtml, EmojioneArea) {
    EmojioneArea.prototype.getText = function() {
        var el = (this.standalone) ? "button" : "editor";
        return textFromHtml(this[el].html(), this);
    }
});