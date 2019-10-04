const { google } = require('googleapis');
const config = require('config');
const logger = require('../../../utils/logger');

class AppInsightLibs {

    getAllRealtimeUsers() {
        return new Promise((resolve, reject) => {
            const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
            const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
            const view_id = config.get('analytics.view_id');
            return jwt.authorize()
                .then((response) => {
                    return google.analytics('v3').data.realtime.get({
                        'auth': jwt,
                        'ids': 'ga:' + view_id,
                        'metrics': 'rt:activeUsers',
                        'dimensions': 'rt:eventCategory',
                    });
                })
                .then((result) => {
                    var analytics = [];

                    if (result.data.rows)
                        analytics = result.data.rows;

                    resolve(analytics);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getAllUser(startDate, endDate) {
        return new Promise((resolve, reject) => {
            if (!startDate || !endDate) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        logger.info(response);
                        return google.analytics('v3').data.ga.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'start-date': startDate,
                            'end-date': endDate,
                            'metrics': 'ga:totalEvents',
                            'dimensions': 'ga:eventCategory'
                        });
                    })
                    .then((result) => {

                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    user: datas[0],
                                    count: datas[1],
                                };
                                analytics.push(info);
                            });
                        }
                        var totalActivities = analytics.length;
                        //var totalActivities = result.data.totalsForAllResults["ga:totalEvents"];
                        resolve({ result: { totalUsersFound: totalActivities, analytics: analytics } });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUsersActivities(emailId, pageId) {
        return new Promise((resolve, reject) => {
            if (!emailId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        logger.info(response);
                        return google.analytics('v3').data.ga.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'start-date': '30daysAgo',
                            'end-date': 'today',
                            'metrics': 'ga:eventValue',
                            'dimensions': 'ga:eventCategory,ga:eventAction,ga:eventLabel,ga:dateHourMinute',
                            'filters': `ga:eventCategory==${emailId}`,
                            'sort': '-ga:dateHourMinute',
                            'max-results': 1000,
                            'start-index': pageId
                        });
                    })
                    .then((result) => {
                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    user: datas[0],
                                    action: datas[1],
                                    activity: datas[2],
                                    datetime: datas[3]
                                };
                                analytics.push(info);
                            });
                        }
                        resolve(analytics);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUsersActivitiesByDate(emailId, startDate, endDate, pageId) {
        return new Promise((resolve, reject) => {
            if (!emailId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        logger.info(response);
                        return google.analytics('v3').data.ga.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'start-date': startDate,
                            'end-date': endDate,
                            'metrics': 'ga:eventValue',
                            'dimensions': 'ga:eventCategory,ga:eventAction,ga:eventLabel,ga:dateHourMinute',
                            'filters': `ga:eventCategory==${emailId}`,
                            'sort': '-ga:dateHourMinute',
                            'max-results': 1000,
                            'start-index': pageId
                        });
                    })
                    .then((result) => {
                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    user: datas[0],
                                    action: datas[1],
                                    activity: datas[2],
                                    datetime: datas[3]
                                };
                                analytics.push(info);
                            });
                        }
                        resolve(analytics);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
    getUsersActivitiesByAction(emailId, action, pageId) {
        return new Promise((resolve, reject) => {
            if (!emailId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        logger.info(response);
                        return google.analytics('v3').data.ga.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'start-date': '30daysAgo',
                            'end-date': 'today',
                            'metrics': 'ga:eventValue',
                            'dimensions': 'ga:eventCategory,ga:eventAction,ga:eventLabel,ga:dateHourMinute',
                            'filters': `ga:eventCategory==${emailId};ga:eventAction==${action}`,
                            'sort': '-ga:dateHourMinute',
                            'max-results': 1000,
                            'start-index': pageId
                        });
                    })
                    .then((result) => {
                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    user: datas[0],
                                    action: datas[1],
                                    activity: datas[2],
                                    datetime: datas[3]
                                };
                                analytics.push(info);
                            });
                        }
                        resolve(analytics);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUserActionCount(userEmail, startDate, endDate) {
        return new Promise((resolve, reject) => {
            if (!userEmail || !startDate || !endDate) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        logger.info(response);
                        return google.analytics('v3').data.ga.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'start-date': startDate,
                            'end-date': endDate,
                            'metrics': 'ga:totalEvents',
                            'dimensions': 'ga:eventAction',
                            'filters': `ga:eventCategory==${userEmail}`
                        });
                    })
                    .then((result) => {
                        var totalActivities = result.data.totalsForAllResults["ga:totalEvents"];
                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    action: datas[0],
                                    count: datas[1],
                                };
                                analytics.push(info);
                            });
                        }
                        resolve({ result: { totalActivities: totalActivities, analytics: analytics } });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getRealtimeUsersActivities(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject(new Error("Invalid Inputs"));
            } else {
                const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
                const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
                const view_id = config.get('analytics.view_id');
                var analytics = [];
                return jwt.authorize()
                    .then((response) => {
                        return google.analytics('v3').data.realtime.get({
                            'auth': jwt,
                            'ids': 'ga:' + view_id,
                            'max-results': 1000,
                            'metrics': 'rt:totalEvents',
                            'dimensions': 'rt:eventCategory,rt:eventAction,rt:eventLabel,rt:minutesAgo',
                            'filters': `rt:eventCategory==${email}`,
                            'sort': 'rt:minutesAgo'
                        });
                    })
                    .then((result) => {
                        if (result.data.rows) {
                            result.data.rows.map(datas => {
                                var info = {
                                    user: datas[0],
                                    action: datas[1],
                                    activity: datas[2],
                                    minutesAgo: datas[3]
                                };
                                analytics.push(info);
                            });
                        }
                        resolve(analytics);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getTodayActionwiseCount() {
        return new Promise((resolve, reject) => {
            const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
            const jwt = new google.auth.JWT(config.get('analytics.ganalytics_service_email'), null, config.get('analytics.ganalytics_private_key'), scopes);
            const view_id = config.get('analytics.view_id');
            var analytics = [];
            return jwt.authorize()
                .then((response) => {
                    logger.info(response);
                    return google.analytics('v3').data.ga.get({
                        'auth': jwt,
                        'ids': 'ga:' + view_id,
                        'start-date': 'today',
                        'end-date': 'today',
                        'metrics': 'ga:totalEvents',
                        'dimensions': 'ga:eventAction'
                    });
                })
                .then((result) => {
                    var totalActivities = result.data.totalsForAllResults["ga:totalEvents"];
                    if (result.data.rows) {
                        result.data.rows.map(datas => {
                            var info = {
                                action: datas[0],
                                count: datas[1],
                            };
                            analytics.push(info);
                        });
                    }
                    resolve({ result: { totalActivities: totalActivities, analytics: analytics } });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}

module.exports = AppInsightLibs;