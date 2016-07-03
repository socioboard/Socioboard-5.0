using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.App.Core;

namespace Socioboard.GoogleLib.Gplus.Core.MomentsMethod
{
    public class Moments
    {

        public Moments(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;


        /// <summary>
        /// Record a moment representing a user's activity such as making a purchase or commenting on a blog
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Post_Insert_Moment(string UserId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strMoments + UserId + "/moments/vault?access_token=" + access;
            string response = string.Empty;
            try
            {
                response = objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST,RequestUrl,"");
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
        /// List all of the moments that your app has written for the authenticated user
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Get_Moment_List(string UserId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strMoments + UserId + "/moments/vault?access_token=" + access;
            string response = string.Empty;
            try
            {
                response = objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET, RequestUrl, "");
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
        /// Delete a moment that your app has written for the authenticated user.
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray Remove_Moment(string UserId, string access)
        {
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string RequestUrl = Globals.strRemoveMoments + UserId + "?access_token=" + access;
            string response = string.Empty;
            try
            {
                response = objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.DELETE, RequestUrl, "");
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
