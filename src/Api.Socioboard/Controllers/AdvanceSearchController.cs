using System.Linq;
using System.Threading.Tasks;
using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Api.Socioboard.Repositories;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Models.Mongo;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    /// <summary>
    /// Advance 
    /// </summary>
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AdvanceSearchController : Controller
    {
        private readonly AppSettings _appSettings;
        private readonly Cache _redisCache;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="settings"></param>
        public AdvanceSearchController(IOptions<AppSettings> settings)
        {
            _appSettings = settings.Value;
            _redisCache = Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="networkType"></param>
        /// <param name="skip"></param>
        /// <param name="count"></param>
        /// <returns></returns>
        [HttpGet("QuickTopics")]
        public IActionResult QuickTopics(NetworkType networkType, int skip, int count)
        {
            var mongorepo = new MongoRepository("AdvanceSerachData", _appSettings);

            if(skip + count < 100)
                return Ok(ContentStudioRepository.QuickTopicRepository(networkType, _redisCache, _appSettings) .Skip(skip).Take(count));
            
            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.totalShareCount);
            var result = mongorepo.FindWithRange(t => t.twtShareCount != 0, sort, skip, count);
            var task = Task.Run(async () => await result);
            var lstTwitterFeeds = task.Result;
            return Ok(lstTwitterFeeds);
        }
    }
}