class TextHelpers {

    getBetween(pageSource, firstData, secondData) {
        return new Promise((resolve, reject) => {
            if (!pageSource || !firstData || !secondData) {
                reject(new Error("Invalid Inputs"));
            } else {
                const resSplit = pageSource.split(firstData);
                const indexSec = resSplit[1].indexOf(secondData);
                var result = resSplit[1].substring(0, indexSec);
                resolve(result);
            }
        });
    }

    hexcodeToChar(text) {
        return new Promise((resolve, reject) => {
            if (!text) {
                reject(new Error("Invalid Inputs"));
            } else {
                var regex = /&#x[\dA-F]{1,5};/gi;
                var regex1 = /&#x[\dA-F]{1,5}d;/gi;
                var regex2 = /&#(?:x([\da-f]+)|(\d+));/gi;
                var matchedRegex;

                if (regex.test(text)) {
                    matchedRegex = regex;
                } else {
                    if (regex1.test(text)) {
                        matchedRegex = regex1;
                    }
                }
                if (matchedRegex === undefined) {
                    if (regex2.test(text)) {
                        text.replace(regex2, function (_, hex, dec) {
                            var result = String.fromCharCode(dec || +('0x' + hex));
                            resolve(result);
                        });
                    }
                }
                if (matchedRegex !== undefined || matchedRegex !== null) {
                    text.replace(matchedRegex, function replace(match) {
                        var result = String.fromCharCode(parseInt(match.replace(/&#x/g, '0x').replace(/;/g, ''), 16));
                        resolve(result);
                    });
                } else {
                    resolve(text);
                }
            }
        });
    }
}

module.exports = TextHelpers;