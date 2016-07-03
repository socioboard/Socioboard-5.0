using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.App.Core;

namespace Socioboard.GoogleLib.Gplus.Core.CommentsMethod
{
    public class Comments
    {
        public Comments(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        /// <summary>
        /// List all of the comments for an activity
        /// </summary>
        /// <param name="ActivityId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_CommentList_By_ActivityId(string ActivityId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetCommentListByActivityId + ActivityId + "/comments?access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = string.Empty;
            try
            {
                response = objToken.WebRequestHeader(path, header, val);
                if (!response.StartsWith("["))
                    response = "[" + response + "]";
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return JArray.Parse(response);
        }

        /// <summary>
        /// Get a comment By Comment Id.
        /// </summary>
        /// <param name="CommentId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_Comments_By_CommentId(string CommentId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetCommentByCommentId + CommentId + "?access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = string.Empty;
            try
            {
                response = objToken.WebRequestHeader(path, header, val);
                if (!response.StartsWith("["))
                    response = "[" + response + "]";
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return JArray.Parse(response);
        }
    }
}
