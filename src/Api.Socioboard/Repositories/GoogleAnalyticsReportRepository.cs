using Api.Socioboard.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Socioboard.Helper;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Threading;
using Domain.Socioboard.ViewModels;
using Domain.Socioboard.Models.Mongo;

namespace Api.Socioboard.Repositories
{
    public class GoogleAnalyticsReportRepository
    {
        public static List<GoogleAnalyticsReport> getGoogleAnalyticsReportData(string profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            var mongorepo = new MongoRepository("GoogleAnalyticsReport", _appSettings);

            var inMemGoogleAnalyticsDailyReports = _redisCache.Get<List<GoogleAnalyticsReport>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGoogleAnalyticsReport + profileId);

            if (inMemGoogleAnalyticsDailyReports != null)
                return inMemGoogleAnalyticsDailyReports;

            if (daysCount == -1)
            {
                var ret = mongorepo.Find<GoogleAnalyticsReport>(t => t.GaProfileId == profileId);

                var task = Task.Run(async () => { return await ret; });

                if (task.Result == null)
                    return new List<GoogleAnalyticsReport>();

                var lstGoogleAnalyticsReport = task.Result.ToList();

                if (lstGoogleAnalyticsReport.Count > 0)
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGoogleAnalyticsReport + profileId, lstGoogleAnalyticsReport.ToList());

                return lstGoogleAnalyticsReport.ToList();
            }
            else
            {
                var dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<GoogleAnalyticsReport>(t => t.GaProfileId == profileId && t.date <= DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= DateExtension.ConvertToUnixTimestamp(dayStart));

                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                  var   lstGoogleAnalyticsReport = task.Result.ToList();
                    if (lstGoogleAnalyticsReport.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGoogleAnalyticsReport + profileId, lstGoogleAnalyticsReport.ToList());
                    }
                    return lstGoogleAnalyticsReport.ToList();
                }
            }

            return new List<GoogleAnalyticsReport>();

        }

        //for twiter
        public static List<TwitterUrlMentions> GetTwitterMentionReports(string HostName, int dayCount, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository TwtsearchRepo = new MongoRepository("TwitterUrlMentions", settings);

            if (dayCount == -1)
            {
                var allResult = TwtsearchRepo.Find<TwitterUrlMentions>(t => t.HostName.Equals(HostName) );

                var allTask = Task.Run(async () =>
                {
                    return await allResult;
                });

                IList<TwitterUrlMentions> allReports = allTask.Result;
                return allReports.ToList();
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);

                var result = TwtsearchRepo.Find<TwitterUrlMentions>(t => t.HostName.Equals(HostName) && (t.Feeddate > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.Feeddate < SBHelper.ConvertToUnixTimestamp(dayEnd)));

                var task = Task.Run(async () =>
                {
                    return await result;
                });

                IList<TwitterUrlMentions> lstDailyReports = task.Result;
                return lstDailyReports.ToList();

            }

        }

        // for article and blogs;
        public static List<ArticlesAndBlogs> GetArticlesAndBlogsReports(string HostName, int dayCount, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            MongoRepository ArticlesAndBlogsRepo = new MongoRepository("ArticlesAndBlogs", settings);

            if (dayCount == -1)
            {
                var allResult = ArticlesAndBlogsRepo.Find<ArticlesAndBlogs>(t => t.HostName.Equals(HostName));

                var allTask = Task.Run(async () =>
                {
                    return await allResult;
                });

                IList<ArticlesAndBlogs> allReports = allTask.Result;
                return allReports.ToList();
            }
  
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = ArticlesAndBlogsRepo.Find<ArticlesAndBlogs>(t => t.HostName.Equals(HostName) && (t.Created_Time > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.Created_Time < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<ArticlesAndBlogs> lstArticlesAndBlogs = task.Result;
            return lstArticlesAndBlogs.ToList();

        }

    }

}
