const universalAnalytics = require('universal-analytics');
const moment = require('moment');

function Analytics(analytics) {
    this.analyticsConfig = analytics;
}

Analytics.prototype.registerEvents = function (event) {
    var visitor = universalAnalytics(this.analyticsConfig.tracking_id, event.category);
    // var pageviews = {
    //     path: "/Register",
    //     host: "https://localhost:3002",
    //     title: "Welcome"
    // };
    if (event.value) {
        visitor.event(event.category, event.action, event.label, event.value).send();
        //visitor.pageview(pageviews.path, pageviews.host, pageviews.title).event(event.category, moment().toString(), event.label, event.value).send();
    } else {
        visitor.event(event.category, event.action, event.label).send();
        //visitor.pageview(pageviews.path, pageviews.host, pageviews.title).event(event.category, moment().toString(), event.label).send();
    }
    return;
};

Analytics.prototype.registerDaisyChainEvents = function (pageviews, event) {
    var visitor = universalAnalytics(this.analyticsConfig.tracking_id, event.category);
    if (event.value) {
        visitor.pageview(pageviews.path, pageviews.host, pageviews.title).event(event.category, moment().toString(), event.label, event.value).send();
    } else {
        visitor.pageview(pageviews.path, pageviews.host, pageviews.title).event(event.category, moment().toString(), event.label).send();
    }
    return;
};

module.exports = Analytics;




