using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using FluentScheduler;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Facebook.Data;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;


namespace SocioboardDataServices.Facebook
{
    public class FacebookServiceHelper
    {
        #region Properties

        public static int ApiMaximumHitLimit { get; set; } = 25;

        public static int ApiHitsCount { get; set; }

        #endregion

        #region Methods

        /// <summary>
        /// To get all facebook account 
        /// </summary>
        /// <returns>facebook accounts</returns>
        public static IEnumerable<Facebookaccounts> GetFacebookAccounts(FbProfileType profileType = FbProfileType.FacebookProfile)
        {
            var databaseRepository = new DatabaseRepository();

            var fbAccounts = databaseRepository.Find<Facebookaccounts>
            (t => t.IsAccessTokenActive &&
                  t.FbProfileType == profileType).ToList();
            return fbAccounts;
        }


        #region Option 1 - Update facebooks accounts details and news feed posts 

        public void UpdateFacebookAccounts()
        {
            try
            {
                JobManager.AddJob(() =>
                 {
                     var status =
                         DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.FacebookUpdateFeeds,
                             objStatus => false);

                     if (!status)
                         StartUpdateAccountDetails();
                 }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(10).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void StartUpdateAccountDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.FacebookUpdateFeeds, true, (enumType, runningStatus) => true);
                var fbAccounts = GetFacebookAccounts();
                Parallel.ForEach(fbAccounts, new ParallelOptions { MaxDegreeOfParallelism = 100 }, account =>
                {
                    UpdateFbFeedDetails(account);
                });
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.FacebookUpdateFeeds, true, (enumType, runningStatus) => false);
            }
            catch (Exception ex)
            {
                Console.WriteLine("issue in web api calling" + ex.StackTrace);
            }
        }

        public int UpdateFbFeedDetails(Facebookaccounts facebookAccount)
        {
            ApiHitsCount = 0;
            var databaseRepository = new DatabaseRepository();

            if (facebookAccount.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (!facebookAccount.IsAccessTokenActive)
                    return 0;

                ApiHitsCount++;
                ParseAndUpdateAccountDetails(facebookAccount, databaseRepository);
                UpdateFeeds(facebookAccount);
            }
            else
            {
                ApiHitsCount = 0;
            }
            return 0;
        }

        public void ParseAndUpdateAccountDetails(Facebookaccounts facebookAccount, DatabaseRepository databaseRepository)
        {
            try
            {
                var profileDetails = FacebookApiHelper.GetUserDetails(facebookAccount.AccessToken).ToString();

                var profile = JObject.Parse(profileDetails);

                if (Convert.ToString(profile) == "Invalid Access Token")
                    return;

                facebookAccount.Friends = FacebookApiHelper.GetFriendCounts(facebookAccount.AccessToken);

                ApiHitsCount++;

                facebookAccount.EmailId = profile.SelectToken("email")?.ToString();

                facebookAccount.ProfileUrl = profile.SelectToken("link")?.ToString();
                if (string.IsNullOrEmpty(facebookAccount.ProfileUrl))
                    facebookAccount.ProfileUrl = profile.SelectToken("picture.data.url")?.ToString();

                facebookAccount.Gender = profile.SelectToken("gender")?.ToString();
                facebookAccount.Bio = profile.SelectToken("bio")?.ToString();
                facebookAccount.About = profile.SelectToken("about")?.ToString();
                facebookAccount.CoverPic = profile.SelectToken("cover.source")?.ToString();
                facebookAccount.Birthday = profile.SelectToken("birthday")?.ToString();

                var profileEducationDetails = JArray.Parse(profile.SelectToken("education")?.ToString() ?? "[]");
                facebookAccount.College = profileEducationDetails?.LastOrDefault()?.SelectToken("school.name")?.ToString();
                facebookAccount.Education = profileEducationDetails?.LastOrDefault()?.SelectToken("concentration.name")?.ToString();

                var profileWorkingDetails = JArray.Parse(profile["work"]?.ToString() ?? "[]");
                facebookAccount.WorkPosition = profileWorkingDetails?.FirstOrDefault()?.SelectToken("position.name")?.ToString();
                facebookAccount.WorkCompany = profileWorkingDetails?.FirstOrDefault()?.SelectToken("employer.name")?.ToString();

                facebookAccount.LastUpdate = DateTime.UtcNow;

                databaseRepository.Update(facebookAccount);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }



        #endregion

        #region Option 13 - Update Page details and posts

        public void UpdateFacebookPages()
        {
            try
            {
                JobManager.AddJob(() =>
                {
                    var status =
                        DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.FacebookUpdatePageDetails,
                            objStatus => false);

                    if (!status)
                        StartUpdatePageDetails();
                }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(10).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void StartUpdatePageDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.FacebookUpdatePageDetails, true, (enumType, runningStatus) => true);

                var fbAccounts = GetFacebookAccounts(FbProfileType.FacebookPage);

                Parallel.ForEach(fbAccounts, new ParallelOptions { MaxDegreeOfParallelism = 1 }, account =>
                {
                    UpdatePageFeedDetails(account);
                });
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.FacebookUpdatePageDetails, true, (enumType, runningStatus) => false);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Issue in update page details" + ex.StackTrace);
            }
        }

        public int UpdatePageFeedDetails(Facebookaccounts facebookAccount)
        {
            ApiHitsCount = 0;
            var databaseRepository = new DatabaseRepository();

            if (facebookAccount.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (!facebookAccount.IsAccessTokenActive)
                    return 0;

                ApiHitsCount++;

                UpdatePageDetails(facebookAccount, databaseRepository);

                UpdateFeeds(facebookAccount);

                UpdatePosts(facebookAccount);

                UpdatePageNotifications(facebookAccount);

                UpdatePageConversations(facebookAccount);

                UpdatePageTaggedDetails(facebookAccount);

                UpdatePagePromotionPostDetails(facebookAccount);
            }
            else
            {
                ApiHitsCount = 0;
            }
            return 0;
        }

        public void UpdatePageDetails(Facebookaccounts facebookAccount, DatabaseRepository databaseRepository)
        {
            try
            {
                if (facebookAccount.FbPageSubscription == FbPageSubscription.NotSubscribed &&
                    FacebookApiHelper.MakeSubscribedWithApp(facebookAccount.AccessToken))
                {
                    facebookAccount.FbPageSubscription = FbPageSubscription.Subscribed;
                }
                var pageDetails = JObject.Parse(FacebookApiHelper.GetPageDetails(facebookAccount.AccessToken));
                facebookAccount.Friends = long.Parse(pageDetails.SelectToken("fan_count")?.ToString() ?? "0");
                databaseRepository.Update(facebookAccount);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        #endregion

        #region Common Functionlaity

        public void UpdatePosts(Facebookaccounts facebookAccount)
        {
            const int maximumPaginationCount = 25;
            var currentPage = 0;

            if (currentPage >= maximumPaginationCount)
                return;

            string feeds = FacebookApiHelper.GetPosts(facebookAccount.AccessToken).ToString();

            var feedDetails = JObject.Parse(feeds);

            string nextPaginationUrl;

            do
            {
                nextPaginationUrl = feedDetails.SelectToken("paging.next")?.ToString();

                var postDetails = FetchAccountsFeedDetails(facebookAccount, feedDetails).ToList();

                if (postDetails.Count > 0)
                {
                    UpdatePostsToDb(postDetails);

                    if (!string.IsNullOrEmpty(nextPaginationUrl))
                        feedDetails = JObject.Parse(FacebookApiHelper
                            .GetResponse(nextPaginationUrl, facebookAccount.AccessToken).ToString());
                }
                else
                    nextPaginationUrl = string.Empty;

                currentPage++;
                if (currentPage > maximumPaginationCount)
                    nextPaginationUrl = string.Empty;

            } while (!string.IsNullOrEmpty(nextPaginationUrl));
        }

        public void UpdateFeeds(Facebookaccounts facebookAccount)
        {
            const int maximumPaginationCount = 25;
            var currentPage = 0;

            if (currentPage >= maximumPaginationCount)
                return;

            string feeds = FacebookApiHelper.GetOwnFeedDetails(facebookAccount.AccessToken).ToString();

            var feedDetails = JObject.Parse(feeds);

            string nextPaginationUrl;

            do
            {
                nextPaginationUrl = feedDetails.SelectToken("paging.next")?.ToString();

                var postDetails = FetchAccountsFeedDetails(facebookAccount, feedDetails).ToList();

                if (postDetails.Count > 0)
                {
                    UpdatePostsToDb(postDetails);

                    if (!string.IsNullOrEmpty(nextPaginationUrl))
                        feedDetails = JObject.Parse(FacebookApiHelper
                            .GetResponse(nextPaginationUrl, facebookAccount.AccessToken).ToString());
                }
                else
                    nextPaginationUrl = string.Empty;

                currentPage++;
                if (currentPage > maximumPaginationCount)
                    nextPaginationUrl = string.Empty;

            } while (!string.IsNullOrEmpty(nextPaginationUrl));
        }

        public IEnumerable<MongoMessageModel> UpdatePageNotifications(Facebookaccounts facebookAccount)
        {
            var notificationDetails = new List<MongoMessageModel>();

            try
            {
                var notificationsDetails = FacebookApiHelper.GetPageNotifications(facebookAccount.AccessToken);

                var notifications = JObject.Parse(notificationsDetails);

                foreach (var item in notifications["data"])
                {
                    var inboxMessages = new MongoMessageModel
                    {
                        profileId = facebookAccount.FbUserId,
                        type = MessageType.FacebookPageNotification,
                        messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)
                    };

                    try
                    {
                        inboxMessages.Message = item.SelectToken("title")?.ToString();
                        inboxMessages.messageId = item.SelectToken("id").ToString();
                        inboxMessages.fromId = item.SelectToken("from.id").ToString();
                        inboxMessages.fromName = item.SelectToken("from.name").ToString();
                        inboxMessages.fromScreenName = item.SelectToken("from.name").ToString();
                        inboxMessages.fromProfileUrl = "http://graph.facebook.com/" + inboxMessages.fromId + "/picture?type=small";
                        inboxMessages.RecipientId = item.SelectToken("to.id").ToString();
                        inboxMessages.RecipientName = item.SelectToken("to.name").ToString();
                        inboxMessages.messageDate = Convert.ToDateTime(item["created_time"].ToString()).ToString(CultureInfo.InvariantCulture);

                        notificationDetails.Add(inboxMessages);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }
                AddNotificationsToDb(notificationDetails);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return notificationDetails;
        }

        public IEnumerable<FacebookPagePromotionDetails> UpdatePageTaggedDetails(Facebookaccounts facebookAccount)
        {
            var taggedDetailCollections = new List<FacebookPagePromotionDetails>();
            try
            {
                var taggedDetails = FacebookApiHelper.GetPageTaggedDetails(facebookAccount.AccessToken);

                taggedDetailCollections = ParseTagAndPromoteDetails(facebookAccount, taggedDetails).ToList();
                AddedPromotionDetailsToDb(taggedDetailCollections);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return taggedDetailCollections;
        }

        private static IEnumerable<FacebookPagePromotionDetails> ParseTagAndPromoteDetails(Facebookaccounts facebookAccount, string taggedDetails, FacebookPagePromotion facebookPagePromotion = FacebookPagePromotion.Tagged)
        {
            var data = JObject.Parse(taggedDetails);

            var taggedDetailCollections = new List<FacebookPagePromotionDetails>();

            foreach (var item in data["data"])
            {
                var inboxMessages = new FacebookPagePromotionDetails
                {
                    ProfileId = facebookAccount.FbUserId,
                    type = facebookPagePromotion,
                    EntryDate = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)
                };
                try
                {
                    inboxMessages.message = item.SelectToken("message")?.ToString();
                    inboxMessages.FeedId = item.SelectToken("id")?.ToString();
                    inboxMessages.FromId = item.SelectToken("from.id")?.ToString();
                    inboxMessages.FromName = item.SelectToken("from.name")?.ToString();
                    inboxMessages.FromProfileUrl = "http://graph.facebook.com/" + inboxMessages.FromId + "/picture?type=small";
                    inboxMessages.FeedDate = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item.SelectToken("created_time")?.ToString()));
                    inboxMessages.Picture = item.SelectToken("picture")?.ToString();
                    inboxMessages.FeedDescription = item.SelectToken("description")?.ToString();
                    taggedDetailCollections.Add(inboxMessages);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
            return taggedDetailCollections;
        }

        public void UpdatePagePromotionPostDetails(Facebookaccounts facebookAccount)
        {
            try
            {
                var promotablePosts = FacebookApiHelper.GetPromotablePostsDetails(facebookAccount.AccessToken);
                var taggedDetailCollections = ParseTagAndPromoteDetails(facebookAccount, promotablePosts, FacebookPagePromotion.PromotablePosts).ToList();
                AddedPromotionDetailsToDb(taggedDetailCollections);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public void UpdatePageConversations(Facebookaccounts facebookAccount)
        {
            try
            {
                var conversations = FacebookApiHelper.GetConversations(facebookAccount.AccessToken);

                var conversationCollections = JObject.Parse(conversations);

                var conversationCollection = conversationCollections.SelectTokens("data").SelectMany(x=> x)
                    .Select(item => 
                        new MongoDirectMessages
                        {
                            messageId = item.SelectToken("id")?.ToString(),
                            createdDate = Convert.ToDateTime(item.SelectToken("updated_time")?.ToString()
                                                             ?? DateTime.Now.ToString(CultureInfo.InvariantCulture)).ToString("yyyy/MM/dd HH:mm:ss"),
                            ConversationLink = item.SelectToken("link")?.ToString(), type = MessageType.FacebookPagDirectMessageReceived
                        }).ToList();

                AddConversationDetailsToDb(conversationCollection);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
      
        public IEnumerable<MongoFacebookFeed> FetchAccountsFeedDetails(Facebookaccounts facebookAccount,
            JObject feedDetails)
        {
            return (from feed in feedDetails.SelectTokens("data")?.SelectMany(feed => feed)
                    select JObject.Parse(feed.ToString())
            into feedDetail
                    let fromName = feedDetail.SelectToken("from.name")?.ToString()
                    let fromId = feedDetail.SelectToken("from.id")?.ToString()
                    let feedId = feedDetail.SelectToken("id")?.ToString()
                    let createdDateTime = DateTime.Parse(feedDetail.SelectToken("created_time")?.ToString() ?? DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"))
                        .ToString("yyyy/MM/dd HH:mm:ss")
                    let likeCount = feedDetail.SelectToken("likes.summary.total_count")?.ToString()
                    let commentCount = feedDetail.SelectToken("comments.summary.total_count")?.ToString()
                    let postType = feedDetail.SelectToken("type")?.ToString() ?? "status"
                    let postingFrom = feedDetail.SelectToken("application.name")?.ToString() ?? "Facebook"
                    let picture = feedDetail.SelectToken("picture")?.ToString()
                    let message = feedDetail.SelectToken("message")?.ToString() ?? feedDetail.SelectToken("description")?.ToString() ?? feedDetail.SelectToken("story")?.ToString() ?? string.Empty
                    let postDate = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(createdDateTime))
                    select new MongoFacebookFeed
                    {
                        Type = "fb_feed",
                        ProfileId = facebookAccount.FbUserId,
                        Id = ObjectId.GenerateNewId(),
                        FromProfileUrl = $"http://graph.facebook.com/{facebookAccount.FbUserId}/picture?type=small",
                        FromName = fromName,
                        FromId = fromId,
                        FeedId = feedId,
                        FeedDate = postDate.ToString(CultureInfo.InvariantCulture),
                        FeedDateToshow = SBHelper.ConvertFromUnixTimestamp(Convert.ToDouble(postDate)).ToString("yyyy/MM/dd HH:mm:ss"),
                        FbComment = $"http://graph.facebook.com/{feedId}/comments",
                        FbLike = $"http://graph.facebook.com/{feedId}/likes",
                        Likecount = likeCount,
                        Commentcount = commentCount,
                        postType = postType,
                        postingFrom = postingFrom,
                        Picture = picture,
                        FeedDescription = message,
                        EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss")
                    }).ToList();
        }

        public void UpdatePostsToDb(IEnumerable<MongoFacebookFeed> feedCollections)
        {
            foreach (var feed in feedCollections)
            {
                try
                {
                    var mongoDbRepository = new MongoRepository("MongoFacebookFeed");
                    var getAccountPostDetails = mongoDbRepository.Find<MongoFacebookFeed>(t => t.FeedId == feed.FeedId && t.ProfileId == feed.ProfileId);
                    var matchedCount = Task.Run(async () => await getAccountPostDetails).Result.Count;

                    if (matchedCount < 1)
                        mongoDbRepository.Add(feed);
                    else
                    {
                        try
                        {
                            var filter = new BsonDocument("FeedId", feed.FeedId);
                            var update = Builders<BsonDocument>.Update.Set("postType", feed.postType).Set("postingFrom", feed.postingFrom).Set("Likecount", feed.Likecount).Set("Commentcount", feed.Commentcount).Set("_facebookComment", feed._facebookComment);
                            mongoDbRepository.Update<MongoFacebookFeed>(update, filter);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
        }

        private static void AddedPromotionDetailsToDb(IEnumerable<FacebookPagePromotionDetails> inboxMessages)
        {
            foreach (var inboxMessage in inboxMessages)
            {
                var mongoRepository = new MongoRepository("FacebookPagePromotionDetails");
                var ret = mongoRepository.Find<FacebookPagePromotionDetails>(t => t.ProfileId == inboxMessage.ProfileId && t.FeedId == inboxMessage.FeedId);
                var task = Task.Run(async () => await ret);
                var count = task.Result.Count;
                if (count < 1)
                {
                    mongoRepository.Add(inboxMessage);
                }
            }
        }

        private static void AddNotificationsToDb(IEnumerable<MongoMessageModel> inboxMessages)
        {
            inboxMessages.ForEach(inboxMessage =>
            {
                var mongoRepository = new MongoRepository("MongoMessageModel");
                var ret = mongoRepository.Find<MongoMessageModel>(t => t.profileId == inboxMessage.profileId && t.messageId == inboxMessage.messageId);
                var task = Task.Run(async () => await ret);
                var count = task.Result.Count;
                if (count < 1)
                    mongoRepository.Add(inboxMessage);
            });
        }

        private static void AddConversationDetailsToDb(IEnumerable<MongoDirectMessages> directMessages)
        {
            try
            {
                foreach (var directMessage in directMessages)
                {
                    var mongoRepository = new MongoRepository("MongoDirectMessages");
                    var ret = mongoRepository.Find<MongoDirectMessages>(t => t.messageId == directMessage.messageId);
                    var task = Task.Run(async () => await ret);
                    var count = task.Result.Count;
                    if (count <= 0)
                    {
                        mongoRepository.Add(directMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        #endregion

        #endregion













    }
}