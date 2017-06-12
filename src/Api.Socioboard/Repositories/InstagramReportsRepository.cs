using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using System;
using System.Collections.Generic;
using System.Drawing;
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
                    return lstfbpagereportdata.OrderBy(t=>t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.InstagramDailyReport>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.InstagramDailyReport> getInstagramReport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
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
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.InstagramDailyReport>(t =>profileId.Contains(t.profileId) && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
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
                    return lstfbpagereportdata.OrderBy(t => t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.InstagramDailyReport>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing> getInstafollofollowingReport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("InstagramDailyReport", _appSettings);
            List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing> reportdata = new List<InstaFollowerFollowing>();
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.InstagramDailyReport>(t => profileId.Contains(t.profileId) && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.InstagramDailyReport> lstfbpagereportdata = task.Result.ToList();
                    var Instapid = lstfbpagereportdata.GroupBy(x => x.profileId).Select(x => x.First()).ToList();
                    var random = new Random();
                    foreach (Domain.Socioboard.Models.Mongo.InstagramDailyReport lstcolordata in Instapid)
                    {
                        
                        var randomColor = String.Format("#{0:X6}", random.Next(0x1000000));
                        Domain.Socioboard.Models.Mongo.InstaFollowerFollowing repo = new InstaFollowerFollowing();
                        long InstaFollowerCount = lstfbpagereportdata.ToList().Where(t => t.profileId==lstcolordata.profileId).Sum(t => t.followcount);
                        long InstaFollowingCount = lstfbpagereportdata.ToList().Where(t => t.profileId == lstcolordata.profileId).Sum(t => t.followingcount);
                        repo.startdate=dayStart;
                        repo.endtdate=dayEnd;
                        repo.InstaFollowerCounts = InstaFollowerCount;
                        repo.InstaFollowingCounts = InstaFollowingCount;
                        repo.profileId = lstcolordata.profileId;
                        repo.instaName = lstcolordata.instaName;
                        repo.profilepic = lstcolordata.profilePicUrl;
                        repo.colors =Convert.ToString(randomColor);
                        reportdata.Add(repo);
                    }
                    // long TwitterFollowerCount = lstfbpagereportdata.ToList().Where(t => profileId.Contains(t.profileId)).Sum(t => t.followcount);
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return reportdata.OrderBy(t => t.startdate).ToList();
                   // return lstfbpagereportdata.OrderBy(t => t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing>();
            }
            
        }


        public static List<Domain.Socioboard.Models.Mongo.InstagramFeed> getInstagramfeedsreport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("InstagramFeed", _appSettings);
            List<Domain.Socioboard.Models.Mongo.InstagramFeed> inMeminstagramfeedsReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.InstagramFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMeminstagramfeedsReports != null)
            {
                return inMeminstagramfeedsReports;
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.InstagramFeed>(t => profileId.Contains(t.InstagramId) && t.FeedDate <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.InstagramFeed> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return lstfbpagereportdata.OrderBy(t => t.FeedDate).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.InstagramFeed>();
            }
        }
    }
}
