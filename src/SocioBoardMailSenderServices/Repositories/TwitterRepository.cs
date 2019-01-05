
using Domain.Socioboard.Models.Mongo;

using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TimeLineMethods;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.Repositories
{
    public class TwitterRepository
    {
        public static Domain.Socioboard.Models.TwitterAccount getTwitterAccount(string twitterUserId, Helper.Cache _redisCache, Helper.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.TwitterAccount inMemTwitterAcc = _redisCache.Get<Domain.Socioboard.Models.TwitterAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + twitterUserId);
                if (inMemTwitterAcc != null)
                {
                    return inMemTwitterAcc;
                }
            }
            catch { }

            List<Domain.Socioboard.Models.TwitterAccount> lstTwitterAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(twitterUserId)).ToList();
            if (lstTwitterAcc != null && lstTwitterAcc.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + twitterUserId, lstTwitterAcc.First());
                return lstTwitterAcc.First();
            }
            else
            {
                return null;
            }



        }

        public static string TwitterFollowerCount(string userId, long groupId, Helper.DatabaseRepository dbr)
        {
            string[] profileids = null;
            string FollowerCount = string.Empty;
           // List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Domain.Socioboard.Models.Groupprofiles>();
            //if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            //{
            //    lstGroupprofiles = iMmemGroupprofiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            //}
            //else
            //{
            //    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            //}

            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            long TwitterFollowerCount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => profileids.Contains(t.twitterUserId) && t.isActive).Sum(t => t.followersCount);
            if (TwitterFollowerCount > 1000000)
            {
                long r = TwitterFollowerCount % 1000000;
                long t = TwitterFollowerCount / 1000000;
                FollowerCount = t.ToString() + "." + (r / 10000).ToString() + "M";
            }
            else if (TwitterFollowerCount > 1000)
            {
                long r = TwitterFollowerCount % 1000;
                long t = TwitterFollowerCount / 1000;
                FollowerCount = t.ToString() + "." + (r / 100).ToString() + "K";
            }
            else
            {
                FollowerCount = TwitterFollowerCount.ToString();
            }
            return FollowerCount;
        }
    }
}
