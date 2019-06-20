
const swaggerJSDoc = require('swagger-jsdoc');
const config = require('config');

class Swagger {

    constructor(app, rootDir) {

        var swaggerDefinition = {
            info: {
                title: config.get('publisher_socioboard.title'),
                version: config.get('publisher_socioboard.version'),
                description: config.get('publisher_socioboard.description'),
            },
            host: `${config.get('publisher_socioboard.host')}`,
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
            apis: [`${rootDir}/core/uploader/routes.js`,
            `${rootDir}/core/publish/routes.js`,
            `${rootDir}/core/scheduler/routes.js`,
            `${rootDir}/core/task/routes.js`,
            `${rootDir}/core/message/routes.js`,
            `${rootDir}/core/reports/routes.js`,
            `${rootDir}/core/scheduler/adminroutes.js`,
            ],
        };

        // initialize swagger-jsdoc
        var swaggerSpec = swaggerJSDoc(options);

        // serve swagger
        app.get('/publisherservices.json', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

    }
}

module.exports = Swagger;