using AdvanceSerachData.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace TwitterSearch.TwitterSearch
{
    public class DailyMotionAdvanceSearch
    {
        public static void DailyMotionSearch()
        {
            DatabaseRepository dbr = new DatabaseRepository();
            List<Discovery> lst_discovery = dbr.Find<Discovery>(t => t.SearchKeyword != "").ToList();
            foreach (var itemdis in lst_discovery)
            {
                new Thread(delegate ()
                {
                    fetchdata(itemdis);
                }).Start();

            }
        }

        private static void fetchdata(Discovery itemdis)
        {
            MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
            try
            {
                string _dailymotionpostRestUrl = "https://api.dailymotion.com/videos/?search=" + itemdis.SearchKeyword + "&fields=id,title,created_time,url,description,owner.username, owner.screenname, owner.fullname,owner.url, owner.avatar_25_url, owner.avatar_60_url, owner.avatar_80_url, owner.avatar_120_url, owner.avatar_190_url, owner.avatar_240_url, owner.avatar_360_url, owner.avatar_480_url, owner.avatar_720_url";

                string response = WebRequst(_dailymotionpostRestUrl);

                var jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in jdata["list"])
                {
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "http://www.dailymotion.com/in";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.video;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.dailymotion;
                    try
                    {
                        _AdvanceSerachData.userName = item["owner.username"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.userName = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postId = "";
                    }
                    try
                    {
                        _AdvanceSerachData.title = item["title"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.title = "";
                    }
                    try
                    {
                        _AdvanceSerachData.videourl = item["url"].ToString();
                        long fbengagementCount = TwitterAdvanceSearch.fbShareCount(_AdvanceSerachData.videourl);
                        long redditShare = TwitterAdvanceSearch.redditShareCount(_AdvanceSerachData.videourl);
                        string datacount = TwitterAdvanceSearch.getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + _AdvanceSerachData.videourl);
                        JObject shareData = JObject.Parse(datacount);
                        long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                        long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                        long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                        long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());
                        _AdvanceSerachData.postUrl = _AdvanceSerachData.videourl;
                        _AdvanceSerachData.pinShareCount = pinshare;
                        _AdvanceSerachData.gplusShareCount = gplusshare;
                        _AdvanceSerachData.linShareCount = linshare;
                        _AdvanceSerachData.twtShareCount = twittershare;
                        _AdvanceSerachData.redditShareCount = redditShare;
                        _AdvanceSerachData.fbengagementCount = fbengagementCount;
                        _AdvanceSerachData.totalShareCount = Convert.ToInt64(pinshare + gplusshare + linshare + twittershare + redditShare + fbengagementCount);
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.videourl = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postdescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postdescription = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postedTime = double.Parse(item["created_time"].ToString());
                    }
                    catch (Exception ex)
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
                        var update = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Update.Set(t => t.linShareCount, _AdvanceSerachData.linShareCount).Set(t => t.pinShareCount, _AdvanceSerachData.pinShareCount)
                           .Set(t => t.redditShareCount, _AdvanceSerachData.redditShareCount)
                           .Set(t => t.twtShareCount, _AdvanceSerachData.twtShareCount)
                           .Set(t => t.gplusShareCount, _AdvanceSerachData.gplusShareCount)
                           .Set(t => t.fbengagementCount, _AdvanceSerachData.fbengagementCount)
                          .Set(t => t.totalShareCount, _AdvanceSerachData.totalShareCount);
                        mongoreppo.Update<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(update, t => t.postUrl == _AdvanceSerachData.postUrl);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public static string WebRequst(string Url)
        {

            try
            {
                HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(Url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/json; charset=utf-8";
                HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                StreamReader responseStreamReader = new StreamReader(responseStream, System.Text.Encoding.Default);
                string pageContent = responseStreamReader.ReadToEnd();
                responseStreamReader.Close();
                responseStream.Close();
                httResponse.Close();
                return pageContent;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}
