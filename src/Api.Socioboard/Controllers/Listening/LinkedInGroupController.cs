using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Controllers.Listening
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class LinkedInGroupsController:Controller
    {
        public LinkedInGroupsController(ILogger<LinkedInGroupsController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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

        [HttpPost("GetLinkedInGroupFeeds")]
        public IActionResult GetLinkedInGroupFeeds(string keyword, int skip, int count)
        {
            return Ok(Repositories.ListeningRepository.LinkedInGroupPostRepository.GetFacebookGroupFeeds(keyword,skip,count,_redisCache,_appSettings,_logger));
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
