using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.Repositories
{
    public class GroupProfilesRepository
    {
        public static List<Domain.Socioboard.Models.Groupprofiles> getGroupProfiles(long groupId, Helper.Cache _redisCache, Helper.DatabaseRepository dbr)
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
    }
}
