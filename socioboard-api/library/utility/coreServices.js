const uuid = require('uuid/v1');

function CoreServices() {
    this.userPlans = {
        "Basic": 0,
        "Standard": 1,
        "Premium": 2,
        "Deluxe": 3,
        "Topaz": 4,
        "Ruby": 5,
        "Gold": 6,
        "Platinum": 7
    };
    this.userPlansAccount = {
        0: 2,
        1: 10,
        2: 20,
        3: 50,
        4: 100,
        5: 200,
        6: 500,
        7: 1000,
    };
    this.userPlansTeamMember = {
        0: 1,
        1: 5,
        2: 10,
        3: 20,
        4: 30,
        5: 50,
        6: 80,
        7: 100,
    };
    this.webhooksSupportedAccountType = ['2', '4', '9'];
    this.networks = {
        Facebook: 1,
        FacebookPage: 2,
        FacebookGroup: 3,
        Twitter: 4,
        Instagram: 5,
        LinkedIn: 6,
        LinkedInCompany: 7,
        GooglePlus: 8,
        Youtube: 9,
        GoogleAnalytics: 10,
        Pinterest: 11,
        InstagramBusiness: 12
    };
}

CoreServices.prototype.getNetworkName = function (id) {
    if (id > 12 || id == 0) {
        return undefined;
    }
    return Object.keys(this.networks).find(k => this.networks[k] === id);
};

CoreServices.prototype.getUserPlan = function (id) {
    if (id > 7) {
        return undefined;
    }
    return Object.keys(userPlans).find(k => userPlans[k] === id);
};

CoreServices.prototype.getGuid = function () {
    return uuid();
};

CoreServices.prototype.getRandomNumbers = function () {
    var randomNum = Math.floor(100000 + Math.random() * 900000);
    randomNum = String(randomNum);
    return randomNum.substring(0, 4);
};

CoreServices.prototype.getRandomNumbersByLength = function (len) {
    var randomNum = Math.floor(10093404234099 + Math.random() * 90010234092439);
    randomNum = String(randomNum);
    return randomNum.substring(0, len);
};

CoreServices.prototype.getRandomCharacters = function (len) {
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPosition = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPosition, randomPosition + 1);
    }
    return randomString;
};


CoreServices.prototype.generatePasswordByDob = function (birthDay, firstName) {
    var password = 'SOci1992#';
    if (birthDay == null || firstName == null) {
        firstName = this.getRandomCharacters(6);
        birthDay = this.getRandomNumbers(4);
        password = `${firstName.toUpperCase().substring(0, 2)}${firstName.toLowerCase().substring(2, 4)}${birthYear}#`;
        return password;
    }

    var birthYear = birthDay.match(/\d{4}/gm);
    if (birthYear.length > 0) {
        password = `${firstName.toUpperCase().substring(0, 2)}${firstName.toLowerCase().substring(2, 4)}${birthYear[0]}#`;
        return password;
    }
    else {
        return password;
    }
};

CoreServices.prototype.generatePassword = function () {
    var password = 'SOci1992#';
    try {

        var firstName = this.getRandomCharacters(6);
        var birthYear = this.getRandomNumbers(4);
        password = `${firstName.toUpperCase().substring(0, 2)}${firstName.toLowerCase().substring(2, 4)}${birthYear}#`;
        return password;

    } catch (error) {
        return password;
    }
};

module.exports = CoreServices;



