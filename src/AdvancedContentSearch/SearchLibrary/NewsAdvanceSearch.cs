using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using AdvancedContentSearch.Helper;
using AdvancedContentSearch.Model;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;

namespace AdvancedContentSearch.SearchLibrary
{
    public static class NewsAdvanceSearch
    {
        public static void NewsSearch()
        {
            string newsources = getHtmlfromUrl("https://newsapi.org/v1/sources?language=en");
            JObject newssource = JObject.Parse(newsources);
            foreach (var item in newssource["sources"])
            {
                new Thread(delegate ()
                {
                    fetchsourcedata(item);
                }).Start();
            }
        }

        private static void fetchsourcedata(JToken item)
        {
            try
            {
                string sourceid = item["id"].ToString();
                string domainUrl = item["url"].ToString();
                string category = item["category"].ToString();
                string newsdataurl = "https://newsapi.org/v1/articles?source=" + sourceid + "&sortBy=latest&apiKey=" + AppSetting.newsapikey;
                string newdatas = getHtmlfromUrl(newsdataurl);
                if (string.IsNullOrEmpty(newdatas))
                {
                    newsdataurl = "https://newsapi.org/v1/articles?source=" + sourceid + "&sortBy=top&apiKey=" + AppSetting.newsapikey;
                    newdatas = getHtmlfromUrl(newsdataurl);
                }
                JObject newsdata = JObject.Parse(newdatas);
                foreach (var item_newsdata in newsdata["articles"])
                {
                    try
                    {
                        MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                        Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                        _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                        _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                        _AdvanceSerachData.domainType = domainUrl;
                        _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                        if (category == "general")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.general;
                        }
                        if (category == "technology")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.technology;
                        }
                        if (category == "sport")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.sport;
                        }
                        if (category == "business")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.business;
                        }
                        if (category == "politics")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.politics;
                        }
                        if (category == "entertainment")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.entertainment;
                        }
                        if (category == "gaming")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.gaming;
                        }
                        if (category == "music")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.music;
                        }
                        if (category == "science-and-nature")
                        {
                            _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.science_and_nature;
                        }
                        try
                        {
                            _AdvanceSerachData.postUrl = item_newsdata["url"].ToString();
                            _AdvanceSerachData.ImageUrl = item_newsdata["urlToImage"].ToString();
                            long fbengagementCount = TwitterAdvanceSearch.fbShareCount(_AdvanceSerachData.postUrl);
                            long redditShare = TwitterAdvanceSearch.redditShareCount(_AdvanceSerachData.postUrl);

                            // string datacount = TwitterAdvanceSearch.getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + _AdvanceSerachData.postUrl);
                            // JObject shareData = JObject.Parse(datacount);
                            //long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                            //long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                            //long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                            //long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());

                            long pinshare = TwitterAdvanceSearch.pinShareCount(_AdvanceSerachData.postUrl);
                            long linshare = TwitterAdvanceSearch.linShareCount(_AdvanceSerachData.postUrl);
                            long twittershare = 0;
                            long gplusshare = TwitterAdvanceSearch.GetPlusOnes(_AdvanceSerachData.postUrl);


                            _AdvanceSerachData.pinShareCount = pinshare;
                            _AdvanceSerachData.gplusShareCount = gplusshare;
                            _AdvanceSerachData.linShareCount = linshare;
                            _AdvanceSerachData.twtShareCount = twittershare;
                            _AdvanceSerachData.redditShareCount = redditShare;
                            _AdvanceSerachData.fbengagementCount = fbengagementCount;
                            _AdvanceSerachData.totalShareCount = Convert.ToInt64(pinshare + gplusshare + linshare + twittershare + redditShare + fbengagementCount);
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.title = item_newsdata["title"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.postdescription = item_newsdata["description"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.userName = item_newsdata["author"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.postedTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(new DateTime(1970, 1, 1).AddSeconds(Convert.ToInt64(item_newsdata["publishedAt"].ToString())));

                            _AdvanceSerachData.publishDate = item_newsdata["publishedAt"].ToString();
                        }
                        catch
                        {
                            _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                            _AdvanceSerachData.publishDate =DateTime.Now.ToString(CultureInfo.InvariantCulture);
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
                    catch (Exception ex)
                    {

                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public static string getHtmlfromUrl(string Url)
        {
            string output = string.Empty;
            string facebookSearchUrl = Url;
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
