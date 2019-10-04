const config = require('config');
const TwitterHelper = require('../../../../library/network/twitter');
const FacebookHelper = require('../../../../library/network/facebook');
const GoogleHelper = require('../../../../library/network/google');
const LinkedInHelper = require('../../../../library/network/linkedin');

const UserTeamAccount = require('../../../../library/mixins/userteamaccount');
const TwitterInsightMongoModel = require('../../../../library/mongoose/models/twitterInsights');
const moment = require('moment');

class NetworkInsightLibs {
    constructor() {
        Object.assign(this, UserTeamAccount);
        this.twitterHelper = new TwitterHelper(config.get('twitter_api'));
        this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
        this.googleHelper = new GoogleHelper(config.get('google_api'));
        this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'));
    }

    facebookPageInsights(userId, accountId, teamId, filterPeriod, since, untill) {
        return new Promise((resolve, reject) => {
            if (!accountId || !filterPeriod) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating whether that account is belongs to Facebook page or not
                return this.getSocialAccount(2, accountId, userId, teamId)
                    .then((socialAccount) => {
                        var dataPreset = null;
                        switch (Number(filterPeriod)) {
                            case 1:
                                dataPreset = 'today';
                                break;
                            case 2:
                                dataPreset = 'yesterday';
                                break;
                            case 3:
                                dataPreset = 'last_7d';
                                break;
                            case 4:
                                dataPreset = 'last_30d';
                                break;
                            case 5:
                                dataPreset = 'this_month';
                                break;
                            case 6:
                                dataPreset = 'last_month';
                                break;
                            case 7:
                                if (filterPeriod == 7) {
                                    if (!since || !untill) throw new Error('Invalid Inputs');
                                    else {
                                        if (since <= untill) {
                                            break;
                                        }
                                        else throw new Error('Check range values. since should be lesserthan or equals to until');
                                    }
                                }
                                break;

                            default:
                                throw new Error("please choose valid filter type");
                        }
                        // Fetching insights from Facebook 
                        return this.facebookHelper.fbPageInsights(socialAccount.access_token, socialAccount.social_id, since, untill, dataPreset)
                            .then((response) => {
                                if (response && response.data && response.data.length < 1)
                                    resolve("Sorry, Account isn't active for specified time span");
                                else if (response.error)
                                    reject(response.error)
                                else
                                    resolve(response);
                            })
                            .catch((error) => {
                                throw new Error(error.message);
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getYoutubeInsights(userId, accountId, teamId, filterPeriod, since, untill) {

        return new Promise((resolve, reject) => {
            var breakFunctioanlity = false;
            if (!accountId || !filterPeriod) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating whether that account is belongs to youtube or not
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAccount) => {
                        switch (Number(filterPeriod)) {
                            case 1:
                            case 2:
                                breakFunctioanlity = true;
                                break;
                            case 3:
                                since = moment().subtract(1, 'weeks').startOf('weeks').format('YYYY-MM-DD');
                                untill = moment().subtract(1, 'weeks').endOf('weeks').format('YYYY-MM-DD');
                                break;
                            case 4:
                                since = moment().subtract(30, 'days').startOf('day').format('YYYY-MM-DD');
                                untill = moment().format('YYYY-MM-DD');
                                break;
                            case 5:
                                since = moment().startOf('month').format('YYYY-MM-DD');
                                untill = moment().format('YYYY-MM-DD');
                                break;
                            case 6:
                                since = moment().startOf('month').subtract(1, 'days').startOf('month').format('YYYY-MM-DD');
                                untill = moment().startOf('month').subtract(1, 'days').endOf('month').format('YYYY-MM-DD');
                                break;
                            case 7:
                                if (filterPeriod == 7) {
                                    if (!since || !untill) throw new Error('Invalid Inputs');
                                }
                                break;
                            default:
                                throw new Error("please choose valid filter type");
                        }
                        if (breakFunctioanlity || (since == '' && untill == '')) {
                            throw new Error("Currently youtube didnt support today's and yesterday's insights, please choose some other");
                        }
                        else if (since <= untill) {
                            // Fetching insights from youtube/google
                            return this.googleHelper.youtubeInsights(socialAccount.refresh_token, encodeURIComponent(socialAccount.social_id), since, untill)
                                .then((response) => {
                                    resolve(response);
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else throw new Error('Check range values. since should be lesserthan or equals to until');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getLinkedInCompanyInsights(userId, accountId, teamId, filterPeriod, since, untill) {

        return new Promise((resolve, reject) => {
            if (!accountId || !filterPeriod) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating whether that account is belongs to linkedin company or not
                return this.getSocialAccount(7, accountId, userId, teamId)
                    .then((socialAccount) => {
                        switch (Number(filterPeriod)) {
                            case 1:
                                since = moment().startOf('day').format('x');
                                untill = moment().endOf('day').format('x');
                                break;
                            case 2:
                                since = moment().subtract(1, 'days').startOf('day').format('x');
                                untill = moment().subtract(1, 'days').endOf('day').format('x');
                                break;
                            case 3:
                                since = moment().subtract(1, 'weeks').startOf('weeks').format('X');
                                untill = moment().subtract(1, 'weeks').endOf('weeks').format('X');
                                break;
                            case 4:
                                since = moment().subtract(30, 'days').startOf('day').format('x');
                                untill = moment().format('x');
                                break;
                            case 5:
                                since = moment().startOf('month').format('x');
                                untill = moment().endOf('month').format('x');
                                break;
                            case 6:
                                since = moment().startOf('month').subtract(1, 'days').startOf('month').format('x');
                                untill = moment().startOf('month').subtract(1, 'days').endOf('month').format('x');
                                break;
                            case 7:
                                if (filterPeriod == 7) {
                                    if (!since || !untill) throw new Error('Invalid Inputs');
                                    else {
                                        since = moment(since, 'YYYY-MM-DD').format('x');
                                        untill = moment(untill, 'YYYY-MM-DD').add(1, 'days').format('x');
                                    }
                                }
                                break;
                            default:
                                throw new Error("please choose valid filter type");
                        }
                        if (since <= untill) {
                            // Fetching insights from linkedin
                            return this.linkedInHelper.getCompanyInsights(socialAccount.access_token, socialAccount.social_id, since, untill)
                                .then((response) => {
                                    resolve(response);
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else throw new Error('Check range values. since should be lesserthan or equals to until');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getInstagramBusinessInsights(userId, accountId, teamId, filterPeriod, since, untill) {

        return new Promise((resolve, reject) => {
            if (!accountId || !filterPeriod) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating whether that account is belongs to Instagram business or not
                return this.getSocialAccount(12, accountId, userId, teamId)
                    .then((socialAccount) => {
                        switch (Number(filterPeriod)) {
                            case 1:
                                since = moment().startOf('day').format('X');
                                untill = moment().endOf('day').format('X');
                                break;
                            case 2:
                                since = moment().subtract(1, 'days').startOf('day').format('X');
                                untill = moment().subtract(1, 'days').endOf('day').format('X');
                                break;
                            case 3:
                                since = moment().subtract(1, 'weeks').startOf('weeks').format('X');
                                untill = moment().subtract(1, 'weeks').endOf('weeks').format('X');
                                break;
                            case 4:
                                since = moment().subtract(30, 'days').startOf('day').format('X');
                                untill = moment().format('X');
                                break;
                            case 5:
                                since = moment().startOf('month').format('X');
                                untill = moment().format('X');
                                break;
                            case 6:
                                since = moment().subtract(1, 'months').startOf('months').format('X');
                                untill = moment().subtract(1, 'months').endOf('months').format('X');
                                break;
                            case 7:
                                if (filterPeriod == 7) {
                                    if (!since || !untill) throw new Error('Invalid Inputs');
                                    else {
                                        since = moment(since, 'YYYY-MM-DD').format('X');
                                        untill = moment(untill, 'YYYY-MM-DD').add(1, 'days').format('X');
                                    }
                                }
                                break;
                            default:
                                throw new Error("please choose valid filter type");
                        }

                        if (!since && !unitll) {
                            throw new Error("There cannot be more than 30 days between since and until. Rather use custom range options with maximum 30 days difference.");
                        } else if (since <= untill) {
                            since = Math.floor(Number(since));
                            untill = Math.floor(Number(untill));

                            // if difference between untill and since goes more than 30 days then instagram return error.
                            // so we need to make a request for max 30 days
                            // In this case, some month we will get 31 days then subtract 1 day from that.
                            if (untill - since > (24 * 60 * 60 * 30))
                                untill -= (24 * 60 * 60);
                            // Fetching insights from Facebook/Instagram
                            return this.facebookHelper.instagramBusinessInsights(socialAccount.access_token, socialAccount.social_id, since, untill)
                                .then((response) => {
                                    if (response && response.data && response.data.length < 1)
                                        resolve("Sorry, Account isn't active for specified time span");
                                    else if (response.error)
                                        reject(response.error);
                                    else
                                        resolve(response);
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else throw new Error('Check range values. since should be lesserthan or equals to until');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getTwitterInsights(userId, accountId, teamId, filterPeriod, since, untill) {

        return new Promise((resolve, reject) => {
            if (!accountId || !filterPeriod) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating whether that account is belongs to Twitter or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then(() => {
                        switch (Number(filterPeriod)) {
                            case 1:
                                since = moment().startOf('day');
                                untill = moment().endOf('day');
                                break;
                            case 2:
                                since = moment().subtract(1, 'days').startOf('day');
                                untill = moment().subtract(1, 'days').endOf('day');
                                break;
                            case 3:
                                since = moment().subtract(1, 'weeks').startOf('weeks');
                                untill = moment().subtract(1, 'weeks').endOf('weeks');
                                break;
                            case 4:
                                since = moment().subtract(30, 'days').startOf('day');
                                untill = moment();
                                break;
                            case 5:
                                since = moment().startOf('month');
                                untill = moment();
                                break;
                            case 6:
                                since = moment().startOf('month').subtract(1, 'days').startOf('month');
                                untill = moment().startOf('month').subtract(1, 'days').endOf('month');
                                break;
                            case 7:
                                if (filterPeriod == 7) {
                                    if (!since || !untill) throw new Error('Invalid Inputs');
                                    else {
                                        since = moment(since).startOf('day');
                                        untill = moment(untill).endOf('day');
                                    }
                                }
                                break;
                            default:
                                throw new Error("please choose valid filter type");
                        }
                        if (since <= untill) {
                            var twitterInsightMongoModelObject = new TwitterInsightMongoModel();
                            // Fetching insights from Twitter insight model of mongo DB
                            return twitterInsightMongoModelObject.getInsights(accountId, since, untill)
                                .then((response) => {
                                    resolve(response);
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else throw new Error('Check range values. since should be lesser than or equals to until');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = NetworkInsightLibs;