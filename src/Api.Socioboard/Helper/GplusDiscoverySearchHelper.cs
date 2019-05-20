
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;


namespace Api.Socioboard.Helper
{
    /// <summary>
    /// 
    /// </summary>
    public static class GplusDiscoverySearchHelper
    {
      
        /// <summary>
        /// 
        /// </summary>
        /// <param name="keyword"></param>
        /// <param name="googleRssApiKey"></param>
        /// <returns></returns>
        public static string GooglePlus(string keyword, string googleRssApiKey)
        {
            var ret = string.Empty;
            try
            {              
                var requestUrl = "https://www.googleapis.com/plus/v1/activities?query=" + keyword + "&maxResults=20&orderBy=best&key=" + googleRssApiKey;

                var gPlusResponse = (HttpWebRequest)WebRequest.Create(requestUrl);

                gPlusResponse.Method = "GET";

                var response = string.Empty;

                try
                {
                    using (var gResponse = gPlusResponse.GetResponse())
                    {
                        var responseStream = gResponse.GetResponseStream();

                        if (responseStream == null)
                            response = "";
                        else
                        {
                            using (var stream = new StreamReader(responseStream, Encoding.GetEncoding(1256)))
                            {
                                response = stream.ReadToEnd();
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    //ignored
                }

                return response;
            }
            catch (Exception)
            {
                //ignored
            }

            return ret;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="keyword"></param>
        /// <param name="googleDiscoverApi"></param>
        /// <returns></returns>
        public static List<Domain.Socioboard.ViewModels.DiscoveryViewModal> DiscoverySearchGplus(long userId, string keyword , string googleDiscoverApi)
        {
            var gPlusDiscoverySearch = new List<Domain.Socioboard.ViewModels.DiscoveryViewModal>();

            try
            {
                var searchResultObj = GooglePlus(keyword, googleDiscoverApi);

                var gPlusActivities = JObject.Parse(searchResultObj);

                foreach (var googleActivity in JArray.Parse(gPlusActivities["items"].ToString()))
                {
                    var feeds = new Domain.Socioboard.ViewModels.DiscoveryViewModal();
                    try
                    {
                        feeds.MessageId = googleActivity["url"].ToString();
                        feeds.CreatedTime = DateTime.Parse(googleActivity["published"].ToString());
                        feeds.Message = googleActivity["title"].ToString();
                        feeds.FromId = googleActivity["actor"]["id"].ToString();
                        feeds.FromName = googleActivity["actor"]["displayName"].ToString();
                        feeds.ProfileImageUrl = googleActivity["actor"]["image"]["url"].ToString();
                    }
                    catch
                    {
                        //ignored
                    }

                    gPlusDiscoverySearch.Add(feeds);
                }
            }
            catch
            {
                //ignored
            }
            return gPlusDiscoverySearch;
        }

    }
}