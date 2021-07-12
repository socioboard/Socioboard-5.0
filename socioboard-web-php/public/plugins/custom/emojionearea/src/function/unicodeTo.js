define([
    'var/emojione',
    'var/uniRegexp',
    'var/emojioneSupportMode',
    'function/getTemplate',
    'block/loadEmojione'
],
function(emojione, uniRegexp, emojioneSupportMode, getTemplate) {
    return function(str, template) {
        return str.replace(uniRegexp, function(unicodeChar) {
            var map = emojione[(emojioneSupportMode < 1 ? 'jsecapeMap' : 'jsEscapeMap')];
            if (typeof unicodeChar !== 'undefined' && unicodeChar in map) {
                return getTemplate(template, map[unicodeChar]);
            }
            return unicodeChar;
        });
    }
});