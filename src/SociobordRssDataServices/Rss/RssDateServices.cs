using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using SociobordRssDataServices.Model;
using System.Threading;

namespace SociobordRssDataServices.Rss
{
    public class RssDateServices
    {
        public void Rss()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    MongoRepository _MongoRepository = new MongoRepository("Rss");
                    List<Domain.Socioboard.Models.RssFeedUrl> lstRssFeedUrl = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl != null && t.Keywords == null).ToList();
                    //lstRssFeedUrl = lstRssFeedUrl.Where(t => t.rssFeedUrlId.Equals(68)).ToList();
                    foreach (var item in lstRssFeedUrl)
                    {
                        var ret = _MongoRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.RssFeedUrl == item.rssurl);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        List<Domain.Socioboard.Models.Mongo.Rss> lstRss = task.Result.ToList();
                        foreach (var item_Rss in lstRss)
                        {
                            if (item.LastUpdate.AddHours(6) <= DateTime.UtcNow)
                            {

                                new Thread(delegate ()
                                {
                                    RssFeed.updateRssFeeds(item_Rss);
                                }).Start();

                                Console.WriteLine(item.rssurl + "rssdata");
                                item.LastUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.RssFeedUrl>(item);
                            }

                        }

                    }
                    Thread.Sleep(60000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue while calling api");
                    Thread.Sleep(60000);
                }
            }
        }

        public void RssContentsFeeds()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    MongoRepository _MongoRepository = new MongoRepository("RssNewsContents");
                    List<Domain.Socioboard.Models.RssFeedUrl> lstRssFeedUrl = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl != null && t.Keywords != null).ToList();
                    foreach (var item in lstRssFeedUrl)
                    {
                        var ret = _MongoRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContents>(t => t.RssFeedUrl == item.rssurl);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        List<Domain.Socioboard.Models.Mongo.RssNewsContents> lstRss = task.Result.ToList();
                        foreach (var item_Rss in lstRss)
                        {
                            if (item.LastUpdate.AddHours(6) <= DateTime.UtcNow)
                            {

                                new Thread(delegate ()
                                {
                                    RssFeed.updateRssContentFeeds(item_Rss, item.Keywords);
                                }).Start();

                                Console.WriteLine(item.rssurl + "rssdata");
                                item.LastUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.RssFeedUrl>(item);
                            }

                        }

                    }
                    Thread.Sleep(60000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue while calling api");
                    Thread.Sleep(60000);
                }
            }
        }
    }
}
