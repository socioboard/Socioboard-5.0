
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TimeLineMethods;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.Twitter
{
    public class TwtFeeds
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 50;

        public static int updateTwitterFeeds(Domain.Socioboard.Models.TwitterAccount twtaccount, oAuthTwitter oAuth)
        {
            apiHitsCount = 0;
            if (twtaccount.lastUpdate.AddMinutes(15) <= DateTime.UtcNow)
            {
                if (twtaccount.isActive)
                {
                    string twitterUserId = string.Empty;
                    Users userinfo = new Users();
                    JArray profile = userinfo.Get_Users_LookUp_ByScreenName(oAuth, oAuth.TwitterScreenName);
                    TwitterUser twtuser;
                    if (profile!=null)
                    {
                        var item = profile[0];
                        Domain.Socioboard.Models.TwitterAccount twitterAccount = new Domain.Socioboard.Models.TwitterAccount();

                        try
                        {
                            twitterAccount.followingCount = Convert.ToInt64(item["friends_count"].ToString());
                        }
                        catch (Exception ex)
                        {
                            twitterAccount.followingCount = twtaccount.followingCount;
                        }
                        try
                        {
                            twitterAccount.followersCount = Convert.ToInt64(item["followers_count"].ToString());
                        }
                        catch (Exception ex)
                        {
                            twitterAccount.followersCount = twtaccount.followersCount;
                        }

                        try
                        {
                            twitterAccount.profileImageUrl = item["profile_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {

                        }
                        try
                        {
                            twitterAccount.location = item["location"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twitterAccount.description = item["description"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twitterAccount.profileUrl = string.Empty;
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twitterAccount.twitterScreenName = item["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            twitterAccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');

                        }
                        catch (Exception ex)
                        {

                        }
                        Model.DatabaseRepository dbr = new DatabaseRepository();
                        dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twitterAccount);
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            SaveTwitterMessages(twtaccount.twitterUserId, oAuth);
                            SaveUserRetweets(twtaccount.twitterUserId, oAuth);
                            SaveUserTweets(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);
                            SaveTwitterFeeds(twtaccount.twitterUserId, twtaccount.twitterScreenName, oAuth);
                            SaveUserFollowers(oAuth, twtaccount.twitterScreenName, twtaccount.twitterUserId);
                            SaveTwitterDirectMessageSent(oAuth,twtaccount.twitterUserId);
                            SaveTwittwrDirectMessageRecieved(oAuth,twtaccount.twitterUserId);
                        }
                        twtaccount.lastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twtaccount); 
                    }
                }
            }
            return 0;
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
                if (data!=null)
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
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);

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
                if (Retweet!=null)
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
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
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
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
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
                if (Home_Timeline!=null)
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
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed");
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(objTwitterFeed);
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
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
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


        private static void SaveTwittwrDirectMessageRecieved(oAuthTwitter OAuth, string profileId )
        {
            #region Add Twitter Direct Message
            TwitterUser twtuser = new TwitterUser();
            try
            {
                JArray Messages_Sent = twtuser.GetDirect_Messages(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages objTwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
                if (Messages_Sent!=null)
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
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
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
                    if (jdata!=null)
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
                                _InboxMessages.messageId = "";
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

    }
}
