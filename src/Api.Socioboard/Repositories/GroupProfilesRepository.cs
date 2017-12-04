using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class GroupProfilesRepository
    {
        public static int AddGroupProfile(Int64 GroupId, string ProfileId, string ProfileName, Int64 ProfileOwnerId, string ProfilePic, Domain.Socioboard.Enum.SocialProfileType profileType, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Groupprofiles grpProfile = new Domain.Socioboard.Models.Groupprofiles();
            grpProfile.groupId = GroupId;
            grpProfile.profileId = ProfileId;
            grpProfile.profileName = ProfileName;
            grpProfile.profileOwnerId = ProfileOwnerId;
            grpProfile.profilePic = ProfilePic;
            grpProfile.profileType = profileType;
            return dbr.Add<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
        }


        public static int getAllProfilesCountOfUser(Int64 userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                string inMemProfilesCount = _redisCache.Get<string>(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                if (inMemProfilesCount != null)
                {
                    return Convert.ToInt32(inMemProfilesCount);
                }
            }
            catch { }

            int groupProfilesCount = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileOwnerId == userId).GroupBy(t => t.profileId).Select(x => x.First()).Count();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId, groupProfilesCount.ToString());
            return groupProfilesCount;
        }

        public static List<Domain.Socioboard.Models.Groupprofiles> getGroupProfiles(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupprofiles> inMemGroupProfiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                if (inMemGroupProfiles != null)
                {
                    return inMemGroupProfiles;
                }
            }
            catch { }

            List<Domain.Socioboard.Models.Groupprofiles> topgroupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = topgroupProfiles.Take(3).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            return groupProfiles;
        }

        public static List<Domain.Socioboard.Models.Groupprofiles> getAllGroupProfiles(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupprofiles> inMemGroupProfiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                if (inMemGroupProfiles != null)
                {
                    return inMemGroupProfiles;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);

            return groupProfiles;
        }
        public static Int64 GetAllGroupProfilesCount(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                long groupProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId);
                return groupProfiles;
            }
            catch (Exception)
            {
                return 0;
            }
        }

        public static List<Domain.Socioboard.Models.profilesdetail> getTop3GroupProfiles(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            //try
            //{
            //    List<Domain.Socioboard.Models.Groupprofiles> inMemGroupProfiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            //    if (inMemGroupProfiles != null)
            //    {
            //         return inMemGroupProfiles;
            //    }
            //}
            //catch { }
            //Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
            List<Domain.Socioboard.Models.profilesdetail> lstprofiledetail = new List<profilesdetail>();
            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = dbr.FindWithRange<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId, 0, 3).ToList();
            // _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            //  List<Domain.Socioboard.Models.Groupprofiles> groupProfiless = groupProfiles.Take(3).ToList();
            foreach (Domain.Socioboard.Models.Groupprofiles profile in groupProfiles)
            {
                if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                {

                    Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(profile.profileId, _redisCache, dbr);

                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Fbaccount = fbAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                {
                    Domain.Socioboard.Models.Facebookaccounts fbpageAcc = Repositories.FacebookRepository.getFacebookAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Fbaccount = fbpageAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                {
                    Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Twtaccount = twtAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                {
                    Domain.Socioboard.Models.Instagramaccounts insAcc = Repositories.InstagramRepository.getInstagramAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Instaaccount = insAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus)
                {
                    Domain.Socioboard.Models.Googleplusaccounts gPlusAcc = Repositories.GplusRepository.getGPlusAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Gplusaccount = gPlusAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn)
                {
                    Domain.Socioboard.Models.LinkedInAccount linkdAcc = Repositories.LinkedInAccountRepository.getLinkedInAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.LinkdInaccount = linkdAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage)
                {
                    Domain.Socioboard.Models.LinkedinCompanyPage LinkedcompanyAcc = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.LinkdINcompanyaccount = LinkedcompanyAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube)
                {
                    Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.GplusRepository.getYTChannel(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Ytubeaccount = YTChnl;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics)
                {
                    Domain.Socioboard.Models.GoogleAnalyticsAccount gAAcc = Repositories.GplusRepository.getGAAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.GAaccount = gAAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Pinterest)
                {
                    Domain.Socioboard.Models.PinterestAccount PinAcc = Repositories.PinterestRepository.getPinterestAccountDetail(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Pintrestaccount = PinAcc;
                    lstprofiledetail.Add(profiledetails);
                }

                //lstprofiledetail.Add(profiledetails);
            }

            return lstprofiledetail;
        }

        public static List<Domain.Socioboard.Models.profilesdetail> getAllGroupProfilesdetail(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupprofiles> inMemGroupProfiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                if (inMemGroupProfiles != null)
                {
                    // return inMemGroupProfiles;
                }
            }
            catch { }
            //Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
            List<Domain.Socioboard.Models.profilesdetail> lstprofiledetail = new List<profilesdetail>();
            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            // _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            //  List<Domain.Socioboard.Models.Groupprofiles> groupProfiless = groupProfiles.Take(3).ToList();
            foreach (Domain.Socioboard.Models.Groupprofiles profile in groupProfiles)
            {
                if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                {

                    Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(profile.profileId, _redisCache, dbr);

                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Fbaccount = fbAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                {
                    Domain.Socioboard.Models.Facebookaccounts fbpageAcc = Repositories.FacebookRepository.getFacebookAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Fbaccount = fbpageAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                {
                    Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Twtaccount = twtAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                {
                    Domain.Socioboard.Models.Instagramaccounts insAcc = Repositories.InstagramRepository.getInstagramAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Instaaccount = insAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus)
                {
                    Domain.Socioboard.Models.Googleplusaccounts gPlusAcc = Repositories.GplusRepository.getGPlusAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Gplusaccount = gPlusAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn)
                {
                    Domain.Socioboard.Models.LinkedInAccount linkdAcc = Repositories.LinkedInAccountRepository.getLinkedInAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.LinkdInaccount = linkdAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage)
                {
                    Domain.Socioboard.Models.LinkedinCompanyPage LinkedcompanyAcc = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.LinkdINcompanyaccount = LinkedcompanyAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube)
                {
                    Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.GplusRepository.getYTChannel(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Ytubeaccount = YTChnl;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics)
                {
                    Domain.Socioboard.Models.GoogleAnalyticsAccount gAAcc = Repositories.GplusRepository.getGAAccount(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.GAaccount = gAAcc;
                    lstprofiledetail.Add(profiledetails);
                }
                else if (profile.profileType == Domain.Socioboard.Enum.SocialProfileType.Pinterest)
                {
                    Domain.Socioboard.Models.PinterestAccount PinAcc = Repositories.PinterestRepository.getPinterestAccountDetail(profile.profileId, _redisCache, dbr);
                    Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                    profiledetails.Pintrestaccount = PinAcc;
                    lstprofiledetail.Add(profiledetails);
                }

                //lstprofiledetail.Add(profiledetails);
            }

            return lstprofiledetail;
        }

        public static string DeleteProfile(long groupId, long userId, string profileId, Helper.Cache _redisCache, Model.DatabaseRepository dbr, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.Groupprofiles grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileId.Equals(profileId)).FirstOrDefault();
            Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id == groupId).FirstOrDefault();
            string res = string.Empty;
            if (grpProfile != null)
            {
                if (grp.groupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName))
                {
                    switch (grpProfile.profileType)
                    {
                        case Domain.Socioboard.Enum.SocialProfileType.Facebook:
                            {
                                res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage:
                            {
                                res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage:
                            {
                                res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.Twitter:
                            {
                                res = TwitterRepository.DeleteProfile(dbr, profileId, userId, _redisCache);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.LinkedIn:
                            {
                                res = LinkedInAccountRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage:
                            {
                                res = LinkedInAccountRepository.DeleteCompanyPageProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.Instagram:
                            {
                                res = InstagramRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics:
                            {
                                res = GplusRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.GPlus:
                            {
                                res = GplusRepository.DeleteGplusProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.YouTube:
                            {
                                res = GplusRepository.DeleteYoutubeChannelProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                        case Domain.Socioboard.Enum.SocialProfileType.Pinterest:
                            {
                                res = PinterestRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                break;
                            }
                    }
                }
                else
                {
                    Groups defaultGroup = GroupsRepository.getAllGroupsofUser(userId, _redisCache, dbr).Find(t => t.groupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName));
                    List<Groupprofiles> defalutGroupProfiles = getGroupProfiles(defaultGroup.id, _redisCache, dbr);
                    if (defalutGroupProfiles != null && defalutGroupProfiles.Count(t => t.profileId.Equals(profileId)) <= 0)
                    {
                        switch (grpProfile.profileType)
                        {
                            case Domain.Socioboard.Enum.SocialProfileType.Facebook:
                                {
                                    res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage:
                                {
                                    res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage:
                                {
                                    res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.Twitter:
                                {
                                    res = TwitterRepository.DeleteProfile(dbr, profileId, userId, _redisCache);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.LinkedIn:
                                {
                                    res = LinkedInAccountRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage:
                                {
                                    res = LinkedInAccountRepository.DeleteCompanyPageProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.Instagram:
                                {
                                    res = InstagramRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics:
                                {
                                    res = GplusRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.GPlus:
                                {
                                    res = GplusRepository.DeleteGplusProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.YouTube:
                                {
                                    res = GplusRepository.DeleteYoutubeChannelProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }
                            case Domain.Socioboard.Enum.SocialProfileType.Pinterest:
                                {
                                    res = PinterestRepository.DeleteProfile(dbr, profileId, userId, _redisCache, _appSettings);
                                    break;
                                }

                        }
                    }
                    else
                    {
                        res = "Deleted";
                    }
                }

                if (res.Equals("Deleted"))
                {
                    dbr.Delete<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                    return "Deleted";
                }
                else
                {
                    if (grpProfile != null)
                    {
                        dbr.Delete<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        return "Deleted";
                    }
                    return res;
                }
            }
            else
            {
                return "Issue while deleting Profile";
            }
        }

        public static List<Domain.Socioboard.Models.profilesdetail> SearchProfileType(long groupId, string Profiletype, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupprofiles> inMemGroupProfiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                if (inMemGroupProfiles != null)
                {
                    // return inMemGroupProfiles;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.profilesdetail> lstprofiledetail = new List<profilesdetail>();
            {
                if (Profiletype == "Facebook")
                {

                    List<Domain.Socioboard.Models.Groupprofiles> FbProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles profil in FbProfiles)
                    {
                        Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(profil.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Fbaccount = fbAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "FacebookPage")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> Fbpage = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles page in Fbpage)
                    {
                        Domain.Socioboard.Models.Facebookaccounts fbpageAcc = Repositories.FacebookRepository.getFacebookAccount(page.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Fbaccount = fbpageAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "twitter")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> TwitterProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles Twitter in TwitterProfiles)
                    {
                        Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(Twitter.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Twtaccount = twtAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "instagram")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> InstagramProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles Instagram in InstagramProfiles)
                    {
                        Domain.Socioboard.Models.Instagramaccounts insAcc = Repositories.InstagramRepository.getInstagramAccount(Instagram.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Instaaccount = insAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "googlepluse")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> GPlusProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles GPlus in GPlusProfiles)
                    {
                        Domain.Socioboard.Models.Googleplusaccounts gPlusAcc = Repositories.GplusRepository.getGPlusAccount(GPlus.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Gplusaccount = gPlusAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "linkedin")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> LinkedInProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles LinkedIn in LinkedInProfiles)
                    {
                        Domain.Socioboard.Models.LinkedInAccount linkdAcc = Repositories.LinkedInAccountRepository.getLinkedInAccount(LinkedIn.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.LinkdInaccount = linkdAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "linkedincompanypage")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> LinkedInComapanyPageProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage).ToList();

                    foreach (Domain.Socioboard.Models.Groupprofiles LinkedInComapanyPage in LinkedInComapanyPageProfiles)
                    {
                        Domain.Socioboard.Models.LinkedinCompanyPage LinkedcompanyAcc = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(LinkedInComapanyPage.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.LinkdINcompanyaccount = LinkedcompanyAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "Youtube")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> YouTubeProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles YouTube in YouTubeProfiles)
                    {
                        Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.GplusRepository.getYTChannel(YouTube.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Ytubeaccount = YTChnl;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "GAnalytics")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> GoogleAnalyticsProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics).ToList();

                    foreach (Domain.Socioboard.Models.Groupprofiles GoogleAnalytics in GoogleAnalyticsProfiles)
                    {
                        Domain.Socioboard.Models.GoogleAnalyticsAccount gAAcc = Repositories.GplusRepository.getGAAccount(GoogleAnalytics.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.GAaccount = gAAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }
                else if (Profiletype == "Pinterest")
                {
                    List<Domain.Socioboard.Models.Groupprofiles> PinterestProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Pinterest).ToList();
                    foreach (Domain.Socioboard.Models.Groupprofiles Pinterest in PinterestProfiles)
                    {
                        Domain.Socioboard.Models.PinterestAccount PinAcc = Repositories.PinterestRepository.getPinterestAccountDetail(Pinterest.profileId, _redisCache, dbr);
                        Domain.Socioboard.Models.profilesdetail profiledetails = new profilesdetail();
                        profiledetails.Pintrestaccount = PinAcc;
                        lstprofiledetail.Add(profiledetails);
                    }
                }

                return lstprofiledetail;
            }
        }

    }
}
