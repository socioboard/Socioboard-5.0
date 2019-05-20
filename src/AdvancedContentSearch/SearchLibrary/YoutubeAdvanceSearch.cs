using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using AdvancedContentSearch.Helper;
using AdvancedContentSearch.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;

namespace AdvancedContentSearch.SearchLibrary
{
    public class YoutubeAdvanceSearch
    {
        public static void YoutubeSearch()
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
                string youtubesearchurl = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&order=relevance&q=" + itemdis.SearchKeyword + "&key=" + AppSetting.youtubeKey;
                string response = WebRequst(youtubesearchurl);
                var Jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in Jdata["items"])
                {
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "https://www.youtube.com/";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.video;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.youtube;
                    try
                    {
                        _AdvanceSerachData.userName = item["snippet"]["channelTitle"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.userName = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postId = item["id"]["videoId"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postId = "";
                    }
                    try
                    {
                        _AdvanceSerachData.title = item["snippet"]["title"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.title = "";
                    }
                    try
                    {
                        _AdvanceSerachData.videourl = "https://www.youtube.com/watch?v=" + _AdvanceSerachData.postId;
                        long fbengagementCount = TwitterAdvanceSearch.fbShareCount(_AdvanceSerachData.videourl);
                        long redditShare = TwitterAdvanceSearch.redditShareCount(_AdvanceSerachData.videourl);
                        //string datacount = TwitterAdvanceSearch.getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + _AdvanceSerachData.videourl);
                        //JObject shareData = JObject.Parse(datacount);
                        //long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                        //long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                        //long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                        //long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());

                        long pinshare = TwitterAdvanceSearch.pinShareCount(_AdvanceSerachData.postUrl);
                        long linshare = TwitterAdvanceSearch.linShareCount(_AdvanceSerachData.postUrl);
                        long twittershare = 0;
                        long gplusshare = TwitterAdvanceSearch.GetPlusOnes(_AdvanceSerachData.postUrl);

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
                        _AdvanceSerachData.postdescription = item["snippet"]["description"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postdescription = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp((DateTime.Parse(item["snippet"]["publishedAt"].ToString())));
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
