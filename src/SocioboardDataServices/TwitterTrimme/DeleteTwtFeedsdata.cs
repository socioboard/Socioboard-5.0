using Domain.Socioboard.Enum;
using MongoDB.Driver;
using Socioboard.Twitter.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.TwitterTrimme
{
    public class DeleteTwtFeedsdata
    {
        //services for delete free user all feeds data 
       // * keep only  3months data only
        public void deleteTwitterfeeds()
        {
            try
            {

                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                oAuthTwitter OAuth = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerSecret, AppSettings.twitterRedirectionUrl);
                List<Domain.Socioboard.Models.TwitterAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isActive).ToList();
                foreach (var item in lstTwtAccounts)
                {
                    try
                    {
                        var id = item.userId;
                        List<Domain.Socioboard.Models.User> userdetails = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id== id).ToList();
                        if (userdetails!=null)
                        {
                            if(userdetails.First().AccountType==Domain.Socioboard.Enum.SBAccountType.Free)
                            {
                                MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed");
                                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>.Sort;
                                var sort = builder.Descending(t => t.feedDate);
                                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(t => t.profileId.Equals(item.twitterUserId));
                                var task = Task.Run(async () =>
                                {
                                    return await result;
                                });
                                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> allTwitterFeeds = task.Result;
                                allTwitterFeeds = allTwitterFeeds.OrderByDescending(t => t.feedTimeStamp).ToList();
                                DateTime lstfeed = Convert.ToDateTime(allTwitterFeeds.First().feedDate);
                                foreach (var iteme in allTwitterFeeds)
                                {
                                    DateTime latestFeedDate = Convert.ToDateTime(iteme.feedDate);
                                    DateTime FeedDate = lstfeed.AddMonths(-3);//constant date value
                                    if (latestFeedDate.Date <= FeedDate.Date)
                                    {
                                        try
                                        {
                                            var idd = iteme.messageId;
                                            MongoRepository _DeleteTwtFeeds = new MongoRepository("MongoTwitterFeed");
                                            var builders = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>.Filter;
                                            FilterDefinition<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> filter = builders.Eq("messageId", idd);
                                            _DeleteTwtFeeds.Delete<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(filter);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Thread.Sleep(600000);
                    }
                }
                Thread.Sleep(600000);
            }
            catch (Exception ex)
            {
                Console.WriteLine("issue in web api calling" + ex.StackTrace);
                Thread.Sleep(600000);
            }
        }
    }
}
