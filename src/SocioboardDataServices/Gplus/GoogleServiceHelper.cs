using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using FluentScheduler;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Gplus
{
    public class GoogleServiceHelper
    {

        #region Get google plus accounts
        /// <summary>
        /// Fetch all the google plus accounts
        /// </summary>
        /// <returns>Google plus accounts</returns>

        private static IEnumerable<Googleplusaccounts> GetGooglePlusAccounts()
        {
            var databaseRepository = new DatabaseRepository();
            var gpAccounts = databaseRepository.Find<Googleplusaccounts>(t => t.IsActive).ToList();
            return gpAccounts;
        }
        #endregion

        #region Google Services
        public void UpdateGooglePlusAccounts()
        {
            try
            {
                JobManager.AddJob(() =>
                {

                    var status = DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.GooglePlusUpdateDetails,
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

        public void StartUpdateAccountDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.GooglePlusUpdateDetails, true, (enumType, runningStatus) => true);
                var googleAccounts = GetGooglePlusAccounts();

                var objoAuthTokenGPlus = new oAuthTokenGPlus(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                var objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);

                Parallel.ForEach(googleAccounts, new ParallelOptions { MaxDegreeOfParallelism = 20 }, gPlusAccount =>
                {
                    UpdateGooglePlusFeeds(gPlusAccount, objoAuthTokenGPlus, objToken);
                });

                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.GooglePlusUpdateDetails, true, (enumType, runningStatus) => false);


            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private int UpdateGooglePlusFeeds(Googleplusaccounts googlePlusAccount, oAuthTokenGPlus objoAuthTokenGPlus, oAuthToken objToken)
        {
            var databaseRepository = new DatabaseRepository();

            if (googlePlusAccount.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (!googlePlusAccount.IsActive)
                    return 0;

                ParseAndUpdateGoogleAccountDetails(googlePlusAccount, databaseRepository, objoAuthTokenGPlus, objToken);
                ParseAndUpdateGoogleAccountFeeds(googlePlusAccount, objoAuthTokenGPlus, objToken);
            }

            return 0;
        } 
        #endregion

        #region Update google account details
        private void ParseAndUpdateGoogleAccountDetails(Googleplusaccounts googlePlusAccount, DatabaseRepository databaseRepository, oAuthTokenGPlus objoAuthTokenGPlus, oAuthToken objToken)
        {
            try
            {
                string objRefresh = objoAuthTokenGPlus.GetAccessToken(googlePlusAccount.RefreshToken);
                JObject objaccesstoken = JObject.Parse(objRefresh);
                string access_token = objaccesstoken.SelectToken("access_token")?.ToString();
                string user = objToken.GetUserInfo("self", access_token);
                JObject userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                string people = objToken.GetPeopleInfo("self", access_token, googlePlusAccount.GpUserId);
                userinfo = JObject.Parse(JArray.Parse(people)[0].ToString());

                googlePlusAccount.GpUserName = userinfo.SelectToken("displayName")?.ToString() ?? userinfo.SelectToken("name")?.ToString();
                googlePlusAccount.GpProfileImage = userinfo.SelectToken("image.url")?.ToString() ?? userinfo.SelectToken("picture")?.ToString();
                googlePlusAccount.about = userinfo.SelectToken("tagline")?.ToString() ?? googlePlusAccount.about;
                googlePlusAccount.college = userinfo.SelectTokens("organizations").FirstOrDefault()?.SelectToken("name")?.ToString() ?? googlePlusAccount.college;
                googlePlusAccount.coverPic = userinfo.SelectToken("cover.coverPhoto.url")?.ToString() ?? googlePlusAccount.coverPic;
                googlePlusAccount.education = userinfo.SelectTokens("organizations").FirstOrDefault()?.SelectToken("type")?.ToString() ?? googlePlusAccount.education;
                googlePlusAccount.EmailId = userinfo.SelectTokens("emails").FirstOrDefault()?.SelectToken("value")?.ToString() ?? googlePlusAccount.EmailId;
                googlePlusAccount.gender = userinfo.SelectToken("gender")?.ToString() ?? googlePlusAccount.gender;
                googlePlusAccount.workPosition = userinfo.SelectToken("occupation")?.ToString() ?? googlePlusAccount.workPosition;
                googlePlusAccount.LastUpdate = DateTime.UtcNow;

                databaseRepository.Update(googlePlusAccount);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        #endregion

        #region Update google plus feeds
        private void ParseAndUpdateGoogleAccountFeeds(Googleplusaccounts googlePlusAccount, oAuthTokenGPlus objoAuthTokenGPlus, oAuthToken objToken)
        {
            try
            {

                string objRefresh = objoAuthTokenGPlus.GetAccessToken(googlePlusAccount.RefreshToken);
                JObject objaccesstoken = JObject.Parse(objRefresh);
                string access_token = objaccesstoken.SelectToken("access_token")?.ToString();

                MongoGplusFeed _GooglePlusActivities;
                string _Activities = objoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetActivitiesList.Replace("[ProfileId]", googlePlusAccount.GpUserId) + "?key=" + AppSettings.googleApiKey, access_token);
                JObject J_Activities = JObject.Parse(_Activities);
                foreach (var item in J_Activities["items"])
                {
                    _GooglePlusActivities = new MongoGplusFeed();
                    _GooglePlusActivities.Id = ObjectId.GenerateNewId();
                    _GooglePlusActivities.GpUserId = googlePlusAccount.GpUserId;

                    _GooglePlusActivities.FromUserName = item.SelectToken("actor.displayName")?.ToString();
                    _GooglePlusActivities.FromId = item.SelectToken("actor.id")?.ToString();
                    _GooglePlusActivities.ActivityId = item.SelectToken("id")?.ToString();
                    _GooglePlusActivities.ActivityUrl = item.SelectToken("url")?.ToString();
                    _GooglePlusActivities.Title = item.SelectToken("title")?.ToString();
                    _GooglePlusActivities.FromProfileImage = item.SelectToken("actor.image.url")?.ToString();
                    _GooglePlusActivities.Content = item.SelectToken("object.content")?.ToString();
                    _GooglePlusActivities.PublishedDate = Convert.ToDateTime(item.SelectToken("published")?.ToString()).ToString("yyyy/MM/dd HH:mm:ss") ?? "";
                    _GooglePlusActivities.PlusonersCount = Convert.ToInt32(item.SelectToken("object.plusoners.totalItems")?.ToString() ?? "0");
                    _GooglePlusActivities.RepliesCount = Convert.ToInt32(item.SelectToken("object.replies.totalItems")?.ToString() ?? "0");
                    _GooglePlusActivities.ResharersCount = Convert.ToInt32(item.SelectToken("object.resharers.totalItems")?.ToString() ?? "0");

                    _GooglePlusActivities.AttachmentType = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("objectType")?.ToString() ?? "";

                    switch (_GooglePlusActivities.AttachmentType)
                    {
                        case "video":
                            _GooglePlusActivities.Attachment = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("embed.url")?.ToString() ?? "";
                            break;
                        case "photo":
                            _GooglePlusActivities.Attachment = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("image.url")?.ToString() ?? "";
                            break;
                        case "album":
                            _GooglePlusActivities.Attachment = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectTokens("thumbnails")?.FirstOrDefault().SelectToken("image.url")?.ToString() ?? "";
                            break;
                        case "article":
                            _GooglePlusActivities.Attachment = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("image.url")?.ToString() ?? "";
                            _GooglePlusActivities.ArticleDisplayname = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("displayName")?.ToString() ?? "";
                            _GooglePlusActivities.ArticleContent = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("content")?.ToString() ?? "";
                            _GooglePlusActivities.Link = item.SelectTokens("object.attachments")?.FirstOrDefault()?.SelectToken("url")?.ToString() ?? "";
                            break;
                        default:
                            _GooglePlusActivities.AttachmentType = "note";
                            _GooglePlusActivities.Attachment = "";
                            break;
                    }

                    MongoRepository gplusFeedRepo = new MongoRepository("MongoGplusFeed");
                    var ret = gplusFeedRepo.Find<MongoGplusFeed>(t => t.ActivityId.Equals(_GooglePlusActivities.ActivityId));
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        gplusFeedRepo.Add(_GooglePlusActivities);
                    }
                    else
                    {
                        FilterDefinition<BsonDocument> filter = new BsonDocument("ActivityId", _GooglePlusActivities.ActivityId);
                        var update = Builders<BsonDocument>.Update.Set("PlusonersCount", _GooglePlusActivities.PlusonersCount).Set("RepliesCount", _GooglePlusActivities.RepliesCount).Set("ResharersCount", _GooglePlusActivities.ResharersCount);
                        gplusFeedRepo.Update<MongoGplusFeed>(update, filter);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        #endregion
    }
}
