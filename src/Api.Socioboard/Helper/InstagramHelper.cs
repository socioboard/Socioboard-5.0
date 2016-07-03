using Newtonsoft.Json.Linq;
using Socioboard.Instagram.Instagram.Core.MediaMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public class InstagramHelper
    {
        public static List<Domain.Socioboard.Models.InstagramDiscoveryFeed> DiscoverySearchinstagram(string Keyword,string accesstoken ,string Client_id)
        {
            Domain.Socioboard.Models.InstagramDiscoveryFeed _InstagramFeed;
            List<Domain.Socioboard.Models.InstagramDiscoveryFeed> lstInstagramFeed = new List<Domain.Socioboard.Models.InstagramDiscoveryFeed>();
            Media _Media = new Media();
            try
            {
                string ret = _Media.ActivitySearchByTag(Keyword, accesstoken, Client_id);
                JObject Jdata = JObject.Parse(ret);
                foreach (var item in Jdata["data"])
                {
                    try
                    {
                        _InstagramFeed = new Domain.Socioboard.Models.InstagramDiscoveryFeed();
                        try
                        {
                            _InstagramFeed.Type = item["type"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.FeedDate = item["created_time"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.FeedUrl = item["link"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.LikeCount = Int32.Parse(item["likes"]["count"].ToString());
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.CommentCount = Int32.Parse(item["comments"]["count"].ToString());
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.FeedImageUrl = item["images"]["thumbnail"]["url"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.Feed = item["caption"]["text"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.FeedId = item["caption"]["id"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.FromId = item["caption"]["from"]["id"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.ImageUrl = item["caption"]["from"]["profile_picture"].ToString();
                        }
                        catch { }
                        try
                        {
                            _InstagramFeed.AdminUser = item["caption"]["from"]["username"].ToString();
                        }
                        catch { }
                        if (_InstagramFeed.Type == "video")
                        {
                            try
                            {
                                _InstagramFeed.VideoUrl = item["videos"]["low_resolution"]["url"].ToString();
                            }
                            catch { }
                        }
                        lstInstagramFeed.Add(_InstagramFeed);
                    }
                    catch (Exception ex)
                    {
                    }
                }

                return lstInstagramFeed;
            }
            catch (Exception)
            {

                return null;
            }
        }
    }
}
