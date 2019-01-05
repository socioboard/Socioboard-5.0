using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TimeLineMethods;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using SocioboardDataServices.Helper;
using HtmlAgilityPack;
using System.Threading;
using Domain.Socioboard.Helpers;

namespace SocioboardDataServices.Twitter
{
    public class TwtFeeds
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 50;

        public static int updateTwitterFeeds(Domain.Socioboard.Models.TwitterAccount twtaccount, oAuthTwitter oAuth)
        {
            apiHitsCount = 0;
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> _grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(twtaccount.twitterUserId)).ToList();
            if (twtaccount.lastUpdate.AddMinutes(15) <= DateTime.UtcNow)
            {
                if (twtaccount.isActive)
                {
                    string twitterUserId = string.Empty;
                    Users userinfo = new Users();
                    JArray profile = userinfo.Get_Users_LookUp_ByScreenName(oAuth, oAuth.TwitterScreenName);
                    TwitterUser twtuser;




                    if (profile != null && profile.HasValues == true)
                    {

                        var item = profile[0];


                        try
                        {
                            twtaccount.followingCount = Convert.ToInt64(item["friends_count"].ToString());
                        }
                        catch (Exception ex)
                        {
                            twtaccount.followingCount = twtaccount.followingCount;
                        }
                        try
                        {
                            twtaccount.followersCount = Convert.ToInt64(item["followers_count"].ToString());
                        }
                        catch (Exception ex)
                        {
                            twtaccount.followersCount = twtaccount.followersCount;
                        }

                        try
                        {
                            twtaccount.profileImageUrl = item["profile_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
                            _grpProfile.Select(s => { s.profilePic = twtaccount.profileImageUrl; return s; }).ToList();
                        }
                        catch (Exception ex)
                        {
                            twtaccount.profileImageUrl = twtaccount.profileImageUrl;
                            _grpProfile.Select(s => { s.profilePic = twtaccount.profileImageUrl; return s; }).ToList();
                        }
                        try
                        {
                            twtaccount.location = item["location"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twtaccount.description = item["description"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twtaccount.profileUrl = string.Empty;
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twtaccount.twitterScreenName = item["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            _grpProfile.Select(s => { s.profileName = item["screen_name"].ToString().TrimStart('"').TrimEnd('"'); return s; }).ToList();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twtaccount.profileBackgroundImageUrl = item["profile_banner_url"].ToString().TrimStart('"').TrimEnd('"');

                        }
                        catch (Exception ex)
                        {
                            twtaccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
                        }

                        dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twtaccount);
                        foreach (var item_grpProfile in _grpProfile)
                        {
                            dbr.Update<Domain.Socioboard.Models.Groupprofiles>(item_grpProfile);
                        }
                        Console.WriteLine("Api hits Count" + apiHitsCount);
                        if (apiHitsCount < MaxapiHitsCount)
                        {
                            try
                            {
                                Savetwitterrecentdetails(profile);
                                SaveTwitterMessages(twtaccount.twitterUserId, oAuth);
                                SaveUserRetweets(twtaccount.twitterUserId, oAuth);
                                SaveTwitterDirectMessageSent(oAuth, twtaccount.twitterUserId);
                                //SaveTwittwrDirectMessageRecieved(oAuth, twtaccount.twitterUserId);//recieve is coming from SaveTwitterDirectMessageSent
                                SaveUserFollowers(oAuth, twtaccount.twitterScreenName, twtaccount.twitterUserId);

                                //SaveTwitterFeeds(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);
                                //SaveUserTweets(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);                           
                            }
                            catch (Exception exs)
                            {
                                Console.WriteLine(exs.StackTrace);
                            }
                        }
                        twtaccount.lastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twtaccount);
                    }
                }
            }
            return 0;
        }


        public static void Savetwitterrecentdetails(JArray data)
        {
            try
            {
                string TwitterId = string.Empty;
                Domain.Socioboard.Models.Mongo.TwitterRecentDetails insertdata = new TwitterRecentDetails();
                MongoRepository mongorepo = new MongoRepository("TwitterRecentDetails");
                try
                {
                    TwitterId = data[0]["id_str"].ToString();

                }
                catch (Exception)
                {

                    TwitterId = string.Empty;

                }

                if (!string.IsNullOrEmpty(TwitterId))
                {
                    string AccountCreationDate = string.Empty;
                    string LastActivityDate = string.Empty;
                    string lastfeed = string.Empty;
                    string FeedId = string.Empty;
                    string retweetcount = string.Empty;
                    string favoritecount = string.Empty;

                    try
                    {
                        DateTime AccntCreationDate = ParseTwitterTime((data[0]["created_at"].ToString()));
                        AccountCreationDate = AccntCreationDate.ToString();
                    }
                    catch (Exception)
                    {
                        AccountCreationDate = string.Empty;

                    }


                    try
                    {
                        DateTime lastactivitydate = ParseTwitterTime((data[0]["status"]["created_at"].ToString()));
                        LastActivityDate = lastactivitydate.ToString();

                    }
                    catch (Exception)
                    {


                        LastActivityDate = string.Empty;
                    }

                    try
                    {
                        lastfeed = data[0]["status"]["text"].ToString();
                        FeedId = data[0]["status"]["id_str"].ToString();
                        retweetcount = data[0]["status"]["retweet_count"].ToString();
                        favoritecount = data[0]["status"]["favorite_count"].ToString();

                    }
                    catch (Exception)
                    {
                        lastfeed = string.Empty;
                        FeedId = string.Empty;
                        retweetcount = string.Empty;
                        favoritecount = string.Empty;

                    }

                    insertdata.TwitterId = TwitterId;
                    insertdata.AccountCreationDate = AccountCreationDate;
                    insertdata.LastActivityDate = LastActivityDate;
                    insertdata.lastfeed = lastfeed;
                    insertdata.FeedId = FeedId;
                    insertdata.retweetcount = Convert.ToInt64(retweetcount);
                    insertdata.favoritecount = Convert.ToInt64(favoritecount);
                    var result = mongorepo.Find<TwitterRecentDetails>(t => t.TwitterId.Contains(TwitterId));
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<TwitterRecentDetails> lstTwitterRecentDetails = task.Result?.ToList() ?? new List<TwitterRecentDetails>();
                    if (lstTwitterRecentDetails.Count > 0)
                    {
                        var builders = Builders<BsonDocument>.Filter;
                        FilterDefinition<BsonDocument> filter = builders.Eq("TwitterId", TwitterId);
                        var update = Builders<BsonDocument>.Update.Set("AccountCreationDate", AccountCreationDate).Set("LastActivityDate", LastActivityDate).Set("lastfeed", lastfeed)
                            .Set("FeedId", FeedId).Set("retweetcount", retweetcount).Set("favoritecount", favoritecount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.TwitterRecentDetails>(update, filter);
                    }
                    else
                    {
                        mongorepo.Add<TwitterRecentDetails>(insertdata);
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
        }

        private static void SaveTwitterMessages(string profileId, oAuthTwitter oAuth)
        {


            try
            {
                TwitterUser twtuser = new TwitterUser();
                TimeLine tl = new TimeLine();
                JArray data = null;
                try
                {
                    data = tl.Get_Statuses_Mentions_Timeline(oAuth);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    //apiHitsCount = MaxapiHitsCount;
                }
                Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                if (data != null)
                {
                    apiHitsCount++;
                    foreach (var item in data)
                    {

                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterMention;
                        objMessageModel.id = MongoDB.Bson.ObjectId.GenerateNewId();

                        try
                        {
                            objMessageModel.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.Message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');

                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.profileId = profileId;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.screenName = item["user"]["screen_name"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoMessageModel");
                        var ret = mongorepo.Find<MongoMessageModel>(t => t.messageId.Equals(objMessageModel.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        int count = task.Result?.Count ?? 0;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objMessageModel.messageId);
                            var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objMessageModel.fromProfileUrl);
                            mongorepo.Update<MongoMessageModel>(update, filter);
                        }

                    }
                }
                else
                {
                    Console.WriteLine("data is null");
                    //apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                //apiHitsCount = MaxapiHitsCount;
            }
        }

        private static void SaveUserRetweets(string profileId, oAuthTwitter oAuth)
        {

            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Retweet = null;
                try
                {
                    Retweet = twtuser.GetStatuses_Retweet_Of_Me(oAuth);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    //apiHitsCount = MaxapiHitsCount;
                }
                Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                if (Retweet != null)
                {
                    apiHitsCount++;
                    foreach (var item in Retweet)
                    {
                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterRetweet;
                        objMessageModel.id = ObjectId.GenerateNewId();

                        try
                        {
                            objMessageModel.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.Message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            // objMessageModel.type = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }



                        try
                        {
                            objMessageModel.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.profileId = profileId;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoMessageModel");
                        var ret = mongorepo.Find<MongoMessageModel>(t => t.messageId.Equals(objMessageModel.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        int count = task.Result?.Count ?? 0;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objMessageModel.messageId);
                            var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objMessageModel.fromProfileUrl);
                            mongorepo.Update<MongoMessageModel>(update, filter);
                        }
                    }
                }
                else
                {
                    Console.WriteLine("Retweet is null");
                    //apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                //apiHitsCount = MaxapiHitsCount;

            }
        }

        private static void SaveUserTweets(string profileId, string screenName, oAuthTwitter oAuth)
        {
            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Timeline = twtuser.GetStatuses_User_Timeline(oAuth);
                if (Timeline != null)
                {
                    apiHitsCount++;
                    foreach (var item in Timeline)
                    {
                        Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                        objMessageModel.id = ObjectId.GenerateNewId();
                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterUsertweet;
                        try
                        {
                            objMessageModel.Message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.mediaUrl = item["extended_entities"]["media"][0]["media_url_https"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.screenName = screenName;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.profileId = profileId;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objMessageModel.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoMessageModel");
                        var ret = mongorepo.Find<MongoMessageModel>(t => t.messageId.Equals(objMessageModel.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objMessageModel.messageId);
                            var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objMessageModel.fromProfileUrl);
                            mongorepo.Update<MongoMessageModel>(update, filter);
                        }
                    }
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                apiHitsCount = MaxapiHitsCount;
            }
        }

        private static void SaveTwitterFeeds(string profileId, string screenName, oAuthTwitter oAuth)
        {
            TwitterUser twtuser;
            twtuser = new TwitterUser();
            try
            {
                JArray Home_Timeline = twtuser.GetStatuses_Home_Timeline(oAuth);
                Domain.Socioboard.Models.Mongo.MongoTwitterFeed objTwitterFeed = new Domain.Socioboard.Models.Mongo.MongoTwitterFeed();
                if (Home_Timeline != null)
                {
                    apiHitsCount++;
                    foreach (var item in Home_Timeline)
                    {
                        objTwitterFeed.type = Domain.Socioboard.Enum.MessageType.TwitterFeed;
                        try
                        {
                            objTwitterFeed.feed = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.screenName = screenName;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.profileId = profileId;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objTwitterFeed.feedDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objTwitterFeed.feedTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.Id = ObjectId.GenerateNewId();
                            objTwitterFeed.strId = ObjectId.GenerateNewId().ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objTwitterFeed.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objTwitterFeed.mediaUrl = item["extended_entities"]["media"][0]["media_url"].ToString();
                        }
                        catch (Exception ex)
                        {
                            objTwitterFeed.mediaUrl = null;
                        }
                        try
                        {
                            objTwitterFeed.Retweetcount = item["retweet_count"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.Likecount = item["favorite_count"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objTwitterFeed.mediaType = item["extended_entities"]["media"][0]["type"].ToString();
                        }
                        catch
                        {
                            objTwitterFeed.mediaType = "status";
                        }

                        MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed");

                        var ret = mongorepo.Find<MongoTwitterFeed>(t => t.messageId.Equals(objTwitterFeed.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(objTwitterFeed);
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterFeed.messageId);
                            var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objTwitterFeed.fromProfileUrl).Set("mediaType", objTwitterFeed.mediaType).Set("Retweetcount", objTwitterFeed.Retweetcount).Set("Likecount", objTwitterFeed.Likecount);
                            mongorepo.Update<MongoTwitterFeed>(update, filter);
                        }
                    }
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                apiHitsCount = MaxapiHitsCount;
            }
        }



        private static void SaveTwitterDirectMessageSent(oAuthTwitter OAuth, string profileId)
        {
            #region Add Twitter Direct Message
            Console.WriteLine("SaveTwitterDirectMessageSent is called");
            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Messages_Sent = twtuser.GetDirect_Messages_Sent(OAuth, 50);

                Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();
                if (Messages_Sent != null)
                {
                    apiHitsCount++;
                    foreach (var item in Messages_Sent[0]["events"])
                    {
                        objDirectMessages.type = Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent;
                        objDirectMessages.id = ObjectId.GenerateNewId();
                        objDirectMessages.profileId = profileId;
                        try
                        {
                            objDirectMessages.messageId = item["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "dd/MM/yyyy HH:mm:ss";// "ddd MMM dd HH:mm:ss zzzz yyyy";//ConvertUnixTimeStamp
                            objDirectMessages.createdDate = DateTime.ParseExact(SBHelper.ConvertUnixTimeStamp(item["created_timestamp"].ToString()).ToString(format), format, CultureInfo.CurrentCulture).ToString(format);
                            objDirectMessages.timeStamp = Convert.ToDouble(item["created_timestamp"]);
                            //objDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            // objDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.message = item["message_create"]["message_data"]["text"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.recipientId = item["message_create"]["target"]["recipient_id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        SortedDictionary<string, string> parameters = new SortedDictionary<string, string>();
                        parameters.Add("user_id", objDirectMessages.recipientId);
                        var RecipientDetails = HttpHelper.GetRequest("https://twitter.com", "/intent/user", parameters).Result;
                        Thread.Sleep(2000);
                        HtmlDocument htmldocument = new HtmlDocument();
                        htmldocument.LoadHtml(RecipientDetails);
                        try
                        {
                            objDirectMessages.recipientProfileUrl = htmldocument.DocumentNode.SelectSingleNode("//div[@class='profile summary']//a").GetAttributeValue("href", "");
                            //objDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.senderId = item["message_create"]["sender_id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            string temp = htmldocument.DocumentNode.SelectSingleNode("//div[@class='profile summary']//a").GetAttributeValue("href", "");
                            objDirectMessages.recipientScreenName = temp.Substring(temp.IndexOf("=") + 1);
                            //objDirectMessages.recipientScreenName = item["message_create"]["message_data"]["entities"]["user_mentions"][0]["screen_name"].ToString();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        SortedDictionary<string, string> senderparameters = new SortedDictionary<string, string>();
                        senderparameters.Add("user_id", objDirectMessages.senderId);
                        String SenderDetails = HttpHelper.GetRequest("https://twitter.com", "/intent/user", senderparameters).Result;
                        Thread.Sleep(2000);
                        HtmlDocument senderhtmldocument = new HtmlDocument();
                        senderhtmldocument.LoadHtml(SenderDetails);
                        HtmlNode ProfileDetailsHtmlNode = senderhtmldocument.DocumentNode.SelectSingleNode("//div[@class='profile summary']");
                        try
                        {
                            var FollowerAndFollowingCount = senderhtmldocument.DocumentNode.SelectNodes("//dl//a[@class='alternate-context']").Select(x => x.InnerText);
                            objDirectMessages.FollowerCount = FollowerAndFollowingCount.ElementAt(0);
                            objDirectMessages.FollowingCount = FollowerAndFollowingCount.ElementAt(1);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            string temp = ProfileDetailsHtmlNode.SelectSingleNode("//div[@class='profile summary']//a").GetAttributeValue("href", "");
                            objDirectMessages.senderScreenName = temp.Substring(temp.IndexOf("=") + 1);
                            //objDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.senderProfileUrl = ProfileDetailsHtmlNode.SelectSingleNode("//div[@class='profile summary']//img").GetAttributeValue("src", "");
                            // objDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoDirectMessages");

                        var ret = mongorepo.Find<MongoDirectMessages>(t => t.messageId.Equals(objDirectMessages.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });

                        int count = 0;
                        try
                        {
                            count = task.Result.Count;
                        }
                        catch { }
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(objDirectMessages);
                            Console.WriteLine("MongoDirectMessages added");
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objDirectMessages.messageId);
                            var update = Builders<BsonDocument>.Update.Set("senderProfileUrl", objDirectMessages.senderProfileUrl).Set("recipientProfileUrl", objDirectMessages.recipientProfileUrl).Set("FollowerCount", objDirectMessages.FollowerCount).Set("FollowingCount", objDirectMessages.FollowingCount);
                            mongorepo.Update<MongoDirectMessages>(update, filter);
                            Console.WriteLine("MongoDirectMessages updated");
                        }
                    }
                }
                else
                {
                    Console.WriteLine("Messages_Sent is null");
                    //apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                //apiHitsCount = MaxapiHitsCount;
            }
            #endregion
        }
        //private static void SaveTwitterDirectMessageSent(oAuthTwitter OAuth, string profileId)
        //{
        //    #region Add Twitter Direct Message
        //    TwitterUser twtuser = new TwitterUser();
        //    try
        //    {
        //        JArray Messages_Sent = twtuser.GetDirect_Messages_Sent(OAuth, 20);

        //        Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();
        //        if (Messages_Sent != null)
        //        {
        //            apiHitsCount++;
        //            foreach (var item in Messages_Sent)
        //            {
        //                objDirectMessages.type = Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent;
        //                objDirectMessages.id = ObjectId.GenerateNewId();
        //                objDirectMessages.profileId = profileId;
        //                try
        //                {
        //                    objDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }
        //                try
        //                {
        //                    const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
        //                    objDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
        //                    objDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }
        //                try
        //                {
        //                    objDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }

        //                try
        //                {
        //                    objDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }

        //                try
        //                {
        //                    objDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }

        //                try
        //                {
        //                    objDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }

        //                try
        //                {
        //                    objDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }

        //                try
        //                {
        //                    objDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }
        //                try
        //                {
        //                    objDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }
        //                try
        //                {
        //                    objDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine(ex.StackTrace);
        //                }
        //                MongoRepository mongorepo = new MongoRepository("MongoDirectMessages");

        //                var ret = mongorepo.Find<MongoDirectMessages>(t => t.messageId.Equals(objDirectMessages.messageId));
        //                var task = Task.Run(async () => {
        //                    return await ret;
        //                });
        //                int count = task.Result.Count;
        //                if (count < 1)
        //                {
        //                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(objDirectMessages);
        //                }
        //                else
        //                {
        //                    var builders = Builders<BsonDocument>.Filter;
        //                    FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objDirectMessages.messageId);
        //                    var update = Builders<BsonDocument>.Update.Set("senderProfileUrl", objDirectMessages.senderProfileUrl).Set("recipientProfileUrl", objDirectMessages.recipientProfileUrl);
        //                    mongorepo.Update<MongoDirectMessages>(update, filter);
        //                }
        //            }
        //        }
        //        else
        //        {
        //            apiHitsCount = MaxapiHitsCount;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine(ex.StackTrace);
        //        apiHitsCount = MaxapiHitsCount;
        //    }
        //    #endregion
        //}


        private static void SaveTwittwrDirectMessageRecieved(oAuthTwitter OAuth, string profileId)
        {
            #region Add Twitter Direct Message
            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Messages_Sent = twtuser.GetDirect_Messages(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();
                if (Messages_Sent != null)
                {
                    foreach (var item in Messages_Sent)
                    {
                        objDirectMessages.type = Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived;
                        objDirectMessages.id = ObjectId.GenerateNewId();
                        objDirectMessages.profileId = profileId;
                        try
                        {
                            objDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }

                        try
                        {
                            objDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoDirectMessages");
                        var ret = mongorepo.Find<MongoDirectMessages>(t => t.messageId.Equals(objDirectMessages.messageId));
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(objDirectMessages);
                        }
                        else
                        {
                            var builders = Builders<BsonDocument>.Filter;
                            FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objDirectMessages.messageId);
                            var update = Builders<BsonDocument>.Update.Set("senderProfileUrl", objDirectMessages.senderProfileUrl).Set("recipientProfileUrl", objDirectMessages.recipientProfileUrl);
                            mongorepo.Update<MongoDirectMessages>(update, filter);
                        }
                    }
                }
                else
                {
                    Console.WriteLine("Messages_Sent is null");
                    //apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                //apiHitsCount = MaxapiHitsCount;
            }
            #endregion
        }


        public static void SaveUserFollowers(oAuthTwitter OAuth, string screeenName, string TwitterUserId)
        {
            try
            {
                TimeLine _TimeLine = new TimeLine();
                JArray jdata = _TimeLine.Get_User_Followers(OAuth);
                JArray user_data = JArray.Parse(jdata[0]["users"].ToString());
                string curser = string.Empty;
                string curser_next = string.Empty;
                try
                {
                    curser_next = jdata[0]["next_cursor"].ToString();
                }
                catch (Exception ex)
                {
                    curser_next = "0";
                }
                do
                {
                    curser = curser_next;
                    Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel;
                    if (jdata != null)
                    {
                        apiHitsCount++;
                        foreach (var item in user_data)
                        {
                            try
                            {
                                objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                                objMessageModel.id = ObjectId.GenerateNewId();
                                objMessageModel.profileId = TwitterUserId;
                                objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterFollower;
                                objMessageModel.messageId = Generatetxnid();
                                objMessageModel.readStatus = 1;
                                try
                                {
                                    objMessageModel.Message = item["description"].ToString();
                                }
                                catch (Exception ex)
                                {
                                }
                                try
                                {
                                    objMessageModel.fromId = item["id_str"].ToString();
                                }
                                catch (Exception ex)
                                {
                                    objMessageModel.fromId = item["id"].ToString();
                                }
                                try
                                {
                                    objMessageModel.fromName = item["screen_name"].ToString();
                                }
                                catch (Exception ex)
                                {
                                }
                                try
                                {
                                    objMessageModel.FollowerCount = Convert.ToInt32(item["followers_count"].ToString());
                                }
                                catch (Exception ex)
                                {
                                }
                                try
                                {
                                    objMessageModel.FollowingCount = Convert.ToInt32(item["friends_count"].ToString());
                                }
                                catch (Exception ex)
                                {
                                }
                                try
                                {
                                    objMessageModel.fromProfileUrl = item["profile_image_url"].ToString();
                                }
                                catch (Exception ex)
                                {
                                    objMessageModel.fromProfileUrl = item["profile_image_url_https"].ToString();
                                }
                                try
                                {
                                    objMessageModel.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                                    objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                }
                                catch (Exception ex)
                                {
                                }
                                objMessageModel.RecipientId = TwitterUserId;
                                objMessageModel.RecipientName = screeenName;
                                MongoRepository mongorepo = new MongoRepository("MongoMessageModel");
                                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.fromId == objMessageModel.fromId && t.RecipientId == objMessageModel.RecipientId && t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                                var task = Task.Run(async () =>
                                {
                                    return await result;
                                });
                                IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstMongoTwitterMessage = task.Result;
                                if (lstMongoTwitterMessage.Count > 0)
                                {
                                    mongorepo.UpdateReplace<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel, t => t.id == lstMongoTwitterMessage[0].id);
                                }
                                else
                                {
                                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                                }

                            }
                            catch (Exception ex)
                            {
                            }

                        }
                    }
                    else
                    {
                        Console.WriteLine("curser_next is null");
                        //apiHitsCount = MaxapiHitsCount;
                    }
                    if (curser != "0")
                    {
                        jdata = _TimeLine.Get_User_FollowersWithCurser(OAuth, curser);
                        user_data = JArray.Parse(jdata[0]["users"].ToString());
                        curser_next = jdata[0]["next_cursor"].ToString();
                    }
                }
                while (curser != "0");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                //apiHitsCount = MaxapiHitsCount;
            }
        }

        public static DateTime ParseTwitterTime(string date)
        {
            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
            return DateTime.ParseExact(date, format, CultureInfo.InvariantCulture);
        }
        public static string Generatetxnid()
        {

            Random rnd = new Random();
            string strHash = Generatehash512(rnd.ToString() + DateTime.Now);
            string txnid1 = strHash.ToString().Substring(0, 20);

            return txnid1;
        }

        public static string Generatehash512(string text)
        {

            byte[] message = Encoding.UTF8.GetBytes(text);

            UnicodeEncoding UE = new UnicodeEncoding();
            byte[] hashValue;
            SHA512Managed hashString = new SHA512Managed();
            string hex = "";
            hashValue = hashString.ComputeHash(message);
            foreach (byte x in hashValue)
            {
                hex += String.Format("{0:x2}", x);
            }
            return hex;

        }
    }
}