// const uuid = require('uuid/v1');
import uuidv1 from 'uuidv1';

import TIK_TOK_CONSTANTS from '../Constants/tiktok.constants.js';

function CoreServices() {
  this.userPlans = {
    Basic: 0,
    Standard: 1,
    Premium: 2,
    Deluxe: 3,
    Topaz: 4,
    Ruby: 5,
    Gold: 6,
    Platinum: 7,
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
    InstagramBusiness: 12,
    Bitly: 13,
    Tumblr: 16,
    TikTok: TIK_TOK_CONSTANTS.ACCOUNT_TYPE,
  };
}

CoreServices.prototype.getNetworkName = function (id) {
  if (id > 13 || id == 0) {
    return undefined;
  }

  return Object.keys(this.networks).find((k) => this.networks[k] === id);
};

CoreServices.prototype.getNetworkId = function (name) {
  return this.networks[name];
};

CoreServices.prototype.getUserPlan = function (id) {
  if (id > 7) {
    return undefined;
  }

  return Object.keys(userPlans).find((k) => userPlans[k] === id);
};

CoreServices.prototype.getGuid = function () {
  return uuidv1();
};

CoreServices.prototype.getRandomNumbers = function () {
  let randomNum = Math.floor(100000 + Math.random() * 900000);

  randomNum = String(randomNum);

  return randomNum.substring(0, 4);
};

CoreServices.prototype.getRandomCharacters = function (len) {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString = '';

  for (let i = 0; i < len; i++) {
    const randomPosition = Math.floor(Math.random() * charSet.length);

    randomString += charSet.substring(randomPosition, randomPosition + 1);
  }

  return randomString;
};

CoreServices.prototype.generatePasswordByDob = function (birthDay, firstName) {
  let password = 'SOci1992#';

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

  return password;
};

CoreServices.prototype.generatePassword = function () {
  let password = 'SOci1992#';

  try {
    const firstName = this.getRandomCharacters(6);
    const birthYear = this.getRandomNumbers(4);

    password = `${firstName.toUpperCase().substring(0, 2)}${firstName.toLowerCase().substring(2, 4)}${birthYear}#`;

    return password;
  } catch (error) {
    return password;
  }
};

export default CoreServices;
