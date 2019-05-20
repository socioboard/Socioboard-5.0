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
    public static class ImgurAdvanceSearch
    {
        public static void ImgurSearch()
        {
            var imagedata = GetImgurHtmlContent();
            var shareData = JObject.Parse(imagedata);
            foreach (var item in shareData["data"])
            {
                var type = item.SelectToken("type")?.ToString();

                if (string.IsNullOrEmpty(type))
                    continue;

                var mongoreppo = new MongoRepository("AdvanceSerachData");

                try
                {
                    var advanceSearchData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData
                    {
                        Id = ObjectId.GenerateNewId(),
                        strId = ObjectId.GenerateNewId().ToString(),
                        domainType = "http://imgur.com/",
                        postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending,
                        networkType = Domain.Socioboard.Enum.NetworkType.imgur,
                        ImageUrl = item.SelectToken("link")?.ToString(),
                        title = item.SelectToken("title")?.ToString(),
                        postdescription = item.SelectToken("description")?.ToString(),
                        postId = item.SelectToken("id")?.ToString(),
                        postedTime = double.Parse(item.SelectToken("datetime")?.ToString() ??
                                                      SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)
                                                          .ToString(CultureInfo.InvariantCulture)),
                        totalShareCount = Convert.ToInt32(item.SelectToken("comment_count")?.ToString())
                    };
                    var count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postId == advanceSearchData.postId);

                    if (count == 0)
                        mongoreppo.Add(advanceSearchData);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

            }
        }
        public static string GetImgurHtmlContent()
        {
            var output = string.Empty;
            var searchUrl = "https://api.imgur.com/3/gallery/top/top/all/1?showViral=all";
            var imgurRequest = (HttpWebRequest)WebRequest.Create(searchUrl);
            imgurRequest.Method = "GET";
            imgurRequest.Credentials = CredentialCache.DefaultCredentials;
            imgurRequest.AllowWriteStreamBuffering = true;
            imgurRequest.ServicePoint.Expect100Continue = false;
            imgurRequest.PreAuthenticate = false;
            imgurRequest.Headers.Add("Authorization", AppSetting.imgurApi);
            try
            {
                using (var response = imgurRequest.GetResponse())
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
