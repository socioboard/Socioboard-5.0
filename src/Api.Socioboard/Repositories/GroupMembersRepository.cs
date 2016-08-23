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

        public static int createGroupMember(long groupId,User user,  Helper.Cache _redisCache, Model.DatabaseRepository dbr)
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
          return  dbr.Add<Groupmembers>(grpMember);
        }
    }
}
