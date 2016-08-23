using Socioboard.Twitter.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Twitter
{
    public class TwtDataService
    {
        public  void UpdateTwitterAccount()
        {
            while (true)
            {
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();

                oAuthTwitter OAuth = new oAuthTwitter("MbOQl85ZcvRGvp3kkOOJBlbFS", "GF0UIXnTAX28hFhN1ISNf3tURHARZdKWlZrsY4PlHm9A4llYjZ", "http://serv1.socioboard.com/TwitterManager/Twitter");

                List<Domain.Socioboard.Models.TwitterAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isActive).ToList();
                foreach (var item in lstTwtAccounts)
                {
                    OAuth.AccessToken = item.oAuthToken;
                    OAuth.AccessTokenSecret = item.oAuthSecret;
                    Console.WriteLine(item.twitterScreenName + "Updating Started");
                    TwtFeeds.updateTwitterFeeds(item, OAuth);
                    Console.WriteLine(item.twitterScreenName + "Updated");
                }
                Thread.Sleep(600000);
            }
        }
    }
}
