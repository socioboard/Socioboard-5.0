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
    public static class PixabayAdvanceSearch
    {
        public static void pixabaysearch()
        {
            string Imagedata = getHtmlfromUrl();
            JObject shareData = JObject.Parse(Imagedata);
            foreach (var item in shareData["hits"])
            {
                MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                _AdvanceSerachData.domainType = "https://pixabay.com/";
                _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.pixabay;
                try
                {
                    _AdvanceSerachData.ImageUrl = item["previewURL"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.title = item["tags"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.userName = item["user"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.postUrl = item["pageURL"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.postId = item["id"].ToString();
                }
                catch { }
                try
                {
                    _AdvanceSerachData.postedTime = double.Parse(item["datetime"].ToString());
                }
                catch
                {
                    _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                }
                try
                {
                    _AdvanceSerachData.totalShareCount = Convert.ToInt32(item["comments"].ToString())+ Convert.ToInt32(item["likes"].ToString())+ Convert.ToInt32(item["favorites"].ToString());
                }
                catch (Exception ex)
                {

                }
                int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postId == _AdvanceSerachData.postId);
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
            string facebookSearchUrl = "https://pixabay.com/api/?key=" + AdvanceSerachData.Helper.AppSetting.pixabayapikey + "&image_type=photo&pretty=true&order=latest";
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
