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
        public const string NhibernateFilePath = @"D:\bitbucket\Updated\src\SocioboardDataServices\hibernate.cfg.xml";
        public const string MongoDbConnectionString = "mongodb://SB3LiveAdmin:SBLive%$#!12345@37.58.99.114:27017/Socioboard3Live";
        public const string MongoDbName = "Socioboard3Live";


        //Start facebook App Creds
        public const string FacebookClientId = "479899165467945";
        public const string FacebookClientSecretKey = "044ad63e1124d99593be0d8a64130ce2";
        public const string FacebookRedirectUrl = "http://serv1.socioboard.com/FacebookManager/Facebook";
        //End facebook App Creds


        //Twitter App Creds Start
        public string twitterConsumerKey { get; set; }
        public string twitterConsumerScreatKey { get; set; }
        public string twitterRedirectionUrl { get; set; }
        //End Twitter App Creds 

        //LinkedIn App Creds Start
        public string LinkedinApiKey { get; set; }
        public string LinkedinSecretKey { get; set; }
        public string LinkedinCallBackURL { get; set; }
        //End LinkedIn App Creds 


    }
}
