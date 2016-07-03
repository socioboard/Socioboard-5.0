using System;
using System.Net;
using System.IO;
using System.Collections.Specialized;

using Socioboard.Instagram.Authentication;
using System.Text;

namespace Socioboard.Instagram.Authentication
{
    public class oAuthInstagram : oAuthBase
    {
        public enum Method { GET, POST, DELETE };
        protected static readonly object threadlock = new object();

       // OAuth.Manager oauthMgr = new OAuth.Manager();
        #region Properties

        private static oAuthInstagram _sharedInstance = null;
        private static ConfigurationIns _sharedConfiguration = null;

        public ConfigurationIns Configuration
        {
            get { return _sharedConfiguration; }
            set { _sharedConfiguration = value; }
        }
        public oAuthInstagram() 
        {
        }
        #endregion

        #region auth
        public static oAuthInstagram GetInstance()
        {
            if (_sharedInstance == null)
            {
                if (_sharedConfiguration == null)
                    throw new ApplicationException("API Uninitialized");
                else
                    _sharedInstance = new oAuthInstagram();
            }
            return _sharedInstance;
        }
        public static oAuthInstagram GetInstance(ConfigurationIns configuration)
        {
            lock (threadlock)
            {
                if (_sharedInstance == null)
                {
                    _sharedInstance = new oAuthInstagram();
                    _sharedInstance.Configuration = configuration;

                }
            }

            return _sharedInstance;
        }

        public string AuthGetUrl(string scope)
        {
            if (string.IsNullOrEmpty(scope))
                scope = "comments";
            return Configuration.AuthUrl + "?client_id=" + Configuration.ClientId + "&redirect_uri=" + Configuration.ReturnUrl + "&response_type=code&scope=" + scope;
        }

        public string RequestPostToUrl(string url, NameValueCollection postData, WebProxy proxy)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            if (url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try
            {
                using (var client = new WebClient())
                {
                    //proxy
                    if (proxy != null)
                        client.Proxy = proxy;

                    //response
                    byte[] response = client.UploadValues(url, postData);
                    //out
                    var enc = new UTF8Encoding();
                    string outp = enc.GetString(response);
                    return outp;
                }
            }
            catch (WebException ex)
            {
                string err = ex.Message;
            }
            catch (Exception ex)
            {
                string err = ex.Message;
            }

            return null;
        }

        public string RequestGetToUrl(string url, WebProxy proxy)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            if (url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try
            {
                using (var client = new WebClient())
                {
                    //proxy


                    if (proxy != null)
                        client.Proxy = proxy;

                    //response
                    byte[] response = client.DownloadData(url);
                    //out
                    var enc = new UTF8Encoding();
                    string outp = enc.GetString(response);
                    return outp;
                }
            }
            catch (WebException ex)
            {
                string err = ex.Message;
            }
            catch (Exception ex)
            {
                string err = ex.Message;
            }

            return null;
        }

        public string RequestDeleteToUrl(string url, WebProxy proxy)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            if (url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try
            {
                WebRequest request = System.Net.WebRequest.Create(url);

                //proxy
                if (proxy != null)
                    request.Proxy = proxy;

                //type
                request.Method = "DELETE";

                //response
                String str = "";
                WebResponse resp = request.GetResponse();
                Stream ReceiveStream = resp.GetResponseStream();
                Encoding encode = Encoding.GetEncoding("utf-8");
                var readStream = new StreamReader(ReceiveStream, encode);
                var read = new Char[256];
                int count = readStream.Read(read, 0, 256);
                while (count > 0)
                {
                    str = str + new String(read, 0, count);
                    count = readStream.Read(read, 0, 256);
                }
                readStream.Close();
                ReceiveStream.Close();
                //out
                return str;
            }
            catch (WebException ex)
            {
                string err = ex.Message;
            }
            catch (Exception ex)
            {
                string err = ex.Message;
            }

            return null;
        }
        public AccessToken AuthGetAccessToken(string code)
        {
            AccessToken tk;

            string json = RequestPostToUrl(Configuration.TokenRetrievalUrl, new NameValueCollection
                                                               {
                                                                       {"client_id" , Configuration.ClientId},
                                                                       {"client_secret" , Configuration.ClientSecret},
                                                                       {"grant_type" , "authorization_code"},
                                                                       {"redirect_uri" , Configuration.ReturnUrl},
                                                                       {"code" , code}
                                                               }, Configuration.Proxy);

            if (!string.IsNullOrEmpty(json))
            {
                tk = AccessToken.Deserialize(json);
                return tk;
            }



            return null;
        }
        #endregion

        public string GetAccessToken()
        {
            string AuthUrl=  AuthGetUrl("Basic");
            string response = WebRequest(Method.GET, AuthUrl, string.Empty);
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

        /// <summary>
        /// Process the web response.
        /// </summary>
        /// <param name="webRequest">The request object.</param>
        /// <returns>The response data.</returns>
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
    }
}
