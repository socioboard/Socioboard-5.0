import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen();
import config from 'config';

const doc = {
  info: {
    version: '5.0', // by default: "1.0.0"
    title: 'SB Notification Service', // by default: "REST API"
    description: 'Documentation', // by default: ""
  },
  host: config.get('swagger_host_url'), // by default: "localhost:3000"
  basePath: '/', // by default: "/"
  schemes: ['http', 'https'], // by default: ['http']
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Notification', // Tag name
      description: 'Endpoints', // Tag description
    },
  ],
  securityDefinitions: {
    AccessToken: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description:
        'Please provide the valid access token, if you dont have please login and get the token as response!',
    },
  },
  definitions: {
    userIds: { userIds: [1, 1] },
    teamIds: { teamIds: [1] }
  }
};

const outputFile = './resources/views/swagger-api-view.json';
const endpointsFiles = ['./resources/routes/public.routes.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

await swagger(outputFile, endpointsFiles, doc);
