using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using SociobordRssDataServices.Model;
using System.Threading;
using MongoDB.Driver;
using MongoDB.Bson;

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
                    List<Domain.Socioboard.Models.RssFeedUrl> lstRssdata = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t=>t.ProfileId!=null && t.Keywords==null).ToList();
                    
                    foreach (var item in lstRssdata)
                    {
                       // List<Domain.Socioboard.Models.RssFeedUrl> lstRssFeedUrl = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl == lstRssdata.FirstOrDefault().rssurl && t.Keywords == null && t.ProfileId == lstRssdata.FirstOrDefault().ProfileId).ToList();
                        var ret = _MongoRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.RssFeedUrl == item.rssurl && t.ProfileId==item.ProfileId);
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


        public void RssFeedRecent()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    MongoRepository _MongoRepository = new MongoRepository("Rss");
                  
                    List<Domain.Socioboard.Models.RssFeedUrl> lstRssdata = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t => t.ProfileId != null && t.Keywords == null).ToList();
                    //lstRssdata = lstRssdata.Where(t => t.ProfileId.Contains("758233674978426880")).ToList();
                    foreach (var item in lstRssdata)
                    {
                        var ret = _MongoRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.RssFeedUrl == item.rssurl && t.ProfileId == item.ProfileId && t.lastupdate == null);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        List<Domain.Socioboard.Models.Mongo.Rss> lstRss = task.Result.ToList();
                        foreach (var item_Rss in lstRss)
                        {
                            DateTime dtval;
                            try
                            {
                                dtval = Convert.ToDateTime(item_Rss.lastupdate);
                                if (dtval.AddHours(1) <= DateTime.UtcNow)
                                {

                                    new Thread(delegate ()
                                    {
                                        RssFeed.postRssFeeds(item_Rss);
                                    }).Start();


                                    item_Rss.lastupdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                                    FilterDefinition<BsonDocument> filter = new BsonDocument("strId", item_Rss.strId);
                                    var updatemongo = Builders<BsonDocument>.Update.Set("lastupdate", item_Rss.lastupdate);
                                    _MongoRepository.Update<Domain.Socioboard.Models.Mongo.Rss>(updatemongo, filter);
                                    dbr.Update<Domain.Socioboard.Models.RssFeedUrl>(item);
                                    Thread.Sleep(60 * 1000);
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex + "ex");
                                Console.WriteLine(item_Rss.lastupdate);
                                Console.WriteLine(item_Rss.ProfileId);
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
