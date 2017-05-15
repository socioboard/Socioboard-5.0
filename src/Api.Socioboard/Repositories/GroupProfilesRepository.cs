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

            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            return groupProfiles;
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
    }
}
