//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Net;
//using System.Net.Http;
//using System.Net.Http.Headers;
//using System.Text;
//using System.Threading.Tasks;
//namespace SocioBoardMailSenderServices.Helper
//{
//    public class WebApiHelper
//    {
//        public const string baseUrl = "http://api.socioboard.com";
//        public static async Task<HttpResponseMessage> GetReq(string Url, string AccessTokenType, string AccessToken)
//        {
//            HttpResponseMessage response = new HttpResponseMessage();
//            using (var client = new HttpClient())
//            {
//                client.BaseAddress = new Uri(baseUrl);
//                client.DefaultRequestHeaders.Accept.Clear();
//                if (!string.IsNullOrEmpty(AccessTokenType) && !string.IsNullOrEmpty(AccessToken))
//                {
//                    client.DefaultRequestHeaders.Add("Authorization", AccessTokenType + " " + AccessToken);
//                }
//                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
//                try
//                {
//                    response = client.GetAsync(Url).Result;
//                }
//                catch { }
//            }
//            return response;
//        }

//        public static async Task<HttpResponseMessage> DeleteReq(string Url, string AccessTokenType, string AccessToken)
//        {
//            HttpResponseMessage response = new HttpResponseMessage();
//            using (var client = new HttpClient())
//            {
//                client.BaseAddress = new Uri(baseUrl);
//                client.DefaultRequestHeaders.Accept.Clear();
//                if (!string.IsNullOrEmpty(AccessTokenType) && !string.IsNullOrEmpty(AccessToken))
//                {
//                    client.DefaultRequestHeaders.Add("Authorization", AccessTokenType + " " + AccessToken);
//                }
//                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
//                try
//                {
//                    response = client.DeleteAsync(Url).Result;
//                }
//                catch { }
//            }
//            return response;
//        }
//    }
//}
