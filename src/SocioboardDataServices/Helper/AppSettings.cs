using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.Helper
{
    public class AppSettings
    {
        public const string Domain = "";
        public const string ApiDomain = "";

        public const string RedisConfiguration = "127.0.0.1:6379";
        public const string NhibernateFilePath = @"D:\SBPROJECT\Developer\src\SocioboardDataServices";
       
       
        public const string MongoDbConnectionString = "mongodb://localhost/admin";
        public const string MongoDbName = "Socioboard3";

        //Start facebook App Creds
        
        public const string FacebookClientId = "";
        public const string FacebookClientSecretKey = "";
        public const string FacebookRedirectUrl = "http://localhost:port/FacebookManager/Facebook";
        //End facebook App Creds

        //Google App Creds Start
        public const string googleClientId = "";
        public const string googleClientSecret = "";
        public const string googleRedirectionUrl = "https://localhost:port/GoogleManager/Google";
        public const string googleApiKey = "";
        public const string googleApiKey_TestApp = "";
        //End Google App Creds 

        //Instagram App Creds Start
        public const string instaAuthUrl = "https://api.instagram.com/oauth/authorize/";
        public const string instaClientId = "";
        public const string instaClientSecret = "";
        public const string instaReturnUrl = "https://localhost:port/InstagramManager/Instagram";
        public const string instaTokenRetrivelUrl = "https://api.instagram.com/oauth/access_token";
        public const string instaApiBaseUrl = "https://api.instagram.com/v1/";
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
        public const string twitterRedirectionUrl = "https://localhost:port/TwitterManager/Twitter";
        //End Twitter App Creds 



    }
}
