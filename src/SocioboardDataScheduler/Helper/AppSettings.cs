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
        public const string NhibernateFilePath = @"D:\Suresh\BickBucket\src\SocioboardDataServices\hibernate.cfg.xml";
        public const string MongoDbConnectionString = "mongodb://localhost/admin";
        public const string MongoDbName = "Socioboard3";


        //Start facebook App Creds
        public const string FacebookClientId = "";
        public const string FacebookClientSecretKey = "";
        public const string FacebookRedirectUrl = "http://localhost:9821/FacebookManager/Facebook";
        //End facebook App Creds


        //Twitter App Creds Start
        public const string twitterConsumerKey = "";
        public const string twitterConsumerScreatKey = "";
        public const string twitterRedirectionUrl = "http://localhost:9821/TwitterManager/Twitter";
        //End Twitter App Creds 

        //LinkedIn App Creds Start
        public const string LinkedinApiKey = "";
        public const string LinkedinSecretKey = "";
        public const string LinkedinCallBackURL = "http://localhost:9821/LinkedinManager/LinkedinRedirect";

    }
}
