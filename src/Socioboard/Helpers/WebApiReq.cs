using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Socioboard.Helpers
{
    public static class WebApiReq
    {
        public static async Task<HttpResponseMessage> PostReq(string Url, List<KeyValuePair<string, string>> Parameters, string AccessTokenType, string AccessToken, string BaseUrl)
        {
            HttpResponseMessage response;
            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri(BaseUrl);
                // client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("contentType", "application/x-www-form-urlencoded");
                client.DefaultRequestHeaders.Add("Accept", "application/json");
                if (string.IsNullOrEmpty(AccessTokenType) && !string.IsNullOrEmpty(AccessToken))
                {
                    client.DefaultRequestHeaders.Add("Authorization", AccessTokenType + " " + AccessToken);
                }
                var content = new FormUrlEncodedContent(Parameters);
                response = await client.PostAsync(Url, content);
            }
            return response;
        }

        public static async Task<HttpResponseMessage> GetReq(string Url, string AccessTokenType, string AccessToken, string BaseUrl)
        {
            HttpResponseMessage response;
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(BaseUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                if (!string.IsNullOrEmpty(AccessTokenType) && !string.IsNullOrEmpty(AccessToken))
                {
                    client.DefaultRequestHeaders.Add("Authorization", AccessTokenType + " " + AccessToken);
                }
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                response = await client.GetAsync(Url);
            }
            return response;
        }
    }
}
