using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class GroupsRepository
    {

        public static List<Domain.Socioboard.Models.Groups> getAllGroupsofUser(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groups> inMemGroups = _redisCache.Get<List<Domain.Socioboard.Models.Groups>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId);
                if (inMemGroups != null)
                {
                    return inMemGroups;
                }
            }
            catch { }

            List<long> lstGroupIds = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted).Select(t => t.groupid).ToList();
            List<Domain.Socioboard.Models.Groups> groups = dbr.Find<Domain.Socioboard.Models.Groups>(t => lstGroupIds.Contains(t.id) ).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId, groups);
            return groups;
        }

        public static List<Domain.Socioboard.Models.Groups> getAdminGroupsofUser(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groups> inMemGroups = _redisCache.Get<List<Domain.Socioboard.Models.Groups>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId);
                if (inMemGroups != null)
                {
                    return inMemGroups;
                }
            }
            catch { }

            List<long> lstGroupIds = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted &&t.isAdmin==true).Select(t => t.groupid).ToList();
            List<Domain.Socioboard.Models.Groups> groups = dbr.Find<Domain.Socioboard.Models.Groups>(t => lstGroupIds.Contains(t.id)).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId, groups);
            return groups;
        }

        public static List<Domain.Socioboard.Models.Groups> getGroupsofUser(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groups> inMemGroups = _redisCache.Get<List<Domain.Socioboard.Models.Groups>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId);
                if (inMemGroups != null)
                {
                    return inMemGroups;
                }
            }
            catch { }

            List<long> lstGroupIds = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted && t.isAdmin == false).Select(t => t.groupid).ToList();
            List<Domain.Socioboard.Models.Groups> groups = dbr.Find<Domain.Socioboard.Models.Groups>(t => lstGroupIds.Contains(t.id)).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + userId, groups);
            return groups;
        }
        public static int getAllGroupsofUserCount(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<long> lstGroupIds = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted).Select(t => t.groupid).ToList();
            //List<Domain.Socioboard.Models.Groups> groups = dbr.Find<Domain.Socioboard.Models.Groups>(t => lstGroupIds.Contains(t.id)).ToList();
            int lstScheduledMessage = dbr.Counts<Domain.Socioboard.Models.Groups>(t => lstGroupIds.Contains(t.id));
            return lstScheduledMessage;
        }
        public static int getMemberCount(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<Groupmembers> lstgrpmember = dbr.Find<Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted && t.isAdmin==true).ToList();
            List<long> tempLst = new List<long>();
            foreach(var itemLst in lstgrpmember)
            {
                tempLst.Add(itemLst.groupid);
            }
            int membersAdminGrp = dbr.Counts<Domain.Socioboard.Models.Groupmembers>(t => tempLst.Contains(t.groupid) && t.memberStatus==Domain.Socioboard.Enum.GroupMemberStatus.Accepted);
            //int lstGrp = dbr.GetCount<Domain.Socioboard.Models.Groups>(t => t.adminId == userId);
            //long[] lstgrpId = lstGrp.Select(t => t.id).ToArray();
            ////int GrpMemberCount = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => lstgrpId.Contains(t.groupid) && t.isAdmin==false).Count();
            //int GrpMemberCount = dbr.Counts<Domain.Socioboard.Models.Groupmembers>(t => lstgrpId.Contains(t.groupid) && t.isAdmin == false);
            int nonadminMemberCount = dbr.GetCount<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.isAdmin!=true && t.memberStatus==Domain.Socioboard.Enum.GroupMemberStatus.Accepted);
            //int GrpMemberCount = dbr.GetCount<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.memberStatus==Domain.Socioboard.Enum.GroupMemberStatus.Accepted)- (lstGrp+ nonadminMemberCount);
            int GrpMemberCount = nonadminMemberCount + membersAdminGrp - tempLst.Count;
            return GrpMemberCount;
        }


        public static List<Domain.Socioboard.Models.Groups> getSBGroup(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
           List<Domain.Socioboard.Models.Groups> topgroupProfiles = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.groupName =="Socioboard").ToList();
            return topgroupProfiles;
        }
        public static List<Domain.Socioboard.Models.Groups> getGroups(long groupid, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.Groups> topgroupProfiles = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == groupid && t.groupName=="Socioboard").ToList();
            return topgroupProfiles;
        }
        public static string DeleteProfile(long userId, long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id == groupId).FirstOrDefault();
            IList<Domain.Socioboard.Models.Groupprofiles> grpProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId);
            if(grpProfiles.Count !=0)
            {
                foreach (Domain.Socioboard.Models.Groupprofiles grpProfile in grpProfiles)
                {
                    string res = string.Empty;
                    if (grpProfile != null)
                    {
                        try
                        {
                            switch (grpProfile.profileType)
                            {
                                case Domain.Socioboard.Enum.SocialProfileType.Facebook:
                                    {
                                        res = FacebookRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage:
                                    {
                                        res = FacebookRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage:
                                    {
                                        res = FacebookRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.Twitter:
                                    {
                                        res = TwitterRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.LinkedIn:
                                    {
                                        res = LinkedInAccountRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage:
                                    {
                                        res = LinkedInAccountRepository.DeleteCompanyPageProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.Instagram:
                                    {
                                        res = InstagramRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics:
                                    {
                                        res = GplusRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.GPlus:
                                    {
                                        res = GplusRepository.DeleteGplusProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.YouTube:
                                    {
                                        res = GplusRepository.DeleteYoutubeChannelProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }
                                case Domain.Socioboard.Enum.SocialProfileType.Pinterest:
                                    {
                                        res = PinterestRepository.DeleteProfile(dbr, grpProfile.profileId, userId, _redisCache, _appSettings);
                                        break;
                                    }

                            }
                        }
                        catch (Exception ex)
                        {

                        }
                        try
                        {
                            if (res.Equals("Deleted"))
                            {
                                dbr.Delete<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                               // dbr.Delete<Domain.Socioboard.Models.Groups>(t => t.id == groupId);
                                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                               
                            }
                            else
                            {
                                if (grpProfile != null)
                                {
                                    dbr.Delete<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                                    //dbr.Delete<Domain.Socioboard.Models.Groups>(t => t.id == groupId);
                                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                                   
                                }
                              
                            }
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                    else
                    {
                        return "Issue while deleting Profile";
                    }
                }
                dbr.Delete<Domain.Socioboard.Models.Groups>(grp);
                return "Deleted";
            }
            else
            {
                dbr.Delete<Domain.Socioboard.Models.Groups>(grp);
            }
         

            return "Deleted";
        }
    }
}
