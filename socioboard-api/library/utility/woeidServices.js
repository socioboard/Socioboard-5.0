'use strict';
const data = require('./country')();

var helper = {};

function getWoeidFromISO2Country(country) {
    for (const d of data) {
        if (country.toLowerCase() === d['iso-3166-alpha2'].toLowerCase()) {
            return d;
        }
    }
}

function getWoeidFromISO3Country(country) {
    for (const d of data) {
        if (country.toLowerCase() === d['iso-3166-alpha3'].toLowerCase()) {
            return d;
        }
    }
}

helper.getWoeid = function getWoeid(country) {
    if (typeof country === 'string' && country.length === 2) {
        return getWoeidFromISO2Country(country);
    } else if (typeof country === 'string' && country.length === 3) {
        return getWoeidFromISO3Country(country);
    }
}

helper.getCountry = function getCountry(woeid) {
    if (typeof woeid === 'number') {
        for (const d of data) {
            if (woeid === d.woeid) {
                return d;
            }
        }
    }
}

module.exports = helper;