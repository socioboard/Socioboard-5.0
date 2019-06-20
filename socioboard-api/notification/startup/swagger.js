const swaggerJSDoc = require('swagger-jsdoc');
const config = require('config');

class Swagger {
    constructor(app, rootDir) {
        var swaggerDefinition = {
            info: {
                title: config.get('notification_socioboard.title'),
                version: config.get('notification_socioboard.version'),
                description: config.get('notification_socioboard.description'),
            },
            host: `${config.get('notification_socioboard.host')}`,
            basePath: '/',
            securityDefinitions: {
                AccessToken: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-access-token',
                    description: 'Please provide the valid access token, if you dont have please login and get the token as response!'
                }
            },
        };

        // options for the swagger docs
        var options = {
            // import swaggerDefinitions
            swaggerDefinition: swaggerDefinition,
            // path to the API docs
            apis: [
                `${rootDir}/core/notify/routes.js`,              
                `${rootDir}/core/mail/routes.js`,
                `${rootDir}/core/Insights/routes.js`
            ],
        };

        // initialize swagger-jsdoc
        var swaggerSpec = swaggerJSDoc(options);

        // serve swagger
        app.get('/notificationservices.json', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
}

module.exports = Swagger;