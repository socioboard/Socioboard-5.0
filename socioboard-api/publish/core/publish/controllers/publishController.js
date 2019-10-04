const PublisherLibs = require('../utils/publishlibs');
var publishServices = {};

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));


publishServices.publishPost = function (req, res) {
    var publishLibs = new PublisherLibs();

    // Add to publish queue
    return publishLibs.publishPost(req.body, req.query.teamId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.post_publish_success.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', JSON.stringify(req.body.accountIds)).replace('{{type}}', req.body.postType).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.post_publish_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', JSON.stringify(req.body.accountIds)).replace('{{type}}', req.body.postType).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

publishServices.getDraftedPosts = function (req, res) {
    var publishLibs = new PublisherLibs();
    return publishLibs.getDraftedPosts(req.query.userScopeId, req.query.teamId, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.get_drafted_posts.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: 'success', data: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.get_drafted_posts_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

publishServices.getApprovalPostStatus = function (req, res) {
    var publishLibs = new PublisherLibs();
    return publishLibs.getApprovalPostStatus(req.query.userScopeId, req.query.teamId, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.get_approval_post_status.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: 'success', data: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Publish,
                label: configruation.publiser_service_events.publish_event_label.get_approval_post_status_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

publishServices.startPublish = function (postDetails, teamId, socialAccountIds) {
    var publishLibs = new PublisherLibs();
    // Call directly to publish a post to any social networks
    return publishLibs.startPublish(postDetails, teamId, socialAccountIds);
};


module.exports = publishServices;