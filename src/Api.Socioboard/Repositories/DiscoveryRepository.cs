using Api.Socioboard.Model;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class DiscoveryRepository
    {
        public static List<Domain.Socioboard.ViewModels.DiscoveryViewModal> DiscoverySearchTwitter(long userId, long groupId, string keyword, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> iMmemDiscoveryViewModal = _redisCache.Get<List<Domain.Socioboard.ViewModels.DiscoveryViewModal>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryTwitter + keyword);
            if (iMmemDiscoveryViewModal != null && iMmemDiscoveryViewModal.Count > 0)
            {
                return iMmemDiscoveryViewModal;
            }
            else
            {
                oAuthTwitter oauth = new oAuthTwitter();
                Domain.Socioboard.Models.Discovery _discovery = new Domain.Socioboard.Models.Discovery();
                List<Domain.Socioboard.Models.TwitterAccount> lsttwtaccount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.oAuthSecret != null).Take(20).ToList();
                List<Domain.Socioboard.Models.Discovery> lstdiscovery = dbr.Find<Domain.Socioboard.Models.Discovery>(t => t.SearchKeyword.Equals(keyword) && t.userId == userId).ToList();
                if (lstdiscovery.Count == 0)
                {
                    _discovery.createTime = DateTime.UtcNow;
                    _discovery.GroupId = groupId;
                    _discovery.SearchKeyword = keyword;
                    _discovery.userId = userId;
                    dbr.Add(_discovery);
                }
                foreach (Domain.Socioboard.Models.TwitterAccount item in lsttwtaccount)
                {
                    oauth.AccessToken = item.oAuthToken;
                    oauth.AccessTokenSecret = item.oAuthSecret;
                    oauth.TwitterUserId = item.twitterUserId;
                    oauth.TwitterScreenName = item.twitterScreenName;
                    SetCofigDetailsForTwitter(oauth, _appSeetings);

                    try
                    {
                        Users _Users = new Users();
                        JArray _AccountVerify = _Users.Get_Account_Verify_Credentials(oauth);
                        string id = (string)(_AccountVerify[0]["id_str"]);
                        break;
                    }
                    catch (Exception ex)
                    {

                    }

                }
                List<Domain.Socioboard.ViewModels.DiscoveryViewModal> lstdiscoveryDiscoveryViewModal = Helper.TwitterHelper.DiscoverySearchTwitter(oauth, keyword, userId, groupId);
                if (lstdiscoveryDiscoveryViewModal.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryTwitter + keyword, lstdiscoveryDiscoveryViewModal);

                }
                return lstdiscoveryDiscoveryViewModal;
            }

        }

        public static void SetCofigDetailsForTwitter(oAuthTwitter OAuth, Helper.AppSettings _appSettings)
        {
            OAuth.ConsumerKey = _appSettings.twitterConsumerKey;
            OAuth.ConsumerKeySecret = _appSettings.twitterConsumerScreatKey;
            OAuth.CallBackUrl = _appSettings.twitterRedirectionUrl;
        }


        public static List<Domain.Socioboard.ViewModels.DiscoveryViewModal> DiscoverySearchGplus(long userId, long groupId, string keyword, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> iMmemDiscoveryViewModal = _redisCache.Get<List<Domain.Socioboard.ViewModels.DiscoveryViewModal>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryGplus + keyword);
            if (iMmemDiscoveryViewModal != null && iMmemDiscoveryViewModal.Count > 0)
            {
                return iMmemDiscoveryViewModal;
            }
            else
            {
                List<Domain.Socioboard.ViewModels.DiscoveryViewModal> lstDiscoveryViewModal = Helper.GplusDiscoverySearchHelper.DiscoverySearchGplus(userId, keyword);
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryGplus + keyword, lstDiscoveryViewModal);
                return lstDiscoveryViewModal;
            }
        }

        public static List<Helper.DiscoverySmart> TwitterTweetSearchWithGeoLocation(string searchkeyword, string geoLocation, Helper.Cache _redisCache)
        {
            List<Helper.DiscoverySmart> iMmemDiscoverySmart = _redisCache.Get<List<Helper.DiscoverySmart>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterTweetSearchWithGeoLocation + searchkeyword + geoLocation);
            if (iMmemDiscoverySmart != null)
            {
                return iMmemDiscoverySmart;
            }
            else
            {
                List<Helper.DiscoverySmart> lstDiscoverySmart = Helper.TwitterHelper.TwitterTweetSearchWithGeoLocation(searchkeyword, geoLocation);
                if (lstDiscoverySmart.Count > 0 && lstDiscoverySmart != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterTweetSearchWithGeoLocation + searchkeyword + geoLocation, lstDiscoverySmart);

                }
                return lstDiscoverySmart;
            }
        }

        public static List<Domain.Socioboard.Models.InstagramDiscoveryFeed> DiscoverySearchinstagram(string keyword, long userId, long groupId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.InstagramDiscoveryFeed> iMmemInstagramDiscoveryFeed = _redisCache.Get<List<Domain.Socioboard.Models.InstagramDiscoveryFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryInstagram + keyword);
            List<Domain.Socioboard.Models.InstagramDiscoveryFeed> lstnstagramDiscoveryFeed = new List<Domain.Socioboard.Models.InstagramDiscoveryFeed>();
            if (iMmemInstagramDiscoveryFeed != null && iMmemInstagramDiscoveryFeed.Count > 0)
            {
                return iMmemInstagramDiscoveryFeed;
            }
            else
            {
               List<Domain.Socioboard.Models.Instagramaccounts> _Instagramaccounts = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.AccessToken != null).ToList();
               
                foreach (var item in _Instagramaccounts) 
                {
                     lstnstagramDiscoveryFeed = Helper.InstagramHelper.DiscoverySearchinstagram(keyword, item.AccessToken, _appSettings.InstagramClientKey);
                    if (lstnstagramDiscoveryFeed != null)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryInstagram + keyword, lstnstagramDiscoveryFeed);
                        break;
                    } 
                }
                return lstnstagramDiscoveryFeed;
            }
        }

        public static List<Domain.Socioboard.Models.Discovery> DiscoveryHistory(long userId, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.Discovery> totaldata = dbr.Find<Domain.Socioboard.Models.Discovery>(t => t.userId == userId).ToList();

            List<Domain.Socioboard.Models.Discovery> lstdiscovery = totaldata.OrderByDescending(t => t.createTime).ToList();

                return lstdiscovery;
        }
    }
}
