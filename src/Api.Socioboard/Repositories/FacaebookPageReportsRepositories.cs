using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
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


        public static List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans> GetTotalFanpageDet(List<Domain.Socioboard.Models.Facebookaccounts> lstfanpageacc, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {

            MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _appSettings);
            string[] profileId = lstfanpageacc.Select(t => t.FbUserId).ToArray();
            List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {

                List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans> reportdata = new List<totalFacebookpagefans>();
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>(t => profileId.Contains(t.pageId) && (t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd)) && (t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart)));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> lstfbfanpage = task.Result.ToList();
                    lstfbfanpage = lstfbfanpage.OrderByDescending(t => t.date).ToList();
                    var facebookId = lstfbfanpage.GroupBy(x => x.pageId).Select(x => x.First()).ToList();
                    var random = new Random();
                    foreach (Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports lstcolordata in facebookId)
                    {
                        List<Domain.Socioboard.Models.Facebookaccounts> lstacc = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        var randomColor = String.Format("#{0:X6}", random.Next(0x1000000));
                        Domain.Socioboard.Models.Mongo.totalFacebookpagefans fbreportData = new totalFacebookpagefans();
                        // string fansCount = lstfbfanpage.ToList().Where(t => t.pageId == lstcolordata.pageId).Sum(t => Convert.ToInt64(t.perDayLikes)).ToString();

                        lstacc = lstfanpageacc.Where<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == lstcolordata.pageId).ToList();
                        //lstFbAcc = lstFbAcc.Where(t => t.FbUserId.Contains("1842605449304385")).ToList();


                        fbreportData.startdate = dayStart;
                        fbreportData.endtdate = dayEnd;
                        fbreportData.totalfans = lstcolordata.totalLikes;
                        fbreportData.profileId = lstcolordata.pageId;
                        fbreportData.facebookPagename = lstacc.First().FbUserName;
                        fbreportData.profilepic = lstacc.First().ProfileUrl;
                        fbreportData.colors = Convert.ToString(randomColor);

                        reportdata.Add(fbreportData);
                    }
                    if (lstfbfanpage.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbfanpage.ToList());
                    }
                    return reportdata.OrderBy(t => t.startdate).ToList();
                    // return lstfbpagereportdata.OrderBy(t => t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> GetFbpageDetails(string[] lstfbpageid, Model.DatabaseRepository dbr, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + lstfbpageid);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fbpdailyrep = new List<FacaebookPageDailyReports>();
                Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports fbdailyrepodata = new FacaebookPageDailyReports();
                MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _appSettings);

                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);

                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>(t => lstfbpageid.Contains(t.pageId) && t.date <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.date >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                if (task.Result != null)
                {
                    List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> lstfbpagedet = task.Result.ToList();
                    if (lstfbpagedet.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + lstfbpageid, lstfbpagedet.ToList());
                    }
                    return lstfbpagedet.OrderBy(t => t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails> getfbPagePostAllDetails(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("FacebookPagePost", _appSettings);
            //string[] profileId = lstfanpageacc.Select(t => t.FbUserId).ToArray();
            List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {

                List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails> reportdata = new List<totalfbPagePostDetails>();

                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePost>(t => profileId.Contains(t.PageId) && (t.CreatedTime <= Helper.DateExtension.ToUnixTimestamp(dayEnd) && t.CreatedTime >= Helper.DateExtension.ToUnixTimestamp(dayStart)));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.FacebookPagePost> lstfacebookpagepost = task.Result.ToList();
                    var facebookId = lstfacebookpagepost.GroupBy(x => x.PageId).Select(x => x.First()).ToList();
                    var random = new Random();
                    foreach (Domain.Socioboard.Models.Mongo.FacebookPagePost lstcolordata in facebookId)
                    {
                        List<Domain.Socioboard.Models.Facebookaccounts> lstacc = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        var randomColor = String.Format("#{0:X6}", random.Next(0x1000000));

                        Domain.Socioboard.Models.Mongo.totalfbPagePostDetails fbreportData = new totalfbPagePostDetails();
                        string comments = lstfacebookpagepost.ToList().Where(t => t.PageId == lstcolordata.PageId).Sum(t => Convert.ToInt64(t.Comments)).ToString();
                        string likes = lstfacebookpagepost.ToList().Where(t => t.PageId == lstcolordata.PageId).Sum(t => Convert.ToInt64(t.Likes)).ToString();
                        string posts = null;
                        try
                        {
                            posts = lstfacebookpagepost.ToList().Where(t => t.PageId == lstcolordata.PageId).Count(t => Convert.ToBoolean(int.Parse(t.PostId))).ToString();

                        }
                        catch (Exception ex)
                        {

                        }
                        string talkings = lstfacebookpagepost.ToList().Where(t => t.PageId == lstcolordata.PageId).Sum(t => Convert.ToInt64(t.Talking)).ToString();
                        string shares = lstfacebookpagepost.ToList().Where(t => t.PageId == lstcolordata.PageId).Sum(t => Convert.ToInt64(t.Shares)).ToString();

                        // lstacc = lstfanpageacc.Where<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == lstcolordata.pageId).ToList();

                        fbreportData.startDate = dayStart;
                        fbreportData.endDate = dayEnd;
                        fbreportData.profileId = lstcolordata.PageId;
                        fbreportData.name = lstcolordata.PageName;
                        fbreportData.commnets = comments;
                        fbreportData.likes = likes;
                        fbreportData.shares = shares;
                        //fbreportData.post = posts;
                        fbreportData.color = Convert.ToString(randomColor);
                        reportdata.Add(fbreportData);
                    }
                    return reportdata.OrderBy(t => t.startDate).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails>();
            }   
        }

    }
}
