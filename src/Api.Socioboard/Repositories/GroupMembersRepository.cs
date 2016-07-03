using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
