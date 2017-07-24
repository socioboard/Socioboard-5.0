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

        //Send Grid Mail Crds
        public string SendgridUserName { get; set; }
        public string SendGridPassword { get; set; }

        public string frommail { get; set; }

        public string ccmail { get; set; }
        public string sitemapPath { get; set; }
        public string sitefilePath { get; set; }

        //Start facebook App Creds
        public string FacebookClientId { get; set; }
        public string FacebookClientSecretKey { get; set; }
        public string FacebookRedirectUrl { get; set; }

        //Pinterest App Creds Start
        public string pinterestConsumerKey { get; set; }
        public string pinterestConsumerScreatKey { get; set; }
        public string pinterestRedirectionUrl { get; set; }
        public string PinterestAuthUrl { get; set; }
        //End Pinterest App Creds 

        public string AccessToken1 { get; set; }
        public string AccessToken2 { get; set; }
        public string AccessToken3 { get; set; }
        public string AccessToken4 { get; set; }

        //End facebook App Creds

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
        public string InsagramAuthUrl { get; set; }
        //End Instgram App Creds 

        //LinkedIn App Creds Start
        public string LinkedinApiKey { get; set; }
        public string LinkedinSecretKey { get; set; }
        public string LinkedinCallBackURL { get; set; }
        //End LinkedIn App Creds 



        //dropobox App Creds Start
        public string dropboxApiKey { get; set; }
        public string dropboxSecretKey { get; set; }
        public string dropboxCallBackURL { get; set; }
        //End dropobox App Creds 

        //BoardMe
        public string InstagramBoardMeAccessToken { get; set; }

        public string bitlyaccesstoken { get; set; }

        //facebooklimits
        public int FacebookScheduleMessageMaxLimit { get; set; }

        //get in touch
        public string socioUserFromMail { get; set; }
        public string getInTouchSubject { get; set; }
        public string getInTouchToMail { get; set; }
        public string getInTouchToMailCc { get; set; }

        public string paypalapiUsername { get; set; }
        public string paypalapiPassword { get; set; }
        public string paypalapiSignature { get; set; }

    }
}
