using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class InstagramReportsRepository
    {
        public static List<Domain.Socioboard.Models.Mongo.InstagramDailyReport> getInstagramReportData(string profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("InstagramDailyReport", _appSettings);
            List<Domain.Socioboard.Models.Mongo.InstagramDailyReport> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.InstagramDailyReport>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.InstagramDailyReport>(t => t.profileId == profileId && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.InstagramDailyReport> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return lstfbpagereportdata.ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.InstagramDailyReport>();
            }
        }
    }
}
