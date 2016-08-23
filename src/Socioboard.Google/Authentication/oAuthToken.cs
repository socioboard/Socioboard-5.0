using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using System.IO;
using System.Net;
using Socioboard.GoogleLib.App.Core;
using Newtonsoft.Json.Linq;

namespace Socioboard.GoogleLib.Authentication
{
    public class oAuthToken
    {

        public oAuthToken(string clientId, string clientSecret, string redirectUrl)
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
        /// <param name="scope"></param>
        /// <returns></returns>
        public string GetAutherizationLink(string scope)
        {
            string strAuthUrl = Globals.strAuthentication;
            strAuthUrl +="?scope="+ scope +"&state=%2Fprofile&redirect_uri=" + _redirectUrl + "&response_type=code&client_id=" + _clientId + "&approval_prompt=force&access_type=offline";
            return strAuthUrl;
        }

        /// <summary>
        /// After the web server receives the authorization code, it may exchange the authorization code for an access token and a refresh token.
        /// </summary>
        /// <param name="code">authorization code</param>
        /// <returns></returns>
        public string GetRefreshToken(string code)
        {
            string postData = "code=" + code + "&client_id=" + _clientId + "&client_secret=" + _clientSecret + "&redirect_uri=" + _redirectUrl + "&grant_type=authorization_code";
            string result = WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, Globals.strRefreshToken, postData);
            return result;
        }

        /// <summary>
        ///  obtain a new access token by sending a refresh token to the Google OAuth 2.0 Authorization server.
        /// </summary>
        /// <param name="refreshToken">refreshToken</param>
        /// <returns></returns>
        public string GetAccessToken(string refreshToken)
        {
            string postData = "refresh_token=" + refreshToken + "&client_id=" + _clientId + "&client_secret=" + _clientSecret + "&grant_type=refresh_token";
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            Uri path = new Uri(Globals.strRefreshTokenGPlus);
          //  string response = postWebRequest(path, postData, header, val);
            string response = WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, Globals.strRefreshTokenGPlus, postData);
            return response;
        }

        public string GetUserInfo(string UserId,string access)
        {
            string RequestUrl = Globals.strUserInfo +"&access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return response;
        }

        public string GetPeopleInfo(string UserId, string access,string profileid)
        {
            string RequestUrl = Globals.strPeopleIf + profileid + "?fields=aboutMe,ageRange,birthday,braggingRights,circledByCount,cover,currentLocation,displayName,domain,emails,etag,gender,id,image,isPlusUser,kind,language,name,nickname,objectType,occupation,organizations,placesLived,plusOneCount,relationshipStatus,skills,tagline,url,urls,verified&access_token=" + access;
            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = WebRequestHeader(path, header, val);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return response;
        }
        /// <summary>
        /// Web Request Wrapper
        /// </summary>
        /// <param name="method">Http Method</param>
        /// <param name="url">Full url to the web resource</param>
        /// <param name="postData">Data to post in querystring format</param>
        /// <returns>The web server response.</returns>
        public string WebRequest(Method method, string url, string postData)
        {
            HttpWebRequest webRequest = null;
            StreamWriter requestWriter = null;
            string responseData = "";

            webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            webRequest.Method = method.ToString();
            webRequest.ServicePoint.Expect100Continue = false;
            //webRequest.UserAgent  = "Identify your application please.";
            //webRequest.Timeout = 20000;
            if (method == Method.POST || method == Method.DELETE)
            {
                //webRequest.ContentType = "application/json";
                webRequest.ContentType = "application/x-www-form-urlencoded";
                //  webRequest.ContentType = "multipart/form-data;";
                //POST the data.
                requestWriter = new StreamWriter(webRequest.GetRequestStream());
                try
                {
                    requestWriter.Write(postData);
                }
                catch
                {
                    
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

     
        /// <summary>
        /// Process the web response.
        /// </summary>
        /// <param name="webRequest">The request object.</param>
        /// <returns>The response data.</returns>
        public string WebResponseGet(HttpWebRequest webRequest)
        {
            //StreamReader responseReader = null;
            string responseData = "";

            try
            {
                using (HttpWebResponse httResponse = (HttpWebResponse)webRequest.GetResponse())
                {
                    Stream responseStream = httResponse.GetResponseStream();
                    using (StreamReader responseReader = new StreamReader(responseStream, Encoding.Default))
                    {
                        responseData = responseReader.ReadToEnd();
                    }
                }
                
            }
            catch (Exception ex)
            {
               
            }
            
            return responseData;
        }

        public string WebRequestHeader(Uri url, string[] HeaderName, string[] Value)
        {
            HttpWebRequest gRequest;
              HttpWebResponse gResponse;
            gRequest = (HttpWebRequest)System.Net.WebRequest.Create(url.ToString());
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

        public string postWebRequest(Uri formActionUrl, string postData, string[] HeaderName, string[] Value)
        {
            HttpWebRequest gRequest;
            HttpWebResponse gResponse;
            gRequest = (HttpWebRequest)System.Net.WebRequest.Create(formActionUrl);
            gRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.4) Gecko/2008102920 Firefox/3.0.4";
            gRequest.CookieContainer = new CookieContainer();
            gRequest.Method = "POST";
            gRequest.Accept = " text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8, */*";
            gRequest.KeepAlive = true;
            gRequest.ContentType = @"text/html; charset=iso-8859-1";

            for (int i = 0; i < HeaderName.Length; i++)
            {
                gRequest.Headers.Add(HeaderName[i], Value[i]);
            }
          

            //logic to postdata to the form
            string postdata = string.Format(postData);
            byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
            gRequest.ContentLength = postBuffer.Length;
            Stream postDataStream = gRequest.GetRequestStream();
            postDataStream.Write(postBuffer, 0, postBuffer.Length);
            postDataStream.Close();
            //post data logic ends

            //Get Response for this request url
            gResponse = (HttpWebResponse)gRequest.GetResponse();



            //check if the status code is http 200 or http ok
            if (gResponse.StatusCode == HttpStatusCode.OK)
            {
                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string responseString = reader.ReadToEnd();
                reader.Close();
                //Console.Write("Response String:" + responseString);
                return responseString;
            }
            else
            {
                return "Error in posting data";
            }
        }
 
    }
}
