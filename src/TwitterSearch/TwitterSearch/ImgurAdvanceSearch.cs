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
    public static class ImgurAdvanceSearch
    {
        public static void ingursearch()
        {
            string Imagedata = getHtmlfromUrl();
            JObject shareData = JObject.Parse(Imagedata);
            foreach (var item in shareData["data"])
            {
                string type = string.Empty;
                try
                {
                     type= item["type"].ToString();
                }
                catch ( Exception ex)
                {
                    type = "";
                }
                if(!string.IsNullOrEmpty(type))
                {
                    MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "http://imgur.com/";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.imgur;
                    try
                    {
                        _AdvanceSerachData.ImageUrl = item["link"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.title = item["title"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postdescription = item["description"].ToString();
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
                        _AdvanceSerachData.totalShareCount = Convert.ToInt32(item["comment_count"].ToString());
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
        }
        public static string getHtmlfromUrl()
        {
            string output = string.Empty;
            string facebookSearchUrl = "https://api.imgur.com/3/gallery/top/top/all/1?showViral=all";
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            facebooklistpagerequest.Headers.Add("Authorization", "Client-ID 5f1ad42ec5988b7");
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
