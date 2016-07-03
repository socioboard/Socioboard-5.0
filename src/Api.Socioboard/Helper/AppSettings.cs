using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public class AppSettings
    {
        public string Domain { get; set; }
        public string ApiDomain { get; set; }

        public string RedisConfiguration { get; set; }

        //Zoho Mail Creds
        public string ZohoMailUserName { get; set; }
        public string ZohoMailPassword { get; set; }

        //Mongo Database Creds

        public string MongoDbConnectionString { get; set; }
        public string MongoDbName { get; set; }



        //Start Google App Creds
        public string GoogleConsumerKey { get; set; }
        public string GoogleConsumerSecret { get; set; }
        public string GoogleApiKey { get; set; }
        public string GoogleRedirectUri { get; set; }
        //End Google App Creds


        //Twitter App Creds Start
        public string twitterConsumerKey { get; set; }
        public string twitterConsumerScreatKey { get; set; }
        public string twitterRedirectionUrl { get; set; }
        //End Twitter App Creds 


        //Instgram App Creds Start
        public string InstagramClientKey { get; set; }
        public string InstagramClientSec { get; set; }
        public string InstagramCallBackURL { get; set; }
        //End Instgram App Creds 



    }
}
