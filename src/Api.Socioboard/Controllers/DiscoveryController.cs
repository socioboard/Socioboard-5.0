using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class DiscoveryController : Controller
    {
        public DiscoveryController(ILogger<DiscoveryController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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



        /// <summary>
        /// Use for searching the customer which is linked with keyword 
        /// </summary>
        /// <param name="userId">Id of user</param>
        /// <param name="groupId">Id of the group to which account is to be added. </param>
        /// <param name="keyword">provided by the user for searcing new customer or post related to keyword</param>
        /// <returns></returns>
        /// <response code="500">Internal Server Erro.r</response>
        [HttpPost("DiscoverySearchTwitter")]
        public IActionResult DiscoverySearchTwitter(long userId,long groupId,string keyword)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> lstDiscoveryViewModal = Repositories.DiscoveryRepository.DiscoverySearchTwitter(userId, groupId, keyword, _redisCache, _appSettings, dbr);
            return Ok(lstDiscoveryViewModal);
        }

        [HttpPost("DiscoverySearchGplus")]
        public IActionResult DiscoverySearchGplus(long userId,long groupId,string keyword)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger,_env);
            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> lstDiscoveryViewModal = Repositories.DiscoveryRepository.DiscoverySearchGplus(userId, groupId, keyword, _redisCache, _appSettings, dbr);
            return Ok(lstDiscoveryViewModal);
        }

        [HttpPost("TwitterTweetSearchWithGeoLocation")]
        public IActionResult TwitterTweetSearchWithGeoLocation(string searchkeyword, string geoLocation)
        {
            List<Helper.DiscoverySmart> lstTwitterTweetSearchWithGeoLocation = Repositories.DiscoveryRepository.TwitterTweetSearchWithGeoLocation(searchkeyword, geoLocation, _redisCache);
            return Ok(lstTwitterTweetSearchWithGeoLocation);
        }

        [HttpPost("DiscoverySearchinstagram")]
        public IActionResult DiscoverySearchinstagram(string keyword, long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.InstagramDiscoveryFeed> lstSearchinstagram = Repositories.DiscoveryRepository.DiscoverySearchinstagram(keyword,userId,groupId,_redisCache, _appSettings,dbr);
            return Ok(lstSearchinstagram);
        }

        [HttpPost("DiscoveryHistory")]
        public IActionResult DiscoveryHistory(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Discovery> lstdiscovery = Repositories.DiscoveryRepository.DiscoveryHistory(userId,dbr);
            return Ok(lstdiscovery);
        }

        [HttpPost("YoutubeSearch")]
        public IActionResult YoutubeSearch(string q, int page, string pagecode)
        {
            if (page == 0)
            {
                List<Domain.Socioboard.Models.Mongo.YoutubeSearch> lstVideoss = Helper.GoogleHelper.YoutubeSearch(q, _appSettings);
                return Ok(lstVideoss);
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.YoutubeSearch> lstVideoss = Helper.GoogleHelper.YoutubeSearchPageCode(q, pagecode, _appSettings);
                return Ok(lstVideoss);
            }
        }
    }
}
