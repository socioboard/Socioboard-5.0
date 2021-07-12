import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen()

const doc = {
  info: {
    "version": "5.0",                // by default: "1.0.0"
    "title": "SB Notification Service",                  // by default: "REST API"
    "description": "Documentation"             // by default: ""
  },
  host: "localhost:9001",                         // by default: "localhost:3000"
  basePath: "/",                     // by default: "/"
  schemes: ["http", "https"],                      // by default: ['http']
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      "name": "Notification",               // Tag name
      "description": "Endpoints"         // Tag description
    }

  ],
  securityDefinitions: {
    AccessToken: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Please provide the valid access token, if you dont have please login and get the token as response!'
    }
  },        // by default: empty object
  // by default: empty object
}

const outputFile = './resources/views/swagger-api-view.json'
const endpointsFiles = ['./resources/routes/public.routes.js']


/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */


await swagger(outputFile, endpointsFiles, doc)