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
            grpProfile.GroupId = GroupId;
            grpProfile.ProfileId = ProfileId;
            grpProfile.ProfileName = ProfileName;
            grpProfile.ProfileOwnerId = ProfileOwnerId;
            grpProfile.ProfilePic = ProfilePic;
            grpProfile.ProfileType = profileType;
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

            int groupProfilesCount = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.ProfileOwnerId == userId).Count();
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

            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.GroupId == groupId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, groupProfiles);
            return groupProfiles;
        }


        public static string DeleteProfile(long groupId, long userId, string profileId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Groupprofiles grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.GroupId == groupId && t.ProfileId.Equals(profileId)).FirstOrDefault();
            string res = string.Empty;
            if (grpProfile != null)
            {
                switch (grpProfile.ProfileType)
                {
                    case Domain.Socioboard.Enum.SocialProfileType.Facebook:
                        {
                            res = FacebookRepository.DeleteProfile(dbr, profileId, userId, _redisCache);
                            break;
                        }
                    case Domain.Socioboard.Enum.SocialProfileType.Twitter:
                        {
                            res = TwitterRepository.DeleteProfile(dbr, profileId, userId, _redisCache);
                            break;
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
