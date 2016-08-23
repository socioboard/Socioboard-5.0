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
    }
}
