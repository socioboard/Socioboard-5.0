using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Helper
{
    public class AppSettings
    {
        public const string Domain = "http://localhost:9821";
        public const string ApiDomain = "http://localhost:6361";

        public const string RedisConfiguration = "127.0.0.1:6379";
        public const string NhibernateFilePath = @"D:\SBPROJECT\Developer\src\SocioboardDataScheduler";
       

        public const string MongoDbConnectionString = "";
        public const string MongoDbName = "";


        //Start facebook App Creds
        public const string FacebookClientId = "";
        public const string FacebookClientSecretKey = "";
        public const string FacebookRedirectUrl = "http://localhost:port/FacebookManager/Facebook";
        //End facebook App Creds


        //Elsatic mail and Send grid Credentials

        public const string elasticMailApiKey = "";
        public const string from_mail = "support@socioboard.com";
        public const string sendGridUserName = "";
        public const string sendGridPassword = "";

        //End Elsatic mail and Send grid Credentials

        //Live Twitter Developer Application
        //Twitter App Creds Start
        public const string twitterConsumerKey = "";
        public const string twitterConsumerScreatKey = "";
        public const string twitterRedirectionUrl = "https://localhost:port/TwitterManager/Twitter";
        //End Twitter App Creds 

        //Mongo DB Connection string Start
        public const string LiveMongoDbConnectionString = "";
        public const string LiveMongoDbName = "";
        public const string ServMongoDbConnectionString = "";
        public const string ServMongoDbName = "";
        //Mongo DB Connection string


        //LinkedIn App Creds Start
        public const string LinkedinConsumerKey = "";
        public const string LinkedinConsumerSecret = "";
        public const string LinkedinCallBackURL = "";
        //End LinkedIn App Creds 

        //Imgur Cred Start
        public const string imgurClientId = "";
        public const string imgurClientSecret = "";
        //Imgur Cred End

    }
}
