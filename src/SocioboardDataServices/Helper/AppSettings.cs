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

        public const string RedisConfiguration = "127.0.0.1:6379";
        public const string NhibernateFilePath = @"D:\Socioboard Bitbucket\src\SocioboardDataServices\hibernate.cfg.xml";
        //public const string MongoDbConnectionString = "mongodb://SB3LiveAdmin:SBLive%$#!12345@173.192.35.244:27017/Socioboard3Live";
        //public const string MongoDbName = "Socioboard3Live";

        public const string MongoDbConnectionString = "mongodb://localhost/admin";
        public const string MongoDbName = "Socioboard3";


        //Start facebook App Creds
        public const string FacebookClientId = "479899165467945";
        public const string FacebookClientSecretKey = "044ad63e1124d99593be0d8a64130ce2";
        public const string FacebookRedirectUrl = "http://serv1.socioboard.com/FacebookManager/Facebook";
        //End facebook App Creds

        //Google App Creds Start
        public const string googleClientId = "246221405801-5sg3n6bfpj329ie7tiqfdnb404pc78ea.apps.googleusercontent.com";
        public const string googleClientSecret = "S5B4EtNKIe-1yHq4xEtXHCHK";
        public const string googleRedirectionUrl = "https://www.socioboard.com/GoogleManager/Google";
        public const string googleApiKey = "AIzaSyBmQ1X1UBnKi3V78EkLuh7UHk5odrGfp5M";
        //End Google App Creds 

        //Instagram App Creds Start
        public const string instaAuthUrl = "https://api.instagram.com/oauth/authorize/";
        public const string instaClientId = "d89b5cfa3796458ebbb2520d70eeb498";
        public const string instaClientSecret = "e4663d0a287243f88ac619b5692119c8";
        public const string instaReturnUrl = "https://www.socioboard.com/InstagramManager/Instagram";
        public const string instaTokenRetrivelUrl = "https://api.instagram.com/oauth/access_token";
        public const string instaApiBaseUrl = "https://api.instagram.com/v1/";
        //End Instagram App Creds

        //LinkedIn App Creds Start
        public const string LinkedinConsumerKey = "754ysxdp72ulk5";
        public const string LinkedinConsumerSecret = "vbU52SjK7xS6cT8H";
        public const string LinkedinCallBackURL = "";
        //End LinkedIn App Creds

        //Mongo DB Connection string Start
        public const string LiveMongoDbConnectionString = "mongodb://SB3LiveAdmin:SBLive%$#!12345@37.58.99.114:27017/Socioboard3Live";
        public const string LiveMongoDbName = "Socioboard3Live";
        public const string ServMongoDbConnectionString = "mongodb://Socioboard3user:sb8520R$lRo0@37.58.99.114:27017/Socioboard3";
        public const string ServMongoDbName = "Socioboard3";
        //Mongo DB Connection string

        //Twitter App Creds Start
        public const string twitterConsumerKey = "h4FT0oJ46KBBMwbcifqZMw";
        public const string twitterConsumerSecret = "yfowGI2g21E2mQHjtHjUvGqkfbI7x26WDCvjiSZOjas";
        public const string twitterRedirectionUrl = "https://www.socioboard.com/TwitterManager/Twitter";
        //End Twitter App Creds 



    }
}
