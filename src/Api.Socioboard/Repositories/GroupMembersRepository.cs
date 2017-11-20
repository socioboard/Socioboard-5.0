using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;

namespace Api.Socioboard.Repositories
{
    public static class GroupMembersRepository
    {
        public static List<Domain.Socioboard.Models.Groupmembers> getGroupMembers(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupmembers> inMemGroupMembers = _redisCache.Get<List<Domain.Socioboard.Models.Groupmembers>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + groupId);
                if (inMemGroupMembers != null)
                {
                    return inMemGroupMembers;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.Groupmembers> groupMembers = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.groupid == groupId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + groupId, groupMembers);
            return groupMembers;
        }

        public static List<Domain.Socioboard.Models.Groupmembers> findGroupsformember(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupmembers> inMemGroupMembers = _redisCache.Get<List<Domain.Socioboard.Models.Groupmembers>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + userId);
                if (inMemGroupMembers != null)
                {
                    return inMemGroupMembers;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.Groupmembers> groupMembers = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + userId, groupMembers);
            return groupMembers;
        }

        public static List<Domain.Socioboard.Models.Groupmembers> findmember(long SBgroupId, long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                List<Domain.Socioboard.Models.Groupmembers> inMemGroupMembers = _redisCache.Get<List<Domain.Socioboard.Models.Groupmembers>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + userId);
                if (inMemGroupMembers != null)
                {
                    return inMemGroupMembers;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.Groupmembers> groupMembers = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.userId == userId && t.groupid != SBgroupId).ToList();
            _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + userId, groupMembers);
            return groupMembers;
        }

        public static int createGroupMember(long groupId, User user, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Groupmembers grpMember = new Domain.Socioboard.Models.Groupmembers();
            grpMember.groupid = groupId;
            grpMember.email = user.EmailId;
            grpMember.firstName = user.FirstName;
            grpMember.lastName = user.LastName;
            grpMember.memberStatus = Domain.Socioboard.Enum.GroupMemberStatus.Accepted;
            grpMember.profileImg = user.ProfilePicUrl;
            grpMember.userId = user.Id;
            grpMember.memberCode = "Admin";
            grpMember.isAdmin = true;
            return dbr.Add<Groupmembers>(grpMember);
        }

        public static List<Domain.Socioboard.Models.Groupmembers> getGroupadmin(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
           List<Domain.Socioboard.Models.Groupmembers> adminDetails = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.groupid == groupId && t.isAdmin).ToList();
           long userID = adminDetails.First().userId;
           List<Domain.Socioboard.Models.User> user = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == userID).ToList();
           string Email = null;
            try
            {
                Email = user.First().EmailId;
            }
            catch (Exception ex)
            {

            }
            
           adminDetails.First().email = Email;
           return adminDetails;
        }

        public static List<Domain.Socioboard.Models.Groupmembers> adminDelete(long groupId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.Groupmembers> adminDetails = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.groupid == groupId).ToList();

            foreach (Domain.Socioboard.Models.Groupmembers item in adminDetails)
            {
                Groupmembers user =item;
                dbr.Delete<Domain.Socioboard.Models.Groupmembers>(user);
            }
            List<Domain.Socioboard.Models.Groups> groupName = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id== groupId).ToList();
            foreach (Domain.Socioboard.Models.Groups item in groupName)
            {
                Groups group = item;
                dbr.Delete<Domain.Socioboard.Models.Groups>(group);
            }
            return adminDetails;
        }
        public static List<Domain.Socioboard.Models.Groupmembers> LeaveTeam(long groupId, long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.Groupmembers> leave = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.groupid == groupId && t.userId == userId).ToList();
            foreach (Domain.Socioboard.Models.Groupmembers item in leave)
            {
                dbr.Delete<Domain.Socioboard.Models.Groupmembers>(item);
            }

            return leave;
        }

        public static List<Domain.Socioboard.Models.retaingroup> RetainGrpMber(long userId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.retaingroup> lstgrpdetal = new List<retaingroup>();
            List<Groupmembers> lstadmingrpmember = dbr.Find<Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted && t.isAdmin == true).ToList();
            List<long> tempLst = new List<long>();
            foreach (var itemLst in lstadmingrpmember)
            {
                tempLst.Add(itemLst.groupid);
            }
            List<Groupmembers> membersAdminGrp = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => tempLst.Contains(t.groupid) && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted && t.isAdmin!=true).ToList();
            List<Groupmembers> lstnonadmingrpmember = dbr.Find<Groupmembers>(t => t.userId == userId && t.memberStatus == Domain.Socioboard.Enum.GroupMemberStatus.Accepted && t.isAdmin != true).ToList();

            foreach(var item in membersAdminGrp)
            {
                Domain.Socioboard.Models.retaingroup lstretailgrp = new retaingroup();

                Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id==item.groupid).First();
                string grpname = grp.groupName;
                lstretailgrp.grpname = grpname;
                lstretailgrp.username = item.firstName;
                lstretailgrp.userId = item.email;
                lstretailgrp.memberid = item.id;
                lstretailgrp.grpid = item.groupid;
                lstretailgrp.type = "You";
                
                lstgrpdetal.Add(lstretailgrp);
            }
            foreach (var item in lstnonadmingrpmember)
            {
                Domain.Socioboard.Models.retaingroup lstretailgrp = new retaingroup();

                Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id == item.groupid).First();
                string grpname = grp.groupName;
                lstretailgrp.grpname = grpname;
                lstretailgrp.username = item.firstName;
                lstretailgrp.userId = item.email;
                lstretailgrp.memberid = item.id;
                lstretailgrp.grpid = item.groupid;
                lstretailgrp.type = "Other";
                lstgrpdetal.Add(lstretailgrp);
            }
            //lstretailgrp.memberofadmin = membersAdminGrp;
            //lstretailgrp.memberofNonadmin = lstnonadmingrpmember;
            return lstgrpdetal;
        }
    }
}
