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
    public static class PixabayAdvanceSearch
    {
        public static void PixaBaySearch()
        {
            var imageData = GetPixaBayHtmlContent();

            var shareData = JObject.Parse(imageData);

            foreach (var item in shareData["hits"])
            {
                var mongoreppo = new MongoRepository("AdvanceSerachData");

                var advanceSearchData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData
                {
                    Id = ObjectId.GenerateNewId(),
                    strId = ObjectId.GenerateNewId().ToString(),
                    domainType = "https://pixabay.com/",
                    postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending,
                    networkType = Domain.Socioboard.Enum.NetworkType.pixabay
                };
                try
                {
                    advanceSearchData.ImageUrl = item.SelectToken("previewURL")?.ToString();
                    advanceSearchData.title = item.SelectToken("tags")?.ToString();
                    advanceSearchData.userName = item.SelectToken("user")?.ToString();
                    advanceSearchData.postUrl = item.SelectToken("pageURL")?.ToString();
                    advanceSearchData.postId = item.SelectToken("id")?.ToString();
                    advanceSearchData.postedTime = double.Parse(item.SelectToken("datetime")?.ToString() ?? SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow).ToString(CultureInfo.InvariantCulture));
                    advanceSearchData.totalShareCount = Convert.ToInt32(item.SelectToken("comments")?.ToString() ?? "0") + Convert.ToInt32(item.SelectToken("likes")?.ToString() ?? "0") + Convert.ToInt32(item.SelectToken("favorites")?.ToString() ?? "0");                    
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message); 
                }                           

                var count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postId == advanceSearchData.postId);

                if (count == 0)               
                    mongoreppo.Add(advanceSearchData);
                               
            }
        }

        public static string GetPixaBayHtmlContent()
        {
            var output = string.Empty;
            var searchUrl = "https://pixabay.com/api/?key=" + AppSetting.pixabayapikey + "&image_type=photo&pretty=true&order=latest";
            var pixaBayObject = (HttpWebRequest)WebRequest.Create(searchUrl);
            pixaBayObject.Method = "GET";
            pixaBayObject.Credentials = CredentialCache.DefaultCredentials;
            pixaBayObject.AllowWriteStreamBuffering = true;
            pixaBayObject.ServicePoint.Expect100Continue = false;
            pixaBayObject.PreAuthenticate = false;

            try
            {
                using (var response = pixaBayObject.GetResponse())
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
