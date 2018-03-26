using AdvanceSerachData.Model;
using Domain.Socioboard.Models;
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
    public class GplusAdvanceSearch
    {
        public static void GooglePlusSearch()
        {
            DatabaseRepository dbr = new DatabaseRepository();
            List<Discovery> lst_discovery = dbr.Find<Discovery>(t => t.SearchKeyword != "").ToList();
            MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");

            List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> GplusAdvanceSearch = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();
            foreach (var itemdis in lst_discovery)
            {
                string profileid = string.Empty;
                try
                {
                    //string searchResultObj = GplusDiscoverySearchHelper.GooglePlus(keyword);

                    JObject GplusActivities = JObject.Parse(GooglePlus(itemdis.SearchKeyword));

                    foreach (JObject gobj in JArray.Parse(GplusActivities["items"].ToString()))
                    {
                        Domain.Socioboard.Models.Mongo.AdvanceSerachData gpadvanceSearch = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                        try
                        {
                            gpadvanceSearch.postUrl = gobj["url"].ToString();
                            
                        }
                        catch { }
                        try
                        {
                            gpadvanceSearch.ImageUrl = gobj["object"]["attachments"][0]["fullImage"]["url"].ToString();
                            
                        }
                        catch 
                        {

                        }
                        try
                        {
                            gpadvanceSearch.title = gobj["title"].ToString();

                        }
                        catch
                        {

                        }
                        try
                        {
                            gpadvanceSearch.postId = gobj["actor"]["id"].ToString();
                        }
                        catch
                        {

                        }
                        try
                        {
                            gpadvanceSearch.userName = gobj["actor"]["displayName"].ToString();
                        }
                        catch
                        {

                        }
                        try
                        {
                            // gpadvanceSearch.postedTime = DateTime.Parse(gobj["published"].ToString());
                            gpadvanceSearch.postedTime  = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(gobj["published"].ToString()));

                        }
                        catch
                        {

                        }




                        //gpadvanceSearch.postedTime = DateTime.Parse(gobj["published"].ToString());


                        //gpadvanceSearch.postdescription = gobj["actor"]["displayName"].ToString();


                        // gpadvanceSearch.ImageUrl

                        int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == gpadvanceSearch.postUrl);
                        if (count == 0)
                        {
                            mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(gpadvanceSearch);
                        }
                        else
                        {

                        }
                    }
                }
                catch { }
            }
           
        }


        public static string GooglePlus(string keyword)
        {
            string ret = string.Empty;
            try
            {
                string Key = AdvanceSerachData.Helper.AppSetting.GplusKey;

                string RequestUrl = "https://www.googleapis.com/plus/v1/activities?query=" + keyword + "&maxResults=20&orderBy=best&key=" + Key;



                var gpluslistpagerequest = (HttpWebRequest)WebRequest.Create(RequestUrl);
                gpluslistpagerequest.Method = "GET";
                string response = string.Empty;
                try
                {
                    using (var gplusresponse = gpluslistpagerequest.GetResponse())
                    {
                        using (var stream = new StreamReader(gplusresponse.GetResponseStream(), Encoding.GetEncoding(1252)))
                        {
                            response = stream.ReadToEnd();

                        }
                    }
                }
                catch (Exception ex)
                {

                }

                return response;
            }
            catch (Exception ex)
            {

            }

            return ret;
        }
    }
}
