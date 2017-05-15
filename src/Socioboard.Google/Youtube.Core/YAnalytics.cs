using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Google.Youtube.Core
{
    public class YAnalytics
    {
        public YAnalytics(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

        public string Get_YAnalytics_ChannelId(string channelId, string acctoken, string fromDate, string toDate)
        {
            
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string accesstoken = objoAuthTokenYoutube.GetAccessToken(acctoken);
            JObject JData = JObject.Parse(accesstoken);
            accesstoken = JData["access_token"].ToString();

            string RequestUrl = "https://www.googleapis.com/youtube/analytics/v1/reports?ids=channel%3D%3D" + channelId + "&start-date=" + fromDate + "&end-date=" + toDate + "&metrics=subscribersGained%2Cviews%2Clikes%2Ccomments%2Cshares%2Cdislikes%2CsubscribersLost%2CaverageViewDuration%2CestimatedMinutesWatched%2CannotationClickThroughRate%2CannotationCloseRate&dimensions=day%2Cchannel&key=" + accesstoken;
            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val, Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET.ToString());
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }            

            return response;
        }
    }
}

