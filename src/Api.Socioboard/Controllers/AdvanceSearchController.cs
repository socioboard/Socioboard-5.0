using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using MongoDB.Driver;
using Microsoft.AspNetCore.Cors;
using Domain.Socioboard.Models.Mongo;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AdvanceSearchController : Controller
    {
        public AdvanceSearchController(ILogger<AdvanceSearchController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;



        [HttpGet("GetYTAdvanceSearchData")]
        public IActionResult GetYTAdvanceSearchData(Domain.Socioboard.Enum.NetworkType network, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);          
            if (skip + count < 100)
            {
                return Ok(Repositories.ContentStudioRepository.YuTubeAdvanceSerachData(network, _redisCache, _appSettings).Skip(skip).Take(count));
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
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
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
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
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
    }
}
