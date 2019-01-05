using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.Helper
{
    public class AppSettings
    {
        public const string Domain = "";
        public const string ApiDomain = "";

        public const string RedisConfiguration = "127.0.0.1:6379";
        public const string NhibernateFilePath = @"..\hibernate.cfg.xml";
       

        
        public const string MongoDbConnectionString = "mongodb://localhost/admin";
        public const string MongoDbName = "Socioboard";

        public string SendgridUserName = "";
        public string SendGridPassword = "";
        public string frommail = "support@socioboard.com";

        public string ZohoMailPassword = "";
        public string ZohoMailUserName = "";

        //Start facebook App Creds
        public const string FacebookClientId = "";
        public const string FacebookClientSecretKey = "";
        public const string FacebookRedirectUrl = "";
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
