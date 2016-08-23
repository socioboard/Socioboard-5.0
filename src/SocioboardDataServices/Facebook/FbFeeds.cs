
using Domain.Socioboard.Models.Mongo;
using SocioboardDataServices.Model;
using System;

namespace SocioboardDataServices.Facebook
{
    public class FbFeeds
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 150;
        public int updateFacebookFeeds(Domain.Socioboard.Models.Facebookaccounts fbAcc)
        {
            apiHitsCount = 0;
            if (fbAcc.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (fbAcc.IsAccessTokenActive)
                {
                    dynamic feeds = Socioboard.Facebook.Data.FbUser.getFeeds(fbAcc.AccessToken);


                    while (apiHitsCount < MaxapiHitsCount && feeds != null && feeds["data"] != null)
                    {

                        apiHitsCount++;
                        if (feeds["data"] != null)
                        {
                            Console.WriteLine(feeds["data"]);
                            foreach (var result in feeds["data"])
                            {
                                MongoFacebookFeed objFacebookFeed = new MongoFacebookFeed();
                                objFacebookFeed.Type = "fb_feed";
                                objFacebookFeed.ProfileId = fbAcc.FbUserId;
                                objFacebookFeed.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                                objFacebookFeed.FromProfileUrl = "http://graph.facebook.com/" + result["from"]["id"] + "/picture?type=small";
                                objFacebookFeed.FromName = result["from"]["name"].ToString();
                                objFacebookFeed.FromId = result["from"]["id"].ToString();
                                objFacebookFeed.FeedId = result["id"].ToString();
                                objFacebookFeed.FeedDate = DateTime.Parse(result["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                                objFacebookFeed.FbComment = "http://graph.facebook.com/" + result["id"] + "/comments";
                                objFacebookFeed.FbLike = "http://graph.facebook.com/" + result["id"] + "/likes";

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
                                objFacebookFeed.FeedDescription = message;
                                objFacebookFeed.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");

                                try
                                {
                                    MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed");

                                    mongorepo.Add<MongoFacebookFeed>(objFacebookFeed);
                                }
                                catch (Exception ex)
                                {
                                    //_logger.LogInformation(ex.Message);
                                    //_logger.LogError(ex.StackTrace);
                                }

                                AddFbPostComments(objFacebookFeed.FeedId, fbAcc.AccessToken);
                            }

                        }
                        else
                        {
                            apiHitsCount = MaxapiHitsCount;
                        }
                        try
                        {
                            feeds = Socioboard.Facebook.Data.FbUser.fbGet(fbAcc.AccessToken, feeds["paging"]["next"]);
                        }
                        catch
                        {
                            apiHitsCount = MaxapiHitsCount;
                        }

                    }

                    fbAcc.LastUpdate = DateTime.UtcNow;
                    DatabaseRepository dbr = new DatabaseRepository();
                    dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);

                }
            }
            return 0;
        }

        //todo : need to write codes to get all comments 
        public static string AddFbPostComments(string postid, string AccessToken)
        {
            MongoFbPostComment fbPostComment = new MongoFbPostComment();
            string ret = string.Empty;
            try
            {

                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                apiHitsCount++;
                //while (apiHitsCount < MaxapiHitsCount )
                //{

                //}
                dynamic post = Socioboard.Facebook.Data.FbUser.getPostComments(AccessToken, postid);

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

                        MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment");
                        fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        //_logger.LogInformation(ex.Message);
                        //_logger.LogError(ex.StackTrace);
                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        //_logger.LogInformation(ex.Message);
                        //_logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                //_logger.LogInformation(ex.Message);
                //_logger.LogError(ex.StackTrace);
            }
            return ret;
        }
    }
}
