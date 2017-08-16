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


namespace TwitterSearch
{
    public static class FlickrAdvanceSearch
    {
        public static void flickrSearch()
        {
            try
            {
                string Imagedata = getHtmlfromUrl();
                JObject shareData = JObject.Parse(Imagedata);
                foreach (var item in shareData["photos"]["photo"])
                {
                    MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "https://www.flickr.com/";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.flickr;
                    try
                    {
                        _AdvanceSerachData.ImageUrl = item["url_n"].ToString();
                        _AdvanceSerachData.postUrl= item["url_n"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.title = item["title"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postdescription = item["tags"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postId = item["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.userName = item["ownername"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postedTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item["datetaken"].ToString()));
                    }
                    catch {
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
            catch (Exception ex)
            {
                
            }
        }
        public static string getHtmlfromUrl()
        {
            string output = string.Empty;
            string facebookSearchUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key="+ AdvanceSerachData.Helper.AppSetting.flickrapkey + "&extras=date_upload%2C+date_taken%2C+owner_name%2C+icon_server%2C+original_format%2C+last_update%2C+geo%2C+tags%2C+machine_tags%2C+o_dims%2C+views%2C+media%2C+path_alias%2C+url_sq%2C+url_t%2C+url_s%2C+url_q%2C+url_m%2C+url_n%2C+url_z%2C+url_c%2C+url_l%2C+url_o&per_page=100&page=2&format=json&nojsoncallback=1";
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
