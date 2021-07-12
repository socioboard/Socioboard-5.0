define([
    'var/emojione',
    'var/uniRegexp',
    'var/emojioneList',
    'var/emojioneVersion',
    'var/readyCallbacks',
    'var/emojioneSupportMode',
    'function/emojioneReady'
],
function(emojione, uniRegexp, emojioneList, emojioneVersion, readyCallbacks, emojioneSupportMode, emojioneReady) {
    var cdn_base = "https://cdnjs.cloudflare.com/ajax/libs/emojione/";
    function detectSupportMode() {
        return (typeof emojione['jsEscapeMap']).toLowerCase() === 'object' ? emojione.cacheBustParam === "?v=1.2.4" ? 2 : 1 : 0;
    }
    if (!emojione) {
        $.getScript(cdn_base + emojioneVersion + "/lib/js/emojione.min.js", function () {
            emojione = window.emojione;
            emojioneSupportMode = detectSupportMode();
            cdn_base += emojioneVersion + "/assets";
            var sprite = cdn_base +"/sprites/emojione.sprites.css";
            if (document.createStyleSheet) {
                document.createStyleSheet(sprite);
            } else {
                $('<link/>', {rel: 'stylesheet', href: sprite}).appendTo('head');
            }
            while (readyCallbacks.length) {
                readyCallbacks.shift().call();
            }
        });
    } else {
        emojioneSupportMode = detectSupportMode();
        cdn_base += (emojioneSupportMode > 0 ? emojioneSupportMode > 1 ? '2.0.0' : '2.1.1' : '1.5.2') + "/assets";
    }

    emojioneReady(function() {
        emojione.imagePathPNG = cdn_base + "/png/";
        emojione.imagePathSVG = cdn_base + "/svg/";
        emojione.imagePathSVGSprites = cdn_base + "/sprites/emojione.sprites.svg";

        $.each(emojione.emojioneList, function (shortname, keys) {
            // fix shortnames for emojione v1.5.0
            emojioneList[shortname.replace('-', '_')] = keys;
        });

        uniRegexp = new RegExp("<object[^>]*>.*?<\/object>|<span[^>]*>.*?<\/span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|("+
            emojione.unicodeRegexp+")", "gi");
    });
});