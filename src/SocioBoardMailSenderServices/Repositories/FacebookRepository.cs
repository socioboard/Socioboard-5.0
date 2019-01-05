
using Domain.Socioboard.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace SocioBoardMailSenderServices.Repositories
{
    public class FacebookRepository
    {
        public  List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> getFacaebookPageReports(string profileId, int daysCount)
        {
            try
            {
                SocioBoardMailSenderServices.Model.MongoRepository mongorepo = new SocioBoardMailSenderServices.Model.MongoRepository("FacaebookPageDailyReports");
                //MongoRepository mongorepo =
                //List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookPageReportsByProfileId + profileId);
                //if (inMemFacaebookPageDailyReports != null)
                //{
                //    return inMemFacaebookPageDailyReports;
                //}
                //else

                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>(t => t.pageId.Equals(profileId) && (t.date <= SBHelper.ConvertToUnixTimestamp(dayEnd)) && (t.date >= SBHelper.ConvertToUnixTimestamp(dayStart)));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        // _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookPageReportsByProfileId + profileId, lstfbpagereportdata.ToList());
                    }
                    // int likescount = lstfbpagereportdata.Sum(t => t.likes);
                    //string talkingabout = lstfbpagereportdata.Sum(t => t.talkingAbout);


                    return lstfbpagereportdata.ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();

            }
            catch(Exception ex)
            {
                return new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();
            }


        }
    }
}
