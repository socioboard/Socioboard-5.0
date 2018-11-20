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
        public enum Method
        {
            GET,
            POST,
            DELETE
        }
        //  OAuth.OAuthRequest oauth = new OAuth.OAuthRequest();
        #region Properties


        public const string RequestToken = "https://api.twitter.com/oauth/request_token";

        public const string Authorize = "https://api.twitter.com/oauth/authorize";

        public const string ACCESS_TOKEN = "https://api.twitter.com/oauth/access_token";

        private string _consumerKey = "";
        private string _consumerSecret = "";
        private string _token = "";
        private string _tokenSecret = "";
        private string _callBackUrl = "";
        private string _oauthVerifier = "";
        private string _twitterUser = "";
        private string _profileimage = "";

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
        public string TwitterUserId { get; set; }


        #endregion


        public oAuthTwitter()
        {

        }

        public oAuthTwitter(string consumerkey, string consumerSecret)
        {
            ConsumerKey = consumerkey;
            ConsumerKeySecret = consumerSecret;
        }

        public oAuthTwitter(string consumerkey, string consumerSecret, string callbackUrl)
        {
            CallBackUrl = callbackUrl;
            ConsumerKey = consumerkey;
            ConsumerKeySecret = consumerSecret;
        }

        public oAuthTwitter(string consumerkey, string consumerSecret, string oauthToken, string oauthTokenSecret)
        {
            AccessTokenSecret = oauthTokenSecret;
            AccessToken = oauthToken;
            ConsumerKey = consumerkey;
            ConsumerKeySecret = consumerSecret;
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
                string response = OAuthWebRequest(Method.GET, RequestToken, slt);
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
                        ret = Authorize + "?oauth_token=" + qs["oauth_token"];
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
        public void GetTwitterAccessToken(string authToken, string oauthVerifier)
        {
            try
            {
                string resourceUrl = string.Format(ACCESS_TOKEN);
                var requestParameters = new SortedDictionary<string, string>
                {
                    {"oauth_consumer_key", ConsumerKey},
                    {"oauth_token", AccessToken},
                    {"oauth_signature_method", "HMA-SHA1"},
                    {"oauth_verifier", oauthVerifier}
                };

                var oauthnonce = CreateOauthNonce();
                var timestamp = CreateOAuthTimestamp();
                requestParameters.Add("oauth_nonce", oauthnonce);
                requestParameters.Add("oauth_version", OauthVersion);
                var signature = CreateOauthSignature(resourceUrl, Method.POST, oauthnonce, timestamp, requestParameters);
                requestParameters.Add("oauth_signature", signature);
                var response = OAuthWebRequest(Method.POST, resourceUrl, requestParameters);

                if (response.Length > 0)
                {

                    var qs = HttpUtility.ParseQueryString(response);
                    AccessToken = qs["oauth_token"];
                    AccessTokenSecret = qs["oauth_token_secret"];
                    TwitterScreenName = qs["screen_name"];
                    TwitterUserId = qs["user_id"];
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }


        /// <summary>
        /// Submit a web request using oAuth.
        /// </summary>
        /// <param name="method">GET or POST</param>
        /// <param name="resourceUrl">The full url, including the querystring.</param>
        /// <param name="requestParameters">Data to post</param>
        /// <returns>The web server response.</returns>
        public string OAuthWebRequest(Method method, string resourceUrl, SortedDictionary<string, string> requestParameters)
        {
            var resultString = string.Empty;
            try
            {
                ServicePointManager.Expect100Continue = false;
                HttpWebRequest request = null;
                switch (method)
                {
                    case Method.POST:
                    {
                        var postBody = requestParameters.ToWebString();
                        request = (HttpWebRequest)WebRequest.Create(resourceUrl);
                        request.Method = method.ToString();                        
                        request.ContentType = "application/x-www-form-urlencoded";
                        request.ProtocolVersion = HttpVersion.Version11;
                        using (var stream = request.GetRequestStream())
                        {
                            var content = Encoding.ASCII.GetBytes(postBody);
                            stream.Write(content, 0, content.Length);
                        }
                        break;
                    }
                    case Method.GET:
                        request = (HttpWebRequest)WebRequest.Create(resourceUrl + "?" + requestParameters.ToWebString());
                        request.Method = method.ToString();
                        break;
                    default:                       
                        break;
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


        public string SendDirectMessage(string url,string recipientId,string Message, SortedDictionary<string, string> requestParameters)
        {
            var resultString = string.Empty;

            try
            {
                
                ServicePointManager.Expect100Continue = false;
                HttpWebRequest request = null;
                var authHeader = CreateHeader(url, Method.POST, requestParameters);
                request = (HttpWebRequest)WebRequest.Create(url);
                WebHeaderCollection headers = new WebHeaderCollection();
                headers.Add("authorization: " + authHeader);

                request.Headers = headers;
               
                request.ContentType = "application/json";
                request.MediaType = "application/json";
                request.Accept = "application/json";
                request.Method = "POST";

                var postBody = "{\"event\": {\"type\": \"message_create\", \"message_create\": {\"target\": {\"recipient_id\": \""+ recipientId .ToString()+ "\"}, \"message_data\": {\"text\": \""+ Message .ToString()+ "\"}}}}";

                var content = Encoding.ASCII.GetBytes(postBody);
                request.ContentLength = content.Length;

                using (var stream = request.GetRequestStream())
                {                 
                    stream.Write(content, 0, content.Length);               
                }

                var response = request.GetResponse();
                using (var sd = new StreamReader(response.GetResponseStream()))
                {
                    resultString = sd.ReadToEnd();
                    response.Close();

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return resultString;
        }


        public string oAuthWebRequest(Method method, string resourceUrl, string hello) => "hello";

        public string CreateOauthNonce() => Convert.ToBase64String(new ASCIIEncoding().GetBytes(DateTime.Now.Ticks.ToString()));

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
                const string headerFormat = "OAuth oauth_nonce=\"{0}\", oauth_signature_method=\"{1}\", " +"oauth_timestamp=\"{2}\", oauth_consumer_key=\"{3}\", " +"oauth_token=\"{4}\", oauth_signature=\"{5}\", " +"oauth_version=\"{6}\"";

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

                const string headerFormat = "OAuth oauth_nonce=\"{0}\", oauth_signature_method=\"{1}\", " + "oauth_timestamp=\"{2}\", oauth_consumer_key=\"{3}\", " +"oauth_signature=\"{4}\", oauth_version=\"{5}\"";

                var authHeader = string.Format(headerFormat,
                                                    Uri.EscapeDataString(oauthNonce),
                                                    Uri.EscapeDataString(OauthSignatureMethod),
                                                    Uri.EscapeDataString(oauthTimestamp),
                                                    Uri.EscapeDataString(ConsumerKey),
                                                    Uri.EscapeDataString(oauthSignature),
                                                    Uri.EscapeDataString(OauthVersion));
                return authHeader;
            }

        }

        public string CreateOauthSignature(string resourceUrl, Method method, string oauthNonce, string oauthTimestamp,
                                            SortedDictionary<string, string> requestParameters)
        {
            //firstly we need to add the standard oauth parameters to the sorted list
            var oauthSignature = string.Empty;        
                try
                {
                    if (!string.IsNullOrEmpty(ConsumerKey) && !requestParameters.ContainsKey("oauth_consumer_key"))
                        requestParameters.Add("oauth_consumer_key", ConsumerKey);

                    if (!string.IsNullOrEmpty(oauthNonce) && !requestParameters.ContainsKey("oauth_nonce"))
                        requestParameters.Add("oauth_nonce", oauthNonce);

                    if (!string.IsNullOrEmpty(OauthSignatureMethod) && !requestParameters.ContainsKey("oauth_signature_method"))
                        requestParameters.Add("oauth_signature_method", OauthSignatureMethod);

                    if (!string.IsNullOrEmpty(oauthTimestamp) && !requestParameters.ContainsKey("oauth_timestamp"))
                        requestParameters.Add("oauth_timestamp", oauthTimestamp);

                    if (!string.IsNullOrEmpty(AccessToken) && !requestParameters.ContainsKey("oauth_token"))
                        requestParameters.Add("oauth_token", AccessToken);

                    if (!string.IsNullOrEmpty(OauthVersion) && !requestParameters.ContainsKey("oauth_version"))
                        requestParameters.Add("oauth_version", OauthVersion);

                    if (!string.IsNullOrEmpty(OAuthVerifer) && !requestParameters.ContainsKey("oauth_verifier"))
                        requestParameters.Add("oauth_verifier", OAuthVerifer);

                    if (requestParameters.Count > 0)
                    {
                        var sigBaseString = requestParameters.ToWebString();

                        var signatureBaseString = string.Concat(method.ToString(), "&", Uri.EscapeDataString(resourceUrl), "&",
                            Uri.EscapeDataString(sigBaseString));

                        //Using this base string, we then encrypt the data using a composite of the 
                        //secret keys and the HMAC-SHA1 algorithm.
                        var compositeKey = string.Concat(Uri.EscapeDataString(ConsumerKeySecret), "&",
                            Uri.EscapeDataString(AccessTokenSecret));

                        using (var hasher = new HMACSHA1(Encoding.ASCII.GetBytes(compositeKey)))
                        {
                            oauthSignature = Convert.ToBase64String(hasher.ComputeHash(Encoding.ASCII.GetBytes(signatureBaseString)));
                        }
                    }                 
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
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
