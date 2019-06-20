define([
    'var/emojione',
    'var/emojioneList',
    'var/emojioneVersion',
    'function/getTemplate'
],
function(emojione, emojioneList, emojioneVersion, getTemplate) {
    return function(str, template) {
        return str.replace(/:?[\w_]+:?/g, function(shortname) {
            shortname = ":" + shortname.replace(/:$/,'').replace(/^:/,'') + ":";
            if (shortname in emojioneList) {
                return getTemplate(template, emojioneList[shortname][emojioneList[shortname].length-1], shortname);
            }
            return shortname;
        });
    };
});