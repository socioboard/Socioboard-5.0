using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.App.Core;
using System.Configuration;
using System.Data;
using System.Net;
using System.IO;

namespace Socioboard.GoogleLib.Authentication
{
       

    public class oAuthTokenGa
    {
        
        public oAuthTokenGa(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }

        public enum Method { GET, POST, DELETE };
        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

        /// <summary>
        ///  To get authentication Link
        /// </summary>
        /// <param name="scope">https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/analytics.readonly</param>
        /// <returns></returns>
        public string GetAutherizationLinkGa(string scope)
        {
            string strAuthUrl = Globals.strAuthentication;
            strAuthUrl += "?scope=" + scope + "&redirect_uri=" + _redirectUrl + "&response_type=code&client_id=" + _clientId + "&approval_prompt=force&access_type=offline";
            return strAuthUrl;
        }

        /// <summary>
        /// After the web server receives the authorization code, it may exchange the authorization code for an access token and a refresh token.
        /// </summary>
        /// <param name="code">authorization code</param>
        /// <returns></returns>
        public string GetRefreshToken(string code)
        {
            oAuthToken objoAuth = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string postData = "code=" + code + "&client_id=" + _clientId + "&client_secret=" + _clientSecret + "&redirect_uri=" + _redirectUrl + "&grant_type=authorization_code";
            string result = objoAuth.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, Globals.strRefreshToken, postData);
            return result;
        }

        /// <summary>
        ///  obtain a new access token by sending a refresh token to the Google OAuth 2.0 Authorization server.
        /// </summary>
        /// <param name="refreshToken">refreshToken</param>
        /// <returns></returns>
        public string GetAccessToken(string refreshToken)
        {
            oAuthToken objoAuth = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            string postData = "refresh_token=" + refreshToken + "&client_id=" + _clientId + "&client_secret=" + _clientSecret + "&grant_type=refresh_token";
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            Uri path = new Uri(Globals.strRefreshToken);
            //  string response = postWebRequest(path, postData, header, val);
            string response = objoAuth.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, Globals.strRefreshToken, postData);
            return response;
        }

        public string RevokeToken(String token)
        {
            string Token = string.Empty;
            string Url = "https://accounts.google.com/o/oauth2/revoke?token=" + token;
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            Token = WebRequestHeader(new Uri(Url), header, val);

            return Token;
        }

        public string WebRequestHeader(Uri url, string[] HeaderName, string[] Value)
        {
            HttpWebRequest gRequest;
            HttpWebResponse gResponse;
            gRequest = (HttpWebRequest)System.Net.WebRequest.Create(url);
            gRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.4) Gecko/2008102920 Firefox/3.0.4";
            gRequest.CookieContainer = new CookieContainer();
            gRequest.Method = "GET";

            for (int i = 0; i < HeaderName.Length; i++)
            {
                gRequest.Headers.Add(HeaderName[i], Value[i]);
            }


            gResponse = (HttpWebResponse)gRequest.GetResponse();
            Stream getstream = gResponse.GetResponseStream();
            StreamReader readStream = new StreamReader(getstream);


            //get all the cookies from the current request and add them to the response object cookies
            gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);
            //check if response object has any cookies or not


            StreamReader reader = new StreamReader(gResponse.GetResponseStream());
            string responseString = reader.ReadToEnd();
            reader.Close();
            //Console.Write("Response String:" + responseString);
            return responseString;


        }


    }
}
