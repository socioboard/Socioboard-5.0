using Api.Socioboard.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class GroupReportRepository
    {
        public static List<Domain.Socioboard.Models.Mongo.GroupdailyReports> getgroupReportData(long groupId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _settings)
        {

            List<Domain.Socioboard.Models.Mongo.GroupdailyReports> inMemGroupdailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.GroupdailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupdailyReports + groupId);
            if (inMemGroupdailyReports != null)
            {
                return inMemGroupdailyReports;
            }
            else
            {
                MongoRepository mongoreppo = new MongoRepository("GroupdailyReports", _settings);
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongoreppo.Find<Domain.Socioboard.Models.Mongo.GroupdailyReports>(t => t.GroupId == groupId && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.GroupdailyReports> lstGroupdailyReportsdata = task.Result.ToList();
                    if (lstGroupdailyReportsdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupdailyReports + groupId, lstGroupdailyReportsdata.ToList());
                    }
                    return lstGroupdailyReportsdata.ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.GroupdailyReports>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> getfacebookpageGroupReportData(long groupId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _settings, Model.DatabaseRepository dbr)
        {
            MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _settings);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
            string[] profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>(t => profileids.Contains(t.pageId) && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });

            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> lstfbpagereportdata = task.Result.ToList();
                return lstfbpagereportdata.ToList();
            }
            else
            {
                return new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();
            }

        }

        public static List<MongoTwitterDailyReports> GetTwitterMessageReports(long groupId, int dayCount, Helper.Cache _redisCache, Helper.AppSettings settings,Model.DatabaseRepository dbr)
        {
            
                List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
                string[] profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
                MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports", settings);
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-dayCount).Year, DateTime.UtcNow.AddDays(-dayCount).Month, DateTime.UtcNow.AddDays(-dayCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var result = mongorepo.Find<MongoTwitterDailyReports>(t => profileids.Contains(t.profileId) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterDailyReports> lstDailyReports = task.Result;
                return lstDailyReports.ToList();
           
        }
    }
}
