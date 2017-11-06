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
        //public const string NhibernateFilePath = @"D:\bitbucket\Updated\New Updated\src\SocioboardDataScheduler";
        public const string NhibernateFilePath = @"D:\augustnewsb\src\SocioboardDataScheduler\hibernate.cfg.xml";
        //public const string MongoDbConnectionString = "mongodb://Socioboard3user:sb8520R$lRo0@173.192.35.244:27017/Socioboard3";
        //public const string MongoDbName = "Socioboard3";
        public const string MongoDbConnectionString = "mongodb://SB3LiveAdmin:SBLive%$#!12345@173.192.35.244:27017/Socioboard3Live";
        public const string MongoDbName = "Socioboard3Live";

        //Start facebook App Creds
        public const string FacebookClientId = "730896073595509";
        public const string FacebookClientSecretKey = "6f5590e64eaa924cb08f6c883f68f7dc";
        public const string FacebookRedirectUrl = "http://serv1.socioboard.com/FacebookManager/Facebook";
        //End facebook App Creds


        //Elsatic mail and Send grid Credentials

        public const string elasticMailApiKey = "3eb5a724-e696-40fc-8d4f-7b33f488f3a3";
        public const string from_mail = "support@socioboard.com";
        public const string sendGridUserName = "socioboard007";
        public const string sendGridPassword = "SB125@#$$@d!&&&!";

        //End Elsatic mail and Send grid Credentials

        //Live Twitter Developer Application
        //Twitter App Creds Start
        public const string twitterConsumerKey = "h4FT0oJ46KBBMwbcifqZMw";
        public const string twitterConsumerScreatKey = "yfowGI2g21E2mQHjtHjUvGqkfbI7x26WDCvjiSZOjas";
        public const string twitterRedirectionUrl = "https://www.socioboard.com/TwitterManager/Twitter";
        //End Twitter App Creds 

        //Mongo DB Connection string Start
        public const string LiveMongoDbConnectionString = "mongodb://SB3LiveAdmin:SBLive%$#!12345@37.58.99.114:27017/Socioboard3Live";
        public const string LiveMongoDbName = "Socioboard3Live";
        public const string ServMongoDbConnectionString = "mongodb://Socioboard3user:sb8520R$lRo0@37.58.99.114:27017/Socioboard3";
        public const string ServMongoDbName = "Socioboard3";
        //Mongo DB Connection string


        //LinkedIn App Creds Start
        public const string LinkedinConsumerKey = "754ysxdp72ulk5";
        public const string LinkedinConsumerSecret = "vbU52SjK7xS6cT8H";
        public const string LinkedinCallBackURL = "";
        //End LinkedIn App Creds 

        //Imgur Cred Start
        public const string imgurClientId = "5f1ad42ec5988b7";
        public const string imgurClientSecret = "f3294c8632ef8de6bfcbc46b37a23d18479159c5";
        //Imgur Cred End

    }
}
