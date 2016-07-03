using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Configuration;
using Socioboard.GoogleLib.App.Core;
using System.IO;

namespace Socioboard.GoogleLib.Authentication
{
    public class oAuthTokenYoutube
    {


        public oAuthTokenYoutube(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;



        public enum Parts
        {
            //contentDetails,
            //id,
            //snippet,
            //status,

            snippet,
            contentDetails,
            fileDetails,
            player,
            processingDetails,
            recordingDetails,
            statistics,
            status,
            suggestions,
            topicDetails

        }

        public enum Method
        {
            GET,
            POST,
        }
        

        /// <summary>
        ///  To get authentication Link
        /// </summary>
        /// <param name="scope">https://www.googleapis.com/auth/userinfo. email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/analytics.readonly</param>
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
        public string GetRefreshToken(string code, string client_id, string client_secret, string redirect_uri)
        {
            oAuthToken objoAuth = new oAuthToken(_clientId, _clientSecret, _redirectUrl);

            string postData = "code=" + code + "&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code";
            string result = objoAuth.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, Globals.strRefreshToken, postData);
            return result;
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

        public string WebRequestHeader(Uri url, string[] HeaderName, string[] Value, String MethodType)
        {
            HttpWebRequest gRequest;
            HttpWebResponse gResponse;
            gRequest = (HttpWebRequest)System.Net.WebRequest.Create(url);
            gRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.4) Gecko/2008102920 Firefox/3.0.4";
            gRequest.CookieContainer = new CookieContainer();
            gRequest.Method = MethodType;
            //  gRequest.ContentLength = 1024;
            //gRequest.Proxy = new WebProxy("173.234.140.18");

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


        public string WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method method, string url, string postData)
        {
            HttpWebRequest webRequest = null;
            StreamWriter requestWriter = null;
            string responseData = "";

            webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            webRequest.Method = method.ToString();
            webRequest.ServicePoint.Expect100Continue = false;
            //webRequest.UserAgent  = "Identify your application please.";
            //webRequest.Timeout = 20000;

            if (method == Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST)
            {
                webRequest.ContentType = "application/x-www-form-urlencoded";

                //POST the data.
                requestWriter = new StreamWriter(webRequest.GetRequestStream());
                try
                {
                    requestWriter.Write(postData);
                }
                catch
                {
                    throw;
                }
                finally
                {
                    requestWriter.Close();
                    requestWriter = null;
                }
            }

            responseData = WebResponseGet(webRequest);

            webRequest = null;

            return responseData;

        }

        public string Post_WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method method, string url, string postData, string[] HeaderName, string[] Value)
        {
            HttpWebRequest webRequest = null;
            StreamWriter requestWriter = null;
            string responseData = "";

            webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            webRequest.Method = method.ToString();
            webRequest.ServicePoint.Expect100Continue = false;
            //webRequest.UserAgent  = "Identify your application please.";
            //webRequest.Timeout = 20000;
            for (int i = 0; i < HeaderName.Length; i++)
            {
                webRequest.Headers.Add(HeaderName[i], Value[i]);
            }

            if (method == Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST)
            {
                webRequest.ContentType = "application/json";

                //POST the data.
                requestWriter = new StreamWriter(webRequest.GetRequestStream());
                try
                {
                    requestWriter.Write(postData);
                }
                catch
                {
                    throw;
                }
                finally
                {
                    requestWriter.Close();
                    requestWriter = null;
                }
            }

            responseData = WebResponseGet(webRequest);

            webRequest = null;

            return responseData;

        }




        public string WebResponseGet(HttpWebRequest webRequest)
        {
            StreamReader responseReader = null;
            string responseData = "";

            try
            {
                responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
                responseData = responseReader.ReadToEnd();
            }
            catch
            {
                throw;
            }
            finally
            {
                webRequest.GetResponse().GetResponseStream().Close();
                responseReader.Close();
                responseReader = null;
            }

            return responseData;
        }


        public string WebRequestHeader(Uri url, string[] HeaderName, string[] Value)
        {
            HttpWebRequest gRequest;
            HttpWebResponse gResponse;
            gRequest = (HttpWebRequest)System.Net.WebRequest.Create(url);
            gRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.4) Gecko/2008102920 Firefox/3.0.4";
            gRequest.CookieContainer = new CookieContainer();
            gRequest.Method = "GET";
            //  gRequest.ContentLength = 1024;
            //gRequest.Proxy = new WebProxy("173.234.140.18");

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
