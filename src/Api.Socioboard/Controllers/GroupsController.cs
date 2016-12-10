using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Interfaces.Services;
using Api.Socioboard.Repositories;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GroupsController : Controller
    {
        public GroupsController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="group"></param>
        /// <returns></returns>
        [HttpPost("CreateGroup")]
        public IActionResult CreateGroup(Domain.Socioboard.Models.Groups group)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            if(dbr.Find<Domain.Socioboard.Models.Groups>(t=>t.adminId == group.adminId && t.groupName.Equals(group.groupName)).Count  > 0)
            {
                return Ok("Group Name Already Exist");
            }
            group.createdDate = System.DateTime.UtcNow;
          int res =  dbr.Add<Domain.Socioboard.Models.Groups>(group);

            if(res == 1)
            {
                Domain.Socioboard.Models.User user = dbr.FindSingle<User>(t => t.Id == group.adminId);
                long GroupId = dbr.FindSingle<Domain.Socioboard.Models.Groups>(t => t.adminId == group.adminId && t.groupName.Equals(group.groupName)).id;
                GroupMembersRepository.createGroupMember(GroupId, user, _redisCache, dbr);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + group.adminId);
                return Ok("Group Added");
            }
            else
            {
                return Ok("Error while adding Group");
            }
        }

        [HttpGet("IsGroupExist")]
        public IActionResult IsGroupExist(string groupName, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            if (dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.groupName.Equals(groupName)).Count > 0)
            {
                return Ok("Group Name Already Exist");
            }
            return Ok("No Group Found With this Name.");
        }


        [HttpGet("GetUserGroups")]
        public IActionResult GetUserGroups(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger,_appEnv);
            return  Ok(GroupsRepository.getAllGroupsofUser(userId, _redisCache, dbr));
        }
    }
}
