define([
    'var/emojione',
    'var/emojioneSupportMode'
],
function(emojione, emojioneSupportMode) {
    return function(template, unicode, shortname) {
        return template
            .replace('{name}', shortname || '')
            .replace('{img}', emojione.imagePathPNG + (emojioneSupportMode !== 1 ? unicode.toUpperCase() : unicode) + '.png'/* + emojione.cacheBustParam*/)
            .replace('{uni}', emojioneSupportMode < 1 ? unicode.toUpperCase() : unicode)
            .replace('{alt}', emojione.convert(unicode));
    }
});