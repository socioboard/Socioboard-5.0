using System;
using System.Collections.Generic;
using System.Linq;
using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Domain.Socioboard.Consatants;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Models;

namespace Api.Socioboard.Repositories
{
    public static class GroupProfilesRepository
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="ProfileId"></param>
        /// <param name="ProfileName"></param>
        /// <param name="ProfileOwnerId"></param>
        /// <param name="ProfilePic"></param>
        /// <param name="profileType"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static int AddGroupProfile(long groupId, string ProfileId, string ProfileName, long ProfileOwnerId,
            string ProfilePic, SocialProfileType profileType, DatabaseRepository dbr)
        {
            var grpProfile = new Groupprofiles
            {
                groupId = groupId,
                profileId = ProfileId,
                profileName = ProfileName,
                profileOwnerId = ProfileOwnerId,
                profilePic = ProfilePic,
                profileType = profileType
            };
            return dbr.Add(grpProfile);
        }


        public static int getAllProfilesCountOfUser(long userId, Cache _redisCache, DatabaseRepository dbr)
        {
            try
            {
                var inMemProfilesCount = _redisCache.Get<string>(SocioboardConsts.CacheUserProfileCount + userId);
                if (inMemProfilesCount != null) return Convert.ToInt32(inMemProfilesCount);
            }
            catch
            {
            }

            var groupProfilesCount = dbr.Find<Groupprofiles>(t => t.profileOwnerId == userId && t.profileType != SocialProfileType.GPlus).GroupBy(t => t.profileId)
                .Select(x => x.First()).Count();
            _redisCache.Set(SocioboardConsts.CacheUserProfileCount + userId, groupProfilesCount.ToString());
            return groupProfilesCount;
        }

        public static List<Groupprofiles> getGroupProfiles(long groupId, Cache _redisCache, DatabaseRepository dbr)
        {
            return GetAllGroupProfiles(groupId, _redisCache, dbr);
            //try
            //{
            //    var inMemGroupProfiles = _redisCache.Get<List<Groupprofiles>>(SocioboardConsts.CacheGroupProfiles + groupId);

            //    if (inMemGroupProfiles != null)
            //        return inMemGroupProfiles;
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine(ex.Message);
            //}

            //var topgroupProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId).ToList();
            //var groupProfiles = topgroupProfiles.Take(3).ToList();
            //_redisCache.Set(SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            //return groupProfiles;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="redisCache"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static List<Groupprofiles> GetAllGroupProfiles(long groupId, Cache redisCache, DatabaseRepository dbr)
        {
            var addedProfile = new List<SocialProfileType>();

            var groupProfilesPerUserPlan = new List<Groupprofiles>();

            try
            {
                var inMemGroupProfiles = redisCache.Get<List<Groupprofiles>>(SocioboardConsts.CacheGroupProfiles + groupId);

                if (inMemGroupProfiles != null && inMemGroupProfiles.Count > 0)
                {
                    var userDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == inMemGroupProfiles[0].profileOwnerId);

                    foreach (var profile in inMemGroupProfiles)
                    {
                        if (userDetails.AccountType == SBAccountType.Free && addedProfile.Contains(profile.profileType))
                            continue;

                        if (userDetails.AccountType != SBAccountType.Free)
                        {
                            var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(userDetails.AccountType);
                            if (groupProfilesPerUserPlan.Count >= maxCount)
                                return groupProfilesPerUserPlan;
                        }

                        addedProfile.Add(profile.profileType);

                        groupProfilesPerUserPlan.Add(profile);
                    }

                    return groupProfilesPerUserPlan;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            var groupProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType != SocialProfileType.GPlus).ToList();

            redisCache.Set(SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);

            if (groupProfiles.Count == 0)
                return groupProfilesPerUserPlan;

            var currentUserDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == groupProfiles[0].profileOwnerId);

            foreach (var profile in groupProfiles)
            {
                if (currentUserDetails.AccountType == SBAccountType.Free && addedProfile.Contains(profile.profileType))
                    continue;

                if (currentUserDetails.AccountType != SBAccountType.Free)
                {
                    var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(currentUserDetails.AccountType);
                    if (groupProfilesPerUserPlan.Count >= maxCount)
                        return groupProfilesPerUserPlan;
                }

                addedProfile.Add(profile.profileType);

                groupProfilesPerUserPlan.Add(profile);
            }

            return groupProfilesPerUserPlan;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="redisCache"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static long GetAllGroupProfilesCount(long groupId, Cache redisCache, DatabaseRepository dbr)
        {
            try
            {
                long groupProfiles = dbr.GetCount<Groupprofiles>(t => t.groupId == groupId);
                return groupProfiles;
            }
            catch (Exception)
            {
                return 0;
            }
        }

        /// <summary>
        /// To Get the top three profile with given group Id
        /// </summary>
        /// <param name="groupId">group Id</param>
        /// <param name="redisCache">redis cache database</param>
        /// <param name="dbr">database object</param>
        /// <returns></returns>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public static List<profilesdetail> GetTop3GroupProfiles(long groupId, Cache redisCache, DatabaseRepository dbr)
        {
            var getTop3GroupProfiles = new List<profilesdetail>();

            var groupProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType != SocialProfileType.GPlus).ToList();

            if (groupProfiles.Count == 0)
                return getTop3GroupProfiles;

            var userDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == groupProfiles[0].profileOwnerId);

            redisCache.Set(SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);

            var addedProfile = new List<SocialProfileType>();

            foreach (var profile in groupProfiles)
            {
                if (getTop3GroupProfiles.Count >= 3)
                    break;

                if (userDetails.AccountType == SBAccountType.Free && addedProfile.Contains(profile.profileType))
                    continue;

                addedProfile.Add(profile.profileType);

                AddedProfileDetails(redisCache, dbr, getTop3GroupProfiles, profile);
            }

            return getTop3GroupProfiles;
        }

        private static void AddedProfileDetails(Cache redisCache, DatabaseRepository dbr, List<profilesdetail> groupProfiles, Groupprofiles profile)
        {
            switch (profile.profileType)
            {
                case SocialProfileType.Facebook:
                    {
                        var fbAcc = FacebookRepository.getFacebookAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Fbaccount = fbAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.FacebookFanPage:
                    {
                        var fbPageAcc = FacebookRepository.getFacebookAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Fbaccount = fbPageAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.Twitter:
                    {
                        var twtAcc = TwitterRepository.getTwitterAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Twtaccount = twtAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.Instagram:
                    {
                        var insAcc = InstagramRepository.getInstagramAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Instaaccount = insAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.GPlus:
                    {
                        var gPlusAcc = GplusRepository.getGPlusAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Gplusaccount = gPlusAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.LinkedIn:
                    {
                        var linkedInAcc = LinkedInAccountRepository.getLinkedInAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { LinkdInaccount = linkedInAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.LinkedInComapanyPage:
                    {
                        var linkedCompanyAcc = LinkedInAccountRepository.getLinkedinCompanyPage(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { LinkdINcompanyaccount = linkedCompanyAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.YouTube:
                    {
                        var youtubeChannel = GplusRepository.getYTChannel(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Ytubeaccount = youtubeChannel };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.GoogleAnalytics:
                    {
                        var gAAcc = GplusRepository.getGAAccount(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { GAaccount = gAAcc };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.Pinterest:
                    {
                        var pInterestAccountDetail = PinterestRepository.getPinterestAccountDetail(profile.profileId, redisCache, dbr);
                        var profileDetails = new profilesdetail { Pintrestaccount = pInterestAccountDetail };
                        groupProfiles.Add(profileDetails);
                        break;
                    }
                case SocialProfileType.GplusPage:
                    break;
                case SocialProfileType.Tumblr:
                    break;
                case SocialProfileType.FacebookPublicPage:
                    break;
                case SocialProfileType.DropBox:
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="redisCache"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static List<profilesdetail> GetAllGroupProfilesDetail(long groupId, Cache redisCache, DatabaseRepository dbr)
        {
            var allGroupProfiles = new List<profilesdetail>();
            var addedProfile = new List<SocialProfileType>();
            try
            {
                var inMemGroupProfiles = redisCache.Get<List<Groupprofiles>>(SocioboardConsts.CacheGroupProfiles + groupId);

                if (inMemGroupProfiles != null && inMemGroupProfiles.Count > 0)
                {
                    var userDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == inMemGroupProfiles[0].profileOwnerId);

                    foreach (var profile in inMemGroupProfiles)
                    {
                        if (userDetails.AccountType == SBAccountType.Free && addedProfile.Contains(profile.profileType))
                            continue;

                        if (userDetails.AccountType != SBAccountType.Free)
                        {
                            var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(userDetails.AccountType);
                            if (allGroupProfiles.Count >= maxCount)
                                return allGroupProfiles;
                        }

                        addedProfile.Add(profile.profileType);

                        AddedProfileDetails(redisCache, dbr, allGroupProfiles, profile);
                    }
                    if (allGroupProfiles.Count > 0)
                        return allGroupProfiles;
                }

                var groupProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType != SocialProfileType.GPlus).ToList();

                if (groupProfiles.Count == 0)
                    return allGroupProfiles;

                var currentUserDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == groupProfiles[0].profileOwnerId);

                foreach (var profile in groupProfiles)
                {
                    if (currentUserDetails.AccountType == SBAccountType.Free && addedProfile.Contains(profile.profileType))
                        continue;

                    if (currentUserDetails.AccountType != SBAccountType.Free)
                    {
                        var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(currentUserDetails.AccountType);
                        if (allGroupProfiles.Count >= maxCount)
                            return allGroupProfiles;
                    }

                    addedProfile.Add(profile.profileType);

                    AddedProfileDetails(redisCache, dbr, allGroupProfiles, profile);
                }
                return allGroupProfiles;

            }
            catch
            {
                return allGroupProfiles;
            }
        }

        public static string DeleteProfile(long groupId, long userId, string profileId, Cache redisCache, DatabaseRepository dbr, AppSettings appSettings)
        {

            var grpProfile =
                dbr.FindFirstMatch<Groupprofiles>(t => t.groupId == groupId && t.profileId.Equals(profileId));

            var res = string.Empty;

            if (grpProfile == null)
                return "Issue while deleting Profile";

            var grp = dbr.FindFirstMatch<Groups>(t => t.id == groupId);

            if (grp.groupName.Equals(SocioboardConsts.DefaultGroupName))
                DeleteGroup(userId, profileId, redisCache, dbr, appSettings, grpProfile, res);

            else
            {
                var defaultGroup = GroupsRepository.GetAllGroupsofUser(userId, redisCache, dbr).Find(t => t.groupName.Equals(SocioboardConsts.DefaultGroupName));

                var defaultGroupProfiles = getGroupProfiles(defaultGroup.id, redisCache, dbr);

                if (defaultGroupProfiles != null && defaultGroupProfiles.Count(t => t.profileId.Equals(profileId)) <= 0)
                    DeleteGroup(userId, profileId, redisCache, dbr, appSettings, grpProfile, res);
            }

            dbr.Delete(grpProfile);
            redisCache.Delete(SocioboardConsts.CacheGroupProfiles + groupId);
            redisCache.Delete(SocioboardConsts.CacheUserProfileCount + userId);
            return "Deleted";

        }

        private static string DeleteGroup(long userId, string profileId, Cache _redisCache, DatabaseRepository dbr, AppSettings _appSettings, Groupprofiles grpProfile, string res)
        {
            switch (grpProfile.profileType)
            {
                case SocialProfileType.Facebook:
                    {
                        res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.FacebookFanPage:
                    {
                        res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.FacebookPublicPage:
                    {
                        res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.Twitter:
                    {
                        res = TwitterRepository.DeleteProfile(dbr, profileId, userId, _redisCache);
                        break;
                    }
                case SocialProfileType.LinkedIn:
                    {
                        res = LinkedInAccountRepository.DeleteProfile(dbr, profileId, userId, _redisCache,
                            _appSettings);
                        break;
                    }
                case SocialProfileType.LinkedInComapanyPage:
                    {
                        res = LinkedInAccountRepository.DeleteCompanyPageProfile(dbr, profileId, userId,
                            _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.Instagram:
                    {
                        res = InstagramRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.GoogleAnalytics:
                    {
                        res = GplusRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.GPlus:
                    {
                        res = GplusRepository.DeleteGplusProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
                case SocialProfileType.YouTube:
                    {
                        res = GplusRepository.DeleteYoutubeChannelProfile(dbr, profileId, userId, _redisCache,
                            _appSettings);
                        break;
                    }
                case SocialProfileType.Pinterest:
                    {
                        res = PinterestRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                        break;
                    }
            }

            return res;
        }

        public static string IsPrimaryAccount(long userId, string profileId, DatabaseRepository dbr, AppSettings _appSettings)
        {
            var user = new User();
            var fbAcc = dbr
                .Find<Facebookaccounts>(t => t.FbUserId.Equals(profileId) && t.UserId == userId && t.IsActive)
                .FirstOrDefault();
            try
            {
                user = dbr.Find<User>(t =>
                        t.Id.Equals(userId) && t.EmailId == fbAcc.EmailId && t.EmailValidateToken == "Facebook")
                    .FirstOrDefault();
            }
            catch (Exception ex)
            {
            }

            if (user != null)
                return "Primary Account";
            return "Not Primary Account";
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="profileType"></param>
        /// <param name="redisCache"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static List<profilesdetail> SearchProfileType(long groupId, string profileType, Cache redisCache, DatabaseRepository dbr)
        {
            var needProfileType = SocialProfileType.Facebook;
            var finalResult = new List<profilesdetail>();
            switch (profileType)
            {
                case "Facebook":
                    needProfileType = SocialProfileType.Facebook;
                    break;
                case "FacebookPage":
                    needProfileType = SocialProfileType.FacebookFanPage;
                    break;
                case "twitter":
                    needProfileType = SocialProfileType.Twitter;
                    break;
                case "instagram":
                    needProfileType = SocialProfileType.Instagram;
                    break;
                case "googlepluse":
                    needProfileType = SocialProfileType.GPlus;
                    break;
                case "linkedin":
                    needProfileType = SocialProfileType.LinkedIn;
                    break;
                case "linkedincompanypage":
                    needProfileType = SocialProfileType.LinkedInComapanyPage;
                    break;
                case "Youtube":
                    needProfileType = SocialProfileType.YouTube;
                    break;
                case "GAnalytics":
                    needProfileType = SocialProfileType.GoogleAnalytics;
                    break;
                case "Pinterest":
                    needProfileType = SocialProfileType.Pinterest;
                    break;
            }

            try
            {
                var inMemGroupProfiles = redisCache.Get<List<Groupprofiles>>(SocioboardConsts.CacheGroupProfiles + groupId);

                if (inMemGroupProfiles == null || inMemGroupProfiles.Count == 0)
                    inMemGroupProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == needProfileType).ToList();



                if (inMemGroupProfiles.Count > 0)
                {
                    var selectedProfileDetails = inMemGroupProfiles.Where(x => x.profileType == needProfileType).ToList();
                    var userDetails = redisCache.Get<User>("User") ?? dbr.FindFirstMatch<User>(t => t.Id == inMemGroupProfiles[0].profileOwnerId);

                    if (userDetails.AccountType == SBAccountType.Free)
                    {
                        var requiredGroup = selectedProfileDetails.FirstOrDefault();
                        AddedProfileDetails(redisCache, dbr, finalResult, requiredGroup);
                    }
                    else
                    {
                        foreach (var profileDetail in selectedProfileDetails)
                        {
                            if (userDetails.AccountType != SBAccountType.Free)
                            {
                                var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(userDetails.AccountType);
                                if (finalResult.Count >= maxCount)
                                    return finalResult;
                            }

                            AddedProfileDetails(redisCache, dbr, finalResult, profileDetail);
                        }

                    }
                }
                return finalResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return finalResult;
            }

            #region Old Code

            //var lstprofiledetail = new List<profilesdetail>();
            //{
            //    if (Profiletype == "Facebook")
            //    {
            //        var FbProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == SocialProfileType.Facebook).ToList();

            //        foreach (var profil in FbProfiles)
            //        {
            //            var fbAcc = FacebookRepository.getFacebookAccount(profil.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Fbaccount = fbAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "FacebookPage")
            //    {
            //        var Fbpage = dbr.Find<Groupprofiles>(t =>
            //            t.groupId == groupId && t.profileType == SocialProfileType.FacebookFanPage).ToList();
            //        foreach (var page in Fbpage)
            //        {
            //            var fbpageAcc = FacebookRepository.getFacebookAccount(page.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Fbaccount = fbpageAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "twitter")
            //    {
            //        var TwitterProfiles =
            //            dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == SocialProfileType.Twitter)
            //                .ToList();
            //        foreach (var Twitter in TwitterProfiles)
            //        {
            //            var twtAcc = TwitterRepository.getTwitterAccount(Twitter.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Twtaccount = twtAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "instagram")
            //    {
            //        var InstagramProfiles = dbr.Find<Groupprofiles>(t =>
            //            t.groupId == groupId && t.profileType == SocialProfileType.Instagram).ToList();
            //        foreach (var Instagram in InstagramProfiles)
            //        {
            //            var insAcc = InstagramRepository.getInstagramAccount(Instagram.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Instaaccount = insAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "googlepluse")
            //    {
            //        var GPlusProfiles =
            //            dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == SocialProfileType.GPlus)
            //                .ToList();
            //        foreach (var GPlus in GPlusProfiles)
            //        {
            //            var gPlusAcc = GplusRepository.getGPlusAccount(GPlus.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Gplusaccount = gPlusAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "linkedin")
            //    {
            //        var LinkedInProfiles =
            //            dbr.Find<Groupprofiles>(
            //                t => t.groupId == groupId && t.profileType == SocialProfileType.LinkedIn).ToList();
            //        foreach (var LinkedIn in LinkedInProfiles)
            //        {
            //            var linkdAcc =
            //                LinkedInAccountRepository.getLinkedInAccount(LinkedIn.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.LinkdInaccount = linkdAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "linkedincompanypage")
            //    {
            //        var LinkedInComapanyPageProfiles = dbr.Find<Groupprofiles>(t =>
            //            t.groupId == groupId && t.profileType == SocialProfileType.LinkedInComapanyPage).ToList();

            //        foreach (var LinkedInComapanyPage in LinkedInComapanyPageProfiles)
            //        {
            //            var LinkedcompanyAcc =
            //                LinkedInAccountRepository.getLinkedinCompanyPage(LinkedInComapanyPage.profileId,
            //                    _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.LinkdINcompanyaccount = LinkedcompanyAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "Youtube")
            //    {
            //        var YouTubeProfiles =
            //            dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == SocialProfileType.YouTube)
            //                .ToList();
            //        foreach (var YouTube in YouTubeProfiles)
            //        {
            //            var YTChnl = GplusRepository.getYTChannel(YouTube.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Ytubeaccount = YTChnl;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "GAnalytics")
            //    {
            //        var GoogleAnalyticsProfiles = dbr.Find<Groupprofiles>(t =>
            //            t.groupId == groupId && t.profileType == SocialProfileType.GoogleAnalytics).ToList();

            //        foreach (var GoogleAnalytics in GoogleAnalyticsProfiles)
            //        {
            //            var gAAcc = GplusRepository.getGAAccount(GoogleAnalytics.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.GAaccount = gAAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }
            //    else if (Profiletype == "Pinterest")
            //    {
            //        var PinterestProfiles = dbr.Find<Groupprofiles>(t =>
            //            t.groupId == groupId && t.profileType == SocialProfileType.Pinterest).ToList();
            //        foreach (var Pinterest in PinterestProfiles)
            //        {
            //            var PinAcc =
            //                PinterestRepository.getPinterestAccountDetail(Pinterest.profileId, _redisCache, dbr);
            //            var profiledetails = new profilesdetail();
            //            profiledetails.Pintrestaccount = PinAcc;
            //            lstprofiledetail.Add(profiledetails);
            //        }
            //    }

            //    return lstprofiledetail;
            //}
            #endregion
        }
    }
}