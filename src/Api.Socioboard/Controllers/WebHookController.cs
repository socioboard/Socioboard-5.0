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

        public HttpResponseMessage Get()
        {
            try
            {

                var querystrings = Request.HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value);
                _logger.LogInformation("querystrings:" + querystrings);
                _logger.LogInformation("querystrings:" + querystrings["hub.verify_token"]);
                _logger.LogInformation("querystrings:" + querystrings["hub.challenge"]);
                foreach (var key in querystrings)
                {
                    _logger.LogInformation("Key: " + key.Key + " Value: " + key.Value);
                }
                if (querystrings["hub.verify_token"] == "hello")
                {

                    return new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent(querystrings["hub.challenge"], Encoding.UTF8, "text/plain")

                    };
                }
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);
            }
            catch (Exception ex)
            {
                _logger.LogError("webhookGetError"+ex.Message);
                _logger.LogError("webhookGetError"+ex.StackTrace);
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }

        }


        [HttpPost]
        public async Task<HttpResponseMessage> Post()
        {
            var signature = Request.Headers["X-Hub-Signature"].FirstOrDefault().Replace("sha1=", "");
            var body = Request.Body.ToString();


            _logger.LogInformation("post value12" + body);
            if (!VerifySignature(signature, body))
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            dynamic value = JsonConvert.DeserializeObject<dynamic>(body);

            try
            {
                if (value["object"] == "page")
                {

                    var x = value["entry"][0];
                    _logger.LogInformation("post value1212");
                    if (x["changes"][0]["value"]["item"] == "status")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);

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
                            _FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch
                        {
                            _FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                        }

                        _FacebookPagePost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");

                        try
                        {
                            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);

                            mongorepo.Add<MongoFacebookFeed>(_FacebookPagePost);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogInformation(ex.Message);
                            _logger.LogError(ex.StackTrace);
                        }

                    }
                    if(x["changes"][0]["value"]["item"] == "photo")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        string picture= Convert.ToString(x["changes"][0]["value"]["link"]);
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
                            _FacebookPagePost.Picture = picture;
                        }
                        catch { }
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
                            _FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch
                        {
                            _FacebookPagePost.FeedDate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
                        }

                        _FacebookPagePost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");

                        try
                        {
                            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);

                            mongorepo.Add<MongoFacebookFeed>(_FacebookPagePost);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogInformation(ex.Message);
                            _logger.LogError(ex.StackTrace);
                        }
                    }
                    if (x["changes"][0]["value"]["item"] == "comment")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        string comment_id = Convert.ToString(x["changes"][0]["value"]["comment_id"]);

                        if (!string.IsNullOrEmpty(comment_id))
                        {
                            MongoFbPostComment fbPostComment = new MongoFbPostComment();
                            fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                            fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                            fbPostComment.Commentdate = DateTime.Parse(postTime).ToString("yyyy/MM/dd HH:mm:ss");
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
                            }
                            catch (Exception ex)
                            {
                                _logger.LogInformation(ex.Message);
                                _logger.LogError(ex.StackTrace);
                            }
                        }
                    }
                    if (x["changes"][0]["value"]["item"] == "share")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string message = Convert.ToString(x["changes"][0]["value"]["message"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                        string share_id = Convert.ToString(x["changes"][0]["value"]["share_id"]);
                        string link = Convert.ToString(x["changes"][0]["value"]["link"]);
                    }
                    if (x["changes"][0]["value"]["item"] == "like" || x["changes"][0]["value"]["item"] == "like")
                    {
                        string profileId = Convert.ToString(x["id"]);
                        string sendId = Convert.ToString(x["changes"][0]["value"]["sender_id"]);
                        string sendername = Convert.ToString(x["changes"][0]["value"]["sender_name"]);
                        string postid = Convert.ToString(x["changes"][0]["value"]["post_id"]);
                        string postTime = Convert.ToString(x["changes"][0]["value"]["created_time"]);
                    }
                }
            }
            catch (Exception ex)
            {

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