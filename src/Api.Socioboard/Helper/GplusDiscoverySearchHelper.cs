
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;


namespace Api.Socioboard.Helper
{
    public static class GplusDiscoverySearchHelper
    {
        public static string GooglePlus(string keyword)
        {
            string ret = string.Empty;
            try
            {
                string Key = "AIzaSyASmXtuaErvVC0FGblSLUAzRcxRXLlBsgE";
                
                string RequestUrl = "https://www.googleapis.com/plus/v1/activities?query=" + keyword + "&maxResults=20&orderBy=best&key=" + Key;



                var gpluslistpagerequest = (HttpWebRequest)WebRequest.Create(RequestUrl);
                gpluslistpagerequest.Method = "GET";
                string response = string.Empty;
                try
                {
                    using (var gplusresponse = gpluslistpagerequest.GetResponse())
                    {
                        using (var stream = new StreamReader(gplusresponse.GetResponseStream(), Encoding.GetEncoding(1256)))
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


        public static List<Domain.Socioboard.ViewModels.DiscoveryViewModal> DiscoverySearchGplus(long userId,string keyword)
        {
            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> GplusDiscoverySearch = new List<Domain.Socioboard.ViewModels.DiscoveryViewModal>();
            string profileid = string.Empty;
            try
            {
                string searchResultObj = GplusDiscoverySearchHelper.GooglePlus(keyword);

                JObject GplusActivities = JObject.Parse(GplusDiscoverySearchHelper.GooglePlus(keyword));

                foreach (JObject gobj in JArray.Parse(GplusActivities["items"].ToString()))
                {
                    Domain.Socioboard.ViewModels.DiscoveryViewModal gpfeed = new Domain.Socioboard.ViewModels.DiscoveryViewModal();
                    try
                    {
                        gpfeed.MessageId = gobj["url"].ToString();
                        gpfeed.CreatedTime = DateTime.Parse(gobj["published"].ToString());
                        gpfeed.Message = gobj["title"].ToString();
                        gpfeed.FromId = gobj["actor"]["id"].ToString();
                        gpfeed.FromName = gobj["actor"]["displayName"].ToString();
                        gpfeed.ProfileImageUrl = gobj["actor"]["image"]["url"].ToString();
                    }
                    catch { }

                    GplusDiscoverySearch.Add(gpfeed);
                }
            }
            catch { }
            return GplusDiscoverySearch;
        }

    }
}