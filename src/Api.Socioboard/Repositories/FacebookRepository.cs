using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Facebook.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class FacebookRepository
    {

        public static int AddFacebookAccount(dynamic profile, Int64 friends, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc = FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            if (fbAcc != null && fbAcc.IsActive == false)
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Friends = friends;
                fbAcc.AccessToken = accessToken;
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = (Convert.ToString(profile["link"]));
                }
                catch { }
                try
                {
                    fbAcc.Gender = (Convert.ToString(profile["gender"]));
                }
                catch { }
                try
                {
                    fbAcc.Bio = (Convert.ToString(profile["bio"]));
                }
                catch { }
                try
                {
                    fbAcc.About = (Convert.ToString(profile["about"]));
                }
                catch { }
                try
                {
                    fbAcc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch { }
                try
                {
                    fbAcc.Birthday = (Convert.ToString(profile["birthday"]));
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["education"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.College = Convert.ToString(arry[arry.Count() - 1]["school"]["name"]);
                        fbAcc.Education = Convert.ToString(arry[arry.Count() - 1]["concentration"]["name"]);
                    }
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["work"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.WorkPosition = Convert.ToString(arry[0]["position"]["name"]);
                        fbAcc.WorkCompany = Convert.ToString(arry[0]["employer"]["name"]);
                    }
                }
                catch { }
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            else
            {
                fbAcc = new Domain.Socioboard.Models.Facebookaccounts();
                fbAcc.UserId = userId;
                fbAcc.IsActive = true;
                fbAcc.Friends = friends;
                fbAcc.FbProfileType = fbProfileType;
                fbAcc.AccessToken = accessToken;
                fbAcc.FbUserId = (Convert.ToString(profile["id"]));
                fbAcc.FbUserName = (Convert.ToString(profile["name"]));
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = (Convert.ToString(profile["picture"]["data"]["url"]));
                   // fbAcc.ProfileUrl = "http://graph.facebook.com/" + profile["from"]["id"] + "/picture?type=small";
                }
                catch { }
                try
                {
                    fbAcc.Gender = (Convert.ToString(profile["gender"]));
                }
                catch { }
                try
                {
                    fbAcc.Bio = (Convert.ToString(profile["bio"]));
                }
                catch { }
                try
                {
                    fbAcc.About = (Convert.ToString(profile["about"]));
                }
                catch { }
                try
                {
                    fbAcc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch { }
                try
                {
                    fbAcc.Birthday = (Convert.ToString(profile["birthday"]));
                }
                catch { }
                try
                {

                    try
                    {
                        fbAcc.College = Convert.ToString(profile["education"][0]["school"]["name"]);
                    }
                    catch { }
                    try
                    {
                        fbAcc.Education = Convert.ToString(profile["education"][0]["concentration"]["name"]);
                    }
                    catch { }

                }
                catch { }
                try
                {

                    try
                    {
                        fbAcc.WorkPosition = Convert.ToString(profile["work"][0]["position"]["name"]);
                    }
                    catch { }
                    try
                    {
                        fbAcc.WorkCompany = Convert.ToString(profile["work"][0]["employer"]["name"]);
                    }
                    catch { }

                }
                catch { }

                isSaved = dbr.Add<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }

            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(fbAcc.FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstFbAcc.First().FbUserId, lstFbAcc.First().FbUserName, userId, "https://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small", Domain.Socioboard.Enum.SocialProfileType.Facebook, dbr);
                    if (isSaved == 1)
                    {
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        new Thread(delegate ()
                        {
                            FacebookRepository.SaveFacebookFeeds(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                            UpdatePageShareathon(fbAcc, userId, settings);
                            UpdateGroupShareathon(fbAcc, userId, settings);
                           // UpdateDeleteFacebookPassChange(fbAcc, userId, settings);
                        }).Start();                       
                    }
                }

            }
            return isSaved;
        }

        public static int ReFacebookAccount(dynamic profile, Int64 friends, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, string reconnect, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc;
           
          
           fbAcc = FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
               

            
            if (fbAcc != null )
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Friends = friends;
                fbAcc.AccessToken = accessToken;
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    //fbAcc.ProfileUrl = (Convert.ToString(profile["link"]));
                    fbAcc.ProfileUrl = (Convert.ToString(profile["picture"]["data"]["url"]));
                }
                catch { }
                try
                {
                    fbAcc.Gender = (Convert.ToString(profile["gender"]));
                }
                catch { }
                try
                {
                    fbAcc.Bio = (Convert.ToString(profile["bio"]));
                }
                catch { }
                try
                {
                    fbAcc.About = (Convert.ToString(profile["about"]));
                }
                catch { }
                try
                {
                    fbAcc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch { }
                try
                {
                    fbAcc.Birthday = (Convert.ToString(profile["birthday"]));
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["education"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.College = Convert.ToString(arry[arry.Count() - 1]["school"]["name"]);
                        fbAcc.Education = Convert.ToString(arry[arry.Count() - 1]["concentration"]["name"]);
                    }
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["work"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.WorkPosition = Convert.ToString(arry[0]["position"]["name"]);
                        fbAcc.WorkCompany = Convert.ToString(arry[0]["employer"]["name"]);
                    }
                }
                catch { }
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            return isSaved;
        }

        public static int AddFacebookPage(dynamic profile, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc = FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            //try
            //{
            //    string subscribed_apps = Fbpages.subscribed_apps(accessToken, Convert.ToString(profile["id"]));
            //    fbAcc.FbPageSubscription = Domain.Socioboard.Enum.FbPageSubscription.Subscribed;
            //}
            //catch(Exception ex)
            //{
            //    fbAcc.FbPageSubscription = 0;
            //}
           
            if (fbAcc != null && fbAcc.IsActive == false)
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Is90DayDataUpdated = false;
                try
                {
                    fbAcc.Friends = (Convert.ToInt64(profile["fan_count"]));
                }
                catch (Exception)
                {
                    fbAcc.Friends = 0;
                }
                try
                {
                    fbAcc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch (Exception)
                {

                }
                fbAcc.AccessToken = accessToken;
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            else
            {
                fbAcc = new Domain.Socioboard.Models.Facebookaccounts();
                fbAcc.UserId = userId;
                fbAcc.IsActive = true;
                try
                {
                    fbAcc.Friends = (Convert.ToInt64(profile["fan_count"]));
                }
                catch (Exception)
                {
                    fbAcc.Friends = 0;
                }
                fbAcc.FbProfileType = fbProfileType;
                fbAcc.AccessToken = accessToken;
                fbAcc.FbPageSubscription = Domain.Socioboard.Enum.FbPageSubscription.Subscribed;
                fbAcc.FbUserId = (Convert.ToString(profile["id"]));
                fbAcc.FbUserName = (Convert.ToString(profile["name"]));
                try
                {
                    fbAcc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch (Exception)
                {

                }
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = "https://graph.facebook.com/" + Convert.ToString(profile["id"]) + "/picture?type=small";
                }
                catch { }


                isSaved = dbr.Add<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }

            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(fbAcc.FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstFbAcc.First().FbUserId, lstFbAcc.First().FbUserName, userId, "https://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small", Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage, dbr);
                    if (isSaved == 1)
                    {
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);

                        new Thread(delegate ()
                         {
                             FacebookRepository.SaveFacebookFeeds(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                             FacebookRepository.SaveFacebookPageFeed(fbAcc.AccessToken, lstFbAcc.First().FbUserId, fbAcc.FbUserName,settings);
                             FacebookRepository.SavePageConversations(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                             FacebookRepository.SaveFacebookPagePromotionalDetails(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                             FacebookRepository.SaveFacebookPageTaggedDetails(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                             // FacebookRepository.SavePageNotification(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);
                             UpdateGroupShareathonPage(fbAcc, userId, settings);
                             UpdatePageshareathonPage(fbAcc, userId, settings);
                             UpdateDeleteLinkShareathon(fbAcc.FbUserName, userId, settings);
                           //  UpdateDeleteFacebookPassChange(fbAcc, userId, settings);
                         }).Start();

                       

                    }
                }

            }
            return isSaved;

        }

        public static int AddFacebookPagesByUrl(Domain.Socioboard.Models.Facebookpage _facebookpage, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc = FacebookRepository.getFacebookAccount(_facebookpage.ProfilePageId, _redisCache, dbr);
            if (fbAcc != null && fbAcc.IsActive == false)
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Friends = _facebookpage.friendsCount;
                fbAcc.AccessToken = _facebookpage.AccessToken;
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            else
            {
                fbAcc = new Domain.Socioboard.Models.Facebookaccounts();
                fbAcc.UserId = userId;
                fbAcc.IsActive = true;
                fbAcc.Friends = _facebookpage.friendsCount;
                fbAcc.FbProfileType = fbProfileType;
                fbAcc.AccessToken = _facebookpage.AccessToken;
                fbAcc.FbUserId = _facebookpage.ProfilePageId;
                fbAcc.FbUserName = _facebookpage.Name;
                try
                {
                    fbAcc.EmailId = "";
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = "https://graph.facebook.com/" + _facebookpage.ProfilePageId + "/picture?type=small";
                }
                catch { }


                isSaved = dbr.Add<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(fbAcc.FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstFbAcc.First().FbUserId, lstFbAcc.First().FbUserName, userId, "https://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small", Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage, dbr);
                    if (isSaved == 1)
                    {
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        new Thread(delegate ()
                        {
                            Repositories.FacebookRepository.SaveFbPublicPagePost(_facebookpage.AccessToken, fbAcc.FbUserId, _appSettings);
                            UpdateGroupShareathonPage(fbAcc, userId, _appSettings);
                            UpdatePageshareathonPage(fbAcc, userId, _appSettings);
                        }).Start();

                       


                    }
                }
            }
            return isSaved;
        }
        public static Domain.Socioboard.Models.Facebookaccounts getFacebookAccount(string FbUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.Facebookaccounts inMemFbAcc = _redisCache.Get<Domain.Socioboard.Models.Facebookaccounts>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + FbUserId);
                if (inMemFbAcc != null)
                {
                    return inMemFbAcc;
                }
            }
            catch { }

            try
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + FbUserId, lstFbAcc.First());
                    return lstFbAcc.First();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public static void SaveFbPublicPagePost(string accesstoken, string profileid, Helper.AppSettings _appSettings)
        {

            dynamic feeds = FbUser.getFeeds(accesstoken, profileid);
            try
            {


                foreach (var item in feeds["data"])
                {
                    Domain.Socioboard.Models.Mongo.FbPublicPagePost objFbPagePost = new Domain.Socioboard.Models.Mongo.FbPublicPagePost();
                    objFbPagePost.Id = ObjectId.GenerateNewId();
                    objFbPagePost.PageId = profileid;

                    try
                    {
                        objFbPagePost.PostId = item["object_id"].ToString();
                    }
                    catch { };
                    if (string.IsNullOrEmpty(objFbPagePost.PostId))
                    {
                        try
                        {
                            string pstid = item["id"];
                            objFbPagePost.PostId = pstid.Split('_')[1];
                        }
                        catch { };
                    }

                    objFbPagePost.PostDate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_time"]));
                    objFbPagePost.EntryDate = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        objFbPagePost.Post = item["message"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.PictureUrl = item["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objFbPagePost.LinkUrl = item["link"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.IconUrl = item["icon"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.StatusType = item["status_type"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.Type = item["type"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.FromId = item["from"]["id"];

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objFbPagePost.FromName = item["from"]["name"];

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        dynamic like = FbUser.getFeedDetail(accesstoken, objFbPagePost.PostId);
                        objFbPagePost.Likes = Convert.ToInt32(like["likes"]["summary"]["total_count"].ToString());
                        objFbPagePost.Comments = Convert.ToInt32(like["comments"]["summary"]["total_count"].ToString());
                        objFbPagePost.Shares = Convert.ToInt32(like["shares"]["count"].ToString());
                    }
                    catch (Exception ex)
                    {
                        objFbPagePost.Likes = 0;
                        objFbPagePost.Comments = 0;
                        objFbPagePost.Shares = 0;
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        //code to add in db
                        MongoRepository mongoreppo = new MongoRepository("FbPublicPagePost", _appSettings);
                        var ret = mongoreppo.Find<Domain.Socioboard.Models.Mongo.FbPublicPagePost>(t => t.PostId == objFbPagePost.PostId);
                        var task = Task.Run(async () =>
                          {
                              return await ret;
                          });
                        IList<Domain.Socioboard.Models.Mongo.FbPublicPagePost> lstFbPublicPagePost = task.Result.ToList();
                        if (lstFbPublicPagePost.Count < 1)
                        {
                            mongoreppo.Add<Domain.Socioboard.Models.Mongo.FbPublicPagePost>(objFbPagePost);
                        }
                        else
                        {
                            var update = Builders<Domain.Socioboard.Models.Mongo.FbPublicPagePost>.Update.Set(t => t.Likes, objFbPagePost.Likes).Set(t => t.Comments, objFbPagePost.Comments).Set(t => t.Shares, objFbPagePost.Shares);
                            mongoreppo.Update<Domain.Socioboard.Models.Mongo.FbPublicPagePost>(update, t => t.PostId == objFbPagePost.PostId);
                        }
                    }
                    catch (Exception ex)
                    {

                    }




                }

            }
            catch (Exception ex)
            {

            }
        }

        public static void SaveFacebookFeeds(string AccessToken, string ProfileId, Helper.AppSettings settings, ILogger _logger)
        {
            dynamic feeds = FbUser.getFeeds(AccessToken);

            if (feeds != null)
            {

                foreach (var result in feeds["data"])
                {
                    MongoFacebookFeed objFacebookFeed = new MongoFacebookFeed();
                    objFacebookFeed.Type = "fb_feed";
                    objFacebookFeed.ProfileId = ProfileId;
                    objFacebookFeed.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    try
                    {
                        objFacebookFeed.FromProfileUrl = "http://graph.facebook.com/" + result["from"]["id"] + "/picture?type=small";
                        objFacebookFeed.FromName = result["from"]["name"].ToString();
                        objFacebookFeed.FromId = result["from"]["id"].ToString();
                        objFacebookFeed.FeedId = result["id"].ToString();
                        try
                        {
                            //objFacebookFeed.FeedDate = DateTime.Parse(result["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            objFacebookFeed.FeedDateToshow = DateTime.Parse(result["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            objFacebookFeed.FeedDate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(objFacebookFeed.FeedDateToshow)).ToString();
                        }
                        catch(Exception ex) { }
                        objFacebookFeed.FbComment = "http://graph.facebook.com/" + result["id"] + "/comments";
                        objFacebookFeed.FbLike = "http://graph.facebook.com/" + result["id"] + "/likes";
                        objFacebookFeed.shareStatus = false;
                        

                    }
                    catch (Exception ex) { }
                    try
                    {
                        objFacebookFeed.postType = result["type"].ToString();
                    }
                    catch
                    {
                        objFacebookFeed.postType = "status";
                    }
                    try
                    {
                        objFacebookFeed.postingFrom = result["application"]["name"].ToString();
                    }
                    catch
                    {
                        objFacebookFeed.postingFrom = "Facebook";
                    }
                    try
                    {
                        objFacebookFeed.Picture = result["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objFacebookFeed.Picture = "";
                    }

                    string message = string.Empty;

                    try
                    {
                        if (result["message"] != null)
                        {
                            message = result["message"];
                        }
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            if (result["description"] != null)
                            {
                                message = result["description"];
                            }
                        }
                        catch (Exception exx)
                        {
                            try
                            {
                                if (result["story"] != null)
                                {
                                    message = result["story"];
                                }
                            }
                            catch (Exception exxx)
                            {
                                message = string.Empty;
                            }
                        }

                    }

                    if (message == null)
                    {
                        message = "";
                    }
                    dynamic comment;
                    try
                    {
                        comment = result["comments"];
                    }
                    catch (Exception)
                    {
                        comment = null;
                    }
                    objFacebookFeed.FeedDescription = message;
                    objFacebookFeed.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    //try
                    //{
                    //    objFacebookFeed.sharedate = DateTime.UtcNow;//this is feed date value for share feed  in another socail media
                    //}
                    //catch { }
                    //objFacebookFeed._facebookComment = FbPostComments(objFacebookFeed.FeedId, AccessToken, settings, _logger);
                    
                    objFacebookFeed._facebookComment = FbPostComments(objFacebookFeed.FeedId, comment,settings, _logger);
                    try
                    {
                        MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);

                        mongorepo.Add<MongoFacebookFeed>(objFacebookFeed);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }

                   // AddFbPostComments(objFacebookFeed.FeedId, AccessToken, settings, _logger);
                }

            }

        }

        public static void SavePageConversations(string AccessToken, string ProfileId, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {

                Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages;
                dynamic data = FbUser.conversations(AccessToken);
                foreach (var item in data["data"])
                {
                    foreach (var msg_item in item["messages"]["data"])
                    {
                        objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();

                        try
                        {
                            objDirectMessages.messageId = msg_item["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.createdDate = Convert.ToDateTime(msg_item["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.senderId = msg_item["from"]["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.senderScreenName = msg_item["from"]["name"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.senderProfileUrl = "http://graph.facebook.com/" + objDirectMessages.senderId + "/picture?type=small";
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.recipientId = msg_item["to"]["data"][0]["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.recipientScreenName = msg_item["to"]["data"][0]["name"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.recipientProfileUrl = "http://graph.facebook.com/" + objDirectMessages.recipientId + "/picture?type=small";
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.message = msg_item["message"].ToString();
                            if (string.IsNullOrEmpty(objDirectMessages.message))
                            {
                                if ((msg_item["attachments"]["data"][0]["mime_type"].ToString()).Contains("image"))
                                {
                                    objDirectMessages.image = msg_item["attachments"]["data"][0]["image_data"]["url"].ToString();
                                }
                                else
                                {
                                    objDirectMessages.message = msg_item["attachments"]["data"][0]["name"].ToString();
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        try
                        {
                            objDirectMessages.image = msg_item["shares"]["data"][0]["link"].ToString();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
                        }
                        if (objDirectMessages.senderId == ProfileId)
                        {
                            objDirectMessages.type = Domain.Socioboard.Enum.MessageType.FacebookPageDirectMessageSent;
                        }
                        else
                        {
                            objDirectMessages.type = Domain.Socioboard.Enum.MessageType.FacebookPagDirectMessageReceived;
                        }

                        //code to add facebook page conversations
                        MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", settings);
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => t.messageId == objDirectMessages.messageId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count > 0)
                        {

                        }
                        else
                        {
                            mongorepo.Add(objDirectMessages);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("getPageConversations = > getPageConversations = > " + ex.Message);
            }
        }


        public static void SavePageNotification(string AccessToken, string ProfileId, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {
                dynamic data = FbUser.notifications(AccessToken);
                Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel;

                foreach (var item in data["data"])
                {
                    objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();

                    objMessageModel.profileId = ProfileId;
                    objMessageModel.type = Domain.Socioboard.Enum.MessageType.FacebookPageNotification;
                    objMessageModel.messageTimeStamp = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        objMessageModel.Message = item["title"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.messageId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.fromId = item["from"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.fromName = item["from"]["name"].ToString();
                        objMessageModel.fromScreenName = item["from"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.fromProfileUrl = "http://graph.facebook.com/" + objMessageModel.fromId + "/picture?type=small";
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.RecipientId = item["to"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    try
                    {
                        objMessageModel.RecipientName = item["to"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    //try
                    //{
                    //    objMessageModel.r = "http://graph.facebook.com/" + objMessageModel.RecipientId + "/picture?type=small";
                    //}
                    //catch (Exception ex)
                    //{
                    //    _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    //}
                    try
                    {
                        objMessageModel.messageDate = Convert.ToDateTime(item["created_time"].ToString());
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoMessageModel", settings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.profileId == objMessageModel.profileId && t.messageId == objMessageModel.messageId);
                    var task = Task.Run(async () =>
                      {
                          return await ret;
                      });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                    }
                }
            }
            catch (Exception)
            {

            }
        }

        public static void SaveFacebookPageFeed(string accesstoken, string facebookid, string fbpagename,Helper.AppSettings _appSettings)
        {
            try
            {
                Domain.Socioboard.Models.Mongo.FacebookPagePost _FacebookPagePost = new FacebookPagePost();

                dynamic fbfeeds = FbUser.getFeeds(accesstoken, facebookid);
                foreach (var _feed in fbfeeds["data"])
                {
                    try
                    {
                        //Domain.Socioboard.Models.Mongo.FacebookPagePost _FacebookPagePost = new FacebookPagePost();
                        _FacebookPagePost.Id = ObjectId.GenerateNewId();
                        _FacebookPagePost.strId = ObjectId.GenerateNewId().ToString();
                        _FacebookPagePost.PageId = facebookid;
                        try
                        {
                            _FacebookPagePost.PageName = _feed["from"]["name"].ToString();
                        }
                        catch(Exception ex)
                        {
                            _FacebookPagePost.PageName = fbpagename;
                        }
                        try
                        {
                            _FacebookPagePost.PostId = _feed["id"].ToString();
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.Message = _feed["message"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Message = "";
                        }
                        try
                        {
                            _FacebookPagePost.Link = _feed["link"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Link = "";
                        }
                        try
                        {
                            _FacebookPagePost.Name = _feed["name"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Name = "";
                        }
                        try
                        {
                            _FacebookPagePost.Picture = _feed["picture"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Picture = "";
                        }
                        try
                        {
                            _FacebookPagePost.Description = _feed["description"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Description = "";
                        }
                        try
                        {
                            _FacebookPagePost.Type = _feed["type"].ToString();
                        }
                        catch
                        {
                            _FacebookPagePost.Type = "";
                        }
                        try
                        {
                            _FacebookPagePost.CreatedTime = Helper.DateExtension.ToUnixTimestamp(Convert.ToDateTime(_feed["created_time"].ToString()));
                        }
                        catch
                        {
                            _FacebookPagePost.CreatedTime = Helper.DateExtension.ToUnixTimestamp(DateTime.UtcNow);
                        }

                        try
                        {
                            dynamic feeddetails = FbUser.getFeedDetail(accesstoken, _FacebookPagePost.PostId);

                            try
                            {
                                _FacebookPagePost.Likes = feeddetails["likes"]["summary"]["total_count"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Likes = "0";
                            }
                            try
                            {
                                _FacebookPagePost.Comments = feeddetails["comments"]["summary"]["total_count"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Comments = "0";
                            }
                            try
                            {
                                _FacebookPagePost.Shares = feeddetails["shares"]["count"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Shares = "0";
                            }
                        }
                        catch (Exception ex)
                        {
                        }

                        try
                        {
                            dynamic postdetails = FbUser.postdetails(accesstoken, _FacebookPagePost.PostId);
                            string _clicks = string.Empty;
                            foreach (var _details in postdetails["data"])
                            {
                                if (_details["name"].ToString() == "post_story_adds_unique")
                                {
                                    try
                                    {
                                        _FacebookPagePost.Talking = _details["values"][0]["value"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                        _FacebookPagePost.Talking = "0";
                                    }
                                }
                                else if (_details["name"].ToString() == "post_impressions_unique")
                                {
                                    try
                                    {
                                        _FacebookPagePost.Reach = _details["values"][0]["value"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                        _FacebookPagePost.Reach = "0";
                                    }
                                }
                                else if (_details["name"].ToString() == "post_consumptions_by_type_unique")
                                {
                                    try
                                    {
                                        _clicks = _details["values"][0]["value"]["other clicks"].ToString();
                                    }
                                    catch (Exception ex)
                                    {
                                        _clicks = "0";
                                    }
                                }
                            }
                            try
                            {
                                _FacebookPagePost.EngagedUsers = (Int32.Parse(_clicks) + Int32.Parse(_FacebookPagePost.Talking)).ToString();
                            }
                            catch (Exception ex)
                            {
                                _FacebookPagePost.EngagedUsers = "0";
                            }
                            try
                            {
                                _FacebookPagePost.Engagement = (double.Parse(_FacebookPagePost.EngagedUsers.ToString()) * 100) / double.Parse(_FacebookPagePost.Reach.ToString());
                            }
                            catch (Exception)
                            {

                                _FacebookPagePost.Engagement = 0.00;
                            }
                        }
                        catch { }
                        //code to save facebookpage post data
                        MongoRepository reppoFacebookPagePost = new MongoRepository("FacebookPagePost", _appSettings);
                        var ret = reppoFacebookPagePost.Find<Domain.Socioboard.Models.Mongo.FacebookPagePost>(t => t.PostId == _FacebookPagePost.PostId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count > 0)
                        {
                            var update = Builders<Domain.Socioboard.Models.Mongo.FacebookPagePost>.Update.Set(t => t.Likes, _FacebookPagePost.Likes).Set(t => t.Comments, _FacebookPagePost.Comments).Set(t => t.Shares, _FacebookPagePost.Shares)
                            .Set(t => t.EngagedUsers, _FacebookPagePost.EngagedUsers).Set(t => t.Talking, _FacebookPagePost.Talking).Set(t => t.Engagement, _FacebookPagePost.Engagement)
                            .Set(t => t.Reach, _FacebookPagePost.Reach).Set(t => t.Link, _FacebookPagePost.Link);
                            reppoFacebookPagePost.Update<Domain.Socioboard.Models.Mongo.FacebookPagePost>(update, t => t.PostId == _FacebookPagePost.PostId);
                        }
                        else
                        {
                            reppoFacebookPagePost.Add(_FacebookPagePost);
                        }

                    }
                    catch (Exception ex)
                    {
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        public static void SaveFacebookPageTaggedDetails(string accesstoken, string facebookid, Helper.AppSettings _appSettings, ILogger _logger)
        {
            try
            {
                dynamic data = FbUser.getPageTaggedPostDetails(accesstoken);
                Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails _InboxMessages;

                foreach (var item in data["data"])
                {
                    _InboxMessages = new Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails();

                    _InboxMessages.ProfileId = facebookid;
                    _InboxMessages.type = Domain.Socioboard.Enum.FacebookPagePromotion.Tagged;
                    _InboxMessages.EntryDate = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        _InboxMessages.message = item["message"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FeedId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromId = item["from"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromName = item["from"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromProfileUrl = "http://graph.facebook.com/" + _InboxMessages.FromId + "/picture?type=small";
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.ProfileId = facebookid;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }

                    try
                    {
                        _InboxMessages.FeedDate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_time"].ToString()));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.Picture = item["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FeedDescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    MongoRepository mongorepo = new MongoRepository("FacebookPagePromotionDetails", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(t => t.ProfileId == _InboxMessages.ProfileId && t.FeedId == _InboxMessages.FeedId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(_InboxMessages);
                    }
                }
            }
            catch (Exception)
            {

            }
        }
        public static void SaveFacebookPagePromotionalDetails(string accesstoken, string facebookid, Helper.AppSettings _appSettings, ILogger _logger)
        {
            try
            {
                dynamic data = FbUser.getPromotablePostsDetails(accesstoken);
                Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails _InboxMessages;

                foreach (var item in data["data"])
                {
                    _InboxMessages = new Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails();

                    _InboxMessages.ProfileId = facebookid;
                    _InboxMessages.type = Domain.Socioboard.Enum.FacebookPagePromotion.PromotablePosts;
                    _InboxMessages.EntryDate = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        _InboxMessages.message = item["message"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FeedId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromId = item["from"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromName = item["from"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FromProfileUrl = "http://graph.facebook.com/" + _InboxMessages.FromId + "/picture?type=small";
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.ProfileId = facebookid;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }

                    try
                    {
                        _InboxMessages.FeedDate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_time"].ToString()));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.Picture = item["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    try
                    {
                        _InboxMessages.FeedDescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Facebook.asmx = > FacebookPagePromotionDetails = > " + ex.Message);
                    }
                    MongoRepository mongorepo = new MongoRepository("FacebookPagePromotionDetails", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(t => t.ProfileId == _InboxMessages.ProfileId && t.FeedId == _InboxMessages.FeedId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(_InboxMessages);
                    }
                }
            }
            catch (Exception)
            {

            }
        }

        public static string AddFbPostComments(string postid, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            MongoFbPostComment fbPostComment = new MongoFbPostComment();
            string ret = string.Empty;
            try
            {

                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                dynamic post = FbUser.GetPostComments(AccessToken, postid);

                foreach (var item in post["data"])
                {
                    fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    fbPostComment.PostId = postid;

                    try
                    {
                        fbPostComment.CommentId = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Comment = item["message"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Likes = Convert.ToInt32(item["like_count"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.UserLikes = Convert.ToInt32(item["user_likes"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Commentdate = DateTime.Parse(item["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        fbPostComment.Commentdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    try
                    {
                        fbPostComment.FromName = item["from"]["name"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.FromId = item["from"]["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.PictureUrl = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {

                        MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                        fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return ret;
        }

        public static List<MongoFbPostComment> FbPostComments(string postid, dynamic post, Helper.AppSettings settings, ILogger _logger)
        {

            List<MongoFbPostComment> lstFbPOstComment = new List<MongoFbPostComment>();
            string ret = string.Empty;
            try
            {

                //System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                //dynamic post = FbUser.getPostComments(AccessToken, postid);

                foreach (var item in post["data"])
                {
                    MongoFbPostComment fbPostComment = new MongoFbPostComment();
                    fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    fbPostComment.PostId = postid;

                    try
                    {
                        fbPostComment.CommentId = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Comment = item["message"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Likes = Convert.ToInt32(item["like_count"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.UserLikes = Convert.ToInt32(item["user_likes"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Commentdate = DateTime.Parse(item["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        fbPostComment.Commentdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    try
                    {
                        fbPostComment.FromName = item["from"]["name"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.FromId = item["from"]["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.PictureUrl = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        lstFbPOstComment.Add(fbPostComment);

                        //MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                        //fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                        new List<MongoFbPostComment>();

                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return lstFbPOstComment;
        }

        public static List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> GetTopFeeds(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookRecent100Feeds + profileId);
            // User inMemUser = (User)_memoryCache.Get(user.UserName);
            if (inMemFeeds != null && inMemFeeds.Count > 0)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);
                var builder = Builders<MongoFacebookFeed>.Sort;
                var sort = builder.Descending(t => t.FeedDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, 0, 100);
                var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;

                if (lstFbFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookRecent100Feeds + profileId, lstFbFeeds.ToList());

                    return lstFbFeeds.ToList();
                }

                return null;
            }

        }

        public static List<Domain.Socioboard.Models.Mongo.facebookfeed> GetTopFacebookFeed(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, int skip, int count)
        {
            var lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.facebookfeed>();
            var mongorepo = new MongoRepository("MongoFacebookFeed", settings);
            var builder = Builders<MongoFacebookFeed>.Sort;         
            var sort = builder.Descending(t => t.FeedDate);
            var result =mongorepo.FindWithRange(t => t.ProfileId.Equals(profileId), sort, skip, 20);
            var task = Task.Run(async () => await result);

            IList<MongoFacebookFeed> lstFbFeeds;
            try
            {
                lstFbFeeds = task.Result.ToList();
            }
            catch (Exception ex)
            {
                lstFbFeeds = new List<MongoFacebookFeed>();
            }


         //   lstFbFeeds = lstFbFeeds.OrderByDescending(t => t.EntryDate).ToList();
            // foreach (var item in lstFbFeeds)//sortt.ToList())
            foreach (var item in lstFbFeeds)
            {
                Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                //MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
                //var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                //var sortcomment = buildecommentr.Descending(t => t.Likes);
                //var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId && (!t.CommentId.Contains("{")), sortcomment, 0, 50);
                //var taskcomment = Task.Run(async () =>
                //{
                //    return await resultcomment;
                //});
                //IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                //lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                //item.Commentcount = lstFbPostComment.Count.ToString();
                //foreach(var commentItems in lstFbPostComment)
                //{
                //    commentItems.Commentdate = Convert.ToDateTime(commentItems.Commentdate).AddMinutes(330).ToString();
                //}

                _intafeed._facebookFeed = item;
               // _intafeed._facebookComment = lstFbPostComment.ToList();
                lstfacebookfeed.Add(_intafeed);
            }
            return lstfacebookfeed;
        }
        public static List<Domain.Socioboard.Models.Mongo.facebookfeed> GetFacebookSort(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, int skip, int count, string typeShort)
        {
            List<Domain.Socioboard.Models.Mongo.facebookfeed> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.facebookfeed>();
            List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeedsLs = new List<MongoFacebookFeed>();
            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);
            var builder = Builders<MongoFacebookFeed>.Sort;
            var sort = builder.Descending(t => t.EntryDate);
            if (typeShort == "maxlikes")
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeeds = lstFbFeeds.OrderByDescending(t => t.Likecount).ToList();
                foreach (var item in lstFbFeeds.ToList())
                {
                    Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                    //MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
                    //var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                    //var sortcomment = buildecommentr.Descending(t => t.Likes);
                    //var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId && (!t.CommentId.Contains("{")), sortcomment, 0, 50);
                    //var taskcomment = Task.Run(async () =>
                    //{
                    //    return await resultcomment;
                    //});
                    //IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                    //lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                    //item.Commentcount = lstFbPostComment.Count.ToString();
                    //foreach (var commentItems in lstFbPostComment)
                    //{
                    //    commentItems.Commentdate = Convert.ToDateTime(commentItems.Commentdate).AddMinutes(330).ToString();
                    //}
                    _intafeed._facebookFeed = item;
                    //_intafeed._facebookComment = lstFbPostComment.ToList();
                    lstfacebookfeed.Add(_intafeed);
                }
                return lstfacebookfeed;
            }
            else if (typeShort == "maxcomment")
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeeds = lstFbFeeds.OrderByDescending(t => Convert.ToInt64(t.Commentcount)).ToList();
                foreach (var item in lstFbFeeds.ToList())
                {
                   Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                //    MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
                //    var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                //    var sortcomment = buildecommentr.Descending(t => t.Likes);
                //    var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId && (!t.CommentId.Contains("{")), sortcomment, 0, 50);
                //    var taskcomment = Task.Run(async () =>
                //    {
                //        return await resultcomment;
                //    });
                //    IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                //    lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                //    item.Commentcount = lstFbPostComment.Count.ToString();
                //    foreach (var commentItems in lstFbPostComment)
                //    {
                //        commentItems.Commentdate = Convert.ToDateTime(commentItems.Commentdate).AddMinutes(330).ToString();
                //    }
                   _intafeed._facebookFeed = item;
                //    _intafeed._facebookComment = lstFbPostComment.ToList();
                    lstfacebookfeed.Add(_intafeed);
                }
                return lstfacebookfeed;
            }
            else if (typeShort == "leastlikes")
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeeds = lstFbFeeds.OrderBy(t => t.Likecount).ToList();
                foreach (var item in lstFbFeeds.ToList())
                {
                    Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                    //MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
                    //var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                    //var sortcomment = buildecommentr.Descending(t => t.Likes);
                    //var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId && (!t.CommentId.Contains("{")), sortcomment, 0, 50);
                    //var taskcomment = Task.Run(async () =>
                    //{
                    //    return await resultcomment;
                    //});
                    //IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                    //lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                    //item.Commentcount = lstFbPostComment.Count.ToString();
                    //foreach (var commentItems in lstFbPostComment)
                    //{
                    //    commentItems.Commentdate = Convert.ToDateTime(commentItems.Commentdate).AddMinutes(330).ToString();
                    //}
                    _intafeed._facebookFeed = item;
                    //_intafeed._facebookComment = lstFbPostComment.ToList();
                    lstfacebookfeed.Add(_intafeed);
                }
                return lstfacebookfeed;
            }
            else if (typeShort == "leastcomment")
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeeds = lstFbFeeds.OrderBy(t => Convert.ToInt64(t.Commentcount)).ToList();
                foreach (var item in lstFbFeeds.ToList())
                {
                    Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                    //MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
                    //var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                    //var sortcomment = buildecommentr.Descending(t => t.Likes);
                    //var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId && (!t.CommentId.Contains("{")), sortcomment, 0, 50);
                    //var taskcomment = Task.Run(async () =>
                    //{
                    //    return await resultcomment;
                    //});
                    //IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                    //lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                    //item.Commentcount = lstFbPostComment.Count.ToString();
                    //foreach (var commentItems in lstFbPostComment)
                    //{
                    //    commentItems.Commentdate = Convert.ToDateTime(commentItems.Commentdate).AddMinutes(330).ToString();
                    //}
                    _intafeed._facebookFeed = item;
                    //_intafeed._facebookComment = lstFbPostComment.ToList();
                    lstfacebookfeed.Add(_intafeed);
                }
                return lstfacebookfeed;
            }
            return new List<facebookfeed>();

        }
        public static List<Domain.Socioboard.Models.Mongo.facebookfeed> GetTopFacebookFilterFeed(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, int skip, int count, string typeFilter)
        {
            List<Domain.Socioboard.Models.Mongo.facebookfeed> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.facebookfeed>();
            List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeedsLs = new List<MongoFacebookFeed>();
            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);
            var builder = Builders<MongoFacebookFeed>.Sort;
            var sort = builder.Descending(t => t.EntryDate);
            if (typeFilter != "socioboard")
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId) && t.postType.Equals(typeFilter), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeedsLs = lstFbFeeds.ToList();
            }
            else
            {
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId) && t.postingFrom.Equals(typeFilter), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
                lstFbFeedsLs = lstFbFeeds.ToList();
            }

            List<string> postIds = new List<string>();
            foreach (var x in lstFbFeedsLs)
            {
                postIds.Add(x.FeedId);
            }
            MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", settings);
            var resultcomment = mongorepocomment.Find<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => postIds.Contains(t.PostId));
            var taskcomment = Task.Run(async () =>
            {
                return await resultcomment;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
            List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> tempData = lstFbPostComment.ToList();

            foreach (var item in lstFbFeedsLs)
            {
                Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostCommentTemp = tempData.Where(t => t.PostId == item.FeedId).ToList();
                lstFbPostCommentTemp = lstFbPostCommentTemp.OrderByDescending(t => t.Commentdate).ToList();
                _intafeed._facebookFeed = item;
                _intafeed._facebookComment = lstFbPostCommentTemp.ToList();
                lstfacebookfeed.Add(_intafeed);
            }
            foreach(var itemss in lstfacebookfeed)
            {
                itemss._facebookFeed.Commentcount = itemss._facebookComment.Count().ToString();
            }
            return lstfacebookfeed.ToList();
        }


        public static List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> GetFbPostComment(string postId, Helper.Cache _redisCache, Helper.AppSettings setting)
        {
            List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoFbPostComment>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFbPostComment + postId);
            if (inMemFeeds != null && inMemFeeds.Count > 0)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoFbPostComment", setting);
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == postId);
                var task = Task.Run(async () =>
                 {
                     return await result;
                 });
                IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = task.Result;
                lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                if (lstFbPostComment != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFbPostComment + postId, lstFbPostComment.ToList());
                    return lstFbPostComment.ToList();
                }
                return null;
            }
        }

        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(profileId) && t.UserId == userId && t.IsActive).FirstOrDefault();
            Domain.Socioboard.Models.User user = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id.Equals(userId) && t.EmailId == fbAcc.EmailId && t.EmailValidateToken == "Facebook").FirstOrDefault();
            if (user != null)
            {
                dbr.Delete<Domain.Socioboard.Models.User>(user);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + userId);
            }

            if (fbAcc != null)
            {

              //  fbAcc.IsActive = false;
              //  dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                dbr.Delete<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId);

                UpdateDeletesPagehreathon(profileId, _appSettings, userId);

                UpadteDeletesGroupShareathon(profileId, _appSettings, userId);

                DeleteLinkShareathon(fbAcc.FbUserName, userId,_appSettings);

                DeleteFacebookPassChange(fbAcc.FbUserId, userId, _appSettings);

                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }

        public static string PostFacebookComment(Model.DatabaseRepository dbr, string message, string profileId, string postId,string timezoneOffset, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            Domain.Socioboard.Models.Facebookaccounts lstFbAcc = new Domain.Socioboard.Models.Facebookaccounts();
            Domain.Socioboard.Models.Facebookaccounts inMemFbAcc = _redisCache.Get<Domain.Socioboard.Models.Facebookaccounts>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId);
            if (inMemFbAcc == null)
            {
                lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(profileId) && t.IsActive);
                if (lstFbAcc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId, lstFbAcc);
                }

            }
            else
            {
                lstFbAcc = inMemFbAcc;
            }
            string commentId = FbUser.PostComments(lstFbAcc.AccessToken, postId, message);
            JObject tempCommentId = JObject.Parse(commentId);
            if (commentId.Contains("Invalid Access Token"))
            {
                return "Invalid Access Token";
            }
            if (!string.IsNullOrEmpty(commentId))
            {
                //DateTime clienttime = Convert.ToDateTime(timezoneOffset);
                MongoFbPostComment fbPostComment = new MongoFbPostComment();
                fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                fbPostComment.EntryDate = timezoneOffset;
                fbPostComment.Commentdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                fbPostComment.PostId = postId;
                fbPostComment.Likes = 0;
                fbPostComment.UserLikes = 0;
                fbPostComment.PictureUrl = message;
                fbPostComment.FromName = lstFbAcc.FbUserName;
                fbPostComment.FromId = lstFbAcc.FbUserId;
                fbPostComment.CommentId = tempCommentId["id"].ToString();
                fbPostComment.Comment = message;
                try
                {

                    MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                    fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    return "posted successfully";
                }
                catch (Exception ex)
                {
                    _logger.LogInformation(ex.Message);
                    _logger.LogError(ex.StackTrace);
                }
            }
            return "";
        }

        public static List<Domain.Socioboard.Models.FacebookGroup> GetAllFacebookGroups(string fbUserId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.FacebookGroup> iMmemFacebookGroup = _redisCache.Get<List<Domain.Socioboard.Models.FacebookGroup>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookGroup + fbUserId);
            if (iMmemFacebookGroup != null)
            {
                return iMmemFacebookGroup;
            }
            else
            {
                Domain.Socioboard.Models.Facebookaccounts _facebookaccount = Repositories.FacebookRepository.getFacebookAccount(fbUserId, _redisCache, dbr);
                List<Domain.Socioboard.Models.FacebookGroup> lstFacebookGroup = Helper.FacebookHelper.GetAllFacebookGroups(_facebookaccount.AccessToken, _appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl, _appSettings.FacebookClientSecretKey);
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookGroup + fbUserId, lstFacebookGroup);
                return lstFacebookGroup;
            }
        }
        
        public static string FacebookfanPageCount(long userId, long groupId, Model.DatabaseRepository dbr, Helper.Cache _redisCache)
        {
            string[] profileids = null;
            string fanPageCount = string.Empty;
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Domain.Socioboard.Models.Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage).ToList();
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage)).ToList();
            }
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            long FacebookfanPageCount = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => profileids.Contains(t.FbUserId) && t.IsActive).Sum(t => t.Friends);
            if (FacebookfanPageCount > 1000000)
            {
                long r = FacebookfanPageCount % 1000000;
                long t = FacebookfanPageCount / 1000000;
                fanPageCount = t.ToString() + "." + (r / 10000).ToString() + "M";
            }
            else if (FacebookfanPageCount > 1000)
            {
                long r = FacebookfanPageCount % 1000;
                long t = FacebookfanPageCount / 1000;
                fanPageCount = t.ToString() + "." + (r / 100).ToString() + "K";
            }
            else
            {
                fanPageCount = FacebookfanPageCount.ToString();
            }
            return fanPageCount;
        }

        public static void UpdatePageShareathon(Domain.Socioboard.Models.Facebookaccounts fbAcc, long userId, Helper.AppSettings settings)
        {
            MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", settings);
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => t.Facebookaccountid == fbAcc.FbUserId && t.Userid == userId);
            var task = Task.Run(async () =>
            {
                return await ret;
            });

            if (task.Result == null)
                return;

            int count = task.Result.Count;
            if (count > 0)
            {

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("Facebookaccountid", fbAcc.FbUserId);
                var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, filter);

            }
        }

        public static void UpdateGroupShareathon(Domain.Socioboard.Models.Facebookaccounts fbAcc, long userId, Helper.AppSettings settings)
        {
            MongoRepository _ShareathongroupRepository = new MongoRepository("GroupShareathon", settings);
            var ret1 = _ShareathongroupRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => t.Facebookaccountid == fbAcc.FbUserId && t.Userid == userId);
            var task1 = Task.Run(async () =>
            {
                return await ret1;
            });

            if (task1.Result == null)
                return;

            int count1 = task1.Result.Count;
            if (count1 > 0)
            {

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("Facebookaccountid", fbAcc.FbUserId);
                var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                _ShareathongroupRepository.Update<Domain.Socioboard.Models.Mongo.GroupShareathon>(update, filter);

            }
        }

        public static void UpdatePageshareathonPage(Domain.Socioboard.Models.Facebookaccounts fbAcc, long userId, Helper.AppSettings settings)
        {
            MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", settings);
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => t.Facebookaccountid == fbAcc.FbUserId && t.Userid == userId);
            var task = Task.Run(async () =>
            {
                return await ret;
            });

            if (task.Result == null)
                return;

            int count = task.Result.Count;
            if (count > 0)
            {

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("Facebookpageid", fbAcc.FbUserId);
                var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, filter);

            }
        }

        public static void UpdateGroupShareathonPage(Domain.Socioboard.Models.Facebookaccounts fbAcc, long userId, Helper.AppSettings settings)
        {
            MongoRepository _ShareathongroupRepository = new MongoRepository("GroupShareathon", settings);
            var ret1 = _ShareathongroupRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => t.Facebookaccountid == fbAcc.FbUserId && t.Userid == userId);
            var task1 = Task.Run(async () =>
            {
                return await ret1;
            });

            if (task1.Result == null)
                return;

            int count1 = task1.Result.Count;
            if (count1 > 0)
            {

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("Facebookaccountid", fbAcc.FbUserId);
                var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                _ShareathongroupRepository.Update<Domain.Socioboard.Models.Mongo.GroupShareathon>(update, filter);

            }

        }

        public static void UpdateDeletesPagehreathon(string profileId, Helper.AppSettings _appSettings, long userId)
        {
            MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", _appSettings);
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => (t.Facebookaccountid == profileId || t.Facebookpageid.Contains(profileId)) && t.Userid == userId);
            var task = Task.Run(async () =>
            {
                return await ret;
            });

            if (task.Result == null)
                return;

            int count = task.Result.Count;
            if (count > 0)
            {
                var update = Builders<Domain.Socioboard.Models.Mongo.PageShareathon>.Update.Set(t => t.FacebookStatus, 2);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, t => t.Facebookaccountid == profileId || t.Facebookpageid.Contains(profileId));
            }
        }

        public static void UpadteDeletesGroupShareathon(string profileId, Helper.AppSettings _appSettings, long userId)
        {
            MongoRepository _ShareathongroupRepository = new MongoRepository("GroupShareathon", _appSettings);
            var ret = _ShareathongroupRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => (t.Facebookaccountid == profileId || t.Facebookpageid.Contains(profileId)) && t.Userid == userId);
            var task1 = Task.Run(async () =>
            {
                return await ret;
            });

            if (task1.Result == null)
                return;

            int count1 = task1.Result.Count;
            if (count1 > 0)
            {
                var update = Builders<Domain.Socioboard.Models.Mongo.GroupShareathon>.Update.Set(t => t.FacebookStatus, 2);
                _ShareathongroupRepository.Update<Domain.Socioboard.Models.Mongo.GroupShareathon>(update, t => t.Facebookaccountid == profileId || t.Facebookpageid.Contains(profileId));
            }
        }

        public static string DeleteLinkShareathon(string Facebookpageid,long userId ,Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("LinkShareathon", _appSettings);
                var ret = _ShareathonRepository.Find<LinkShareathon>(t => t.Facebookusername.Contains(Facebookpageid) && t.Userid == userId);
                var task = Task.Run(async () =>
                  {
                      return await ret;

                  });
                LinkShareathon _linkshareathon = task.Result.ToList().First();
                //var builders = Builders<Domain.Socioboard.Models.Mongo.LinkShareathon>.Filter;
                //FilterDefinition<Domain.Socioboard.Models.Mongo.LinkShareathon> filter = builders.Eq("strId", _linkshareathon.strId);
                //_ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.LinkShareathon>(filter);
                var update = Builders<Domain.Socioboard.Models.Mongo.LinkShareathon>.Update.Set(t => t.IsActive, false);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.LinkShareathon>(update, t => t.strId == _linkshareathon.strId);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static void UpdateDeleteLinkShareathon(string Facebookpageid, long userId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("LinkShareathon", _appSettings);
                var ret = _ShareathonRepository.Find<LinkShareathon>(t => t.Facebookusername.Contains(Facebookpageid) && t.Userid == userId);
                var task = Task.Run(async () =>
                {
                    return await ret;

                });

                if (task.Result == null)
                    return;

                LinkShareathon _linkshareathon = task.Result.ToList().First();
                //var builders = Builders<Domain.Socioboard.Models.Mongo.LinkShareathon>.Filter;
                //FilterDefinition<Domain.Socioboard.Models.Mongo.LinkShareathon> filter = builders.Eq("strId", _linkshareathon.strId);
                //_ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.LinkShareathon>(filter);
                var update = Builders<Domain.Socioboard.Models.Mongo.LinkShareathon>.Update.Set(t => t.IsActive, true);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.LinkShareathon>(update, t => t.strId == _linkshareathon.strId);
               
            }
            catch (Exception ex)
            {
               
            }
        }

        public static void DeleteFacebookPassChange(string profileId,  long userId, Helper.AppSettings _appSettings)
        {
            MongoRepository _facebookPassChange = new MongoRepository("FacebookPasswordChangeUserDetail", _appSettings);
            var ret = _facebookPassChange.Find<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(t => t.profileId.Equals(profileId) && t.userId == userId);
            var task = Task.Run(async () =>
            {
                return await ret;
            });

            if (task.Result == null)
                return;

            int count = task.Result.Count;
            if (count > 0)
            {
                var builders = Builders<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail> filter = builders.Eq("profileId", profileId);
                _facebookPassChange.Delete<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(filter);
              
            }
        }


        public static string CompareDateWithclient(string clientdate, string scheduletime)
        {
            try
            {
                var dt = DateTime.Parse(scheduletime);
                var clientdt = DateTime.Parse(clientdate);
                //  DateTime client = Convert.ToDateTime(clientdate);
                DateTime client = Convert.ToDateTime(TimeZoneInfo.ConvertTimeToUtc(clientdt, TimeZoneInfo.Local));
                DateTime server = DateTime.UtcNow;
                DateTime schedule = Convert.ToDateTime(TimeZoneInfo.ConvertTimeToUtc(dt, TimeZoneInfo.Local));
                {
                    var kind = schedule.Kind; // will equal DateTimeKind.Unspecified
                    if (DateTime.Compare(client, server) > 0)
                    {
                        double minutes = (server - client).TotalMinutes;
                        schedule = schedule.AddMinutes(minutes);
                    }
                    else if (DateTime.Compare(client, server) == 0)
                    {
                    }
                    else if (DateTime.Compare(client, server) < 0)
                    {
                        double minutes = (server - client).TotalMinutes;
                        schedule = schedule.AddMinutes(minutes);
                    }
                }
                return TimeZoneInfo.ConvertTimeFromUtc(schedule, TimeZoneInfo.Local).ToString();
                // return schedule.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return "";
            }
        }

    }
}
