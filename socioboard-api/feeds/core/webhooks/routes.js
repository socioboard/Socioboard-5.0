const routes = require('express').Router();
const webhookController = require('./controllers/webhookcontrollers');

// To validate the tokens from facebook
routes.get('/facebook', webhookController.fbWebhookValidation);

// To get the latest updates from facebook
routes.post('/facebook', webhookController.fbWebhookEvents);

// To validate the tokens from instagram
routes.get('/instagram', webhookController.instaWebhookValidation);

// To get the latest updates from instagram
routes.post('/instagram', webhookController.instaWebhookEvents);


// To validate the tokens from twitter
routes.get('/twitter', webhookController.twitterWebhookValidation);

// To get the latest updates from twitter
routes.post('/twitter', webhookController.twitterWebhookEvents);

// To validate the tokens from youtube
routes.get('/youtube', webhookController.youtubeWebhookValidation);

// To get the latest updates from youtube
routes.post('/youtube', webhookController.youtubeWebhookEvents);

module.exports = routes;