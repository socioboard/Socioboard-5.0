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
            while(true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                MongoRepository _MongoRepository = new MongoRepository("Rss");
                List<Domain.Socioboard.Models.RssFeedUrl> lstRssFeedUrl = dbr.FindAll<Domain.Socioboard.Models.RssFeedUrl>().ToList();
                foreach (var item in lstRssFeedUrl)
                {
                    var ret = _MongoRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.rssFeedUrl.rssFeedUrlId == item.rssFeedUrlId);
                    var task=Task.Run(async()=>{
                        return await ret;
                    });
                    List<Domain.Socioboard.Models.Mongo.Rss> lstRss = task.Result.ToList();
                    foreach (var item_Rss in lstRss)
                    {
                        if(item.LastUpdate.AddHours(6) >= DateTime.UtcNow)
                        {
                            RssFeed _RssFeed = new RssFeed();
                            string rssdata = _RssFeed.updateRssFeeds(item_Rss);
                            Console.WriteLine(item.rssurl + "rssdata");
                        }
                    }
                }
                Thread.Sleep(60000);
            }
        }
    }
}
