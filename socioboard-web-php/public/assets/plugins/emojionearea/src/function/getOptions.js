define([
    'jquery',
    'var/default_options',
    'var/emojioneSupportMode'
],
function($, default_options, emojioneSupportMode) {
    return function(options) {
        options = $.extend({}, default_options, options);

        if (emojioneSupportMode > 0) {
            options.filters.people.emoji = options.filters.people.emoji
                .replace(",writing_hand,", ",");
            options.filters.travel.emoji = options.filters.travel.emoji
                .replace(",contruction_site,", ",construction_site,");
            options.filters.objects_symbols.emoji = options.filters.objects_symbols.emoji
                .replace(",keycap_ten,", ",ten,")
                .replace(",cross_heavy,", ",cross,");
        }

        return options;
    }
});