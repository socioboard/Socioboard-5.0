
namespace Socioboard.Helpers
{
    public class AppSettings
    {
        public string Domain { get; set; }
        public string ApiDomain { get; set; }


        //Start Facebook App Creds
        public string FacebookAuthUrl { get; set; }
        public string FacebookClientId { get; set; }
        public string FacebookClientSecretKey { get; set; }
        public string FacebookRedirectUrl { get; set; }

        //End Facebook App Creds

        //Start Google App Creds
        public string GoogleConsumerKey { get; set; }
        public string GoogleConsumerSecret { get; set; }
        public string GoogleApiKey { get; set; }
        public string GoogleRedirectUri { get; set; }
        //End Google App Creds

        //Twitter App Creds Start
        public string twitterConsumerKey { get; set; }
        public string twitterConsumerScreatKey { get; set; }
        public string twitterRedirectionUrl { get;  set; }
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


        //pay pal
        public string PaypalURL { get; set; }
        public string failUrl { get; set; }
        public string callBackUrl { get; set; }
        public string cancelurl { get; set; }
        public string notifyUrl { get; set; }
        public string paypalemail { get; set; }

        public string AgencycallBackUrl { get; set; }

        public string TrainingcallBackUrl { get; set; }

        public string PayUMoneyURL { get; set; }

        public string PayuMoneyemail { get; set; }
        public string surl { get; set; }
        public string key { get; set; }
        public string salt { get; set; }
        public string moneyconvertion { get; set; }
        public string payurl { get; set; }
        public string AuthorizationKey { get; set; }
    }
}
