using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.Youtube.Core;
using SocioboardDataServices.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Youtube
{
    public class YtDataServices
    {
        public void UpdateYtAccount()
        {
            {
                while (true)
                {

                    try
                    {

                        Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                        string apiKey = AppSettings.googleApiKey;
                        oAuthTokenYoutube ObjoAuthTokenYtubes = new oAuthTokenYoutube(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                        oAuthToken objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                        Video ObjVideo = new Video(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);

                        JObject userinfo = new JObject();
                        List<Domain.Socioboard.Models.YoutubeChannel> lstYtChannels = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.IsActive).ToList();
                        long count = 0;
                        Console.WriteLine("---------------- Youtube Dataservices Started ----------------");
                        foreach (var item in lstYtChannels)
                        {
                            List<Domain.Socioboard.Models.Groupprofiles> _grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(item.YtubeChannelId)).ToList();
                            try
                            {
                                if (item.LastUpdate.AddHours(1) <= DateTime.UtcNow)
                                {
                                    if (item.IsActive)
                                    {
                                        try
                                        {
                                            //string objRefresh = ObjoAuthTokenYtubes.GetAccessToken(item.RefreshToken);
                                            //JObject objaccesstoken = JObject.Parse(objRefresh);
                                            //string access_token = objaccesstoken["access_token"].ToString();

                                            string ChannelInfo = ObjVideo.GetChannelInfo(apiKey, item.YtubeChannelId);
                                            JObject JChannelInfo = JObject.Parse(ChannelInfo);

                                            try
                                            {
                                                string cmntsCount = ObjVideo.GetChannelCmntCount(apiKey, item.YtubeChannelId);
                                                JObject JcmntsCount = JObject.Parse(cmntsCount);

                                                try
                                                {
                                                    item.CommentsCount = Convert.ToDouble(JcmntsCount["pageInfo"]["totalResults"]);
                                                }
                                                catch
                                                {

                                                }
                                            }
                                            catch { }

                                            foreach (var ittem in JChannelInfo["items"])
                                            {

                                                try
                                                {
                                                    item.YtubeChannelName = ittem["snippet"]["title"].ToString();
                                                    _grpProfile.Select(s => { s.profileName = ittem["snippet"]["title"].ToString(); return s; }).ToList();
                                                   
                                                }
                                                catch
                                                {

                                                }
                                                try
                                                {
                                                    item.ChannelpicUrl = Convert.ToString(ittem["snippet"]["thumbnails"]["default"]["url"]).Replace(".jpg","");
                                                    _grpProfile.Select(s => { s.profilePic = Convert.ToString(ittem["snippet"]["thumbnails"]["default"]["url"]).Replace(".jpg", ""); return s; }).ToList();
                                                }
                                                catch
                                                {

                                                }
                                                try
                                                {
                                                    item.YtubeChannelDescription = Convert.ToString(ittem["snippet"]["description"]);
                                                    if (item.YtubeChannelDescription == "")
                                                    {
                                                        item.YtubeChannelDescription = "No Description";
                                                    }
                                                }
                                                catch
                                                {

                                                }
                                                //try
                                                //{
                                                //    item.CommentsCount = Convert.ToDouble(ittem["statistics"]["commentCount"]);
                                                //}
                                                //catch
                                                //{

                                                //}
                                                try
                                                {
                                                    item.SubscribersCount = Convert.ToDouble(ittem["statistics"]["subscriberCount"]);
                                                }
                                                catch
                                                {

                                                }
                                                try
                                                {
                                                    item.VideosCount = Convert.ToDouble(ittem["statistics"]["videoCount"]);

                                                }
                                                catch
                                                {

                                                }
                                                try
                                                {
                                                    item.ViewsCount = Convert.ToDouble(ittem["statistics"]["viewCount"]);

                                                }
                                                catch
                                                {

                                                }

                                                dbr.Update<Domain.Socioboard.Models.YoutubeChannel>(item);
                                                foreach (var item_grpProfile in _grpProfile)
                                                {
                                                    dbr.Update<Domain.Socioboard.Models.Groupprofiles>(item_grpProfile);
                                                }

                                                Youtube.YtFeeds.GetYtFeeds(item.YtubeChannelId, "");

                                                item.LastUpdate = DateTime.UtcNow;
                                                dbr.Update<Domain.Socioboard.Models.YoutubeChannel>(item);
                                            }
                                        }
                                        catch (Exception)
                                        {
                                            Thread.Sleep(600000);
                                        }
                                    }
                                }

                            }
                            catch (Exception ex)
                            {
                                Thread.Sleep(600000);
                            }


                            long oldcount = count;
                            count++;
                            long newcount = count;
                            long totalcount = lstYtChannels.Count();
                            long percentagenew = (newcount * 100) / totalcount;
                            long percentageold = (oldcount * 100) / totalcount;
                            if (percentagenew != percentageold)
                            {
                                Console.WriteLine("---------------- {0}% Completed ----------------", percentagenew);
                            }
                        }
                        Thread.Sleep(600000);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("issue in web api calling" + ex.StackTrace);
                        Thread.Sleep(600000);
                    }
                }
            }
        }
    }
}
