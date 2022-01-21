import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen();
import config from 'config';

const doc = {
  info: {
    version: '5.0', // by default: "1.0.0"
    title: 'SB User Service', // by default: "REST API"
    description: 'Documentation', // by default: ""
  },
  host: config.get('swagger_host_url'), // by default: "localhost:3000"
  basePath: '/', // by default: "/"
  schemes: ['http', 'https'], // by default: ['http']
  consumes: ['application/json', 'application/x-www-form-urlencoded'],
  produces: ['application/json'],
  tags: [
    // by default: empty Array
    {
      name: 'Open', // Tag name
      description: 'Endpoints', // Tag description
    },
    {
      name: 'Social-Callback', // Tag name
      description: 'Endpoints', // Tag description
    },
    {
      name: 'Invitation', // Tag name
      description: 'Endpoints', // Tag description
    },
    {
      name: 'User',
      description: 'User Endpoint',
      summary: 'Secured',
    },
    {
      name: 'Team',
      description: 'Team Endpoint',
      summary: 'Secured',
    },
    {
      name: 'Add-SocialAccount', // Tag name
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
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description:
        'Enter your bearer token in the format **Bearer &lt;token>**',
    },
  }, // by default: empty object
  definitions: {
    UserLogin: {
      email: 'maheshglobussoft@gmail.com',
      password: '9e7c5071f8dae2cfb8dc0a0c055cd8ce',
      username: 'mahi07bRao',
    },
    UserLoginAppSumo: {
      username: 'YOUR_NOTIFICATION_PROFILE_USERNAME',
      password: 'YOUR_NOTIFICATION_PROFILE_PASSWORD',
    },
    DirectLogin: {
      email: 'maheshglobussoft@gmail.com',
    },
    UserRegister: {
      username: 'socioboard',
      email: 'maheshglobussoft@gmail.com',
      password: 'SocIo@123~',
      firstName: 'socio',
      lastName: 'board',
      dateOfBirth: '1997-09-07',
      profilePicture: 'https://i.imgur.com/fdzLeWY.png',
      phoneCode: '+91',
      phoneNo: '1324575248',
      country: 'in',
      timeZone: '+5:30',
      aboutMe: 'A business person',
      // { $ref: "#/definitions/myObject" }
    },
    InviteSocialAccount: [
      {
        teamId: '1',
        userName: '@SocioboardS',
        accName: 'Socioboard',
        email: 'sbs@glb.com',
        network: 'Twitter',
      },
    ],
    userUpdate: {
      username: 'socioboard',
      firstName: 'socio',
      lastName: 'board',
      email: 'socioboard5.0@gmail.com',
      profilePicture: 'https://i.imgur.com/fdzLeWY.png',
      company: 'Globussoft Technologies',
      location: 'Bangalore',
      language: 'En',
      phoneCode: '+91',
      phoneNo: '1324575248',
      country: 'in',
      timezone: '+5:30',
      company_name: 'SocioBoard',
      company_logo: 'default.jpg',
      // { $ref: "#/definitions/myObject" }
    },
    addBulk: [
      {
        account_type: '1',
        user_name: 'socio123',
        first_name: 'socio',
        last_name: 'board',
        email: 'socioboard@socioboard.com',
        social_id: 'sb124234123',
        profile_pic_url:
          'https://www.socioboard.com/contents/socioboard/images/Socioboard.png',
        cover_pic_url:
          'https://www.socioboard.com/contents/socioboard/images/Socioboard.png',
        profile_url: 'https://www.socioboard.com/user/socioboard/socio123',
        access_token:
          'Sifnjfdhfefdwndijvbufkjcvdbvivnriurhgueg8rgijvbciudwff3495ry748truiefeiuf4treugfeuyfr46rfufhdbfuy',
        refresh_token:
          'SuewfefgEWFEFefdhfdfDVCverf4t34t$#FRCs4t84fgRSGRG4t43fF4t4',
        friendship_counts: '243',
        is_invite: 0,
        info: 'Build the success life with using Smart utils like sociobord for Social Networks',
      },
    ],
    changePassword: {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    },
    updateRatings: [
      {
        accountId: 1,
        rating: 5,
      },
    ],
    lockProfile: ['1', '2'],
    teamDetails: {
      TeamInfo: {
        name: 'socioboard',
        description: 'Short note about the team activity.',
        logoUrl: 'https://i.imgur.com/eRkLsuQ.png',
      },
    },
    searchSocialAccount: {
      SocialAccountInfo: {
        rating: ['1', '2'],
        accountType: ['1', '2'],
        username: 'firstnameorlastname',
      },
    },
    AppSumoNotification: {
      action: 'activate',
      plan_id: 'yourproduct_tier1',
      uuid: '65b9528a-702d-4326-9b23-3e0c37ce4553',
      activation_email: 'othermail@test.com',
      invoice_item_uuid: '01ae3d93-ec5f-44a8-b4b9-093cbd662164',
    },
  },
};

const outputFile = './resources/views/swagger-api-view.json';
const endpointsFiles = ['./resources/routes/public.routes.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

await swagger(outputFile, endpointsFiles, doc);
