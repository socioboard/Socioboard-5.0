using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using MongoDB.Driver;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers.Listening
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class FacebookGroupsController : Controller
    {


        public FacebookGroupsController(ILogger<DraftMessageController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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

        [HttpPost("GetFacebookGroupFeeds")]
        public IActionResult GetFacebookGroupFeeds(string keyword, int skip, int count)
        {
            return Ok(Repositories.ListeningRepository.FacebookGroupPostRepository.GetFacebookGroupFeeds(keyword,skip,count,_redisCache,_appSettings));
        }

        [HttpGet("GetCategories")]
        public IActionResult GetCategories()
        {
            MongoRepository mongoreppo = new MongoRepository("GroupPostKeyWords", _appSettings);
            var result = mongoreppo.FindAll<Domain.Socioboard.Models.Mongo.GroupPostKeyWords>();
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.GroupPostKeyWords> lstFbFeeds = task.Result;
            List<Domain.Socioboard.Models.Mongo.GroupPostKeyWords> grppost = lstFbFeeds.ToList().OrderByDescending(t => t.createdTime).Take(15).ToList();
            return Ok(grppost);
        }
    }
}
