using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class AffiliatesRepository
    {
        public static void AddAffiliate(long userId,long friendId,double amount,Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Affiliates _Affiliates = new Domain.Socioboard.Models.Affiliates();
            _Affiliates.AffiliateDate = DateTime.UtcNow;
            _Affiliates.Amount = amount;
            _Affiliates.UserId = userId;
            _Affiliates.FriendUserId = friendId;
            dbr.Add(_Affiliates);
        }

        public static List<Domain.Socioboard.Models.Affiliates> GetAffiliateDataByUserId(long userId, long friendId, Model.DatabaseRepository dbr,Helper.Cache _redisCache)
        {
            List<Domain.Socioboard.Models.Affiliates> inMemAffiliates = _redisCache.Get<List<Domain.Socioboard.Models.Affiliates>>(Domain.Socioboard.Consatants.SocioboardConsts.Affiliates + userId);
            if(inMemAffiliates!=null)
            {
                return inMemAffiliates;
            }
            else
            {
                List<Domain.Socioboard.Models.Affiliates> lstAffiliates = dbr.Find<Domain.Socioboard.Models.Affiliates>(t => t.UserId == userId && t.FriendUserId == friendId).ToList();
                if(lstAffiliates!=null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.Affiliates + userId, lstAffiliates);
                }
                return lstAffiliates;
            }
        }

        public static List<Domain.Socioboard.Models.Affiliates> GetAffilieteDetailbyUserId(long userId,Model.DatabaseRepository dbr,Helper.Cache _redisCache)
        {
            List<Domain.Socioboard.Models.Affiliates> inMemAffiliates = _redisCache.Get<List<Domain.Socioboard.Models.Affiliates>>(Domain.Socioboard.Consatants.SocioboardConsts.Affiliates + userId);
            if (inMemAffiliates != null)
            {
                return inMemAffiliates;
            }
            else
            {
                List<Domain.Socioboard.Models.Affiliates> lstAffiliates = dbr.Find<Domain.Socioboard.Models.Affiliates>(t => t.UserId == userId).ToList();
                if (lstAffiliates != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.Affiliates + userId, lstAffiliates);
                }
                return lstAffiliates;
            }
        }
    }
}
