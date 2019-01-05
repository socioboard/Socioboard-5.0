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
using Api.Socioboard.Repositories;
using Domain.Socioboard.Models;
using Newtonsoft.Json.Linq;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GroupMemberController : Controller
    {
        public GroupMemberController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
        {
            _logger = logger;
            _emailSender = emailSender;
            _appEnv = appEnv;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
        }
        private readonly ILogger _logger;
        private readonly IEmailSender _emailSender;
        private readonly IHostingEnvironment _appEnv;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;



        /// <summary>
        /// To add the member of the group
        /// </summary>
        /// <param name="groupId">Id of the group from which account is to be added.</param>
        /// <param name="members"></param>
        /// <returns></returns>
        [HttpPost("InviteGroupMembers")]
        public IActionResult InviteGroupMembers(long groupId,  string members)
        {
            List<Groupmembers> lstGrpMembers = new List<Groupmembers>();
            if (string.IsNullOrEmpty(members))
            {
                return BadRequest("members should not be null.");
            }
            else
            {
                string[] lstmem = members.Split(';');
                foreach(var item in lstmem)
                {
                    if (!string.IsNullOrEmpty(item))
                    {
                        Groupmembers grpMember = new Groupmembers();
                        string[] memData = item.Split(':');
                        grpMember.email = memData[2];
                        grpMember.firstName = memData[0];
                        grpMember.lastName = memData[1];
                        lstGrpMembers.Add(grpMember);

                    }
                }
            }


            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id == groupId).FirstOrDefault();
            if (grp == null)
            {
                return BadRequest("wrong group Id");
            }
            else if (grp.groupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName))
            {
                return BadRequest("you can't invite members to default group.");
            }
            foreach (var member in lstGrpMembers)
            {
                User inMemUser = _redisCache.Get<User>(member.email.Trim());
                if (inMemUser == null)
                {
                    inMemUser = dbr.Find<User>(t => t.EmailId.Equals(member.email.Trim())).FirstOrDefault();
                }
                member.groupid = groupId;
                member.memberCode = Domain.Socioboard.Helpers.SBHelper.RandomString(15);
                member.isAdmin = false;
                member.memberStatus = Domain.Socioboard.Enum.GroupMemberStatus.MailSent;
                if (inMemUser != null)
                {
                    member.userId = inMemUser.Id;
                    member.profileImg = inMemUser.ProfilePicUrl;
                    //todo : code to add in user notification list.
                }
                Groupmembers temp = dbr.Find<Groupmembers>(t => t.groupid == groupId && t.email == member.email).FirstOrDefault();
                if (temp == null)
                {
                    dbr.Add<Groupmembers>(member);
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupMembers + groupId);
                    string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\groupinvitation.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", member.firstName);
                    html = html.Replace("[JoinLink]", _appSettings.Domain + "/Home/GroupInvite?Token=" + member.memberCode + "&email=" + member.email);
                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", member.email, "", "", "Socioboard Team Invitation Link", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
                }

            }

            return Ok();
        }


        [HttpGet("GetGroupMembers")]
        public IActionResult GetGroupMembers(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupMembersRepository.getGroupMembers(groupId, _redisCache, dbr));
        }

        [HttpGet ("GetGroupAdmin")]
        public IActionResult GetGroupAdmin(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupMembersRepository.getGroupadmin(groupId, _redisCache, dbr));
        }

        [HttpGet("DeleteGroup")]
        public IActionResult DeleteGroup(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupMembersRepository.adminDelete(groupId, _redisCache, dbr));
        }

        [HttpGet("LeaveGroup")]
        public IActionResult LeaveGroup(long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupMembersRepository.LeaveTeam(groupId, userId, _redisCache, dbr));
        }

        [HttpPost("ActivateGroupMember")]
        public IActionResult ActivateGroupMember(string code, string email)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Domain.Socioboard.Models.Groupmembers grpMember = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.email.Equals(email)&&t.memberCode.Equals(code)).FirstOrDefault();
            if(grpMember != null)
            {
                if(grpMember.userId == 0)
                {
                    User inMemUser = _redisCache.Get<User>(email.Trim());
                    if (inMemUser == null)
                    {
                        inMemUser = dbr.Find<User>(t => t.EmailId.Equals(email.Trim())).FirstOrDefault();
                    }
                    grpMember.userId = inMemUser.Id;
                    grpMember.profileImg = inMemUser.ProfilePicUrl;
                }
                grpMember.memberStatus = Domain.Socioboard.Enum.GroupMemberStatus.Accepted;
                dbr.Update<Domain.Socioboard.Models.Groupmembers>(grpMember);
                return Ok("updated");
            }
            else
            {
                return Ok("wrong code or email");
            }
        }

        [HttpPost("DeleteGroupMembers")]
        public IActionResult DeleteGroupMembers(string grpMmbrIdss)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Int64> grpIdsList = grpMmbrIdss.Split(',').Select(Int64.Parse).ToList();
            int tempp = Convert.ToInt32(grpIdsList.First());
            List<Domain.Socioboard.Models.Groupmembers> lstgrpMembers = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => grpIdsList.Contains(t.id)).ToList();
            dbr.DeleteAllList<Domain.Socioboard.Models.Groupmembers>(lstgrpMembers);
            return Ok("Deleted");
        }
        [HttpGet("RetainGrpMber")]
        public IActionResult RetainGrpMber(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupMembersRepository.RetainGrpMber(userId, _redisCache, dbr));
        }
    }
}
