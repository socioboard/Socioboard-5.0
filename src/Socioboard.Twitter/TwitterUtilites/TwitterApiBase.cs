using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Socioboard.Twitter.Twitter.Core;

namespace Socioboard.Twitter.TwitterUtilites
{
    public abstract class TwitterApiBase
    {
        public TwitterApiBase(string consumerKey, string consumerKeySecret, string accessToken, string accessTokenSecret)
        {
            this.consumerKey = consumerKey;
            this.consumerKeySecret = consumerKeySecret;
            this.accessToken = accessToken;
            this.accessTokenSecret = accessTokenSecret;
            sigHasher = new HMACSHA1(new ASCIIEncoding().GetBytes(string.Format("{0}&{1}", consumerKeySecret, accessTokenSecret)));
        }

        const string TwitterApiBaseUrl = "https://api.twitter.com/1.1/";

        readonly string consumerKey, consumerKeySecret, accessToken, accessTokenSecret;

        readonly HMACSHA1 sigHasher;

        readonly DateTime epochUtc = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        protected virtual Task<string> PrepareAuth(string url, Dictionary<string, string> data4Auth, string JsonString)
        {
            var fullUrl = TwitterApiBaseUrl + url;

            // Build the OAuth HTTP Header from the data.
            string oAuthHeader = GenerateOAuthHeader(data4Auth, fullUrl);

            // Setting Content details
            var JsonData = new StringContent(JsonString, Encoding.UTF8, "application/json");

            return SendRequest(fullUrl, oAuthHeader, JsonData);
        }

        protected virtual Task<string> PrepareAuth(string url, Dictionary<string, string> data)
        {
            var fullUrl = TwitterApiBaseUrl + url;

            // Build the OAuth HTTP Header from the data.
            string oAuthHeader = GenerateOAuthHeader(data, fullUrl);

            // Build the form data (exclude OAuth stuff that's already in the header).
            var formData = new FormUrlEncodedContent(data.Where(kvp => !kvp.Key.StartsWith("oauth_")));

            return SendRequest(fullUrl, oAuthHeader, formData);
        }



        protected virtual async Task<string> SendRequest(string fullUrl, string oAuthHeader, StringContent jsondata)
        {
            using (var http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("Authorization", oAuthHeader);
                var httpResp = await http.PostAsync(fullUrl, jsondata);
                var respBody = await httpResp.Content.ReadAsStringAsync();
                return respBody;
            }
        }

        protected virtual async Task<string> SendRequest(string fullUrl, string oAuthHeader, FormUrlEncodedContent formData)
        {
            using (var http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("Authorization", oAuthHeader);

                var httpResp = await http.PostAsync(fullUrl, formData);
                var respBody = await httpResp.Content.ReadAsStringAsync();

                return respBody;
            }
        }


        protected virtual string GetJsonString(TwitterJsonElements twitterJsonElements)
        {
            return twitterJsonElements == null ? null :
                JsonConvert.SerializeObject(
                    value: twitterJsonElements,
                    settings: new JsonSerializerSettings()
                    {
                        NullValueHandling = NullValueHandling.Ignore
                    });
        }

        protected virtual string CreateOauthNonce() => Convert.ToBase64String(new ASCIIEncoding().GetBytes(DateTime.Now.Ticks.ToString()));

        protected virtual string GenerateOAuthHeader(Dictionary<string, string> data,string fullUrl)
        {
            // Timestamps are in seconds since 1/1/1970.
            var timestamp = (int)((DateTime.UtcNow - epochUtc).TotalSeconds);

            // Add all the OAuth headers we'll need to use when constructing the hash.
            data.Add("oauth_consumer_key", consumerKey);
            data.Add("oauth_signature_method", "HMAC-SHA1");
            data.Add("oauth_timestamp", timestamp.ToString());
            data.Add("oauth_nonce", CreateOauthNonce()); // Required, but Twitter doesn't appear to use it, so "a" will do.
            data.Add("oauth_token", accessToken);
            data.Add("oauth_version", "1.0");

            // Generate the OAuth signature and add it to our payload.
            data.Add("oauth_signature", GenerateSignature(fullUrl, data));

            return "OAuth " + string.Join(
                       ", ",
                       data
                           .Where(kvp => kvp.Key.StartsWith("oauth_"))
                           .Select(kvp => string.Format("{0}=\"{1}\"", Uri.EscapeDataString(kvp.Key), Uri.EscapeDataString(kvp.Value)))
                           .OrderBy(s => s)
                   );
        }

        protected virtual string GenerateSignature(string url, Dictionary<string, string> data)
        {
            var sigString = string.Join(
                "&",
                data.Union(data)
                    .Select(kvp => string.Format("{0}={1}", Uri.EscapeDataString(kvp.Key), Uri.EscapeDataString(kvp.Value)))
                    .OrderBy(s => s)
            );

            var fullSigData = string.Format(
                "{0}&{1}&{2}",
                "POST",
                Uri.EscapeDataString(url),
                Uri.EscapeDataString(sigString.ToString())
            );

            return Convert.ToBase64String(sigHasher.ComputeHash(new ASCIIEncoding().GetBytes(fullSigData.ToString())));
        }
    }
}