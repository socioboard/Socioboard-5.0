const swaggerJSDoc = require('swagger-jsdoc');
const config = require('config');

class Swagger {
    constructor(app, rootDir) {
        var swaggerDefinition = {
            info: {
                title: config.get('user_socioboard.title'),
                version: config.get('user_socioboard.version'),
                description: config.get('user_socioboard.description'),
            },
            host: `${config.get('user_socioboard.host')}`,
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
                `${rootDir}/core/unauthorized/routes.js`,
                `${rootDir}/core/authorized/routes.js`,
                `${rootDir}/core/team/routes.js`,
                `${rootDir}/core/profiles/routes.js`,
                `${rootDir}/core/payments/routes.js`,
                `${rootDir}/core/admin/adminRoutes.js`,
                `${rootDir}/core/appinsights/routes.js`

            ],
        };

        // initialize swagger-jsdoc
        var swaggerSpec = swaggerJSDoc(options);

        // serve swagger
        app.get('/userservices.json', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
}

module.exports = Swagger;