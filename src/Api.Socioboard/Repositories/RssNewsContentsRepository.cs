using Api.Socioboard.Model;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models.Mongo;
using Microsoft.AspNetCore.Hosting;
using NewsAPI;
using NewsAPI.Models;
using NewsAPI.Constants;
using Microsoft.Extensions.Logging;

namespace Api.Socioboard.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class RssNewsContentsRepository
    {
        /// <summary>
        /// news api implementation
        /// </summary>
        /// <param name="keywords"></param>
        /// <param name="userId"></param>
        /// <param name="logger"></param>
        /// <param name="env"></param>
        /// <param name="appSettings"></param>
        /// <returns></returns>
        public static async Task<IEnumerable<RssNewsContentsFeeds>> FindUrl(string keywords, string userId, ILogger logger, IHostingEnvironment env, Helper.AppSettings appSettings)
        {
            IList<RssNewsContentsFeeds> finalLinkList = new List<RssNewsContentsFeeds>();
            try
            {
                var rssFeedRepository = new MongoRepository("RssNewsContentsFeeds", appSettings);

                List<string> keywordCollections = null;

                if (keywords != null)
                    keywordCollections = keywords.Split(',').ToList();

                var day = 30;

                if (DateTime.UtcNow.Day > 1)
                    day = DateTime.UtcNow.Day - 1;

                var newsApiClient = new NewsApiClient(appSettings.NewsApiKey);

                if (keywordCollections != null)
                {
                    foreach (var keyword in keywordCollections)
                    {
                        var articlesResponse = newsApiClient.GetEverything(new EverythingRequest
                        {
                            Q = keyword,
                            SortBy = SortBys.PublishedAt,
                            Language = Languages.EN,
                            From = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, day)
                        });

                        if (articlesResponse.Articles.Count == 0)
                        {
                            logger.LogError(articlesResponse.Error?.ToString());
                            var temp = await rssFeedRepository.Find<RssNewsContentsFeeds>(x => x.keywords.Contains(keyword));
                            finalLinkList = temp.Skip(temp.Count - 20).Take(20 / keywordCollections.Count).ToList();
                        }
                        else
                        {
                            foreach (var item in articlesResponse.Articles)
                            {
                                var rssFeed = new RssNewsContentsFeeds
                                {
                                    keywords = keyword,
                                    Link = item.Url,
                                    Title = item.Title,
                                    Image = item.UrlToImage,
                                    PublishingDate = item.PublishedAt?.ToString(System.Globalization.CultureInfo.CurrentCulture)
                                };

                                finalLinkList.Add(rssFeed);
                            }

                            try
                            {
                                await rssFeedRepository.AddList(finalLinkList);
                            }
                            catch (Exception ex)
                            {
                                logger.LogError(ex.StackTrace);
                            }
                        }

                        finalLinkList = finalLinkList.Take(20 / keywordCollections.Count).ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.StackTrace);
            }

            return finalLinkList.Take(20);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="redisCache"></param>
        /// <param name="appSettings"></param>
        /// <returns></returns>
        public static List<RssNewsContentsFeeds> GetRssNewsPostedFeeds(string userId, Helper.Cache redisCache, Helper.AppSettings appSettings)
        {
            var rssRepository = redisCache.Get<List<RssNewsContentsFeeds>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + userId);

            if (rssRepository != null)
                return rssRepository;

            var mongodbRssSuppository = new MongoRepository("RssNewsContentsFeeds", appSettings);

            var builder = Builders<RssNewsContentsFeeds>.Sort;

            var sort = builder.Descending(t => t.PublishingDate);

            var result = mongodbRssSuppository.FindWithRange(t => t.UserId.Equals(userId), sort, 0, 200);

            var task = Task.Run(async () => await result);

            var lstRss = task.Result;

            if (lstRss == null)
                return null;

            redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + userId, lstRss.ToList());

            return lstRss.ToList();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="feedId"></param>
        /// <param name="appSettings"></param>
        /// <returns></returns>
        public static string DeleteContentfeedsRepo(string feedId, Helper.AppSettings appSettings)
        {
            try
            {
                var contentFeedsRepo = new MongoRepository("RssNewsContentsFeeds", appSettings);
                var builders = Builders<RssNewsContentsFeeds>.Filter;
                var filter = builders.Eq("Link", feedId);
                contentFeedsRepo.Delete(filter);
                return "success";
            }
            catch (Exception)
            {
                return "Error";
            }
        }

    }
}