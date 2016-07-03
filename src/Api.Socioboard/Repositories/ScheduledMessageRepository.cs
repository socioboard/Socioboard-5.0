using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class ScheduledMessageRepository
    {
      public static List<Domain.Socioboard.Models.ScheduledMessage> getUsreScheduleMessage(long userId,long groupId,Helper.Cache _redisCache,Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheScheduleMessage + groupId);
            if(inMemScheduleMessgae!=null && inMemScheduleMessgae.Count>0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if(iMmemGroupprofiles!=null && iMmemGroupprofiles.Count>0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.GroupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }
                    
                profileids = lstGroupprofiles.Select(t => t.ProfileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == 0).ToList();
                if(lstScheduledMessage!=null && lstScheduledMessage.Count>0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheScheduleMessage + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }

        public static List<Domain.Socioboard.Models.ScheduledMessage> DeleteSocialMessages(long socioqueueId, long userId, long GroupId, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            Domain.Socioboard.Models.ScheduledMessage ScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.id == socioqueueId).FirstOrDefault();
            ScheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Deleted;
            dbr.Update<Domain.Socioboard.Models.ScheduledMessage>(ScheduledMessage);
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles;
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.GroupId == GroupId).ToList();
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId, lstGroupprofiles);
            }
            profileids = lstGroupprofiles.Select(t => t.ProfileId).ToArray();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId)&&t.status==0).ToList();
            if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheScheduleMessage + GroupId, lstScheduledMessage);
                return lstScheduledMessage;
            }
            else
            {
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.ScheduledMessage> EditScheduleMessage(long socioqueueId, long userId, long GroupId, string message, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            Domain.Socioboard.Models.ScheduledMessage _ScheduleMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.id == socioqueueId).FirstOrDefault();
            _ScheduleMessage.shareMessage = message;
            int isSaved = dbr.Update<Domain.Socioboard.Models.ScheduledMessage>(_ScheduleMessage);
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles;
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.GroupId == GroupId).ToList();
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId, lstGroupprofiles);
            }
            profileids = lstGroupprofiles.Select(t => t.ProfileId).ToArray();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == 0).ToList();
            if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheScheduleMessage + GroupId, lstScheduledMessage);
                return lstScheduledMessage;
            }
            else
            {
                return null;
            }
        }
    }
}
