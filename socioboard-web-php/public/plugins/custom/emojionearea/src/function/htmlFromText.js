define([
    'var/emojione',
    'var/blankImg',
    'function/unicodeTo'
],
function(emojione, blankImg, unicodeTo) {
    return function(str, self) {
        str = str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/`/g, '&#x60;')
            .replace(/(?:\r\n|\r|\n)/g, '\n')
            .replace(/(\n+)/g, '<div>$1</div>')
            .replace(/\n/g, '<br/>')
            .replace(/<br\/><\/div>/g, '</div>');
        if (self.shortnames) {
            str = emojione.shortnameToUnicode(str);
        }
        return unicodeTo(str,
            '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '">' : '" src="{img}">'))
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/  /g, '&nbsp;&nbsp;');
    }
});