using System;
using System.Net;
using System.IO;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Socioboard.Twitter.App.Core;
using System.Compat.Web;

namespace Socioboard.Twitter.Authentication
{
    public class oAuthTwitter : OAuthBase
    {
       // ILog logger = LogManager.GetLogger(typeof(oAuthTwitter));
        public enum Method { GET, POST, DELETE };
        public const string REQUEST_TOKEN = "https://api.twitter.com/oauth/request_token";
        public const string AUTHORIZE = "https://api.twitter.com/oauth/authorize";
        public const string ACCESS_TOKEN = "https://api.twitter.com/oauth/access_token";

        private string _consumerKey = "";
        private string _consumerSecret = "";
        private string _token = "";
        private string _tokenSecret = "";
        private string _callBackUrl = "";
        private string _oauthVerifier = "";
        private string _twitterUser = "";
        private string _profileimage = "";
      //  OAuth.OAuthRequest oauth = new OAuth.OAuthRequest();
        #region Properties


        public const string OauthVersion = "1.0";
        public const string OauthSignatureMethod = "HMAC-SHA1";
        public string CallBackUrl { get; set; }
        public string ConsumerKey { set; get; }
        public string ConsumerKeySecret { set; get; }
        public string AccessToken { set; get; }
        public string AccessTokenSecret { set; get; }
        public string OAuthVerifer { get; set; }
        public string TwitterScreenName { get { return _twitterUser; } set { _twitterUser = value; } }
        public string ProfileImage { get { return _profileimage; } set { _profileimage = value; } }
        public string TwitterUserId{ get; set;}

        

        #endregion


        public oAuthTwitter()
        { 
        
        }

        public oAuthTwitter(string consumerkey,string consumerSecret)
        {
            this.ConsumerKey = consumerkey;
            this.ConsumerKeySecret = consumerSecret;
        }

        public oAuthTwitter(string consumerkey, string consumerSecret,string callbackUrl)
        {
            this.CallBackUrl = callbackUrl;
            this.ConsumerKey = consumerkey;
            this.ConsumerKeySecret = consumerSecret;
        }
        public oAuthTwitter(string consumerkey, string consumerSecret,string oauthToken,string oauthTokenSecret)
        {
            this.AccessTokenSecret = oauthTokenSecret;
            this.AccessToken = oauthToken;
            this.ConsumerKey = consumerkey;
            this.ConsumerKeySecret = consumerSecret;
        }




        /// <summary>
        /// Get the link to Twitter's authorization page for this application.
        /// </summary>
        /// <returns>The url with a valid request token, or a null string.</returns>
        public string AuthorizationLinkGet()
        {
            string ret = null;
            try
            {
                SortedDictionary<string, string> slt = new SortedDictionary<string, string>();
                string response = oAuthWebRequest(Method.GET, REQUEST_TOKEN, slt);
                if (response.Length > 0)
                {
                    //response contains token and token secret.  We only need the token.
                    NameValueCollection qs = HttpUtility.ParseQueryString(response);

                    if (qs["oauth_callback_confirmed"] != null)
                    {
                        if (qs["oauth_callback_confirmed"] != "true")
                        {
                            throw new Exception("OAuth callback not confirmed.");
                        }
                    }

                    if (qs["oauth_token"] != null)
                    {
                        ret = AUTHORIZE + "?oauth_token=" + qs["oauth_token"];
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return ret;
        }

        /// <summary>
        /// Exchange the request token for an access token.
        /// </summary>
        /// <param name="authToken">The oauth_token is supplied by Twitter's authorization page following the callback.</param>
        /// <param name="oauthVerifier">An oauth_verifier parameter is provided to the client either in the pre-configured callback URL</param>
        public void AccessTokenGet(string authToken, string oauthVerifier)
        {
            try
            {
                string resourceUrl = string.Format(ACCESS_TOKEN);
                var requestParameters = new SortedDictionary<string, string>();
                requestParameters.Add("oauth_consumer_key", this.ConsumerKey);
                requestParameters.Add("oauth_token", this.AccessToken);
                requestParameters.Add("oauth_signature_method", "HMA-SHA1");
                requestParameters.Add("oauth_verifier", oauthVerifier);
                string oauthnonce = this.CreateOauthNonce();
                string timestamp = CreateOAuthTimestamp();
                requestParameters.Add("oauth_nonce", oauthnonce);
                requestParameters.Add("oauth_version", OauthVersion);
                string signature = this.CreateOauthSignature(resourceUrl, Method.POST, oauthnonce, timestamp, requestParameters);
                requestParameters.Add("oauth_signature", signature);
                var response = oAuthWebRequest(Method.POST, resourceUrl, requestParameters);
                if (response.Length > 0)
                {

                    NameValueCollection qs = HttpUtility.ParseQueryString(response);
                    this.AccessToken = qs["oauth_token"];
                    this.AccessTokenSecret = qs["oauth_token_secret"];
                    this.TwitterScreenName = qs["screen_name"];
                    this.TwitterUserId = qs["user_id"];
                }
            }
            catch (Exception ex)
            {
               // logger.Error(ex.StackTrace);
            }
        }










        /// <summary>
        /// Submit a web request using oAuth.
        /// </summary>
        /// <param name="method">GET or POST</param>
        /// <param name="url">The full url, including the querystring.</param>
        /// <param name="postData">Data to post (querystring format)</param>
        /// <returns>The web server response.</returns>
        public string oAuthWebRequest(Method method, string resourceUrl, SortedDictionary<string, string> requestParameters)
        {

            string resultString = string.Empty;

            try
            {
                ServicePointManager.Expect100Continue = false;
                HttpWebRequest request = null;


                if (method == Method.POST)
                {
                    var postBody = requestParameters.ToWebString();

                    request = (HttpWebRequest)WebRequest.Create(resourceUrl);
                    request.Method = method.ToString();
                    //if (resourceUrl == Globals.StatusUpdateUrl)
                    //{
                    //    request.ContentType = "multipart/form-data; type=\"image/jpeg\"; start=\"<media>\";boundary=\"--0246824681357ACXZabcxyz\"";

                    //}
                    request.ContentType = "application/x-www-form-urlencoded";
                    request.ProtocolVersion = HttpVersion.Version11;
                    using (var stream = request.GetRequestStream())
                    {
                        byte[] content = Encoding.ASCII.GetBytes(postBody);
                        stream.Write(content, 0, content.Length);
                    }
                }
                else if (method == Method.GET)
                {
                    request = (HttpWebRequest)WebRequest.Create(resourceUrl + "?"
                    + requestParameters.ToWebString());
                    request.Method = method.ToString();

                }
                else
                {
                    //other verbs can be addressed here...
                }

                if (request != null)
                {

                    var authHeader = CreateHeader(resourceUrl, method, requestParameters);
                    request.Headers.Add("Authorization", authHeader);
                    var response = request.GetResponse();

                    using (var sd = new StreamReader(response.GetResponseStream()))
                    {
                        resultString = sd.ReadToEnd();
                        response.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }

            return resultString;
        }




















        public string oAuthWebRequest(Method method, string resourceUrl, string hello)
        {

            return "hello";
        }
        public string CreateOauthNonce()
        {
            return Convert.ToBase64String(new ASCIIEncoding().GetBytes(DateTime.Now.Ticks.ToString()));
        }

        public string CreateHeader(string resourceUrl, Method method,
                                    SortedDictionary<string, string> requestParameters)
        {
            var oauthNonce = CreateOauthNonce();
            // Convert.ToBase64String(new ASCIIEncoding().GetBytes(DateTime.Now.Ticks.ToString()));
            var oauthTimestamp = CreateOAuthTimestamp();
            var oauthSignature = CreateOauthSignature(resourceUrl, method, oauthNonce, oauthTimestamp, requestParameters);

            //The oAuth signature is then used to generate the Authentication header. 


            if (!string.IsNullOrEmpty(AccessToken))
            {
                const string headerFormat = "OAuth oauth_nonce=\"{0}\", oauth_signature_method=\"{1}\", " +
                                             "oauth_timestamp=\"{2}\", oauth_consumer_key=\"{3}\", " +
                                             "oauth_token=\"{4}\", oauth_signature=\"{5}\", " +
                                             "oauth_version=\"{6}\"";
                var authHeader = string.Format(headerFormat,
                                             Uri.EscapeDataString(oauthNonce),
                                             Uri.EscapeDataString(OauthSignatureMethod),
                                             Uri.EscapeDataString(oauthTimestamp),
                                             Uri.EscapeDataString(ConsumerKey),
                                             Uri.EscapeDataString(AccessToken),
                                             Uri.EscapeDataString(oauthSignature),
                                             Uri.EscapeDataString(OauthVersion)
                  );
                return authHeader;
            }
            else
            {

                const string headerFormat = "OAuth oauth_nonce=\"{0}\", oauth_signature_method=\"{1}\", " +
                               "oauth_timestamp=\"{2}\", oauth_consumer_key=\"{3}\", " +
                               "oauth_signature=\"{4}\", oauth_version=\"{5}\"";
                var authHeader = string.Format(headerFormat,
                                                    Uri.EscapeDataString(oauthNonce),
                                                    Uri.EscapeDataString(OauthSignatureMethod),
                                                    Uri.EscapeDataString(oauthTimestamp),
                                                    Uri.EscapeDataString(ConsumerKey),
                                                    Uri.EscapeDataString(oauthSignature),
                                                    Uri.EscapeDataString(OauthVersion)
                         );
                return authHeader;
            }

        }

        public string CreateOauthSignature(string resourceUrl, Method method, string oauthNonce, string oauthTimestamp,
                                            SortedDictionary<string, string> requestParameters)
        {
            //firstly we need to add the standard oauth parameters to the sorted list

            string oauthSignature=string.Empty;

            try
            {
                try
                {
                    requestParameters.Add("oauth_consumer_key", ConsumerKey);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
                try
                {
                    requestParameters.Add("oauth_nonce", oauthNonce);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
                try
                {
                    requestParameters.Add("oauth_signature_method", OauthSignatureMethod);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }

                try
                {
                    requestParameters.Add("oauth_timestamp", oauthTimestamp);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
                if (!string.IsNullOrEmpty(AccessToken))
                {
                    try
                    {
                        requestParameters.Add("oauth_token", AccessToken);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                }
                try
                {
                    requestParameters.Add("oauth_version", OauthVersion);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }

                try
                {
                    if (!string.IsNullOrEmpty(OAuthVerifer))

                        try
                        {
                            requestParameters.Add("oauth_verifier", OAuthVerifer);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                }

                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);

                }


                var sigBaseString = requestParameters.ToWebString();

                var signatureBaseString = string.Concat(method.ToString(), "&", Uri.EscapeDataString(resourceUrl), "&",
                                                        Uri.EscapeDataString(sigBaseString.ToString()));


                //Using this base string, we then encrypt the data using a composite of the 
                //secret keys and the HMAC-SHA1 algorithm.
                var compositeKey = string.Concat(Uri.EscapeDataString(ConsumerKeySecret), "&",
                                                 Uri.EscapeDataString(AccessTokenSecret));



                using (var hasher = new HMACSHA1(Encoding.ASCII.GetBytes(compositeKey)))
                {
                    oauthSignature = Convert.ToBase64String(
                        hasher.ComputeHash(Encoding.ASCII.GetBytes(signatureBaseString)));
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }

            return oauthSignature;
        }

        public static string CreateOAuthTimestamp()
        {

            var nowUtc = DateTime.UtcNow;
            var timeSpan = nowUtc - new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            var timestamp = Convert.ToInt64(timeSpan.TotalSeconds).ToString();

            return timestamp;
        }


        /// <summary>
        /// Web Request Wrapper
        /// </summary>
        /// <param name="method">Http Method</param>
        /// <param name="url">Full url to the web resource</param>
        /// <param name="postData">Data to post in querystring format</param>
        /// <returns>The web server response.</returns>
        //public string WebRequest(Method method, string url, string postData)
        //{
        //    HttpWebRequest webRequest = null;
        //    StreamWriter requestWriter = null;
        //    string responseData = "";

        //    webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
        //    webRequest.Method = method.ToString();
        //    webRequest.ServicePoint.Expect100Continue = false;
        //    //webRequest.UserAgent  = "Identify your application please.";
        //    //webRequest.Timeout = 20000;

        //    if (method == Method.POST || method == Method.DELETE)
        //    {
        //        //   webRequest.ContentType = "application/x-www-form-urlencoded";
        //        webRequest.ContentType = "application/xml";
        //        //  webRequest.ContentType = "multipart/form-data;";
        //        //POST the data.
        //        requestWriter = new StreamWriter(webRequest.GetRequestStream());
        //        try
        //        {
        //            requestWriter.Write(postData);
        //        }
        //        catch
        //        {
        //            throw;
        //        }
        //        finally
        //        {
        //            requestWriter.Close();
        //            requestWriter = null;
        //        }
        //    }

        //    responseData = WebResponseGet(webRequest);

        //    webRequest = null;

        //    return responseData;

        //}

        ///// <summary>
        ///// Process the web response.
        ///// </summary>
        ///// <param name="webRequest">The request object.</param>
        ///// <returns>The response data.</returns>
        //public string WebResponseGet(HttpWebRequest webRequest)
        //{
        //    StreamReader responseReader = null;
        //    string responseData = "";

        //    try
        //    {
        //        responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
        //        responseData = responseReader.ReadToEnd();
        //    }
        //    catch
        //    {
        //        throw;
        //    }
        //    finally
        //    {
        //        webRequest.GetResponse().GetResponseStream().Close();
        //        responseReader.Close();
        //        responseReader = null;
        //    }

        //    return responseData;
        //}

        //public string webRequestWithContentType(oAuthTwitter oAuth, string imageFile, string contentType, string RequestUrl, string postData)
        //{
        //    HttpWebRequest request = null;
        //    request = System.Net.WebRequest.Create(RequestUrl) as HttpWebRequest;
        //    oauthMgr["consumer_key"] = ConfigurationManager.AppSettings["consumerKey"];
        //    oauthMgr["consumer_secret"] = ConfigurationManager.AppSettings["consumerSecret"];
        //    oauthMgr["token"] = oAuth.Token;
        //    oauthMgr["token_secret"] = oAuth.TokenSecret;
        //    var authzHeader = oauthMgr.GenerateAuthzHeader(RequestUrl, "POST");
        //    request.Method = "POST";
        //    request.PreAuthenticate = true;
        //    request.AllowWriteStreamBuffering = true;
        //    request.Headers.Add("Authorization", authzHeader);

        //    string boundary = "======" +
        //                           Guid.NewGuid().ToString().Substring(18).Replace("-", "") +
        //                           "======";

        //    var separator = "--" + boundary;
        //    var footer = "\r\n" + separator + "--\r\n";

        //    string shortFileName = Path.GetFileName(imageFile);
        //    string fileContentType = GetMimeType(shortFileName);
        //    string fileHeader = string.Format("Content-Disposition: file; " +
        //                                      "name=\"media\"; filename=\"{0}\"",
        //                                      shortFileName);
        //    var encoding = System.Text.Encoding.GetEncoding("iso-8859-1");

        //    var contents = new System.Text.StringBuilder();
        //    contents.AppendLine(separator);
        //    contents.AppendLine("Content-Disposition: form-data; name=\"status\"");
        //    contents.AppendLine();
        //    contents.AppendLine(oAuth.UrlEncode(postData));
        //    contents.AppendLine(separator);
        //    contents.AppendLine(fileHeader);
        //    contents.AppendLine(string.Format("Content-Type: {0}", fileContentType));
        //    contents.AppendLine();

        //    request.ServicePoint.Expect100Continue = false;
        //    request.ContentType = "multipart/form-data; boundary=" + boundary;
        //    // actually send the request
        //    using (var s = request.GetRequestStream())
        //    {
        //        byte[] bytes = encoding.GetBytes(contents.ToString());
        //        s.Write(bytes, 0, bytes.Length);
        //        bytes = File.ReadAllBytes(imageFile);
        //        s.Write(bytes, 0, bytes.Length);
        //        bytes = encoding.GetBytes(footer);
        //        s.Write(bytes, 0, bytes.Length);
        //    }
        //    string strUpdate = oAuth.WebResponseGet(request);
        //    return strUpdate;
        //}
        //public static string GetMimeType(String filename)
        //{

        //    var extension = System.IO.Path.GetExtension(filename).ToLower();
        //    var regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(extension);

        //    string result =
        //        ((regKey != null) && (regKey.GetValue("Content Type") != null))
        //        ? regKey.GetValue("Content Type").ToString()
        //        : "image/unknown";
        //    return result;
        //}

    }
}
public static class Extensions
{
    public static string ToWebString(this SortedDictionary<string, string> source)
    {
        var body = new StringBuilder();
        try
        {
            if (source.Count != 0)
            {

                foreach (var requestParameter in source)
                {
                    body.Append(requestParameter.Key);
                    body.Append("=");
                    body.Append(Uri.EscapeDataString(requestParameter.Value));
                    body.Append("&");
                }
                //remove trailing '&'
                body.Remove(body.Length - 1, 1);

            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error : " + ex.StackTrace);
        }
        return body.ToString();
    }
}
