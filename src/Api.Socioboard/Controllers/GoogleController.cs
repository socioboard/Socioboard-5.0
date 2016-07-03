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
                    group.AdminId = nuser.Id;
                    group.CreatedDate = DateTime.UtcNow;
                    group.GroupName = Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName;
                    SavedStatus = dbr.Add<Groups>(group);
                    if (SavedStatus == 1)
                    {
                        Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.AdminId == nuser.Id && t.GroupName.Equals(Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName)).FirstOrDefault();
                        // Adding GPlus Profile
                        Api.Socioboard.Repositories.GplusRepository.AddGplusAccount(userinfo,  dbr, nuser.Id, ngrp.Id, access_token,refreshToken, _redisCache, _appSettings, _logger);
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
            Domain.Socioboard.Models.Googleplusaccounts gplusAcc = Api.Socioboard.Repositories.GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);
            if (gplusAcc != null && gplusAcc.IsActive == true)
            {
                return Ok("GPlus account added by other user.");
            }
            Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.AdminId == userId && t.Id == groupId).FirstOrDefault();
            if(ngrp == null)
            {
                return Ok("group not exist");
            }
            // Adding GPlus Profile
            int x = Api.Socioboard.Repositories.GplusRepository.AddGplusAccount(userinfo, dbr, userId, ngrp.Id, access_token, refreshToken, _redisCache, _appSettings, _logger);
            if (x == 1)
            {
                return Ok("Gplus Account Added Successfully");
            }
            else
            {
                return Ok("Issues while adding account");
            }
        }
    }
}
