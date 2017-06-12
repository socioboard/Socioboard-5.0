using Api.Socioboard.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class YoutubeReportsRepository
    {

        public static List<Domain.Socioboard.Models.Mongo.YoutubeReports> GetYoutubeReports(string ChannelId, long groupIds, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            List<Domain.Socioboard.Models.Mongo.YoutubeReports> lstReports = new List<Domain.Socioboard.Models.Mongo.YoutubeReports>();

            MongoRepository mongorepo_channel = new MongoRepository("YoutubeReportsData", settings);
            var result_channel = mongorepo_channel.Find<Domain.Socioboard.Models.Mongo.YoutubeReports>(t => t.datetime_unix < UnixTimeNows(DateTime.UtcNow) && t.datetime_unix >= UnixTimeNows(DateTime.UtcNow.AddDays(-90)) && t.channelId.Equals(ChannelId));
            var task_channel = Task.Run(async () =>
            {
                return await result_channel;
            });
            IList<Domain.Socioboard.Models.Mongo.YoutubeReports> lstYtReports_channel = task_channel.Result;


            foreach (var items_reports in lstYtReports_channel)
            {
                items_reports.SubscribersGained = items_reports.SubscribersGained-items_reports.subscribersLost;
            }
            
            try
            {
                var lstYtReports_channel_sorted = lstYtReports_channel.OrderBy(t => t.datetime_unix);
                return lstYtReports_channel_sorted.ToList();
            }
            catch
            {
                return lstYtReports_channel.ToList();
            }


        }


        public static List<Domain.Socioboard.Models.Mongo.YoutubeReports> GetYoutubeBulkReports(long groupId, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            List<Domain.Socioboard.Models.Mongo.YoutubeReports> lstReports = new List<Domain.Socioboard.Models.Mongo.YoutubeReports>();

            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube).ToList();
            List<Domain.Socioboard.Models.YoutubeChannel> lstYoutubeChannel = new List<Domain.Socioboard.Models.YoutubeChannel>();


            foreach (var item in lstGroupprofiles)
            {
                Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.YoutubeReportsRepository.GetYtChannelLsts(item.profileId, _redisCache, dbr);
                if (YTChnl != null)
                {
                    lstYoutubeChannel.Add(YTChnl);
                }
            }

            MongoRepository mongorepo_channel = new MongoRepository("YoutubeReportsData", settings);
            var result_channel = mongorepo_channel.Find<Domain.Socioboard.Models.Mongo.YoutubeReports>(t => t.datetime_unix < UnixTimeNows(DateTime.UtcNow) && t.datetime_unix >= UnixTimeNows(DateTime.UtcNow.AddDays(-90)) && t.channelId.Contains(lstYoutubeChannel.First().YtubeChannelId));
            var task_channel = Task.Run(async () =>
            {
                return await result_channel;
            });
            IList<Domain.Socioboard.Models.Mongo.YoutubeReports> lstYtReports_channel = task_channel.Result;
            try
            {
                var lstYtReports_channel_sorted = lstYtReports_channel.OrderBy(t => t.datetime_unix);
            }
            catch
            {
                var lstYtReports_channel_sorted = lstYtReports_channel.ToList();
            }

            foreach(var channel_Items in lstYoutubeChannel)
            {
                if(channel_Items!=lstYoutubeChannel.First())
                {
                    var result_channels = mongorepo_channel.Find<Domain.Socioboard.Models.Mongo.YoutubeReports>(t => t.datetime_unix < UnixTimeNows(DateTime.UtcNow) && t.datetime_unix >= UnixTimeNows(DateTime.UtcNow.AddDays(-90)) && t.channelId.Contains(channel_Items.YtubeChannelId));
                    var task_channels = Task.Run(async () =>
                    {
                        return await result_channels;
                    });
                    IList<Domain.Socioboard.Models.Mongo.YoutubeReports> lstYtReports_channel_new = task_channels.Result;

                    foreach(var new_item in lstYtReports_channel_new)
                    {
                        foreach(var main_list in lstYtReports_channel)
                        {
                            if(main_list.datetime_unix==new_item.datetime_unix)
                            {
                                main_list.views = main_list.views + new_item.views;
                                main_list.likes = main_list.likes + new_item.likes;
                                main_list.comments = main_list.comments + new_item.comments;
                            }
                        }
                    }
                }
            }

            try
            {
                var lstYtReports_channel_sorted = lstYtReports_channel.OrderBy(t => t.datetime_unix);
                return lstYtReports_channel_sorted.ToList();
            }
            catch
            {
                var lstYtReports_channel_sorted = lstYtReports_channel.ToList();
                return lstYtReports_channel_sorted.ToList();
            }

        }


        //All Data
        //channels
        public static List<Domain.Socioboard.Models.YoutubeChannel> GetYtAllChaData(long groupIds, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            List<Domain.Socioboard.Models.YoutubeReports_all> lstReportsAll = new List<Domain.Socioboard.Models.YoutubeReports_all>();

            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupIds).Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube).ToList();
            List<Domain.Socioboard.Models.YoutubeChannel> lstYoutubeChannel = new List<Domain.Socioboard.Models.YoutubeChannel>();


            foreach (var item in lstGroupprofiles)
            {
                Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.YoutubeReportsRepository.GetYtChannelLsts(item.profileId, _redisCache, dbr);
                if (YTChnl != null)
                {
                    lstYoutubeChannel.Add(YTChnl);
                }
            }

            return lstYoutubeChannel;                    

        }

        //
        //videos
        public static List<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList> GetYtAllVdoData(long groupIds, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupIds).Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube).ToList();
            List<Domain.Socioboard.Models.YoutubeChannel> lstYoutubeChannel = new List<Domain.Socioboard.Models.YoutubeChannel>();

            List<string> lstChannelIds = new List<string>();
            foreach (var item in lstGroupprofiles)
            {
                Domain.Socioboard.Models.YoutubeChannel YTChnl = Repositories.YoutubeReportsRepository.GetYtChannelLsts(item.profileId, _redisCache, dbr);
                if (YTChnl != null)
                {
                    lstYoutubeChannel.Add(YTChnl);
                    lstChannelIds.Add(YTChnl.YtubeChannelId);
                }
            }


            MongoRepository mongorepo = new MongoRepository("YoutubeVideosDetailedList", settings);

            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList>(t => lstChannelIds.Contains(t.channelId));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList> lstVideos = task.Result;
            try
            {
                var lstVideos_sorted = lstVideos.OrderBy(t => Convert.ToDateTime(t.publishedAt)).ToList();
                return lstVideos_sorted.ToList();
            }
            catch
            {
                var lstVideos_sorted = lstVideos;
                return lstVideos_sorted.ToList();
            }
        }




        //Custom table report data
        public static List<Domain.Socioboard.Models.YoutubeReports_all> GetYtCustomTableData(string channelId, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            List<Domain.Socioboard.Models.YoutubeReports_all> lstReportsAll = new List<Domain.Socioboard.Models.YoutubeReports_all>();


            List<Domain.Socioboard.Models.YoutubeChannel> lstChannel = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.YtubeChannelId == channelId).ToList();


            Domain.Socioboard.Models.YoutubeReports_all _intaReportsStats = new Domain.Socioboard.Models.YoutubeReports_all();
                MongoRepository mongorepo = new MongoRepository("YoutubeVideosDetailedList", settings);

                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList>(t => t.channelId.Equals(channelId));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList> lstVideos = task.Result;
                IList<Domain.Socioboard.Models.Mongo.YoutubeVideoDetailsList> lstVideos_sorted;

                try
                {
                    lstVideos_sorted = lstVideos.OrderBy(t => Convert.ToDateTime(t.publishedAt)).ToList();
                }
                catch
                {
                    lstVideos_sorted = lstVideos;
                }

                _intaReportsStats._YoutubeChannelss = lstChannel.First();
                _intaReportsStats._YoutubeVideoss = lstVideos_sorted.ToList();

                lstReportsAll.Add(_intaReportsStats);

            return lstReportsAll;

        }

        //
        public static Domain.Socioboard.Models.YoutubeChannel GetYtChannelLsts(string YtChannelId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.YoutubeChannel inMemYTChannel = _redisCache.Get<Domain.Socioboard.Models.YoutubeChannel>(Domain.Socioboard.Consatants.SocioboardConsts.CacheYTChannel + YtChannelId);
                if (inMemYTChannel != null)
                {
                    return inMemYTChannel;
                }
            }
            catch { }

            List<Domain.Socioboard.Models.YoutubeChannel> lstYTChannel = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.YtubeChannelId.Equals(YtChannelId)).ToList();
            if (lstYTChannel != null && lstYTChannel.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheYTChannel + YtChannelId, lstYTChannel.First());
                return lstYTChannel.First();
            }
            else
            {
                return null;
            }

        }

        //total subscriber 
        public static List<Domain.Socioboard.Models.TotalYoutubesubscriber> GetYtTotalsubscriber(string userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            int tmmp = Convert.ToInt32(userId);
            IList<Domain.Socioboard.Models.YoutubeChannel> subscriberC = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.UserId.Equals(tmmp));

            var x = subscriberC;
            List<string> subscriberlist = new List<string>();
            foreach (var item in x)
            {
                subscriberlist.Add(item.YtubeChannelId);
            }

            MongoRepository mongorepo = new MongoRepository("YoutubeReportsData", _appSettings);
            List<Domain.Socioboard.Models.TotalYoutubesubscriber> lstSub = new List<Domain.Socioboard.Models.TotalYoutubesubscriber>();

            foreach (var itemss in subscriberC)
            {
                var Result = mongorepo.Find<Domain.Socioboard.Models.Mongo.YoutubeReports>(t => t.datetime_unix < UnixTimeNows(DateTime.UtcNow) && t.datetime_unix >= UnixTimeNows(DateTime.UtcNow.AddDays(-90)) && t.channelId.Equals(itemss.YtubeChannelId));
                var task = Task.Run(async () =>
                {
                    return await Result;
                });
                IList<Domain.Socioboard.Models.Mongo.YoutubeReports> totallistT = task.Result;
                var random = new Random();
                var randomColor = String.Format("#{0:X6}", random.Next(0x1000000));
                Domain.Socioboard.Models.TotalYoutubesubscriber repoSub = new Domain.Socioboard.Models.TotalYoutubesubscriber();
                int countSub = totallistT.ToList().Sum(t => t.SubscribersGained);
                int countsublost = totallistT.ToList().Sum(t => t.subscribersLost);
                int totalsub = countSub - countsublost;
                repoSub.ChannelId = itemss.YtubeChannelId;
                repoSub.Channelpic = itemss.ChannelpicUrl;
                repoSub.colors = Convert.ToString(randomColor);
                repoSub.ChannelName = itemss.YtubeChannelName;
                repoSub.startdate = DateTime.UtcNow;
                repoSub.endtdate = DateTime.UtcNow;
                repoSub.SubscribersCounts = totalsub;
                lstSub.Add(repoSub);
            }
            return lstSub;
        }

        //end

        public static long UnixTimeNows(DateTime x)
        {
            var timeSpan = (x - new DateTime(1970, 1, 1, 0, 0, 0));
            return (long)timeSpan.TotalSeconds;
        }

    }
}
