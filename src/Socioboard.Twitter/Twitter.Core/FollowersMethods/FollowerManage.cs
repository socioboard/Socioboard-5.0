using Socioboard.Twitter.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Twitter.Twitter.Core.FollowersMethods
{
    public class FollowerManage
    {

        public string FollowUserByScreenName(oAuthTwitter OAuth, string screenName)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("screen_name", screenName);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsCreateUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

        public string FollowUserByUserId(oAuthTwitter OAuth, string userId)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("user_id", userId);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsCreateUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, stringDictionary);
            return response;
        }

        public string RelatnFriendshipByScreenName(oAuthTwitter OAuth, string screenName)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("target_screen_name", screenName);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsShowUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, stringDictionary);
            return response;
        }

        public string RelatnFriendshipByUserId(oAuthTwitter OAuth, string userId)
        {
            SortedDictionary<string, string> stringDictionary = new SortedDictionary<string, string>();
            stringDictionary.Add("target_id", userId);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsShowUrl;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, stringDictionary);
            return response;
        }

    }
}
