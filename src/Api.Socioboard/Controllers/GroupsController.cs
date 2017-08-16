using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Interfaces.Services;
using Api.Socioboard.Repositories;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using Domain.Socioboard.Models;
using System.Collections.Generic;
using System.Linq;
using System;

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
            if (dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == group.adminId && t.groupName.Equals(group.groupName)).Count > 0)
            {
                return Ok("Team Name Already Exist");
            }
            group.createdDate = System.DateTime.UtcNow;
            int res = dbr.Add<Domain.Socioboard.Models.Groups>(group);

            if (res == 1)
            {
                Domain.Socioboard.Models.User user = dbr.FindSingle<User>(t => t.Id == group.adminId);
                long GroupId = dbr.FindSingle<Domain.Socioboard.Models.Groups>(t => t.adminId == group.adminId && t.groupName.Equals(group.groupName)).id;
                GroupMembersRepository.createGroupMember(GroupId, user, _redisCache, dbr);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserGroups + group.adminId);
                return Ok("Team Added Successfully ");
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
                return Ok("Team Name Already Exist");
            }
            return Ok("No Group Found With this Name.");
        }


        [HttpGet("GetUserGroups")]
        public IActionResult GetUserGroups(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupsRepository.getAllGroupsofUser(userId, _redisCache, dbr));
        }


        [HttpGet("GetUserGroupData")]
        public IActionResult GetUserGroupData(long userId,string groupId)
        {
            DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            Domain.Socioboard.Models.GetUserGroupData _GetUserGroupData = new Domain.Socioboard.Models.GetUserGroupData();
            List<Domain.Socioboard.Models.Groups> lstgroup = new List<Groups>();
            List<Domain.Socioboard.Models.Groupmembers> lstgrpmember = new List<Groupmembers>();
            lstgrpmember = dbr.Find<Groupmembers>(t => t.userId == userId && t.memberStatus==Domain.Socioboard.Enum.GroupMemberStatus.Accepted).ToList();
            long[] lstgrpId = lstgrpmember.Select(t => t.groupid).ToArray();
            lstgroup = dbr.Find<Domain.Socioboard.Models.Groups>(t => lstgrpId.Contains(t.id)).ToList();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = new List<Groupprofiles>();
            if (string.IsNullOrEmpty(groupId))
            {
                long[] lstStr = lstgroup.Select(t => t.id).ToArray();
                lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => lstStr.Contains(t.groupId)).ToList(); 
            }
            else
            {
                lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t =>t.groupId==Convert.ToInt32(groupId)).ToList();
            }
            Dictionary<long, List<Groupprofiles>> myProfiles = lstgrpProfiles.GroupBy(o => o.groupId).ToDictionary(g => g.Key, g => g.ToList());
            _GetUserGroupData.lstgroup = lstgroup;
            _GetUserGroupData.myProfiles = myProfiles;
            return Ok(_GetUserGroupData);
        }

        [HttpGet("GetUserGroupsCount")]
        public IActionResult GetUserGroupsCount(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupsRepository.getAllGroupsofUserCount(userId, _redisCache, dbr));
        }
        [HttpGet("GetUserGroupsMembersCount")]
        public IActionResult GetUserGroupsMembersCount(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupsRepository.getMemberCount(userId, _redisCache, dbr));
        }
        [HttpPost("AddSelectedGroups")]
        public IActionResult AddSelectedGroups(long userId)
        {
            string selectedGroups = Request.Form["selectedGroups"];
            string[] Profiles = selectedGroups.Split(',');
            List<string> temp = new List<string>();
            foreach (string item in Profiles)
            {
                temp.Add(item);
            }
            temp.Add("Socioboard");

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groups> lstSBGrp = Repositories.GroupsRepository.getGroups(userId, _redisCache, dbr);
            long SBgroupId = lstSBGrp.First().id;
            List<Domain.Socioboard.Models.Groupmembers> lstGrpmember = Repositories.GroupMembersRepository.findmember(SBgroupId, userId, _redisCache, dbr);
            foreach (Domain.Socioboard.Models.Groupmembers member in lstGrpmember)
            {
                if (member.isAdmin == true)
                {
                    List<Domain.Socioboard.Models.Groups> lstGrp = Repositories.GroupsRepository.getAdminGroupsofUser(member.userId, _redisCache, dbr);
                    lstGrp = lstGrp.Where(t => !temp.Contains(t.groupName)).ToList();
                    if (lstGrp.Count != 0)
                    {
                        foreach (Domain.Socioboard.Models.Groups item in lstGrp)
                        {
                            Groupmembers nuser = dbr.Single<Groupmembers>(t => t.groupid.Equals(item.id));
                            //List<Domain.Socioboard.Models.Groupmembers> lstmember = Repositories.GroupMembersRepository.findmember(item.id,userId, _redisCache, dbr);

                            if (item.groupName == "Socioboard")
                            {
                                return BadRequest("You cann't delete default group choose other one");
                            }
                            else
                            {
                                dbr.Delete<Domain.Socioboard.Models.Groups>(item);
                                dbr.Delete<Domain.Socioboard.Models.Groupmembers>(nuser);
                            }
                        }
                    }

                }
                else
                {
                    List<Domain.Socioboard.Models.Groups> lstGrps = Repositories.GroupsRepository.getGroupsofUser(member.userId, _redisCache, dbr);
                    lstGrps = lstGrps.Where(t => !temp.Contains(t.groupName)).ToList();
                    if (lstGrps.Count != 0)
                    {
                        foreach (Domain.Socioboard.Models.Groups items in lstGrps)
                        {
                            if (items.groupName == "Socioboard")
                            {
                                return BadRequest("You cann't delete default group choose other one");
                            }
                            else
                            {
                                Groupmembers nusers = dbr.Single<Groupmembers>(t => t.groupid == items.id && t.userId == userId);
                                dbr.Delete<Domain.Socioboard.Models.Groupmembers>(nusers);
                            }
                        }
                    }
                    //Groupmembers nuser = dbr.Single<Groupmembers>(t => t.groupid.Equals(member.groupid));

                }

            }
            return Ok();
        }
    }
}
