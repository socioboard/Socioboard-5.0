using Api.Socioboard.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Models;

namespace Api.Socioboard.Helper
{
    public class ScheduleMessageHelper
    {
        public static void ScheduleMessage(string profileId,string socialprofileName,string shareMessage, Domain.Socioboard.Enum.SocialProfileType profiletype, long userId,string url,string picUrl,string scheduleTime, AppSettings _AppSettings, Cache _redisCache, DatabaseRepository dbr, ILogger _logger)
        {
            ScheduledMessage scheduledMessage = new ScheduledMessage();
            scheduledMessage.shareMessage = shareMessage;
            scheduledMessage.scheduleTime = DateTime.Parse(scheduleTime);
            scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Pending;
            scheduledMessage.userId = userId;
            scheduledMessage.profileType = profiletype;
            scheduledMessage.profileId = profileId;
            scheduledMessage.url = url;
            scheduledMessage.picUrl = picUrl;
            scheduledMessage.createTime = DateTime.UtcNow;
            dbr.Add<ScheduledMessage>(scheduledMessage);
        }

        public static void DraftScheduleMessage(string shareMessage, long userId,long groupId, string picUrl, string scheduleTime, AppSettings _AppSettings, Cache _redisCache, DatabaseRepository dbr, ILogger _logger)
        {
            Draft _Draft = new Draft();
            _Draft.shareMessage = shareMessage;
            _Draft.scheduleTime = DateTime.Parse(scheduleTime);
            _Draft.userId = userId;
            _Draft.GroupId = groupId;
            _Draft.picUrl = picUrl;
            _Draft.createTime = DateTime.UtcNow;
            dbr.Add<Draft>(_Draft);
        }
    }
}
