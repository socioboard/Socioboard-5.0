using Api.Socioboard.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class FacaebookPageReportsRepositories
    {
        public static List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> getFacaebookPageReports(string profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _appSettings);
            List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookPageReportsByProfileId + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>(t => t.pageId.Equals(profileId) && (t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd)) && (t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart)));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result!=null)
                {
                    IList<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookPageReportsByProfileId + profileId, lstfbpagereportdata.ToList());
                    }
                    return lstfbpagereportdata.ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.FacebookPagePost> getFacebookPagePostReports(string profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("FacebookPagePost", _appSettings);

            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePost>(t => t.PageId == profileId && (t.CreatedTime <= Helper.DateExtension.ToUnixTimestamp(dayEnd) && t.CreatedTime >= Helper.DateExtension.ToUnixTimestamp(dayStart)));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.FacebookPagePost> lstfacebookpagepost = task.Result.ToList();
            return lstfacebookpagepost.ToList();

        }

        public static List<Domain.Socioboard.ViewModels.FacebookPublicReportViewModal> GetFacebookPublicPageReport(Model.DatabaseRepository dbr,Helper.AppSettings _appSettings,int day)
        {
            List<Domain.Socioboard.ViewModels.FacebookPublicReportViewModal> lstFacebookPublicReportViewModal = new List<Domain.Socioboard.ViewModels.FacebookPublicReportViewModal>();
            List<Domain.Socioboard.Models.Facebookaccounts> lstfbacc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPublicPage).ToList();
            foreach (var item in lstfbacc)
            {
                Domain.Socioboard.ViewModels.FacebookPublicReportViewModal objreportdata = new Domain.Socioboard.ViewModels.FacebookPublicReportViewModal();
                MongoRepository mongoreppopage = new MongoRepository("Fbpublicpagedailyreports", _appSettings);

                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongoreppopage.Find<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports>(t => t.pageid == item.FbUserId && t.date <= Helper.DateExtension.ToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports> lstfacebookpagepost = task.Result.ToList();
                objreportdata.FacebookAccount = item;
                objreportdata.Fbpublicpagedailyreports = lstfacebookpagepost.ToList();
                lstFacebookPublicReportViewModal.Add(objreportdata);
            }
            return lstFacebookPublicReportViewModal;
        }
    }
}
