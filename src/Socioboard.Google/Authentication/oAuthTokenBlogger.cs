using Socioboard.GoogleLib.App.Core;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;

namespace Socioboard.GoogleLib.Authentication
{
    public class oAuthTokenBlogger
    {
        public oAuthTokenBlogger(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

       

        public string GetRefreshToken(string code)
        {
            oAuthToken objoAuth = new oAuthToken(_clientId,_clientSecret, _redirectUrl);
            string postData = "code=" + code + "&client_id=" + _clientId+ "&client_secret=" + _clientSecret + "&redirect_uri=" + _redirectUrl + "&grant_type=authorization_code";
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
        public string RevokeToken(string token)
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

        public JArray GetBlogInfo(string access)
        {
            string RequestUrl = Globals.strUserInfo;
            string response = APIWebRequestToGetUserInfo(RequestUrl, access);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
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

        public string APIWebRequestToGetUserInfo(string url, string access_token)
        {
            string pageContent = string.Empty;

            string authHeaderValue = "Bearer " + access_token;

            HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(url);
            httpRequest.Method = "GET";
            httpRequest.ContentType = "application/x-www-form-urlencoded";
            httpRequest.Headers.Add("Authorization", authHeaderValue);
            
            //httpRequest.Headers.Add("Content-Type", "application/json");
            try
            {
                using (HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse())
                {
                    Stream responseStream = httResponse.GetResponseStream();

                    using (StreamReader responseStreamReader = new StreamReader(responseStream, Encoding.Default))
                    {
                        pageContent = responseStreamReader.ReadToEnd();
                    }

                }
            }
            catch (Exception ex)
            {
                
                throw;
            }
            return pageContent;
        }

        public string APIWebRequest(string url, string postData, string access_token)
        {
            string pageContent = "";
            HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(url);
            httpRequest.Method = "POST";
            byte[] data = Encoding.ASCII.GetBytes(postData);
            //httpRequest.ContentType = "multipart/form-data";
            //httpRequest.ContentType = "application/atom+xml";
            httpRequest.ContentType = "application/json; charset=UTF-8";
            //httpRequest.Headers.Add("Content-Encoding", "gzip");
            //httpRequest.CookieContainer = new CookieContainer();
            string Authorization = "Bearer " + access_token;
            //string Authorization = "OAuth " + access_token;
            if (!string.IsNullOrEmpty(access_token))
            {
                httpRequest.Headers.Add("Authorization", Authorization);
            }
            httpRequest.ContentLength = data.Length;
            Stream requestStream = httpRequest.GetRequestStream();
            requestStream.Write(data, 0, data.Length);
            requestStream.Close();
            try
            {
                HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                StreamReader responseStreamReader = new StreamReader(responseStream, Encoding.Default);
                pageContent = responseStreamReader.ReadToEnd();
                responseStreamReader.Close();
                responseStream.Close();
                httResponse.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return pageContent;
        }

    }
}
