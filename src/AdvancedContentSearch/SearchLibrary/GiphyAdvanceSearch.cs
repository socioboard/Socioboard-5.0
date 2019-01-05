using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using AdvancedContentSearch.Helper;
using AdvancedContentSearch.Model;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;

namespace AdvancedContentSearch.SearchLibrary
{
    public static class GiphyAdvanceSearch
    {
        public static void GiphySearch()
        {
            var imagedata = GetGiphyHtmlContent();
            var shareData = JObject.Parse(imagedata);
            foreach (var item in shareData["data"])
            {           
                try
                {
                    var mongoreppo = new MongoRepository("AdvanceSerachData");
                    var advanceSearchData =
                        new Domain.Socioboard.Models.Mongo.AdvanceSerachData
                        {
                            Id = ObjectId.GenerateNewId(),
                            strId = ObjectId.GenerateNewId().ToString(),
                            domainType = item.SelectToken("source_tld")?.ToString(),
                            postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending,
                            networkType = Domain.Socioboard.Enum.NetworkType.giphy,
                            ImageUrl = item["images"]["preview_gif"]["url"].ToString(),
                            postUrl = item.SelectToken("source_post_url")?.ToString(),
                            title = item.SelectToken("slug")?.ToString(),                  
                            postId = item.SelectToken("id")?.ToString(),
                            userName = item.SelectToken("username")?.ToString(),                            
                            postedTime = double.Parse(item.SelectToken("datetime")?.ToString() ??
                                                      SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)
                                                          .ToString(CultureInfo.InvariantCulture))
                        };

                    var count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == advanceSearchData.postUrl);
                    if (count == 0)                   
                        mongoreppo.Add(advanceSearchData);                   
                }
                catch (Exception e) {
                    Console.WriteLine(e.Message);
                }
            }
        }

        public static string GetGiphyHtmlContent()
        {
            var output = string.Empty;
            var searchUrl = "https://api.giphy.com/v1/gifs/trending?api_key=" + AppSetting.giphyapikey + "&limit=50&rating=Y";
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(searchUrl);
            httpWebRequest.Method = "GET";
            httpWebRequest.Credentials = CredentialCache.DefaultCredentials;
            httpWebRequest.AllowWriteStreamBuffering = true;
            httpWebRequest.ServicePoint.Expect100Continue = false;
            httpWebRequest.PreAuthenticate = false;

            try
            {
                using (var response = httpWebRequest.GetResponse())
                {
                    var responseStream = response.GetResponseStream();

                    if (responseStream != null)
                    {
                        using (var stream = new StreamReader(responseStream, Encoding.GetEncoding(1252)))
                        {
                            output = stream.ReadToEnd();
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            return output;
        }
    }
}
