using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.App.Core;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Gplus.Core.PeopleMethod
{
    public class People
    {

        public People(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        /// <summary>
        /// Get a person's profile.
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_People_Profile(string UserId,string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetPeopleProfile + UserId + "?access_token=" + access;
             Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response= objToken.WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        /// <summary>
        /// Search all public profiles
        /// </summary>
        /// <param name="query"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_People_Search(string query, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetSearchPeople + query + "&access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = objToken.WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        /// <summary>
        /// List all of the people in the specified collection for a particular activity.
        /// </summary>
        /// <param name="activityId"></param>
        /// <param name="access"></param>
        /// <param name="collection"></param>
        /// <returns></returns>
        public JArray Get_People_ListByActivity(string activityId, string access,string collection)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strGetPeopleListByActivity + activityId + "/people/"+ collection +"?access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = objToken.WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        /// <summary>
        /// List all of the people who this user has added to one or more circles.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="access"></param>
        /// <param name="collection"></param>
        /// <returns></returns>
        public JArray Get_People_List(string userId, string access, string collection)
        {
            oAuthToken objToken = new oAuthToken(_clientId,_clientSecret,_redirectUrl);
            string RequestUrl = Globals.strGetPeopleList + userId + "/people/" + collection + "?access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = objToken.WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
    }
}
