using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.App.Core;
using Newtonsoft.Json;
using System.Net;
using System.IO;
using System.Configuration;
using Hammock.Authentication.OAuth;
using Hammock;
using Hammock.Web;

namespace Socioboard.Twitter.Twitter.Core.TweetMethods
{
    public class Tweet
    {
        private JObject jobjResult;

        public Tweet()
        {

        }

        #region Get_Statuses_RetweetsById
        /// <summary>
        /// Returns up to 100 of the first retweets of a given tweet.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public JArray Get_Statuses_RetweetsById(oAuthTwitter oAuth, string UserId)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusesRetweetByIdUrl + UserId + ".json";
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Statuses_ShowById
        /// <summary>
        /// Returns a single Tweet, specified by the id parameter.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public JArray Get_Statuses_ShowById(oAuthTwitter oAuth, string UserId)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusShowByIdUrl + UserId;
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Statuses_DestroyById
        /// <summary>
        /// Destroys the status specified by the required ID parameter. The authenticating user must be the author of the specified status. Returns the destroyed status if successful.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public JArray Post_Statuses_DestroyById(oAuthTwitter oAuth, string UserId)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusDestroyByIdUrl + UserId + ".json";
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Statuses_Update
        /// <summary>
        /// Updates the authenticating user's current status, also known as tweeting.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Post_Statuses_Update(oAuthTwitter oAuth, string statuses)
        {
            string response = string.Empty;
            try
            {
                SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
                strdic.Add("status", statuses);
                string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusUpdateUrl;
                response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
                if (!response.StartsWith("["))
                    response = "[" + response + "]";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }

            return JArray.Parse(response);
        }
        #endregion

        #region Post_Statuses_RetweetsById
        /// <summary>
        /// Retweets a tweet.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <param name="postData"></param>
        /// <returns></returns>
        public JArray Post_Statuses_RetweetsById(oAuthTwitter oAuth, string UserId, string postData)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostStatusesRetweetByIdUrl + UserId + ".json";
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Statuses_Update_With_Media
        /// <summary>
        /// Post a tweet with Image
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <param name="postData"></param>
        /// <returns></returns>
        //public string Post_Statuses_Update_With_Media(oAuthTwitter oAuth, string UserId, string postData, string imageFile)
        //{
        //    string RequestUrl = Globals.PostStatusUpdateWithMediaUrl;
        //    string response=oAuth.webRequestWithContentType(oAuth, imageFile, "multipart/form-data; boundary=", RequestUrl,postData);

        //    return response;
        //}


        #endregion

        #region Get_Statuses_retweetersById
        /// <summary>
        /// Returns a collection of up to 100 user IDs belonging to users who have retweeted the tweet specified by the id parameter.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <param name="postData"></param>
        /// <returns></returns>
        public JArray Get_Statuses_retweetersById(oAuthTwitter oAuth, string StatusId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetStatusesRetweetersByIdUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("id", StatusId);
            strdic.Add("count", "100");
            strdic.Add("stringify_ids", "true");
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        public JArray Post_StatusesUpdate(oAuthTwitter oAuth, string statuses)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusUpdateUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("status", statuses);
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        //post reply
        public JArray Post_StatusesUpdate(oAuthTwitter oAuth, string statuses, string screen_name, string statusid)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.StatusUpdateUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("status", "@" + screen_name + " " + statuses);
            strdic.Add("in_reply_to_status_id", statusid);
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }


        #region post status favorite
        public JArray Post_favorites(oAuthTwitter oAuth, string desirestatusId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostStatusFavoritesById;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("id", desirestatusId);
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region post user report as spam

        public JArray Post_report_as_spammer(oAuthTwitter oAuth, string userScreaanNameorId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostUserReportAsSpammerById;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("screen_name", userScreaanNameorId);
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        #endregion

    }
}
