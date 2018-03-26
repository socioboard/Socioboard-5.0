using AdvanceSerachData.Model;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace TwitterSearch.TwitterSearch
{
    public static class GiphyAdvanceSearch
    {
        public static void giphysearch()
        {
            string Imagedata = getHtmlfromUrl();
            JObject shareData = JObject.Parse(Imagedata);
            foreach (var item in shareData["data"])
            {
                MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                _AdvanceSerachData.domainType = item["source_tld"].ToString();
                _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.giphy;
                try
                {
                    _AdvanceSerachData.ImageUrl = item["images"]["preview_gif"]["url"].ToString();
                    _AdvanceSerachData.postUrl = item["source_post_url"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.title = item["slug"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.postId = item["id"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.userName = item["username"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.postedTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item["trending_datetime"].ToString()));
                }
                catch
                {
                    _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                }
                int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                if (count == 0)
                {
                    mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                }
                else
                {

                }
            }
        }

        public static string getHtmlfromUrl()
        {
            string output = string.Empty;
            string facebookSearchUrl = "https://api.giphy.com/v1/gifs/trending?api_key=" + AdvanceSerachData.Helper.AppSetting.giphyapikey + "&limit=50&rating=Y";
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;

            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }
    }
}
