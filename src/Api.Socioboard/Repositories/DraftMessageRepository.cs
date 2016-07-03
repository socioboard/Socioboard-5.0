using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class DraftMessageRepository
    {
        public static List<Domain.Socioboard.Models.Draft> getUsreDraftMessage(long userId,long GroupId, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.Draft> inMemDraftMessgae = _redisCache.Get<List<Domain.Socioboard.Models.Draft>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheDraftMessage + userId);
            if (inMemDraftMessgae != null && inMemDraftMessgae.Count > 0)
            {
                return inMemDraftMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Draft> lstDraftMessage = dbr.Find<Domain.Socioboard.Models.Draft>(t => t.userId == userId && t.GroupId== GroupId).ToList();
                if (lstDraftMessage != null && lstDraftMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDraftMessage + userId, lstDraftMessage);
                    return lstDraftMessage;
                }
                else
                {
                    return null;
                }
            }
        }

        public static List<Domain.Socioboard.Models.Draft> DeleteDraftMessage(long draftId, long userId, long GroupId, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Draft _draft = dbr.Find<Domain.Socioboard.Models.Draft>(t => t.id == draftId).FirstOrDefault();
            dbr.Delete<Domain.Socioboard.Models.Draft>(_draft);
            List<Domain.Socioboard.Models.Draft> lstDraftMessage = dbr.Find<Domain.Socioboard.Models.Draft>(t => t.userId == userId && t.GroupId == GroupId).ToList();
            if (lstDraftMessage != null && lstDraftMessage.Count > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDraftMessage + userId, lstDraftMessage);
                return lstDraftMessage;
            }
            else
            {
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.Draft> EditDraftMessage(long draftId, long userId, long GroupId,string message, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Draft _draft = dbr.Find<Domain.Socioboard.Models.Draft>(t => t.id == draftId).FirstOrDefault();
            _draft.shareMessage = message;
            int isSaved = dbr.Update<Domain.Socioboard.Models.Draft>(_draft);
            List<Domain.Socioboard.Models.Draft> lstDraftMessage = dbr.Find<Domain.Socioboard.Models.Draft>(t => t.userId == userId && t.GroupId == GroupId).ToList();
            if (lstDraftMessage != null && lstDraftMessage.Count > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDraftMessage + userId, lstDraftMessage);
                return lstDraftMessage;
            }
            else
            {
                return null;
            }
        }
    }
}
