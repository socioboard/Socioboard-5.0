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
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GroupProfilesController : Controller
    {
        public GroupProfilesController(ILogger<GroupProfilesController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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


        /// <summary>
        /// To get the group profiles 
        /// </summary>
        /// <param name="groupId">Id of the group from which account is to be added.</param>
        /// <returns></returns>
        [HttpGet("GetGroupProfiles")]
        public IActionResult GetGroupProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr));
        }

        [HttpGet("GetAllGroupProfiles")]
        public IActionResult GetAllGroupProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr));
        }
        [HttpGet("GetAllGroupProfilesCount")]
        public IActionResult GetAllGroupProfilesCount(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.GetAllGroupProfilesCount(groupId, _redisCache, dbr));
        }

        [HttpGet("GetTop3GroupProfiles")]
        public IActionResult GetTop3GroupProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.getTop3GroupProfiles(groupId, _redisCache, dbr));
        }
        [HttpGet("GetAllGroupProfilesDeatails")]
        public IActionResult GetAllGroupProfilesDeatails(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.getAllGroupProfilesdetail(groupId, _redisCache, dbr));
        }

        [HttpPost("DeleteProfile")]
        public IActionResult DeleteProfile(long groupId, long userId, string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.DeleteProfile(groupId, userId, profileId, _redisCache, dbr, _appSettings));
        }

        [HttpPost("AddSelectedProfiles")]
        public IActionResult AddSelectedProfiles(long groupId, long userId)
        {
            string selectedProfiles = Request.Form["selectedProfiles"];
            string[] Profiles = selectedProfiles.Split(',');
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId)).ToList();
            foreach (var item in lstGrpProfiles)
            {
                GroupProfilesRepository.DeleteProfile(groupId, userId, item.profileId, _redisCache, dbr, _appSettings);
            }
            return Ok();
        }

        [HttpPost("AddSelectedProfilesForBasicPlan")]
        public IActionResult AddSelectedProfilesForBasicPlan(long groupId, long userId)
        {
            string selectedProfiles = Request.Form["selectedProfiles"];
            string[] Profiles = selectedProfiles.Split(',');
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            //User user = dbr.Single<User>(t => t.Id == userId);
            //Domain.Socioboard.Enum.SBAccountType accounttype = user.AccountType;
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            long FBProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage));
            long TwtProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter));
            long GplusProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus && t.profileType == Domain.Socioboard.Enum.SocialProfileType.GplusPage));
            long LinkedInProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn && t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage));
            long InstaProfiles = dbr.GetCount<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram));
            lstGrpProfiles = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId)).ToList();
            long lstFBProfile= lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId) && (t.profileType== Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage)).Count();
            long lstTwtProfile = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId) && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).Count();
            long lstInstaProfile = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId) && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram).Count();
            long lstLinkedInProfile = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId) && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn|| t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage)).Count();
            long lstGplusProfile = lstGrpProfiles.Where(t => !Profiles.Contains(t.profileId) && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus || t.profileType == Domain.Socioboard.Enum.SocialProfileType.GplusPage)).Count();

            long FbCount = FBProfiles - lstFBProfile;
            long twtCount = TwtProfiles - lstTwtProfile;
            long InstaCount = InstaProfiles - lstInstaProfile;
            long LinkedInCount = LinkedInProfiles - lstLinkedInProfile;
            long GplusCount = GplusProfiles - lstGplusProfile;

            if(FbCount>1 || twtCount > 1|| InstaCount > 1|| LinkedInCount > 1|| GplusCount > 1)
            {
                return BadRequest("As per your plan you can use only one profile per network.Please choose profiles as per your plan");
            }
            else
            {
                foreach (var item in lstGrpProfiles)
                {
                    GroupProfilesRepository.DeleteProfile(groupId, userId, item.profileId, _redisCache, dbr, _appSettings);
                }
                return Ok();
            }
            //return Ok();

        }

        [HttpGet("getProfilesAvailableToConnect")]
        public IActionResult getProfilesAvailableToConnect(long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Groups> lstGroups = GroupsRepository.getAllGroupsofUser(userId, _redisCache, dbr);
            long defaultGroupId = lstGroups.FirstOrDefault(t => t.groupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName)).id;
            List<Domain.Socioboard.Models.Groupprofiles> defalutGroupProfiles = GroupProfilesRepository.getAllGroupProfiles(defaultGroupId, _redisCache, dbr);
            return Ok(defalutGroupProfiles.Where(t => !lstGroupProfiles.Any(x => x.profileId.Equals(t.profileId))));
        }

        [HttpPost("AddProfileToGroup")]
        public IActionResult AddProfileToGroup(string profileId, long groupId, long userId, Domain.Socioboard.Enum.SocialProfileType profileType)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            if (lstGroupProfiles.Where(t => t.profileId.Equals(profileId)).Count() > 0)
            {
                return BadRequest("profile already added");
            }
            else
            {
                Domain.Socioboard.Models.Groups grp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.id == groupId).FirstOrDefault();
                if (grp == null)
                {
                    return BadRequest("Invalid groupId");
                }
                else
                {
                    Domain.Socioboard.Models.Groupprofiles grpProfile = new Domain.Socioboard.Models.Groupprofiles();
                    if (profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage)
                    {
                        Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(profileId, _redisCache, dbr);
                        if (fbAcc == null)
                        {
                            return BadRequest("Invalid profileId");
                        }
                        if (fbAcc.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = fbAcc.FbUserName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = "http://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small";
                        grpProfile.profileType = profileType;

                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                    {
                        Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(profileId, _redisCache, dbr);
                        if (twtAcc == null)
                        {
                            return BadRequest("Invalid profileId");
                        }
                        if (twtAcc.userId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = twtAcc.twitterScreenName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = twtAcc.profileImageUrl;
                        grpProfile.profileType = Domain.Socioboard.Enum.SocialProfileType.Twitter;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus)
                    {
                        Domain.Socioboard.Models.Googleplusaccounts gplusAccount = Repositories.GplusRepository.getGPlusAccount(profileId, _redisCache, dbr);
                        if (gplusAccount == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (gplusAccount.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = gplusAccount.GpUserName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = gplusAccount.GpProfileImage;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics)
                    {
                        Domain.Socioboard.Models.GoogleAnalyticsAccount gplusAccount = Repositories.GplusRepository.getGAAccount(profileId, _redisCache, dbr);
                        if (gplusAccount == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (gplusAccount.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = gplusAccount.GaProfileName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = gplusAccount.ProfilePicUrl;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                    {
                        Domain.Socioboard.Models.Instagramaccounts _Instagramaccounts = Repositories.InstagramRepository.getInstagramAccount(profileId, _redisCache, dbr);
                        if (_Instagramaccounts == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (_Instagramaccounts.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = _Instagramaccounts.InsUserName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = _Instagramaccounts.ProfileUrl;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn)
                    {
                        Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedInAccount(profileId, _redisCache, dbr);
                        if (_LinkedInAccount == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (_LinkedInAccount.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = _LinkedInAccount.LinkedinUserName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = _LinkedInAccount.ProfileImageUrl;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage)
                    {
                        Domain.Socioboard.Models.LinkedinCompanyPage _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(profileId, _redisCache, dbr);
                        if (_LinkedInAccount == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (_LinkedInAccount.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = _LinkedInAccount.LinkedinPageName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = _LinkedInAccount.LogoUrl;
                    }
                    else if (profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube)
                    {
                        Domain.Socioboard.Models.YoutubeChannel _YoutubeChannel = Repositories.GplusRepository.getYTChannel(profileId, _redisCache, dbr);
                        if (_YoutubeChannel == null)
                        {
                            return BadRequest("Invalid ProfileId");
                        }
                        if (_YoutubeChannel.UserId != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = _YoutubeChannel.YtubeChannelName;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = _YoutubeChannel.ChannelpicUrl;
                    }
                    if (profileType == Domain.Socioboard.Enum.SocialProfileType.Pinterest)
                    {
                        Domain.Socioboard.Models.PinterestAccount pinAcc = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(profileId)).FirstOrDefault();
                        if (pinAcc == null)
                        {
                            return BadRequest("Invalid profileId");
                        }
                        if (pinAcc.userid != userId)
                        {
                            return BadRequest("profile is added by other user");
                        }
                        grpProfile.profileName = pinAcc.firstname+" "+pinAcc.lastname;
                        grpProfile.profileOwnerId = userId;
                        grpProfile.profilePic = pinAcc.profileimgaeurl;
                        grpProfile.profileType = profileType;

                    }
                    grpProfile.entryDate = DateTime.UtcNow;
                    grpProfile.groupId = grp.id;
                    grpProfile.profileId = profileId;
                    grpProfile.profileType = profileType;
                    dbr.Add<Domain.Socioboard.Models.Groupprofiles>(grpProfile);
                    //codes to clear cache
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                    //end codes to clear cache
                    return Ok("Added Successfully");
                }
            }

        }

        [HttpGet("GetPluginProfile")]
        public IActionResult GetPluginProfile(long groupId)
        {
            List<Domain.Socioboard.Helpers.PluginProfile> lstPluginProfile = new List<Domain.Socioboard.Helpers.PluginProfile>();
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId.Equals(groupId) && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)).ToList();
            lstGroupprofiles = lstGroupprofiles.GroupBy(t => t.profileId).Select(g => g.First()).ToList();
            foreach (var item in lstGroupprofiles)
            {
                try
                {
                    if (item.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || item.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                    {
                        Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                        if (_Facebookaccounts != null)
                        {
                            if (!string.IsNullOrEmpty(_Facebookaccounts.AccessToken))
                            {
                                if (_Facebookaccounts.IsActive)
                                {
                                    Domain.Socioboard.Helpers.PluginProfile _sb = new Domain.Socioboard.Helpers.PluginProfile();
                                    _sb.type = "facebook";
                                    _sb.facebookprofile = _Facebookaccounts;
                                    _sb.twitterprofile = new Domain.Socioboard.Models.TwitterAccount();
                                    lstPluginProfile.Add(_sb);
                                }
                            }
                        }
                    }
                    if (item.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                    {
                        Domain.Socioboard.Models.TwitterAccount _TwitterAccount = TwitterRepository.getTwitterAccount(item.profileId, _redisCache, dbr);
                        if (_TwitterAccount != null)
                        {

                            if (_TwitterAccount.isActive)
                            {
                                Domain.Socioboard.Helpers.PluginProfile _sb = new Domain.Socioboard.Helpers.PluginProfile();
                                _sb.type = "twitter";
                                _sb.twitterprofile = _TwitterAccount;
                                _sb.facebookprofile = new Domain.Socioboard.Models.Facebookaccounts();
                                lstPluginProfile.Add(_sb);
                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    return Ok(lstPluginProfile);
                }
            }
            return Ok(lstPluginProfile);
        }

        [HttpGet("GetSearchProfile")]
        public IActionResult SearchProfile(long groupId,string Profiletype)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(GroupProfilesRepository.SearchProfileType(groupId, Profiletype, _redisCache, dbr));
        }
    }
}
