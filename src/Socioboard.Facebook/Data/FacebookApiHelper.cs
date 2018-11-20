using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Models;
using Facebook;
using Newtonsoft.Json.Linq;
using Socioboard.Facebook.Utils;

namespace Socioboard.Facebook.Data
{
    public class FacebookApiHelper
    {

        /// <summary>
        /// To get the own feed details 
        /// </summary>
        /// <param name="accessToken">valid access token of facebook while logged in</param>
        /// <returns></returns>
        public static dynamic GetOwnFeedDetails(string accessToken)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/feed?limit=99&fields=picture,created_time,message,description,story,from,likes.summary(true),comments.summary(true),type,application");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }

        public static dynamic GetResponse(string url, string accessToken)
        {
            try
            {
                var fb = new FacebookClient { AccessToken = accessToken };
                return fb.Get(url);
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// To get the facebook user details
        /// </summary>
        /// <param name="accessToken">valid access token of facebook while logged in</param>
        /// <returns></returns>
        public static object GetUserDetails(string accessToken)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me?fields=id,about,birthday,cover,education,email,gender,hometown,name,first_name,last_name,work,picture");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }

        /// <summary>
        /// To get the friend count of an account
        /// </summary>
        /// <param name="accessToken">valid access token of facebook while logged in</param>
        /// <returns></returns>
        public static long GetFriendCounts(string accessToken)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            dynamic friends = fb.Get($"{FbConstants.FacebookApiVersion}/me/friends");
            try
            {
                return Convert.ToInt64(friends["summary"]["total_count"].ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return 0;
            }
        }

        public static List<FacebookGroup> GetFacebookGroups(string accessToken)
        {
            var lstAddFacebookGroup = new List<FacebookGroup>();
            var fb = new FacebookClient { AccessToken = accessToken };

            if (accessToken == null)
                return lstAddFacebookGroup;

            try
            {
                dynamic output = fb.Get($"{FbConstants.FacebookApiVersion}/me/groups");
                foreach (var item in output["data"])
                {
                    try
                    {
                        var objAddFacebookGroup =
                            new FacebookGroup
                            {
                                ProfileGroupId = item["id"].ToString(),
                                Name = item["name"].ToString(),
                                AccessToken = accessToken
                            };
                        lstAddFacebookGroup.Add(objAddFacebookGroup);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return null;
            }
            return lstAddFacebookGroup;
        }

        public static List<Facebookpage> GetOwnPagesDetails(string accessToken)
        {
            var lstPages = new List<Facebookpage>();
            var fb = new FacebookClient { AccessToken = accessToken };

            dynamic output = fb.Get($"{FbConstants.FacebookApiVersion}/me/accounts");
            foreach (var item in output["data"])
            {
                try
                {
                    var objAddFacebookPage = new Facebookpage
                    {
                        ProfilePageId = item["id"].ToString(),
                        Name = item["name"].ToString(),
                        AccessToken = item["access_token"].ToString(),
                        Email = string.Empty
                    };
                    try
                    {
                        dynamic postLike = fb.Get($"{FbConstants.FacebookApiVersion}/{objAddFacebookPage.ProfilePageId}?fields=likes,name,username,fan_count");
                        objAddFacebookPage.LikeCount = postLike["fan_count"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objAddFacebookPage.LikeCount = "0";
                        Console.WriteLine(ex.Message);
                    }
                    lstPages.Add(objAddFacebookPage);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
            }
            return lstPages;
        }

        public static bool MakeSubscribedWithApp(string pageAccessToken)
        {
            try
            {
                var fb = new FacebookClient { AccessToken = pageAccessToken };
                fb.Post($"{FbConstants.FacebookApiVersion}/me/subscribed_apps");
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static string GetPageDetails(string pageAccessToken)
        {
            try
            {
                var fb = new FacebookClient { AccessToken = pageAccessToken };
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/?fields=name,fan_count,id,picture").ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return string.Empty;
            }
        }

        public static dynamic GetPosts(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken };
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + "me/posts?limit=99&fields=picture,created_time,message,description,story,from,likes.summary(true),comments.summary(true),type,application");
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static string GetPageNotifications(string pageAccessToken)
        {
            var fb = new FacebookClient {AccessToken = pageAccessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/notifications/?fields=title,from,to,created_time").ToString();
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static string GetPromotablePostsDetails(string pageAccessToken)
        {
            var fb = new FacebookClient {AccessToken = pageAccessToken };
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/promotable_posts?fields=picture,created_time,message,description,from&limit=99").ToString();
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static string GetConversations(string pageAccessToken)
        {
            var fb = new FacebookClient {AccessToken = pageAccessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/conversations").ToString();
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static string GetPageTaggedDetails(string pageAccessToken)
        {
            var fb = new FacebookClient {AccessToken = pageAccessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/tagged?fields=picture,created_time,message,description,from&limit=99").ToString();//v2.6
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static bool PostMessage(string message, string accessToken, string fbUserId, string link)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            var args = new Dictionary<string, object> { ["message"] = message, ["link"] = link };
            fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args);
            return true;
        }

        public static bool PublishPostOnSchedule(string message, string accessToken, string fbUserId, string link, string scheduleTime)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            var args = new Dictionary<string, object> { ["message"] = message, ["link"] = link };

            //, ["scheduled_publish_time"] = scheduleTime, ["published"] = "false"
            fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args);
            return true;
        }

        public static string PublishPost(FbProfileType profileType, string accessToken, string fbUserId, string message, string profileId, string mediaPath, string link)
        {
            var fb = new FacebookClient { AccessToken = accessToken };

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;

            var args = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(message))
                args["message"] = message;

            if (profileType == FbProfileType.FacebookProfile)
                args["privacy"] = FbUser.SetPrivacy("Public", fb, profileId);

            try
            {
                if (string.IsNullOrEmpty(link))
                {
                    if (string.IsNullOrEmpty(mediaPath) && !string.IsNullOrEmpty(message))
                    {
                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args).ToString();
                    }

                    if (mediaPath != null && !mediaPath.Contains("mp4") && !mediaPath.Contains("mov") && !mediaPath.Contains("mpeg") &&
                                              !mediaPath.Contains("wmv") && !mediaPath.Contains("avi") && !mediaPath.Contains("flv") &&
                                              !mediaPath.Contains("3gp"))
                    {
                        var uri = new Uri(mediaPath);
                        var extension = Path.GetExtension(uri.AbsolutePath).Replace(".", "");

                        var media = new FacebookMediaObject
                        {
                            FileName = "filename",
                            ContentType = "image/" + extension
                        };

                        var webClient = new WebClient();
                        var img = webClient.DownloadData(mediaPath);
                        media.SetValue(img);
                        args["source"] = media;

                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/photos", args).ToString();
                    }
                    else
                    {
                        var extension = string.Empty;

                        if (mediaPath != null)
                        {
                            var filename =
                                mediaPath.Substring(mediaPath.IndexOf("get?id=", StringComparison.Ordinal) + 7);

                            if (!string.IsNullOrWhiteSpace(filename))
                            {
                                extension = filename.Substring(filename.IndexOf(".", StringComparison.Ordinal) + 1);
                            }

                            var media = new FacebookMediaObject
                            {
                                FileName = filename,
                                ContentType = "video/" + extension
                            };

                            var webClient = new WebClient();
                            var img = webClient.DownloadData(mediaPath);
                            media.SetValue(img);

                            args["source"] = media;
                        }

                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/videos", args).ToString();
                    }
                }

                args["link"] = link;

                if (!string.IsNullOrEmpty(mediaPath))
                    args["picture"] = mediaPath.Replace("&amp;", "&");
                try
                {
                    return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args).ToString();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);

            }
            return string.Empty;
        }

        public static string PublishPostOnPage(string accessToken, string fbUserId, string message, string mediaPath, string link)
        {
            var fb = new FacebookClient { AccessToken = accessToken };

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;

            var args = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(message))
                args["message"] = message;

            try
            {
                if (string.IsNullOrEmpty(link))
                {
                    if (string.IsNullOrEmpty(mediaPath) && !string.IsNullOrEmpty(message))
                    {
                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args).ToString();
                    }

                    if (!mediaPath.Contains("mp4") && !mediaPath.Contains("mov") && !mediaPath.Contains("mpeg") &&
                        !mediaPath.Contains("wmv") && !mediaPath.Contains("avi") && !mediaPath.Contains("flv") &&
                        !mediaPath.Contains("3gp"))
                    {
                        var uri = new Uri(mediaPath);
                        var extension = Path.GetExtension(uri.AbsolutePath).Replace(".", "");

                        var media = new FacebookMediaObject
                        {
                            FileName = "filename",
                            ContentType = "image/" + extension
                        };

                        var webClient = new WebClient();
                        var img = webClient.DownloadData(mediaPath);
                        media.SetValue(img);
                        args["source"] = media;

                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/photos", args).ToString();
                    }
                    else
                    {
                        var extension = string.Empty;

                        var filename =
                            mediaPath.Substring(mediaPath.IndexOf("get?id=", StringComparison.Ordinal) + 7);

                        if (!string.IsNullOrWhiteSpace(filename))
                        {
                            extension = filename.Substring(filename.IndexOf(".", StringComparison.Ordinal) + 1);
                        }

                        var media = new FacebookMediaObject
                        {
                            FileName = filename,
                            ContentType = "video/" + extension
                        };

                        var webClient = new WebClient();
                        var img = webClient.DownloadData(mediaPath);
                        media.SetValue(img);

                        args["source"] = media;
                        return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/videos", args).ToString();
                    }
                }

                args["link"] = link;

                if (!string.IsNullOrEmpty(mediaPath))
                    args["picture"] = mediaPath.Replace("&amp;", "&");
                try
                {
                    return fb.Post($"{FbConstants.FacebookApiVersion}/" + fbUserId + "/feed", args).ToString();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);

            }
            return string.Empty;
        }

        public static string GetPageAccessToken(string pageId, string accessToken, string message)
        {
            try
            {
                var fb = new FacebookClient { AccessToken = accessToken };

                var pageAccessTokenResponse = JObject.Parse(fb.Get($"{FbConstants.FacebookApiVersion}/{pageId}/?fields=access_token").ToString());

                return pageAccessTokenResponse["access_token"].ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return string.Empty;
            }
        }

        public static dynamic GetPostsLikeCommentShareCount(string accessToken, string postId, string profileId)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + $"{profileId}_{postId}" + "?fields=likes.summary(true),comments.summary(true),shares");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }
   
    }
}