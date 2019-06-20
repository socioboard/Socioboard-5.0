const swaggerJSDoc = require('swagger-jsdoc');
const config = require('config');

class Swagger {

    constructor(app, rootDir) {

        var swaggerDefinition = {
            info: {
                title: config.get('feed_socioboard.title'),
                version: config.get('feed_socioboard.version'),
                description: config.get('feed_socioboard.description'),
            },
            host: `${config.get('feed_socioboard.host')}`,
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
                `${rootDir}/core/trends/routes.js`,
                `${rootDir}/core/networkfeeds/routes.js`,
                `${rootDir}/core/likecomments/routes.js`,
                `${rootDir}/core/friends/routes.js`,
                `${rootDir}/core/friendshipstats/routes.js`,
                `${rootDir}/core/networkInsights/routes.js`,
                `${rootDir}/core/boards/routes.js`,
                `${rootDir}/core/admin/routes.js`           
            ],
        };

        // initialize swagger-jsdoc
        var swaggerSpec = swaggerJSDoc(options);

        // serve swagger
        app.get('/feedservices.json', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

    }
}

module.exports = Swagger;