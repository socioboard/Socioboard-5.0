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
                return inMemScheduleMessgae.OrderByDescending(t => t.scheduleTime).ToList(); 
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
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }
                    
                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == 0).OrderByDescending(t=>t.scheduleTime).ToList();
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
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == GroupId).ToList();
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId, lstGroupprofiles);
            }
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
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
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == GroupId).ToList();
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + GroupId, lstGroupprofiles);
            }
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
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


        public static List<Domain.Socioboard.Models.ScheduledMessage> GetAllSentMessages(long userId, long groupId, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessages + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessages + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }

        public static int GetAllSentMessagesCount(long userId,long groupId,Model.DatabaseRepository dbr,Helper.Cache _redisCache)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles;
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
            }

            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).ToList();
            return lstScheduledMessage.Count;
        }

        public static List<Domain.Socioboard.Models.ScheduledMessage> getAllSentMessageDetailsforADay(long userId, long groupId, int days, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CachelSentMessageDetailsforADay + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).Where(a => a.scheduleTime.Date == DateTime.Now.AddDays(-days).Date).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CachelSentMessageDetailsforADay + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }


        public static List<Domain.Socioboard.Models.ScheduledMessage> getAllSentMessageDetailsByDays(long userId, long groupId, int days, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsByDays + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).Where(a => a.scheduleTime.Date >= DateTime.Now.AddDays(-days).Date).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsByDays + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }

        public static List<Domain.Socioboard.Models.ScheduledMessage> getAllSentMessageDetailsByMonth(long userId, long groupId, int month, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsByMonth + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).Where(a => a.scheduleTime.Month == DateTime.Now.AddMonths(-month).Month).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsByMonth + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }

        public static List<Domain.Socioboard.Models.ScheduledMessage> getAllSentMessageDetailsForCustomrange(long userId, long groupId, DateTime sdate, DateTime ldate, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsForCustomrange + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae;
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated).Where(a => a.scheduleTime.Date>= sdate && a.scheduleTime.Date <= ldate).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheSentMessageDetailsForCustomrange + groupId, lstScheduledMessage);
                    return lstScheduledMessage;
                }
                else
                {
                    return null;
                }
            }
        }


        public static List<Domain.Socioboard.Models.ScheduledMessage> getUserAllScheduleMessage(long userId, long groupId, Helper.Cache _redisCache, Helper.AppSettings _appSeetings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.ScheduledMessage> inMemScheduleMessgae = _redisCache.Get<List<Domain.Socioboard.Models.ScheduledMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheScheduleMessage + groupId);
            if (inMemScheduleMessgae != null && inMemScheduleMessgae.Count > 0)
            {
                return inMemScheduleMessgae.OrderByDescending(t => t.scheduleTime).ToList();
            }
            else
            {
                List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Groupprofiles>();
                if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
                {
                    lstGroupprofiles = iMmemGroupprofiles;
                }
                else
                {
                    lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId, lstGroupprofiles);
                }

                profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => profileids.Contains(t.profileId) && (t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending || t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated)).OrderByDescending(t => t.scheduleTime).ToList();
                if (lstScheduledMessage != null && lstScheduledMessage.Count > 0)
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

    }
}
