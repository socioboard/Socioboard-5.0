using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using Socioboard.Facebook.Data;
using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Facebook
{
    public class FacebookFeedsManagerSched
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public void ScheduleFacebookfeedmanagerPost()
        {
            while (true)
            {
                try
                {
                    MongoRepository _facebookSharefeeds = new MongoRepository("SavedFeedsManagement");                   
                    var result = _facebookSharefeeds.Find<Domain.Socioboard.Models.Mongo.SavedFeedsManagement>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage && t.schedOrNotstatus == 1 && t.status != Domain.Socioboard.Enum.ScheduledStatusFeedsManager.Published);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.SavedFeedsManagement> lstfbpagefeeds = task.Result.ToList();
                    //lstfbpagefeeds = lstfbpagefeeds.Where(t => t.socialProfileId.Equals("1452799044811364")).ToList();
                    int count = 1;

                    foreach (var items in lstfbpagefeeds)
                    {
                        objSemaphore.WaitOne();
                        noOfthreadRunning++;
                        Thread thread_pageshreathon = new Thread(() => feedschedulemessages(new object[] { items,_facebookSharefeeds }));
                        thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                        thread_pageshreathon.Start();
                        Thread.Sleep(180 * 1000);                      
                        Console.WriteLine(count++);
                    }
                    Thread.Sleep(TimeSpan.FromMinutes(1));

                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
            }
        }


        private static void feedschedulemessages(object o)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
                MongoRepository mongorepo = new Helper.MongoRepository("SavedFeedsManagement");
                int pageapiHitsCount;
                object[] arr = o as object[];
            
                SavedFeedsManagement item = (SavedFeedsManagement)arr[0];     
                MongoRepository _ShareathonRepository = (MongoRepository)arr[1];
                Domain.Socioboard.Models.Facebookaccounts _facebook = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == item.socialProfileId && t.IsActive).FirstOrDefault();
                Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _facebook.UserId);
                if (_facebook != null)
                {
                    //foreach (var item in feeds)
                    //{
                        try
                        {
                            Console.WriteLine(item.SocialProfileName + "Scheduling Started");
                            PostFacebookMessage(item, _facebook, _user);
                            Console.WriteLine(item.SocialProfileName + "Scheduling");
                        }
                        catch (Exception)
                        {

                        }
                    //}
                  //  _facebook.SchedulerUpdate = DateTime.UtcNow;
                   // dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_facebook);
                }
            }
            catch (Exception ex)
            {
                //  Thread.Sleep(60000);
            }
            finally
            {
                noOfthreadRunning--;
                objSemaphore.Release();
                Console.WriteLine(Thread.CurrentThread.Name + " Is Released");
            }
        }


        public static void PostFacebookMessage(Domain.Socioboard.Models.Mongo.SavedFeedsManagement schmessage, Domain.Socioboard.Models.Facebookaccounts _facebook, Domain.Socioboard.Models.User _user)
        {
            try
            {
                if (_facebook != null)
                {
                    if (_facebook.IsActive)
                    {
                        DateTime dt = Convert.ToDateTime(schmessage.scheduleTimestr);
                        if (dt <= DateTime.UtcNow)
                        {
                            string data = ComposeMessage(_facebook.FbProfileType, _facebook.AccessToken, _facebook.FbUserId, schmessage.shareMessage, schmessage.postId, schmessage.userId, schmessage.url, schmessage.link, schmessage, _user);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public static string ComposeMessage(Domain.Socioboard.Enum.FbProfileType profiletype, string accessToken, string fbUserId, string message, string profileId, long userId, string imagePath, string link, Domain.Socioboard.Models.Mongo.SavedFeedsManagement schmessage, Domain.Socioboard.Models.User _user)
        {
            string ret = "";
            DatabaseRepository dbr = new DatabaseRepository();
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accessToken;
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;


            var args = new Dictionary<string, object>();


            if (profiletype == Domain.Socioboard.Enum.FbProfileType.FacebookProfile)
            {
                args["privacy"] = FbUser.SetPrivacy("Public", fb, profileId);
            }
            try
            {
                if (string.IsNullOrEmpty(link))
                {

                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        if (!string.IsNullOrEmpty(message))
                        {
                            args["message"] = message;
                        }

                        if (!imagePath.Contains("mp4") && !imagePath.Contains("mov") && !imagePath.Contains("mpeg") && !imagePath.Contains("wmv") && !imagePath.Contains("avi") && !imagePath.Contains("flv") && !imagePath.Contains("3gp"))
                        {
                            Uri u = new Uri(imagePath);
                            string filename = string.Empty;
                            string extension = string.Empty;
                            extension = System.IO.Path.GetExtension(u.AbsolutePath).Replace(".", "");
                            var media = new FacebookMediaObject
                            {
                                FileName = "filename",
                                ContentType = "image/" + extension
                            };
                            var webClient = new WebClient();
                            byte[] img = webClient.DownloadData(imagePath);
                            media.SetValue(img);
                            args["source"] = media;
                            ret = fb.Post("v2.7/" + fbUserId + "/photos", args).ToString();
                        }
                        else
                        {
                            Uri u = new Uri(imagePath);
                            string filename = string.Empty;
                            string extension = string.Empty;
                            filename = imagePath.Substring(imagePath.IndexOf("get?id=") + 7);
                            if (!string.IsNullOrWhiteSpace(filename))
                            {
                                extension = filename.Substring(filename.IndexOf(".") + 1);
                            }
                            var media = new FacebookMediaObject
                            {
                                FileName = filename,
                                ContentType = "video/" + extension
                            };
                            //byte[] img = System.IO.File.ReadAllBytes(imagepath);
                            var webClient = new WebClient();
                            byte[] img = webClient.DownloadData(imagePath);
                            media.SetValue(img);
                            args["title"] = message;
                            args["description"] = message;
                            args["source"] = media;
                            ret = fb.Post("v2.7/" + fbUserId + "/videos", args).ToString();//v2.1 
                        }
                    }
                    else
                    {
                        args["message"] = message;
                        ret = fb.Post("v2.7/" + fbUserId + "/feed", args).ToString();
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(link))
                    {
                        if (message.Contains("https://") || message.Contains("http://"))
                        {
                            link = message;
                            if (link.Contains("https://"))
                            {
                                string links = getBetween(link + "###", "https", "###");
                                links = "https" + links;
                                try
                                {
                                    link = links.Split(' ')[0].ToString();
                                }
                                catch (Exception)
                                {
                                    link = links;
                                }
                            }
                            if (link.Contains("http://"))
                            {
                                string links = getBetween(link + "###", "http", "###");
                                links = "http" + links;
                                try
                                {
                                    link = links.Split(' ')[0].ToString();
                                }
                                catch (Exception)
                                {
                                    link = links;
                                }
                            }
                            message = message.Replace(link, "");
                            args["message"] = message;
                        }
                        else
                        {
                            args["message"] = message;
                        }
                    }
                    else
                    {
                        args["message"] = message;
                    }
                    if (!string.IsNullOrEmpty(link))
                    {
                        args["link"] = link;
                    }
                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        args["picture"] = imagePath.Replace("&amp;", "&");
                    }
                    ret = fb.Post("v2.7/" + fbUserId + "/feed", args).ToString();

                }
                MongoRepository mongorepo = new Helper.MongoRepository("SavedFeedsComments");               
                schmessage.status = Domain.Socioboard.Enum.ScheduledStatusFeedsManager.Published;
                FilterDefinition<BsonDocument> filterIds = new BsonDocument("strId", schmessage.strId);
                var updatetime = Builders<BsonDocument>.Update.Set("status", schmessage.status);
                mongorepo.Update<Domain.Socioboard.Models.Mongo.SavedFeedsComments>(updatetime, filterIds);
               
            }
            catch (Exception ex)
            {

               
            }
            return ret;
        }

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }


    }
}
