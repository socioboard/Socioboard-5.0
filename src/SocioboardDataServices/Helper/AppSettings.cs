using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.Helper
{
    public class AppSettings
    {
        public const string Domain = "http://serv1.socioboard.com";
        public const string ApiDomain = "http://servapi1.socioboard.com";

        public const string RedisConfiguration = "";
        public const string NhibernateFilePath ="";
        

        public const string MongoDbConnectionString = "mongodb://localhost/admin";
        public const string MongoDbName = "";


        //Start facebook App Creds
        public const string FacebookClientId = "";
        public const string FacebookClientSecretKey = "";
        public const string FacebookRedirectUrl = "";
        //End facebook App Creds

        //Google App Creds Start
        public const string googleClientId = "";
        public const string googleClientSecret = "";
        public const string googleRedirectionUrl = "https://www.socioboard.com/GoogleManager/Google";
        public const string googleApiKey = "";
        public const string googleApiKey_TestApp = "";
        //End Google App Creds 

        //Instagram App Creds Start
        public const string instaAuthUrl = "";
        public const string instaClientId = "";
        public const string instaClientSecret = "";
        public const string instaReturnUrl = "https://www.socioboard.com/InstagramManager/Instagram";
        public const string instaTokenRetrivelUrl = "";
        public const string instaApiBaseUrl = "";
        //End Instagram App Creds

        //LinkedIn App Creds Start
        public const string LinkedinConsumerKey = "";
        public const string LinkedinConsumerSecret = "";
        public const string LinkedinCallBackURL = "";
        //End LinkedIn App Creds

        //Mongo DB Connection string Start
        public const string LiveMongoDbConnectionString = "";
        public const string LiveMongoDbName = "";
        public const string ServMongoDbConnectionString = "";
        public const string ServMongoDbName = "";
        //Mongo DB Connection string

        //Twitter App Creds Start
        public const string twitterConsumerKey = "";
        public const string twitterConsumerSecret = "";
        public const string twitterRedirectionUrl = "https://www.socioboard.com/TwitterManager/Twitter";
        //End Twitter App Creds 



    }
}
