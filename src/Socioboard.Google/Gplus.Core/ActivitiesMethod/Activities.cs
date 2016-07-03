using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.App.Core;

namespace Socioboard.GoogleLib.Gplus.Core.ActivitiesMethod
{
    public class Activities
    {
        public Activities(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        /// <summary>
        /// List all of the activities in the specified collection for a particular user.
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_Activities_List(string UserId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetActivitiesList + UserId + "/activities/public?access_token=" + access;
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
        /// Get an activity by Id.
        /// </summary>
        /// <param name="ActivityId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_Activity_By_Id(string ActivityId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetActivityById + ActivityId + "?access_token=" + access;
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
        /// Search public activities.
        /// </summary>
        /// <param name="query">Full-text search query string. </param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_Activities_Search(string query, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetSearchActivity + "?query="+ query +"access_token=" + access;
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
