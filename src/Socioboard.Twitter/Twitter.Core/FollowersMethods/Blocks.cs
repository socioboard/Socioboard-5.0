using Socioboard.Twitter.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Twitter.Twitter.Core.FollowersMethods
{
    public class Blocks
    {

        public string BlocksUserByScreenName(oAuthTwitter OAuth, string screenName)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("screen_name", screenName);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlockCreateUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

        public string BlocksUserByUserId(oAuthTwitter OAuth, string userId)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("user_id", userId);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlockCreateUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

        public string UnBlocksUserByScreenName(oAuthTwitter OAuth, string screenName)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("screen_name", screenName);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlocksDestroyUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

        public string UnBlocksUserByUserId(oAuthTwitter OAuth, string userId)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("user_id", userId);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlocksDestroyUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

    }
}
