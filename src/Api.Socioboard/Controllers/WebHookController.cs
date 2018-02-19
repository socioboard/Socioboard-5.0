using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Cors;
using System.Web.Http;
using System.Security.Cryptography;
using Newtonsoft.Json;
using Domain.Socioboard.Models.Mongo;
using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IO;
using System.Security.Policy;
using Api.Socioboard.Helper;
using Newtonsoft.Json.Linq;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class WebHookController : Controller
    {
        public WebHookController(ILogger<WebHookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _appEnv = appEnv;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _appEnv;

        [HttpGet]
        public string Get([FromQuery(Name = "hub.mode")] string hub_mode,
            [FromQuery(Name = "hub.challenge")] string hub_challenge,
            [FromQuery(Name = "hub.verify_token")] string hub_verify_token)
        {
            if (hub_verify_token == "hello")
            {
                _logger.LogInformation("Get received. Token OK : {0}", hub_verify_token);
                return hub_challenge;
            }
            else
            {
                _logger.LogError("Error. Token did not match. Got : {0}, Expected : {1}", hub_verify_token, "hello");
                return "error. no match";
            }
        }


        //public HttpResponseMessage Get([FromQuery(Name = "hub.mode")] string hub_mode,
        //    [FromQuery(Name = "hub.challenge")] string hub_challenge,
        //    [FromQuery(Name = "hub.verify_token")] string hub_verify_token)
        //{
        //    try
        //    {

        //        //var querystrings = Request.HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value);
        //        //_logger.LogInformation("querystrings:" + querystrings);
        //        //_logger.LogInformation("querystrings:" + querystrings["hub.verify_token"]);
        //        //_logger.LogInformation("querystrings:" + querystrings["hub.challenge"]);
        //        //foreach (var key in querystrings)
        //        //{
        //        //    _logger.LogInformation("Key: " + key.Key + " Value: " + key.Value);
        //        //}
        //        if (hub_verify_token == "hello")
        //        {

        //            return new HttpResponseMessage(HttpStatusCode.OK)
        //            {
        //                Content = new StringContent(hub_challenge, Encoding.UTF8, "text/plain")

        //            };
        //        }
        //        return new HttpResponseMessage(HttpStatusCode.Unauthorized);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError("webhookGetError" + ex.Message);
        //        _logger.LogError("webhookGetError" + ex.StackTrace);
        //        return new HttpResponseMessage(HttpStatusCode.BadRequest);
        //    }

        //}





        [HttpPost]
        public async Task<HttpResponseMessage> Post()
        {
            var signature = Request.Headers["X-Hub-Signature"].FirstOrDefault().Replace("sha1=", "");
            var body = Request.Body.ToString();

            string json = "";
            _logger.LogInformation("post value12" + body);
            using (StreamReader sr = new StreamReader(this.Request.Body))
            {
                json = sr.ReadToEnd();

            }
            _logger.LogInformation("post value13" + json);

            //comment from here.

            //if (!VerifySignature(signature, body))
            //{
            //    _logger.LogInformation("VerifySignature");
            //    return new HttpResponseMessage(HttpStatusCode.BadRequest);

            //}


            // value = JsonConvert.DeserializeObject<dynamic>(body);
            _logger.LogInformation("statusboady>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + json);
            dynamic value = JObject.Parse(json);

            try
            {
                _logger.LogInformation("try block start");
                if (value["object"] == "page")
                {

                    var x = value["entry"][0];
                    _logger.LogInformation("post value1212");
                    if (x["changes"][0]["value"]["item"] == "status")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        _logger.LogInformation("post profileId" + profileId);

                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        _logger.LogInformation("post sendId" + sendId);

                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        _logger.LogInformation("sendername" + sendername);

                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        _logger.LogInformation("postid" + postid);

                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        _logger.LogInformation("message" + message);

                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        _logger.LogInformation("postTime" + postTime);

                        

                        //string picture = Convert.ToString(x["changes"][0]["value"]["link"]);


                        Domain.Socioboard.Models.Mongo.MongoFacebookFeed _FacebookPagePost = new MongoFacebookFeed();
                        _FacebookPagePost.Id = ObjectId.GenerateNewId();
                        _FacebookPagePost.ProfileId = profileId;
                        _FacebookPagePost.Type = "fb_feed";

                        try
                        {
                            _FacebookPagePost.FromName = sendername;
                            _logger.LogInformation("FromName" + sendername);
                        }
                        catch
                        {
                            _FacebookPagePost.FromName = "";
                        }
                        try
                        {
                            _FacebookPagePost.FeedId = postid;
                            _logger.LogInformation("FeedId" + postid);
                        }
                        catch
                        {
                            _FacebookPagePost.FeedId = "";
                        }
                        try
                        {
                            _FacebookPagePost.FeedDescription = message;
                            
                        }
                        catch
                        {
                            _FacebookPagePost.FeedDescription = "";
                        }
                        try
                        {
                            _FacebookPagePost.FromId = sendId;
                        }
                        catch
                        {
                            _FacebookPagePost.FromId = "";
                        }
                        try
                        {
                            _FacebookPagePost.Picture = "";
                          
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.shareStatus = false;
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.FbComment = "http://graph.facebook.com/" + postid + "/comments";
                            _FacebookPagePost.FbLike = "http://graph.facebook.com/" + postid + "/likes";
                        }
                        catch (Exception)
                        {
                            _FacebookPagePost.FbComment = "";
                            _FacebookPagePost.FbLike = "";

                        }
                        try
                        {
                            _FacebookPagePost.FromProfileUrl = "http://graph.facebook.com/" + profileId + "/picture?type=small";
                            _logger.LogInformation("FromProfileUrl" + _FacebookPagePost.FromProfileUrl);
                        }
                        catch (Exception)
                        {
                            _FacebookPagePost.FromProfileUrl = "";                          
                        }
                        


                        try
                        {
                            double datevalue = Convert.ToDouble(postTime);                        
                            System.DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                            dateTime = dateTime.AddSeconds(datevalue);                         
                            string printDate = dateTime.ToShortDateString() + " " + dateTime.ToShortTimeString();                           
                            string createddate = Convert.ToDateTime(printDate).ToString("yyyy-MM-dd h:mm tt");                          
                            DateTime convertedDate = DateTime.SpecifyKind(DateTime.Parse(createddate), DateTimeKind.Utc);                           
                            _FacebookPagePost.FeedDate = convertedDate.ToString();
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString("yyyy/MM/dd HH:mm:ss");
                            // _FacebookPagePost.FeedDate = DateTime.Parse(x["changes"][0]["value"]["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            _logger.LogInformation("FeedDate" + _FacebookPagePost.FeedDate);
                        }
                        catch
                        {
                            //string postingTime = postTime.ToString();
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString("yyyy/MM/dd HH:mm:ss");
                            // _FacebookPagePost.FeedDate = DateTime.Parse(x["changes"][0]["value"]["created_time"]["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString();
                            _logger.LogError("FeedDate error" + _FacebookPagePost.FeedDate);
                        }
                        try
                        {
                            _FacebookPagePost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch { }

                       

                       

                        try
                        {
                            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);

                            mongorepo.Add<MongoFacebookFeed>(_FacebookPagePost);
                            _logger.LogInformation("first feeds added " + _FacebookPagePost);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogInformation("Feeds 1st error");
                            _logger.LogInformation(ex.Message);
                            _logger.LogError(ex.StackTrace);
                        }

                    }
                    if (x["changes"][0]["value"]["item"] == "photo")
                    {
                        _logger.LogInformation("photo start");
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        _logger.LogInformation("photo post time" + postTime);
                        string picture = Convert.ToString(x["changes"][0]["value"]["link"]);
                        Domain.Socioboard.Models.Mongo.MongoFacebookFeed _FacebookPagePost = new MongoFacebookFeed();
                        _FacebookPagePost.Id = ObjectId.GenerateNewId();
                        _FacebookPagePost.ProfileId = profileId;
                        try
                        {
                            _FacebookPagePost.FromName = sendername;
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.FromId = sendId;
                        }
                        catch
                        {
                            _FacebookPagePost.FromId = "";
                        }
                        try
                        {
                            _FacebookPagePost.Picture = picture;
                        }
                        catch
                        {
                            _FacebookPagePost.Picture = "";
                        }
                        try
                        {
                            _FacebookPagePost.FeedId = postid;
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.FeedDescription = message;
                        }
                        catch
                        {
                            _FacebookPagePost.FeedDescription = "";
                        }


                        try
                        {

                            double datevalue = Convert.ToDouble(postTime);
                            System.DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                            dateTime = dateTime.AddSeconds(datevalue);
                            string printDate = dateTime.ToShortDateString() + " " + dateTime.ToShortTimeString();
                            string createddate = Convert.ToDateTime(printDate).ToString("yyyy-MM-dd h:mm tt");
                            DateTime convertedDate = DateTime.SpecifyKind(DateTime.Parse(createddate), DateTimeKind.Utc);
                            _FacebookPagePost.FeedDate = convertedDate.ToString();
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                            _logger.LogInformation("date comment " + _FacebookPagePost.FeedDate);
                        }
                        catch
                        {
                            _FacebookPagePost.FeedDate = postTime;
                            // _FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                            _logger.LogInformation("date comment error " + _FacebookPagePost.FeedDate);
                        }

                        _FacebookPagePost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        _logger.LogInformation("EntryDate " + _FacebookPagePost.EntryDate);

                        try
                        {
                            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);
                            mongorepo.Add<MongoFacebookFeed>(_FacebookPagePost);
                            _logger.LogInformation("photo Feeds data added");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogInformation("Feeds data not added Error");
                            _logger.LogInformation(ex.Message);
                            _logger.LogError(ex.StackTrace);
                        }
                    }
                    if (x["changes"][0]["value"]["item"] == "comment")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string like = Convert.ToString(x["changes"][0]["value"]["item"]);
                        _logger.LogInformation("like" + like);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        _logger.LogInformation("postTime comment" + postTime);
                        string comment_id = Convert.ToString(x["changes"][0]["value"]["comment_id"]);
                        _logger.LogInformation("comment_id " + comment_id);

                        if (!string.IsNullOrEmpty(comment_id))
                        {
                            MongoFbPostComment fbPostComment = new MongoFbPostComment();
                            fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                            fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");

                            double datevalue = Convert.ToDouble(postTime);
                            System.DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                            dateTime = dateTime.AddSeconds(datevalue);
                            string printDate = dateTime.ToShortDateString() + " " + dateTime.ToShortTimeString();
                            string createddate = Convert.ToDateTime(printDate).ToString("yyyy-MM-dd h:mm tt");
                            DateTime convertedDate = DateTime.SpecifyKind(DateTime.Parse(createddate), DateTimeKind.Utc);
                            fbPostComment.Commentdate = convertedDate.ToString();
                            _logger.LogInformation("commnet date" + fbPostComment.Commentdate);
                            //fbPostComment.Commentdate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                            fbPostComment.PostId = postid;
                            fbPostComment.Likes = 0;
                            fbPostComment.UserLikes = 0;
                            fbPostComment.PictureUrl = message;
                            fbPostComment.FromName = sendername;
                            fbPostComment.FromId = sendId;
                            fbPostComment.CommentId = comment_id;
                            fbPostComment.Comment = message;
                            try
                            {

                                MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", _appSettings);
                                fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                                _logger.LogInformation("added data in MongoFbPostComment");
                            }
                            catch (Exception ex)
                            {
                                _logger.LogInformation("comment error while adding in mongo");
                                _logger.LogInformation(ex.Message);
                                _logger.LogError(ex.StackTrace);
                            }
                        }
                    }
                    if (x["changes"][0]["value"]["item"] == "share")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        _logger.LogInformation("ProfileId" + profileId);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        _logger.LogInformation("sendId" + sendId);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        _logger.LogInformation("sendername" + sendername);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        _logger.LogInformation("postid" + postid);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        _logger.LogInformation("message" + message);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        _logger.LogInformation("postTime" + postTime);
                        string share_id = Convert.ToString(x["changes"][0]["value"]["share_id"]);
                        _logger.LogInformation("share_id" + share_id);
                        string link = Convert.ToString(x["changes"][0]["value"]["link"]);
                        _logger.LogInformation("link" + link);





                        Domain.Socioboard.Models.Mongo.MongoFacebookFeed _FacebookPagePost = new MongoFacebookFeed();
                        _FacebookPagePost.Id = ObjectId.GenerateNewId();
                        _FacebookPagePost.ProfileId = profileId;
                        _FacebookPagePost.Type = "fb_feed";

                        try
                        {
                            _FacebookPagePost.FromName = sendername;
                            _logger.LogInformation("FromName" + sendername);
                        }
                        catch
                        {
                            _FacebookPagePost.FromName = "";
                        }
                        try
                        {
                            _FacebookPagePost.FeedId = postid;
                            _logger.LogInformation("FeedId" + postid);
                        }
                        catch
                        {
                            _FacebookPagePost.FeedId = "";
                        }
                        try
                        {
                            _FacebookPagePost.FeedDescription = link;
                            _logger.LogInformation("FeedDescription" + link);

                        }
                        catch (Exception ex)
                        {
                            _FacebookPagePost.FeedDescription = "";
                            _logger.LogInformation("Exception" + ex);
                        }
                        try
                        {
                            _FacebookPagePost.FromId = sendId;
                        }
                        catch
                        {
                            _FacebookPagePost.FromId = "";
                        }
                        try
                        {
                            _FacebookPagePost.Picture = "";

                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.shareStatus = false;
                        }
                        catch { }
                        try
                        {
                            _FacebookPagePost.FbComment = "http://graph.facebook.com/" + postid + "/comments";
                            _FacebookPagePost.FbLike = "http://graph.facebook.com/" + postid + "/likes";
                        }
                        catch (Exception)
                        {
                            _FacebookPagePost.FbComment = "";
                            _FacebookPagePost.FbLike = "";

                        }
                        try
                        {
                            _FacebookPagePost.FromProfileUrl = "http://graph.facebook.com/" + profileId + "/picture?type=small";
                            _logger.LogInformation("FromProfileUrl" + _FacebookPagePost.FromProfileUrl);
                        }
                        catch (Exception)
                        {
                            _FacebookPagePost.FromProfileUrl = "";
                        }



                        try
                        {
                            double datevalue = Convert.ToDouble(postTime);
                            System.DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                            dateTime = dateTime.AddSeconds(datevalue);
                            string printDate = dateTime.ToShortDateString() + " " + dateTime.ToShortTimeString();
                            string createddate = Convert.ToDateTime(printDate).ToString("yyyy-MM-dd h:mm tt");
                            DateTime convertedDate = DateTime.SpecifyKind(DateTime.Parse(createddate), DateTimeKind.Utc);
                            _FacebookPagePost.FeedDate = convertedDate.ToString();
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString("yyyy/MM/dd HH:mm:ss");
                            // _FacebookPagePost.FeedDate = DateTime.Parse(x["changes"][0]["value"]["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            _logger.LogInformation("FeedDate" + _FacebookPagePost.FeedDate);
                        }
                        catch
                        {
                            //string postingTime = postTime.ToString();
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString("yyyy/MM/dd HH:mm:ss");
                            // _FacebookPagePost.FeedDate = DateTime.Parse(x["changes"][0]["value"]["created_time"]["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            //_FacebookPagePost.FeedDate = DateTime.Parse(postingTime).ToString();
                            _logger.LogError("FeedDate error" + _FacebookPagePost.FeedDate);
                        }
                        try
                        {
                            _FacebookPagePost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch { }


                        try
                        {
                            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);

                            mongorepo.Add<MongoFacebookFeed>(_FacebookPagePost);
                            _logger.LogInformation("first feeds added" + _FacebookPagePost);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogInformation("Feeds 1st error");
                            _logger.LogInformation(ex.Message);
                            _logger.LogError(ex.StackTrace);
                        }


                    }
                    if (x["changes"][0]["value"]["item"] == "like" || x["changes"][0]["value"]["item"] == "like")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        _logger.LogInformation("postTime in like part" + postTime);
                    }

                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation("Error message ");
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        private bool VerifySignature(string signature, string body)
        {
            var hashString = new StringBuilder();
            using (var crypto = new HMACSHA1(Encoding.UTF8.GetBytes(_appSettings.FacebookClientSecretKey)))
            {
                var hash = crypto.ComputeHash(Encoding.UTF8.GetBytes(body));
                foreach (var item in hash)
                    hashString.Append(item.ToString("X2"));
            }

            return hashString.ToString().ToLower() == signature.ToLower();
        }

    }
}