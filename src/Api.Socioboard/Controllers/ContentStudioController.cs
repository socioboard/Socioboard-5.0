using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Interfaces.Services;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using MongoDB.Driver;
using Newtonsoft.Json;
using System.Net.Http;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class ContentStudioController : Controller
    {
        // GET: api/values
        public ContentStudioController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
        {
            _logger = logger;
            _emailSender = emailSender;
            _appEnv = appEnv;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
        }
        private readonly ILogger _logger;
        private readonly IEmailSender _emailSender;
        private readonly IHostingEnvironment _appEnv;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;

        [HttpGet("GetAdvanceSearchData")]
        public IActionResult GetAdvanceSearchData(string keywords)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.ContentStudioRepository.GetAdvanceSearchdata(keywords, _redisCache, _appSettings));
        }
   
        [HttpGet("GetAdvanceSearchDataTrending")]
        public IActionResult GetAdvanceSearchDataTrending(Domain.Socioboard.Enum.NetworkType network, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            skip = 0;
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);
            if (skip + count < 100)
            {
                return Ok(Repositories.ContentStudioRepository.AdvanceSerachData(network, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.networkType.Equals(network), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstTwitterFeeds = task.Result;
                return Ok(lstTwitterFeeds);
            }
        }

        [HttpGet("GetYTAdvanceSearchData")]
        public IActionResult GetYTAdvanceSearchData(Domain.Socioboard.Enum.NetworkType network, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            skip = 0;
            MongoRepository mongorepo = new MongoRepository("AdvanceSearchYoutubeContentStdData", _appSettings);
            if (skip + count < 100)
            {
                return Ok(Repositories.ContentStudioRepository.YtAdvanceSerachData(network, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.AdvanceSearchYoutubeContentStdData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSearchYoutubeContentStdData>(t => t.networkType.Equals(network), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSearchYoutubeContentStdData> lstYoutbe = task.Result;
                return Ok(lstYoutbe);
            }
        }


        [HttpGet("GetAdvanceSearchFlickerData")]
        public IActionResult GetAdvanceSearchFlickerData(Domain.Socioboard.Enum.NetworkType network, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            skip = 0;
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);
            if (skip + count < 100)
            {
                return Ok(Repositories.ContentStudioRepository.FlickerAdvanceSerachData(network, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.networkType.Equals(network), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstTwitterFeeds = task.Result;
                return Ok(lstTwitterFeeds);
            }
        }


        [HttpGet("GetSortByData")]
        public IActionResult GetSortByData(string sortType, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);
            if (skip + count < 200)
            {
                return Ok(Repositories.ContentStudioRepository.GetSortBy(sortType, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.twtShareCount != 0, sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstTwitterFeeds = task.Result;
                return Ok(lstTwitterFeeds);
            }
        }


        [HttpGet("QuickTopics")]
        public IActionResult QuickTopics(Domain.Socioboard.Enum.NetworkType networkType, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            skip = 0;
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);
            if (skip + count < 100)
            {
                return Ok(Repositories.ContentStudioRepository.QuickTopicRepository(networkType, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.twtShareCount != 0, sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstTwitterFeeds = task.Result;
                return Ok(lstTwitterFeeds);
            }
        }


        [HttpPost("saveDataIdForShare")]
        public IActionResult saveDataIdForShare(long userId, string fbuserIds, int timeIntervals)
        {
            //List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> shareData
            var FacebookPageId = Request.Form["shareData"];
            List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> lstshareData = JsonConvert.DeserializeObject<List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>>(FacebookPageId);

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string res = Repositories.ContentStudioRepository.saveContentDataIdReposi(lstshareData, userId, fbuserIds, timeIntervals, _redisCache, _appSettings, dbr);
            return Ok(res);
        }

        [HttpGet("ShareathonQueue")]
        public IActionResult ShareathonQueue(long userId)
        {
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);
            IList<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> lstdata = Repositories.ContentStudioRepository.ShareathonQueueReposi(userId, _appSettings);
            return Ok(lstdata);

        }


        [HttpPost("DeleteShareathon")]
        public IActionResult DeleteShareathon(string PageShareathodId)
        {
            string pagedata = Repositories.ContentStudioRepository.Deleteshareathon(PageShareathodId, _appSettings);
            return Ok(pagedata);
        }

       


        [HttpGet("UserpageShareathon")]
        public IActionResult UserpageShareathon(long userId)
        {
            List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> lstPageShareathon = Repositories.ContentStudioRepository.updateShareathonByUserId(userId, _appSettings, _redisCache);
            return Ok(lstPageShareathon);
        }

       
    }
}
