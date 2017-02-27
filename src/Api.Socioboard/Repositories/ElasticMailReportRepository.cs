using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class ElasticMailReportRepository
    {
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailSentReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
         {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);

            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            ////DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
            //DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t=>t.status== " Sent " && t.time>=dayEnd && t.time<=dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
           

            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailOpenedReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);


            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.status == " Opened " && t.time >= dayEnd && t.time <= dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });


            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailClickedReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);


            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.status == " Clicked " && t.time >= dayEnd && t.time <= dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });


            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailBouncedReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);

            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.status == " Bounced " && t.time >= dayEnd && t.time <= dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });


            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailUnsubscribedReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);



            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.status == " Unsubscribed " && t.time >= dayEnd && t.time <= dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });


            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }
        public static List<Domain.Socioboard.Models.Mongo.ElasticmailReport> getElasticMailAbuseReportReportData(int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("ElasticmailDailyReport", _appSettings);


            double dayStart = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.Date);
            double dayEnd = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow.AddDays(-daysCount).Date);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.status == " AbuseReport " && t.time >= dayEnd && t.time <= dayStart);
            var task = Task.Run(async () =>
            {
                return await ret;
            });


            if (task.Result != null)
            {
                IList<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmailuser = task.Result.ToList();
                return lstelasticmailuser.ToList();

            }
            return new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
        }

    }
}
