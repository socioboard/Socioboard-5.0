using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using MongoDB.Driver;
using System.Text.RegularExpressions;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class InstagramController : Controller
    {
        public InstagramController(ILogger<InstagramController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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


        /// <summary>
        /// To add instagram profile
        /// </summary>
        /// <param name="userId">Id of the user .</param>
        /// <param name="groupId">Id of the group to which account is to be added. </param>
        /// <param name="code">Code obtained after successfull authentication from Instagram</param>
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpPost("AddInstagramAccount")]
        public IActionResult AddInstagramAccount(long userId,long groupId,string code)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string instagram = Repositories.InstagramRepository.AddInstagramAccount(_appSettings.InstagramClientKey,_appSettings.InstagramClientSec,_appSettings.InstagramCallBackURL,code,userId,groupId,dbr,_logger,_redisCache,_appSettings);
            //return Ok(instagram);
            if (instagram.Contains("This Account is added by somebody else")|| instagram.Contains("instagram account already added by you."))
            {
                return BadRequest(instagram);
            }
            else
            {
                return Ok (instagram);
            }
        }

        [HttpGet("GetInstagramProfiles")]
        public IActionResult GetInstagramProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = new List<Domain.Socioboard.Models.Instagramaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram))
            {
                Domain.Socioboard.Models.Instagramaccounts insAcc = Repositories.InstagramRepository.getInstagramAccount(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpGet("GetAllInstagramProfiles")]
        public IActionResult GetAllInstagramProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = new List<Domain.Socioboard.Models.Instagramaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram))
            {
                Domain.Socioboard.Models.Instagramaccounts insAcc = Repositories.InstagramRepository.getInstagramAccount(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpGet("GetInstagramFeeds")]
        public IActionResult GetInstagramFeeds(long userId,string instagramId, int skip, int count)
        {
            if (skip + count < 100)
            {
                List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstagramFeeds = Repositories.InstagramRepository.GetInstagramFeeds(instagramId, _appSettings, _redisCache,skip,count);
                return Ok(lstInstagramFeeds);
            }
            else
            {
                
                List<Domain.Socioboard.Models.Mongo.intafeed> lstintafeed = new List<Domain.Socioboard.Models.Mongo.intafeed>();
                MongoRepository InstagramFeedRepo = new MongoRepository("InstagramFeed", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.InstagramFeed>.Sort;
                var sort = builder.Descending(t => t.FeedDate);
                var ret = InstagramFeedRepo.FindWithRange<Domain.Socioboard.Models.Mongo.InstagramFeed>(t => t.InstagramId.Equals(instagramId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.InstagramFeed> _lstInstagramFeed = task.Result;
                //foreach (var item in _lstInstagramFeed.ToList())
                //{
                //    Domain.Socioboard.Models.Mongo.intafeed _intafeed = new Domain.Socioboard.Models.Mongo.intafeed();
                //    MongoRepository InstagramCommentRepo = new MongoRepository("InstagramComment", _appSettings);
                //    var builderComment = Builders<Domain.Socioboard.Models.Mongo.InstagramComment>.Sort;
                //    var sortcomment = builderComment.Descending(t => t.CommentDate);
                //    var ret1 = InstagramCommentRepo.FindWithRange<Domain.Socioboard.Models.Mongo.InstagramComment>(t => t.FeedId.Equals(item.FeedId),sortcomment,skip,5);
                //    var taskq = Task.Run(async () =>
                //    {
                //        return await ret1;
                //    });
                //    IList<Domain.Socioboard.Models.Mongo.InstagramComment> _lstInstagramComment = taskq.Result;
                //    _intafeed._InstagramFeed = item;
                //    _intafeed._InstagramComment = _lstInstagramComment.ToList();
                //    lstintafeed.Add(_intafeed);
                //}
                return Ok(_lstInstagramFeed.OrderByDescending(t=>t.FeedDate));
            }

        }


        [HttpGet("GetInstaUserdetails")]
        public IActionResult GetInstaUserdetails(long userId, string instagramid)
        {
          
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<Domain.Socioboard.Models.Instagramaccounts> Userdata = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.InstagramId==(instagramid));

            
            return Ok(Userdata);
        }

        [HttpGet("GetInstagramFilterFeeds")]
        public IActionResult GetInstagramFilterFeeds(long userId, string instagramId, int skip, int count, string postType)
        {
                List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstagramFeeds = Repositories.InstagramRepository.GetTopInstagramFilterFeed(instagramId, _appSettings, _redisCache, skip, count, postType);
                return Ok(lstInstagramFeeds);
        }

        [HttpGet("GetInstagramSortFeeds")]
        public IActionResult GetInstagramSortFeeds(long userId, string instagramId, int skip, int count, string sortType)
        {
            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstagramFeeds = Repositories.InstagramRepository.GetTopInstagramSortFeed(instagramId, _appSettings, _redisCache, skip, count, sortType);
            return Ok(lstInstagramFeeds);
        }

        [HttpPost("InstagramLikeUnLike")]
        public IActionResult InstagramLikeUnLike(int LikeCount,int IsLike,string FeedId,string InstagramId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            if(IsLike==1)
            {
                Repositories.InstagramRepository.InstagramLikeUnLike(LikeCount, IsLike, FeedId, InstagramId, groupId,_appSettings, _redisCache, dbr);
                return Ok("UnLike");
            }
            else
            {
                Repositories.InstagramRepository.InstagramLikeUnLike(LikeCount, IsLike, FeedId, InstagramId, groupId, _appSettings, _redisCache, dbr);
                return Ok("Like");
            }
        }

        [HttpPost("AddInstagramComment")]
        public IActionResult AddInstagramComment(string FeedId, string Text, string InstagramId, long groupId)
        {
            string postmessage = "";
            string[] updatedText = Regex.Split(Text, "<br>");

            foreach (var item in updatedText)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.Contains("hhh") || item.Contains("nnn") || item.Contains("ppp") || item.Contains("jjj"))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + item.Replace("hhh", "#");
                        }
                        if (item.Contains("nnn"))
                        {
                            postmessage = postmessage.Replace("nnn", "&");
                        }
                        if (item.Contains("ppp"))
                        {
                            postmessage = postmessage.Replace("ppp", "+");
                        }
                        if (item.Contains("jjj"))
                        {
                            postmessage = postmessage.Replace("jjj", "-+");
                        }
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r" + item;
                    }
                }
            }
            Text = postmessage;

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string commentData = Repositories.InstagramRepository.AddInstagramComment(FeedId, Text, InstagramId, groupId, _appSettings, _redisCache, dbr);
            return Ok(commentData);
        }

        [HttpGet("DeleteinstagramFeed")]

        public IActionResult DeleteinstagramFeed(string profileId, string FeedId)
        {
            MongoRepository _DeleteistagramFeeds = new MongoRepository("InstagramFeed", _appSettings);
            var builders = Builders<Domain.Socioboard.Models.Mongo.InstagramFeed>.Filter;
            FilterDefinition<Domain.Socioboard.Models.Mongo.InstagramFeed> filter = builders.Eq("FeedId", FeedId);
            _DeleteistagramFeeds.Delete<Domain.Socioboard.Models.Mongo.InstagramFeed>(filter);
            return Ok();
        }

        [HttpGet("Searchinsta")]
        public IActionResult Searchinsta(string instagramId, string qury,string count)
        {
            count = "1";
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string Searchdata = Repositories.InstagramRepository.Searchbyname(qury, instagramId, count, _appSettings, _redisCache, dbr);
            return Ok(Searchdata);

        }

        [HttpPost("followpeople")]
        public IActionResult followpeople(string instagramId ,string followingid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string Searchdata = Repositories.InstagramRepository.Followpeople( instagramId, followingid, _appSettings, _redisCache, dbr);
            return Ok(Searchdata);

        }

        [HttpGet("GetInstaAccSingle")]
        public IActionResult GetInstaAccSingle(string accId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Domain.Socioboard.Models.Instagramaccounts pageDetails = dbr.Single<Domain.Socioboard.Models.Instagramaccounts>(t => t.InstagramId == accId);
            return Ok(pageDetails);
        }
    }
}
