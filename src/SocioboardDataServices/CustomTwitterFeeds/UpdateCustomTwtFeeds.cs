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

namespace SocioboardDataServices.CustomTwitterFeeds
{
    public class UpdateCustomTwtFeeds
    {
       
            public static int apiHitsCount = 0;
            public static int MaxapiHitsCount = 50;

            public static int updateCustomTwitterFeeds(Domain.Socioboard.Models.TwitterAccount twtaccount, oAuthTwitter oAuth)
            {
                apiHitsCount = 0;
                Model.DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.Groupprofiles> _grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(twtaccount.twitterUserId)).ToList();
                if (twtaccount.lastUpdate.AddMinutes(15) <= DateTime.UtcNow)
                {
                    if (twtaccount.isActive)
                    {
                        string twitterUserId = string.Empty;
                        Users userinfo = new Users();
                        JArray profile = userinfo.Get_Users_LookUp_ByScreenName(oAuth, oAuth.TwitterScreenName);
                        TwitterUser twtuser;
                        if (profile != null)
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
                            if (apiHitsCount < MaxapiHitsCount)
                            {
                                try
                                {
                                    SaveTwitterFeeds(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);
                                    Savetwitterrecentdetails(profile);
                                    //SaveTwitterMessages(twtaccount.twitterUserId, oAuth);
                                    //SaveUserRetweets(twtaccount.twitterUserId, oAuth);
                                    SaveUserTweets(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);
                                    // SaveUserFollowers(oAuth, twtaccount.twitterScreenName, twtaccount.twitterUserId);
                                    // SaveTwitterDirectMessageSent(oAuth, twtaccount.twitterUserId);
                                    // SaveTwittwrDirectMessageRecieved(oAuth, twtaccount.twitterUserId);
                                }
                                catch (Exception exs)
                                {

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
                    IList<TwitterRecentDetails> lstTwitterRecentDetails = task.Result.ToList();
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

            private static void SaveTwitterMessages(string profileId, oAuthTwitter oAuth)
            {

                TwitterUser twtuser;
                twtuser = new TwitterUser();
                try
                {
                    TimeLine tl = new TimeLine();
                    JArray data = null;
                    try
                    {
                        data = tl.Get_Statuses_Mentions_Timeline(oAuth);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                        apiHitsCount = MaxapiHitsCount;
                    }
                    Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                    if (data != null)
                    {
                        apiHitsCount++;
                        foreach (var item in data)
                        {

                            objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterMention;
                            objTwitterMessage.id = MongoDB.Bson.ObjectId.GenerateNewId();

                            try
                            {
                                objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                                objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                                objTwitterMessage.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');

                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.profileId = profileId;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.screenName = item["user"]["screen_name"].ToString();
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                            var ret = mongorepo.Find<MongoTwitterMessage>(t => t.messageId.Equals(objTwitterMessage.messageId));
                            var task = Task.Run(async () => {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
                            }
                            else
                            {
                                var builders = Builders<BsonDocument>.Filter;
                                FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterMessage.messageId);
                                var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objTwitterMessage.fromProfileUrl);
                                mongorepo.Update<MongoTwitterMessage>(update, filter);
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

            private static void SaveUserRetweets(string profileId, oAuthTwitter oAuth)
            {
                TwitterUser twtuser;
                twtuser = new TwitterUser();
                try
                {
                    JArray Retweet = null;
                    try
                    {
                        Retweet = twtuser.GetStatuses_Retweet_Of_Me(oAuth);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                        apiHitsCount = MaxapiHitsCount;

                    }
                    Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                    if (Retweet != null)
                    {
                        apiHitsCount++;
                        foreach (var item in Retweet)
                        {
                            objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet;
                            objTwitterMessage.id = ObjectId.GenerateNewId();

                            try
                            {
                                objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                                objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                                objTwitterMessage.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.profileId = profileId;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                            var ret = mongorepo.Find<MongoTwitterMessage>(t => t.messageId.Equals(objTwitterMessage.messageId));
                            var task = Task.Run(async () => {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
                            }
                            else
                            {
                                var builders = Builders<BsonDocument>.Filter;
                                FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterMessage.messageId);
                                var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objTwitterMessage.fromProfileUrl);
                                mongorepo.Update<MongoTwitterMessage>(update, filter);
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
                            Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                            objTwitterMessage.id = ObjectId.GenerateNewId();
                            objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterUsertweet;
                            try
                            {
                                objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.mediaUrl = item["extended_entities"]["media"][0]["media_url_https"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.screenName = screenName;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.profileId = profileId;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                                objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                                objTwitterMessage.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                            var ret = mongorepo.Find<MongoTwitterMessage>(t => t.messageId.Equals(objTwitterMessage.messageId));
                            var task = Task.Run(async () => {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
                            }
                            else
                            {
                                var builders = Builders<BsonDocument>.Filter;
                                FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterMessage.messageId);
                                var update = Builders<BsonDocument>.Update.Set("fromProfileUrl", objTwitterMessage.fromProfileUrl);
                                mongorepo.Update<MongoTwitterMessage>(update, filter);
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
                            objTwitterFeed.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterFeed;
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
                TwitterUser twtuser = new TwitterUser();
                try
                {
                    JArray Messages_Sent = twtuser.GetDirect_Messages_Sent(OAuth, 20);

                    Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages objTwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
                    if (Messages_Sent != null)
                    {
                        apiHitsCount++;
                        foreach (var item in Messages_Sent)
                        {
                            objTwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent;
                            objTwitterDirectMessages.id = ObjectId.GenerateNewId();
                            objTwitterDirectMessages.profileId = profileId;
                            try
                            {
                                objTwitterDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                                objTwitterDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                                objTwitterDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");

                            var ret = mongorepo.Find<MongoTwitterDirectMessages>(t => t.messageId.Equals(objTwitterDirectMessages.messageId));
                            var task = Task.Run(async () => {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
                            }
                            else
                            {
                                var builders = Builders<BsonDocument>.Filter;
                                FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterDirectMessages.messageId);
                                var update = Builders<BsonDocument>.Update.Set("senderProfileUrl", objTwitterDirectMessages.senderProfileUrl).Set("recipientProfileUrl", objTwitterDirectMessages.recipientProfileUrl);
                                mongorepo.Update<MongoTwitterDirectMessages>(update, filter);
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
                #endregion
            }


            private static void SaveTwittwrDirectMessageRecieved(oAuthTwitter OAuth, string profileId)
            {
                #region Add Twitter Direct Message
                TwitterUser twtuser = new TwitterUser();
                try
                {
                    JArray Messages_Sent = twtuser.GetDirect_Messages(OAuth, 20);

                    Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages objTwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
                    if (Messages_Sent != null)
                    {
                        foreach (var item in Messages_Sent)
                        {
                            objTwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageReceived;
                            objTwitterDirectMessages.id = ObjectId.GenerateNewId();
                            objTwitterDirectMessages.profileId = profileId;
                            try
                            {
                                objTwitterDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                                objTwitterDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                                objTwitterDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }

                            try
                            {
                                objTwitterDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            try
                            {
                                objTwitterDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.StackTrace);
                            }
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
                            var ret = mongorepo.Find<MongoTwitterDirectMessages>(t => t.messageId.Equals(objTwitterDirectMessages.messageId));
                            var task = Task.Run(async () => {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
                            }
                            else
                            {
                                var builders = Builders<BsonDocument>.Filter;
                                FilterDefinition<BsonDocument> filter = builders.Eq("messageId", objTwitterDirectMessages.messageId);
                                var update = Builders<BsonDocument>.Update.Set("senderProfileUrl", objTwitterDirectMessages.senderProfileUrl).Set("recipientProfileUrl", objTwitterDirectMessages.recipientProfileUrl);
                                mongorepo.Update<MongoTwitterDirectMessages>(update, filter);
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
                        Domain.Socioboard.Models.Mongo.MongoTwitterMessage _InboxMessages;
                        if (jdata != null)
                        {
                            apiHitsCount++;
                            foreach (var item in user_data)
                            {
                                try
                                {
                                    _InboxMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                                    _InboxMessages.id = ObjectId.GenerateNewId();
                                    _InboxMessages.profileId = TwitterUserId;
                                    _InboxMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower;
                                    _InboxMessages.messageId = Generatetxnid();
                                    _InboxMessages.readStatus = 1;
                                    try
                                    {
                                        _InboxMessages.twitterMsg = item["description"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                    }
                                    try
                                    {
                                        _InboxMessages.fromId = item["id_str"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                        _InboxMessages.fromId = item["id"].ToString();
                                    }
                                    try
                                    {
                                        _InboxMessages.fromName = item["screen_name"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                    }
                                    try
                                    {
                                        _InboxMessages.FollowerCount = Convert.ToInt32(item["followers_count"].ToString());
                                    }
                                    catch (Exception ex)
                                    {
                                    }
                                    try
                                    {
                                        _InboxMessages.FollowingCount = Convert.ToInt32(item["friends_count"].ToString());
                                    }
                                    catch (Exception ex)
                                    {
                                    }
                                    try
                                    {
                                        _InboxMessages.fromProfileUrl = item["profile_image_url"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                        _InboxMessages.fromProfileUrl = item["profile_image_url_https"].ToString();
                                    }
                                    try
                                    {
                                        _InboxMessages.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                                        _InboxMessages.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                    }
                                    catch (Exception ex)
                                    {
                                    }
                                    _InboxMessages.RecipientId = TwitterUserId;
                                    _InboxMessages.RecipientName = screeenName;
                                    MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                                    var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.fromId == _InboxMessages.fromId && t.RecipientId == _InboxMessages.RecipientId && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower);
                                    var task = Task.Run(async () =>
                                    {
                                        return await result;
                                    });
                                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstMongoTwitterMessage = task.Result;
                                    if (lstMongoTwitterMessage.Count > 0)
                                    {
                                        mongorepo.UpdateReplace<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(_InboxMessages, t => t.id == lstMongoTwitterMessage[0].id);
                                    }
                                    else
                                    {
                                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(_InboxMessages);
                                    }

                                }
                                catch (Exception ex)
                                {
                                }

                            }
                        }
                        else
                        {
                            apiHitsCount = MaxapiHitsCount;
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
                    apiHitsCount = MaxapiHitsCount;
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
