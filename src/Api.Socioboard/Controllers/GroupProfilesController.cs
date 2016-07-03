using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Repositories;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GroupProfilesController : Controller
    {
        public GroupProfilesController(ILogger<GroupProfilesController> logger,  Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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



        [HttpGet("GetGroupProfiles")]
        public IActionResult GetGroupProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr));
        }

        [HttpPost("DeleteProfile")]
        public IActionResult DeleteProfile(long groupId, long userId,string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
          return Ok(GroupProfilesRepository.DeleteProfile(groupId, userId, profileId, _redisCache, dbr));
        }

        [HttpGet("getProfilesAvailableToConnect")]
        public IActionResult getProfilesAvailableToConnect(long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Groups> lstGroups = GroupsRepository.getAllGroupsofUser(userId, _redisCache, dbr);
            long defaultGroupId = lstGroups.FirstOrDefault(t => t.GroupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName)).Id;
            List<Domain.Socioboard.Models.Groupprofiles> defalutGroupProfiles = GroupProfilesRepository.getGroupProfiles(defaultGroupId, _redisCache, dbr);
            return Ok(defalutGroupProfiles.Where(t=> !lstGroupProfiles.Any(x=>x.ProfileId.Equals(t.ProfileId))));
        }

        [HttpPost("AddProfileToGroup")]
        public IActionResult AddProfileToGroup(string profileId, long groupId, long userId, Domain.Socioboard.Enum.SocialProfileType profileType)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            if(lstGroupProfiles.Where(t=>t.ProfileId.Equals(profileId)).Count() > 0)
            {
                return BadRequest("profile already added");
            }
            else
            {
                Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.Id == groupId).FirstOrDefault();
                if(grp == null)
                {
                    return BadRequest("Invalid groupId");
                }
                else
                {
                    Domain.Socioboard.Models.Groupprofiles grpProfile = new Domain.Socioboard.Models.Groupprofiles();
                    if (profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook  || profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                    {
                        Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(profileId, _redisCache, dbr);
                        if(fbAcc == null)
                        {
                            return BadRequest("Invalid profileId");
                        }
                        if(fbAcc.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.ProfileName = fbAcc.FbUserName;
                        grpProfile.ProfileOwnerId = userId;
                        grpProfile.ProfilePic = "http://graph.facebook.com/"+ fbAcc.FbUserId+"/picture?type=small";
                        grpProfile.ProfileType = profileType;

                    }
                    else if(profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                    {
                        Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(profileId, _redisCache, dbr);
                        if(twtAcc == null)
                        {
                            return BadRequest("Invalid profileId");
                        }
                        if (twtAcc.userId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.ProfileName = twtAcc.twitterName;
                        grpProfile.ProfileOwnerId = userId;
                        grpProfile.ProfilePic = twtAcc.profileImageUrl;
                        grpProfile.ProfileType = Domain.Socioboard.Enum.SocialProfileType.Twitter;
                    }
                    grpProfile.EntryDate = DateTime.UtcNow;
                    grpProfile.GroupId = grp.Id;
                    grpProfile.ProfileId = profileId;
                    grpProfile.ProfileType = profileType; 
                    dbr.Add<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                    //codes to clear cache
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                    //end codes to clear cache
                    return Ok("Added Successfully");
                }
            }

        }

        [HttpPost("DeleteProfileFromGroup")]
        public IActionResult DeleteProfileFromGroup(string profileId, long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            if (lstGroupProfiles.Where(t => t.ProfileId.Equals(profileId)).Count() == 0)
            {
                return BadRequest("no profile exist");
            }
            else
            {
                Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.Id == groupId).FirstOrDefault();
                if (grp == null)
                {
                    return BadRequest("Invalid groupId");
                }
                else
                {
                    if(grp.AdminId == userId)
                    {
                        dbr.Delete<Domain.Socioboard.Models.Groupprofiles>(lstGroupProfiles.FirstOrDefault());
                        //codes to clear cache
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        //end codes to clear cache
                    }
                    else
                    {
                        return BadRequest("not authorized to delete");
                    }
                }
            }

            return Ok();
        }
    }
}
