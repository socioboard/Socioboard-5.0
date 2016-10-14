using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Interfaces.Services;
using Newtonsoft.Json.Linq;
using Domain.Socioboard.Models;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Hosting;
using Socioboard.GoogleLib.Authentication;
using Microsoft.AspNetCore.Cors;
using MongoDB.Driver;
using System.Threading.Tasks;
using Api.Socioboard.Repositories;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GoogleController : Controller
    {


        public GoogleController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
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
        /// <param name="code"></param>
        /// <returns></returns
        [HttpPost("GoogleLogin")]
        public IActionResult GoogleLogin(string code)
        {
            string ret = string.Empty;
            string objRefresh = string.Empty;
            string refreshToken = string.Empty;
            string access_token = string.Empty;

            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            oAuthToken objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            JObject userinfo = new JObject();
            try
            {
                objRefresh = ObjoAuthTokenGPlus.GetRefreshToken(code);
                JObject objaccesstoken = JObject.Parse(objRefresh);
                _logger.LogInformation(objaccesstoken.ToString());
                try
                {
                    refreshToken = objaccesstoken["refresh_token"].ToString();
                }
                catch { }
                access_token = objaccesstoken["access_token"].ToString();
                string user = objToken.GetUserInfo("self", access_token.ToString());
                _logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
            }
            catch (Exception ex)
            {
                //access_token = objaccesstoken["access_token"].ToString();
                //ObjoAuthTokenGPlus.RevokeToken(access_token);
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                ret = "Access Token Not Found";
                return Ok(ret);
            }

            string EmailId = string.Empty;
            try
            {
                EmailId = (Convert.ToString(userinfo["email"]));
            }
            catch { }
            if (string.IsNullOrEmpty(EmailId))
            {
                return Ok("Google Not retuning Email");
            }


            try
            {
                User inMemUser = _redisCache.Get<User>(EmailId);
                if (inMemUser != null)
                {
                    return Ok(inMemUser);
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }




            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<User> lstUser = dbr.Find<User>(t => t.EmailId.Equals(EmailId));
            if (lstUser != null && lstUser.Count() > 0)
            {
                _redisCache.Set<User>(lstUser.First().EmailId, lstUser.First());
                return Ok(lstUser.First());
            }
            else
            {
                Domain.Socioboard.Models.Googleplusaccounts gplusAcc = Api.Socioboard.Repositories.GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);
                if (gplusAcc != null && gplusAcc.IsActive == true)
                {
                    return Ok("GPlus account added by other user.");
                }


                Domain.Socioboard.Models.User user = new Domain.Socioboard.Models.User();
                user.AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.Active;
                user.CreateDate = DateTime.UtcNow;
                user.EmailId = EmailId;
                user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                user.UserName = "Socioboard";
                user.EmailValidateToken = "Google";
                user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.UnPaid;
                try
                {
                    user.FirstName = (Convert.ToString(userinfo["name"]));
                }
                catch { }
                user.RegistrationType = Domain.Socioboard.Enum.SBRegistrationType.Google;

                int SavedStatus = dbr.Add<Domain.Socioboard.Models.User>(user);
                User nuser = dbr.Single<User>(t => t.EmailId.Equals(user.EmailId));
                if (SavedStatus == 1 && nuser != null)
                {
                    Groups group = new Groups();
                    group.adminId = nuser.Id;
                    group.createdDate = DateTime.UtcNow;
                    group.groupName = Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName;
                    SavedStatus = dbr.Add<Groups>(group);
                    if (SavedStatus == 1)
                    {
                        Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == nuser.Id && t.groupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName)).FirstOrDefault();
                        GroupMembersRepository.createGroupMember(ngrp.id, nuser, _redisCache, dbr);
                        // Adding GPlus Profile
                        Api.Socioboard.Repositories.GplusRepository.AddGplusAccount(userinfo, dbr, nuser.Id, ngrp.id, access_token, refreshToken, _redisCache, _appSettings, _logger);
                    }
                }
                return Ok(nuser);
            }




        }



        [HttpPost("AddGoogleAccount")]
        public IActionResult AddGoogleAccount(string code, long groupId, long userId)
        {

            string ret = string.Empty;
            string objRefresh = string.Empty;
            string refreshToken = string.Empty;
            string access_token = string.Empty;
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);

            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            oAuthToken objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            JObject userinfo = new JObject();
            try
            {
                objRefresh = ObjoAuthTokenGPlus.GetRefreshToken(code);
                JObject objaccesstoken = JObject.Parse(objRefresh);
                _logger.LogInformation(objaccesstoken.ToString());
                try
                {
                    refreshToken = objaccesstoken["refresh_token"].ToString();
                }
                catch { }
                access_token = objaccesstoken["access_token"].ToString();
               string user = objToken.GetUserInfo("self", access_token.ToString());
                //_logger.LogInformation(user);
               userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                string people = objToken.GetPeopleInfo("self", access_token.ToString(), Convert.ToString(userinfo["id"]));
                userinfo = JObject.Parse(JArray.Parse(people)[0].ToString());
            }
            catch (Exception ex)
            {
                //access_token = objaccesstoken["access_token"].ToString();
                //ObjoAuthTokenGPlus.RevokeToken(access_token);
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                ret = "Access Token Not Found";
                return Ok(ret);
            }
            Domain.Socioboard.Models.Googleplusaccounts gplusAcc = Api.Socioboard.Repositories.GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);
           
            if (gplusAcc != null && gplusAcc.IsActive == true)
            {
                return Ok("GPlus account added by other user.");
            }
            Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
            if (ngrp == null)
            {
                return Ok("group not exist");
            }
            // Adding GPlus Profile
            int x = Api.Socioboard.Repositories.GplusRepository.AddGplusAccount(userinfo, dbr, userId, ngrp.id, access_token, refreshToken, _redisCache, _appSettings, _logger);
            if (x == 1)
            {
                return Ok("Gplus Account Added Successfully");
            }
            else
            {
                return Ok("Issues while adding account");
            }
        }


        [HttpGet("GetGplusFeeds")]
        public IActionResult GetGplusFeeds(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                return Ok(Repositories.GplusRepository.getgoogleplusActivity(profileId, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                MongoRepository gplusFeedRepo = new MongoRepository("MongoGplusFeed", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoGplusFeed>.Sort;
                var sort = builder.Descending(t => t.PublishedDate);
                var result = gplusFeedRepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoGplusFeed>(t => t.GpUserId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoGplusFeed> lstMongoGplusFeed = task.Result;
                return Ok(lstMongoGplusFeed);
            }
        }


        [HttpGet("GetGplusProfiles")]
        public IActionResult GetGplusProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Googleplusaccounts> lstGplusAcc = new List<Domain.Socioboard.Models.Googleplusaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus))
            {
                Domain.Socioboard.Models.Googleplusaccounts gPlusAcc = Repositories.GplusRepository.getGPlusAccount(item.profileId, _redisCache, dbr);
                if (gPlusAcc != null)
                {
                    lstGplusAcc.Add(gPlusAcc);
                }
            }
            return Ok(lstGplusAcc);
        }

        [HttpPost("GetGanalyticsAccount")]
        public IActionResult GetGanalyticsAccount(string code, long groupId, long userId)
        {
            try
            {
                List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> lstGoogleAnalyticsProfiles = new List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles>();
                lstGoogleAnalyticsProfiles = Helper.GoogleHelper.GetGanalyticsAccount(code, _appSettings);
                DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
                List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics).ToList();
                string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                {
                    lstGoogleAnalyticsProfiles.Where(t => lstStr.Contains(t.ProfileId)).Select(s => { s.connected = 1; return s; }).ToList();
                }
                return Ok(lstGoogleAnalyticsProfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetGetGanalyticsAccount" + ex.StackTrace);
                _logger.LogError("GetGetGanalyticsAccount" + ex.Message);
                return Ok(new List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles>());
            }
        }

        [HttpPost("AddGaSites")]
        public IActionResult AddGaSites(long groupId, long userId)
        {
            string data = Request.Form["profileaccesstoken"];
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string[] profiledata = null;
            int i = 0;
            profiledata = data.Split(',');
            foreach (var item in profiledata)
            {
                int j = Repositories.GplusRepository.AddGaSites(item, userId, groupId, _redisCache, _appSettings, dbr,_appEnv);
            }
            return Ok("Added Successfully");
        }

        [HttpGet("GetGAProfiles")]
        public IActionResult GetGAProfiles(long groupId)
        {
            DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics).ToList();
            List<Domain.Socioboard.Models.GoogleAnalyticsAccount> lstGoogleAnalyticsAccount = new List<GoogleAnalyticsAccount>();
            foreach (var item in lstGroupprofiles)
            {
                Domain.Socioboard.Models.GoogleAnalyticsAccount gAAcc = Repositories.GplusRepository.getGAAccount(item.profileId, _redisCache, dbr);
                if (gAAcc != null)
                {
                    lstGoogleAnalyticsAccount.Add(gAAcc);
                }
            }
            return Ok(lstGoogleAnalyticsAccount);
        }
    }
}
