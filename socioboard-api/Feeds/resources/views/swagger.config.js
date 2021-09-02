import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen()
import config from 'config'


const doc = {
  info: {
    "version": "5.0",                // by default: "1.0.0"
    "title": "SB Feeds Service",                  // by default: "REST API"
    "description": "Documentation"             // by default: ""
  },
  host: config.get('swagger_host_url'),
  basePath: "/",                     // by default: "/"
  schemes: ["http", "https"],                      // by default: ['http']
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [                           // by default: empty Array
  ],
  securityDefinitions: {
    AccessToken: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Please provide the valid access token, if you don\'t have please login and get the token as response!'
    }
  },        // by default: empty object
  definitions: {
    UserLogin: {
      email: "maheshglobussoft@gmail.com",
      password: "SocIo@123~",
      username: "mahi07bRao"
    },
    DirectLogin: {
      email: "maheshglobussoft@gmail.com"
    },
    UserRegister: {
      username: "socioboard",
      email: "maheshglobussoft@gmail.com",
      password: "SocIo@123~",
      firstName: "socio",
      lastName: "board",
      dateOfBirth: "1997-09-07",
      profilePicture: "https://i.imgur.com/fdzLeWY.png",
      phoneCode: "+91",
      phoneNo: "1324575248",
      country: "India",
      timeZone: "+5:30",
      aboutMe: "A business person"
      // { $ref: "#/definitions/myObject" }
    },
    user: {
      username: "socioboard",
      firstName: "socio",
      lastName: "board",
      profilePicture: "https://i.imgur.com/fdzLeWY.png",
      company: "Globussoft Technologies",
      location: "Bangalore",
      language: "En",
      phoneCode: "+91",
      phoneNo: "1324575248",
      country: "India",
      timeZone: "+5:30"
      // { $ref: "#/definitions/myObject" }
    },
    changePassword: {
      currentPassword: "currentPassword",
      newPassword: "newPassword"
    },
    updateRatings: [{
      accountId: 1,
      rating: 5
    }],
    lockProfile: ["1", "2"],
    publishlimit: ["1", "2"],
    teamDetails: {
      TeamInfo: {
        name: "socioboard",
        description: "Short note about the team activity.",
        logoUrl: "https://i.imgur.com/eRkLsuQ.png"
      }
    },
    serchedRssUrls: {
      isBookMarked: true,
      rssUrl: "",
      description: "",
      title: ""
    }                  // by default: empty object
  }
}

const outputFile = './resources/views/swagger-api-view.json'
const endpointsFiles = ['./resources/routes/public.routes.js']


/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */


await swagger(outputFile, endpointsFiles, doc)