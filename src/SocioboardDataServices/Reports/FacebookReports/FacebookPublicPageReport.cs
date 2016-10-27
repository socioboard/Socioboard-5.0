using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports.FacebookReports
{
    public class FacebookPublicPageReport
    {
        public static void CreateFacebookPublicPageReport()
        {
            Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
            while(true)
            {
                try
                {
                    Model.DatabaseRepository dbr = new Model.DatabaseRepository();
                    List<Domain.Socioboard.Models.Facebookaccounts> lstFbacc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPublicPage && t.IsActive).ToList();
                    foreach (var item in lstFbacc)
                    {
                        if (item.lastpagereportgenerated.AddHours(24) <= DateTime.UtcNow)
                        {
                            CreateReport(item.FbUserId, item.Is90DayDataUpdated);
                            item.Is90DayDataUpdated = true;
                            item.lastpagereportgenerated = DateTime.UtcNow;
                            dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(item);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }

        public static void CreateReport(string ProfileId, bool is90daysupdated)
        {
            int day = 1;
            if(!is90daysupdated)
            {
                day = 90;
            }
            for (int i = 0; i < day; i++)
            {
                DateTime date = DateTime.UtcNow.AddDays(-1 * i);
                Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports _Fbpublicpagedailyreports = new Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports();
                DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
                MongoRepository mongoreppo = new MongoRepository("FbPublicPagePost");
                MongoRepository mongoreppopage = new MongoRepository("Fbpublicpagedailyreports");
                var ret = mongoreppo.Find<Domain.Socioboard.Models.Mongo.FbPublicPagePost>(t => t.PageId == ProfileId && t.PostDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.PostDate >= SBHelper.ConvertToUnixTimestamp(dayStart));
                var task=Task.Run(async()=>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.FbPublicPagePost> lstFbPublicPagePost = task.Result.ToList();
                _Fbpublicpagedailyreports.id= ObjectId.GenerateNewId();
                _Fbpublicpagedailyreports.date = SBHelper.ConvertToUnixTimestamp(date);
                _Fbpublicpagedailyreports.likescount = lstFbPublicPagePost.ToList().Sum(t => t.Likes);
                _Fbpublicpagedailyreports.pageid = ProfileId;
                _Fbpublicpagedailyreports.pommentscount = lstFbPublicPagePost.ToList().Sum(t=>t.Comments);
                _Fbpublicpagedailyreports.postscount = lstFbPublicPagePost.ToList().Count();
                _Fbpublicpagedailyreports.sharescount = lstFbPublicPagePost.ToList().Sum(t => t.Shares);

                var retfb = mongoreppopage.Find<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports>(t => t.date >= _Fbpublicpagedailyreports.date && t.pageid == _Fbpublicpagedailyreports.pageid);
                var taskfb=Task.Run(async()=>{
                    return await retfb;
                });
                IList<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports> lstfbpublicreport = taskfb.Result.ToList();
                if(lstfbpublicreport.ToList().Count<1)
                {
                    mongoreppopage.Add<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports>(_Fbpublicpagedailyreports);
                }
            }
            
        }
    }
}
