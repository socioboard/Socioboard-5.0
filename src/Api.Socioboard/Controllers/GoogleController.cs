using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Api.Socioboard.Repositories;
using Domain.Socioboard.Consatants;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Interfaces.Services;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using Domain.Socioboard.ViewModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class GoogleController : Controller
    {
        private readonly IHostingEnvironment _appEnv;
        private readonly IEmailSender _emailSender;
        private readonly ILogger _logger;
        private readonly AppSettings _appSettings;
        private readonly Cache _redisCache;


        public GoogleController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv,
            IOptions<AppSettings> settings)
        {
            _logger = logger;
            _emailSender = emailSender;
            _appEnv = appEnv;
            _appSettings = settings.Value;
            _redisCache = Cache.GetCacheInstance(_appSettings.RedisConfiguration);
        }


        /// <summary>
        /// </summary>
        /// <param name="code"></param>
        /// <param name="accType"></param>
        /// <returns></returns>
        [HttpPost("GoogleLogin")]
        public IActionResult GoogleLogin(string code, SBAccountType accType)
        {
            var refreshToken = string.Empty;
            string accessToken;

            var objoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey,
                _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret,
                _appSettings.GoogleRedirectUri);
            JObject userInfo;

            try
            {
                var objRefresh = objoAuthTokenGPlus.GetRefreshToken(code);
                var objAccessToken = JObject.Parse(objRefresh);

                _logger.LogInformation(objAccessToken.ToString());
                try
                {
                    refreshToken = objAccessToken["refresh_token"].ToString();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }

                accessToken = objAccessToken["access_token"].ToString();
                var user = objToken.GetUserInfo("self", accessToken);
                _logger.LogInformation(user);
                userInfo = JObject.Parse(JArray.Parse(user)[0].ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);

                return Ok("Access Token Not Found");
            }

            var emailId = string.Empty;
            try
            {
                emailId = Convert.ToString(userInfo["email"]);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
            }

            if (string.IsNullOrEmpty(emailId))
                return Ok("Google not returning Email");

            try
            {
                var inMemUser = _redisCache.Get<User>(emailId);
                if (inMemUser != null) return Ok(inMemUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
            }

            var dbr = new DatabaseRepository(_logger, _appEnv);
            var signedInUser = dbr.FindFirstMatch<User>(t => t.EmailId.Equals(emailId));


            if (signedInUser != null)
            {
                if (!signedInUser.SocialLoginEnableGo)
                    return Ok("Account isn't sign-up with google!");

                CustomTaskFactory.Instance.Start(() =>
                {
                    if (signedInUser.RefrralCode == null)
                        signedInUser.RefrralCode = $"{SocioboardApiConstants.ApplicationName}" + signedInUser.Id;

                    signedInUser.LastLoginTime = DateTime.UtcNow;
                    dbr.Update(signedInUser);
                    _redisCache.Set(signedInUser.EmailId, signedInUser);
                });

                return Ok(signedInUser);
            }

            var googleUser = new User
            {
                AccountType = accType,
                PaymentType = PaymentType.paypal,
                ActivationStatus = SBUserActivationStatus.Active,
                CreateDate = DateTime.UtcNow,
                EmailId = emailId,
                ExpiryDate = DateTime.UtcNow.AddDays(1),
                UserName = $"{SocioboardApiConstants.ApplicationName}",
                EmailValidateToken = "Google",
                UserType = "User",
                LastLoginTime = DateTime.UtcNow,
                SocialLoginEnableGo = true,
                SocialLoginEnableFb = false,
                PaymentStatus = SBPaymentStatus.UnPaid,
                RegistrationType = SBRegistrationType.Google,
                TrailStatus = UserTrailStatus.active
            };

            if (googleUser.AccountType == SBAccountType.Free)
                googleUser.ExpiryDate = DateTime.UtcNow.AddDays(15);

            try
            {
                googleUser.FirstName = Convert.ToString(userInfo["name"]);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
            }

            var savedStatus = dbr.Add(googleUser);

            var googleUserAccount = dbr.FindFirstMatch<User>(t => t.EmailId.Equals(googleUser.EmailId));

            CustomTaskFactory.Instance.Start(() =>
            {
                if (savedStatus != 1 || googleUserAccount == null)
                    return;

                _redisCache.Set(emailId, googleUserAccount);

                var group = new Groups();
                group.adminId = googleUserAccount.Id;
                group.createdDate = DateTime.UtcNow;
                group.groupName = SocioboardConsts.DefaultGroupName;
                savedStatus = dbr.Add(group);

                if (savedStatus != 1)
                    return;

                var groupDetails = dbr.Find<Groups>(t =>
                        t.adminId == googleUserAccount.Id &&
                        t.groupName.Equals(SocioboardConsts.DefaultGroupName))
                    .FirstOrDefault();

                if (groupDetails == null)
                    return;

                GroupMembersRepository.CreateGroupMember(groupDetails.id, googleUserAccount, _redisCache, dbr);

                GplusRepository.AddGplusAccount(userInfo, dbr, googleUserAccount.Id, groupDetails.id, accessToken,
                    refreshToken,
                    _redisCache, _appSettings, _logger);
            });


            return Ok(googleUserAccount);
        }

        /// <summary>
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="GplusId"></param>
        /// <param name="checkEnable"></param>
        /// <returns></returns>
        [HttpPost("EnableDisableGoogleSignIn")]
        public IActionResult EnableDisableGoogleSignIn(long userId, string GplusId, bool checkEnable)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            var user = dbr.Single<User>(t => t.Id == userId);
            var lstGplusacc = dbr.Find<Googleplusaccounts>(t => t.GpUserId.Equals(GplusId));


            if (user.TwostepEnable == false)
            {
                //user.SocialLoginEnableGo = checkEnable;
                //int res = dbr.Update<User>(user);
                lstGplusacc.First().socialSignInEnable = checkEnable;
                var resgp = dbr.Update(lstGplusacc.First());
                if (resgp == 1)
                {
                    if (checkEnable)
                        return Ok("You have successfully enabled social sign in for Google Account");
                    return Ok("You have successfully disabled social sign in for Google Account");
                }

                return BadRequest("Error while enabling Social Signin, pls try after some time.");
            }

            return BadRequest("Can't enable social signin because two steps login has already enabled.");
        }

        [HttpGet("GetPrimaryGoogleAcc")]
        public IActionResult GetPrimaryGoogleAcc(long userId, long groupId)
        {
            var userGplusAcc = new Googleplusaccounts();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);

                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GPlus).ToList();
                foreach (var item in lstGrpProfiles)
                {
                    var gPlusAcc = GplusRepository.getGPlusAccount(item.profileId, _redisCache, dbr);
                    var userdata = dbr.Single<User>(t => t.Id == gPlusAcc.UserId);
                    if (gPlusAcc != null && userdata.EmailId == gPlusAcc.EmailId) userGplusAcc = gPlusAcc;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return Ok(userGplusAcc);
        }

        [HttpGet("GetGplusProfilesOnly")]
        public IActionResult GetGplusProfilesOnly(long groupId)
        {
            var lstGplusAcc = new List<Googleplusaccounts>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);

                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr)
                    .Where(t => t.profileType == SocialProfileType.GPlus);

                lstGplusAcc.AddRange(
                    from item in lstGrpProfiles
                    select GplusRepository.getGPlusAccount(item.profileId, _redisCache, dbr)
                    into gPlusAcc
                    let userdata = dbr.Single<User>(t => t.Id == gPlusAcc.UserId)
                    where gPlusAcc != null && userdata.EmailId != gPlusAcc.EmailId
                    select gPlusAcc);

                return Ok(lstGplusAcc);
            }
            catch (Exception)
            {
                return Ok(lstGplusAcc);
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="refreshToken"></param>
        /// <param name="accessToken"></param>
        /// <param name="accType"> Pass a enum of <see cref="Domain.Socioboard.Enum.SBAccountType" /></param>
        /// <returns></returns>
        [HttpPost("GoogleLoginPhone")]
        public IActionResult GoogleLoginPhone(string refreshToken, string accessToken, SBAccountType accType)
        {
            var ret = string.Empty;
            var objRefresh = string.Empty;

            var ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey,
                _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret,
                _appSettings.GoogleRedirectUri);
            var userinfo = new JObject();
            try
            {
                var user = objToken.GetUserInfo("self", accessToken);
                _logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                ret = "Access Token Not Found";
                return Ok(ret);
            }

            var EmailId = string.Empty;
            try
            {
                EmailId = Convert.ToString(userinfo["email"]);
            }
            catch
            {
            }

            if (string.IsNullOrEmpty(EmailId)) return Ok("Google Not retuning Email");


            try
            {
                var inMemUser = _redisCache.Get<User>(EmailId);
                if (inMemUser != null) return Ok(inMemUser);
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }


            var dbr = new DatabaseRepository(_logger, _appEnv);
            var lstUser = dbr.Find<User>(t => t.EmailId.Equals(EmailId));
            if (lstUser != null && lstUser.Count() > 0)
            {
                var d1 = DateTime.UtcNow;
                //User userTable = dbr.Single<User>(t => t.EmailId == EmailId);
                //userTable.LastLoginTime = d1;
                lstUser.First().LastLoginTime = d1;
                dbr.Update(lstUser.First());
                _redisCache.Set(lstUser.First().EmailId, lstUser.First());
                return Ok(lstUser.First());
            }

            {
                var gplusAcc = GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);
                if (gplusAcc != null && gplusAcc.IsActive) return BadRequest("GPlus account added by other user.");


                var user = new User();
                if (accType == SBAccountType.Free)
                    user.AccountType = SBAccountType.Free;
                else if (accType == SBAccountType.Deluxe)
                    user.AccountType = SBAccountType.Deluxe;
                else if (accType == SBAccountType.Premium)
                    user.AccountType = SBAccountType.Premium;
                else if (accType == SBAccountType.Topaz)
                    user.AccountType = SBAccountType.Topaz;
                else if (accType == SBAccountType.Platinum)
                    user.AccountType = SBAccountType.Platinum;
                else if (accType == SBAccountType.Gold)
                    user.AccountType = SBAccountType.Gold;
                else if (accType == SBAccountType.Ruby)
                    user.AccountType = SBAccountType.Ruby;
                else if (accType == SBAccountType.Standard) user.AccountType = SBAccountType.Standard;
                user.PaymentType = PaymentType.paypal;
                user.ActivationStatus = SBUserActivationStatus.Active;
                user.CreateDate = DateTime.UtcNow;
                user.EmailId = EmailId;
                user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                user.UserName = "Socioboard";
                user.EmailValidateToken = "Google";
                user.UserType = "User";
                user.LastLoginTime = DateTime.UtcNow;
                user.PaymentStatus = SBPaymentStatus.UnPaid;
                user.SocialLoginEnableGo = true;
                try
                {
                    user.FirstName = Convert.ToString(userinfo["name"]);
                }
                catch
                {
                }

                user.RegistrationType = SBRegistrationType.Google;

                var SavedStatus = dbr.Add(user);
                var nuser = dbr.Single<User>(t => t.EmailId.Equals(user.EmailId));
                if (SavedStatus == 1 && nuser != null)
                {
                    var group = new Groups();
                    group.adminId = nuser.Id;
                    group.createdDate = DateTime.UtcNow;
                    group.groupName = SocioboardConsts.DefaultGroupName;
                    SavedStatus = dbr.Add(group);
                    if (SavedStatus == 1)
                    {
                        var ngrp = dbr.Find<Groups>(t =>
                                t.adminId == nuser.Id && t.groupName.Equals(SocioboardConsts.DefaultGroupName))
                            .FirstOrDefault();
                        GroupMembersRepository.CreateGroupMember(ngrp.id, nuser, _redisCache, dbr);
                        // Adding GPlus Profile
                        GplusRepository.AddGplusAccount(userinfo, dbr, nuser.Id, ngrp.id, accessToken, refreshToken,
                            _redisCache, _appSettings, _logger);
                    }
                }

                return Ok(nuser);
            }
        }

        [HttpPost("AddGoogleAccountPhone")]
        public IActionResult AddGoogleAccountPhone(string refreshToken, string accessToken, long groupId, long userId)
        {
            var ret = string.Empty;
            var objRefresh = string.Empty;
            var dbr = new DatabaseRepository(_logger, _appEnv);

            var ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey,
                _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret,
                _appSettings.GoogleRedirectUri);
            var userinfo = new JObject();
            try
            {
                var user = objToken.GetUserInfo("self", accessToken);
                //_logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                var people = objToken.GetPeopleInfo("self", accessToken, Convert.ToString(userinfo["id"]));
                userinfo = JObject.Parse(JArray.Parse(people)[0].ToString());
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                ret = "Access Token Not Found";
                return Ok(ret);
            }

            var gplusAcc = GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);

            if (gplusAcc != null && gplusAcc.IsActive)
            {
                if (gplusAcc.UserId == userId) return BadRequest("GPlus account already added by you.");
                return BadRequest("GPlus account added by other user.");
            }

            var ngrp = dbr.Find<Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
            if (ngrp == null) return Ok("group not exist");
            // Adding GPlus Profile
            var x = GplusRepository.AddGplusAccount(userinfo, dbr, userId, ngrp.id, accessToken, refreshToken,
                _redisCache, _appSettings, _logger);
            if (x == 1)
                return Ok("Gplus Account Added Successfully");
            return BadRequest("Issues while adding account");
        }


        [HttpPost("AddGoogleAccount")]
        public IActionResult AddGoogleAccount(string code, long groupId, long userId)
        {
            var ret = string.Empty;
            var objRefresh = string.Empty;
            var refreshToken = string.Empty;
            var access_token = string.Empty;
            var dbr = new DatabaseRepository(_logger, _appEnv);

            var ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey,
                _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret,
                _appSettings.GoogleRedirectUri);
            var userinfo = new JObject();
            try
            {
                objRefresh = ObjoAuthTokenGPlus.GetRefreshToken(code);
                var objaccesstoken = JObject.Parse(objRefresh);
                _logger.LogInformation(objaccesstoken.ToString());
                try
                {
                    refreshToken = objaccesstoken["refresh_token"].ToString();
                }
                catch
                {
                }

                access_token = objaccesstoken["access_token"].ToString();
                var user = objToken.GetUserInfo("self", access_token);
                //_logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                var people = objToken.GetPeopleInfo("self", access_token, Convert.ToString(userinfo["id"]));
                userinfo = JObject.Parse(JArray.Parse(people)[0].ToString());
            }
            catch (Exception ex)
            {
                //access_token = objaccesstoken["access_token"].ToString();
                //ObjoAuthTokenGPlus.RevokeToken(access_token);
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                ret = "Access Token Not Found";
                return BadRequest(ret);
            }

            var gplusAcc = GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);

            if (gplusAcc != null && gplusAcc.IsActive)
            {
                if (gplusAcc.UserId == userId) return BadRequest("GPlus account already added by you.");
                return BadRequest("GPlus account added by other user.");
            }

            var ngrp = dbr.Find<Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
            if (ngrp == null) return Ok("group not exist");
            // Adding GPlus Profile
            var x = GplusRepository.AddGplusAccount(userinfo, dbr, userId, ngrp.id, access_token, refreshToken,
                _redisCache, _appSettings, _logger);
            if (x == 1)
                return Ok("Gplus Account Added Successfully");
            return BadRequest("Issues while adding account");
        }

        [HttpPost("RecGoogleAccount")]
        public IActionResult RecGoogleAccount(string code, long userId)
        {
            var ret = string.Empty;
            var objRefresh = string.Empty;
            var refreshToken = string.Empty;
            var access_token = string.Empty;
            var dbr = new DatabaseRepository(_logger, _appEnv);

            var ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var userinfo = new JObject();
            try
            {
                objRefresh = ObjoAuthTokenGPlus.GetRefreshToken(code);
                var objaccesstoken = JObject.Parse(objRefresh);
                _logger.LogInformation(objaccesstoken.ToString());
                try
                {
                    refreshToken = objaccesstoken["refresh_token"].ToString();
                }
                catch
                {
                }

                access_token = objaccesstoken["access_token"].ToString();
                var user = objToken.GetUserInfo("self", access_token);
                //_logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                var people = objToken.GetPeopleInfo("self", access_token, Convert.ToString(userinfo["id"]));
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

            var gplusAcc = GplusRepository.getGPlusAccount(Convert.ToString(userinfo["id"]), _redisCache, dbr);

            if (gplusAcc != null && gplusAcc.IsActive)
                if (gplusAcc.UserId == userId)
                {
                }

            // Adding GPlus Profile
            var x = GplusRepository.ReconnectGplusAccount(userinfo, dbr, userId, access_token, refreshToken,
                _redisCache, _appSettings, _logger);
            if (x == 1)
                return Ok("Gplus Account Reconnect Successfully");
            return BadRequest("Issues while adding account");
        }


        [HttpPost("ReconnectGoogleAnalyticsAccount")]
        public IActionResult ReconnectGoogleAnalyticsAccount(string code, long userId)
        {
            var ret = string.Empty;
            var objRefresh = string.Empty;
            var refreshToken = string.Empty;
            var access_token = string.Empty;
            var dbr = new DatabaseRepository(_logger, _appEnv);

            var ObjoAuthTokenGPlus = new oAuthTokenGPlus(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var objToken = new oAuthToken(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);
            var userinfo = new JObject();
            try
            {
                objRefresh = ObjoAuthTokenGPlus.GetRefreshToken(code);
                var objaccesstoken = JObject.Parse(objRefresh);
                _logger.LogInformation(objaccesstoken.ToString());
                try
                {
                    refreshToken = objaccesstoken["refresh_token"].ToString();
                }
                catch
                {
                }

                access_token = objaccesstoken["access_token"].ToString();
                var user = objToken.GetUserInfo("self", access_token);
                //_logger.LogInformation(user);
                userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                var people = objToken.GetPeopleInfo("self", access_token, Convert.ToString(userinfo["id"]));
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

            // Adding GPlus Profile
            var x = GplusRepository.ReconnectGoogleAnalyticsAccount(userinfo, dbr, userId, access_token, refreshToken, _redisCache, _appSettings, _logger);

            if (x == 1)
                return Ok("Google Analytics Account Successfully Reconnected");

            return BadRequest("Issues while adding account");
        }


        [HttpGet("GetGplusFeeds")]
        public IActionResult GetGplusFeeds(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
                return Ok(GplusRepository.getgoogleplusActivity(profileId, _redisCache, _appSettings).Skip(skip)
                    .Take(count));

            var gplusFeedRepo = new MongoRepository("MongoGplusFeed", _appSettings);
            var builder = Builders<MongoGplusFeed>.Sort;
            var sort = builder.Descending(t => t.PublishedDate);
            var result = gplusFeedRepo.FindWithRange(t => t.GpUserId.Equals(profileId), sort, skip, count);
            var task = Task.Run(async () => { return await result; });
            var lstMongoGplusFeed = task.Result;
            return Ok(lstMongoGplusFeed);
        }

        [HttpGet("GetGplusFilterFeeds")]
        public IActionResult GetGplusFilterFeeds(string profileId, long userId, int skip, int count, string postType)
        {
            return Ok(
                GplusRepository.getgoogleplusActivity(profileId, _redisCache, _appSettings, skip, count, postType));
        }


        [HttpGet("GetGplusProfiles")]
        public IActionResult GetGplusProfiles(long groupId)
        {
            var lstGplusAcc = new List<Googleplusaccounts>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);

                foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GPlus))
                {
                    var gPlusAcc = GplusRepository.getGPlusAccount(item.profileId, _redisCache, dbr);
                    if (gPlusAcc != null) lstGplusAcc.Add(gPlusAcc);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return Ok(lstGplusAcc);
        }

        [HttpGet("GetAllGplusProfiles")]
        public IActionResult GetAllGplusProfiles(long groupId)
        {
            var lstGplusAcc = new List<Googleplusaccounts>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);

                foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GPlus))
                {
                    var gPlusAcc = GplusRepository.getGPlusAccount(item.profileId, _redisCache, dbr);
                    if (gPlusAcc != null) lstGplusAcc.Add(gPlusAcc);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return Ok(lstGplusAcc);
        }

        [HttpPost("GetGanalyticsAccount")]
        public IActionResult GetGanalyticsAccount(string code, long groupId, long userId)
        {
            try
            {
                var lstGoogleAnalyticsProfiles = new List<GoogleAnalyticsProfiles>();
                lstGoogleAnalyticsProfiles = GoogleHelper.GetGanalyticsAccount(code, _appSettings);
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GoogleAnalytics).ToList();

                var lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                    lstGoogleAnalyticsProfiles.Where(t => lstStr.Contains(t.ProfileId)).Select(s =>
                    {
                        s.connected = 1;
                        return s;
                    }).ToList();

                return Ok(lstGoogleAnalyticsProfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetGetGanalyticsAccount" + ex.StackTrace);
                _logger.LogError("GetGetGanalyticsAccount" + ex.Message);
                return Ok(new List<GoogleAnalyticsProfiles>());
            }
        }

        [HttpPost("AddGaSites")]
        public IActionResult AddGaSites(long groupId, long userId)
        {
            string data = Request.Form["profileaccesstoken"];
            var dbr = new DatabaseRepository(_logger, _appEnv);
            string[] profiledata = null;

            var lstAddedAccounts = 0;
            var lstNotAddedAccounts = 0;
            var listStatus = new ListDictionary();
            var i = "0";


            profiledata = data.Split(',');
            foreach (var item in profiledata)
            {
                i = GplusRepository.AddGaSites(item, userId, groupId, _redisCache, _appSettings, dbr, _appEnv);

                if (i == "added by other")
                    lstNotAddedAccounts++;
                else
                    lstAddedAccounts++;
            }

            listStatus.Add("added", lstAddedAccounts);
            listStatus.Add("notadded", lstNotAddedAccounts);

            if (lstAddedAccounts != 0 && lstNotAddedAccounts == 0)
                return Ok("Google Analytics Added Successfully");
            return Ok(listStatus);
        }

        [HttpGet("GetGAProfiles")]
        public IActionResult GetGAProfiles(long groupId)
        {
            var lstGoogleAnalyticsAccount = new List<GoogleAnalyticsAccount>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);

                foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GoogleAnalytics))
                {
                    var gAAcc = GplusRepository.getGAAccount(item.profileId, _redisCache, dbr);
                    if (gAAcc != null) lstGoogleAnalyticsAccount.Add(gAAcc);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return Ok(lstGoogleAnalyticsAccount);
        }


        [HttpGet("GetAllGAProfiles")]
        public IActionResult GetAllGAProfiles(long groupId)
        {
            var lstGoogleAnalyticsAccount = new List<GoogleAnalyticsAccount>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);

                foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.GoogleAnalytics))
                {
                    var gAAcc = GplusRepository.getGAAccount(item.profileId, _redisCache, dbr);
                    if (gAAcc != null) lstGoogleAnalyticsAccount.Add(gAAcc);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);

            }

            return Ok(lstGoogleAnalyticsAccount);
        }


        /// <summary>
        /// To provide the report on website traffic.
        /// </summary>
        /// <param name="profileId">Id of the user</param>       
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpGet("GetActiveUser")]
        public IActionResult GetActiveUser(string profileId)
        {
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var googleAnalyticsAccount = GplusRepository.getGAAccount(profileId, _redisCache, dbr);
                var analytics = new Analytics(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

                var activeUser = analytics.GetRealTimeUsers(profileId, googleAnalyticsAccount.AccessToken);
                return Ok(activeUser);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);

            }
            return Ok("0");
        }


        /// <summary>
        /// To provide the report on website traffic.
        /// </summary>
        /// <param name="profileId">Id of the user</param>
        /// <param name="days"></param>
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpGet("GetViewsAndSession")]
        public IActionResult GetViewsAndSession(string profileId, long days)
        {
            try
            {

                var day = int.Parse(days.ToString());

                var dbr = new DatabaseRepository(_logger, _appEnv);
                var googleAnalyticsAccount = GplusRepository.getGAAccount(profileId, _redisCache, dbr);
                var analytics = new Analytics(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

                var activeUser = analytics.GetSessionViewOfUser(profileId, googleAnalyticsAccount.AccessToken, day);
                return Ok(activeUser);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);

            }
            return Ok("0");
        }


        /// <summary>
        /// To provide the report on website traffic.
        /// </summary>
        /// <param name="profileId">Id of the user</param>       
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpGet("GetProfileDetails")]
        public IActionResult GetProfileDetails(string profileId)
        {
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var googleAnalyticsAccount = GplusRepository.getGAAccount(profileId, _redisCache, dbr);



                return Ok("");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);

            }
            return Ok("0");
        }


        [HttpPost("GetYoutubeAccount")]
        public IActionResult GetYoutubeAccount(string code, long groupId, long userId)
        {
            try
            {
                var lstYoutubeProfiles = new List<YoutubeProfiles>();
                var dbr = new DatabaseRepository(_logger, _appEnv);
                lstYoutubeProfiles = GoogleHelper.GetYoutubeAccount(code, _appSettings, dbr);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == SocialProfileType.YouTube).ToList();
                var lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                    lstYoutubeProfiles.Where(t => lstStr.Contains(t.YtChannelId)).Select(s =>
                    {
                        s.connected = 1;
                        return s;
                    }).ToList();
                return Ok(lstYoutubeProfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetGetYoutubeAccount" + ex.StackTrace);
                _logger.LogError("GetGetYoutubeAccount" + ex.Message);
                return Ok(new List<YoutubeProfiles>());
            }
        }


        [HttpPost("GetReconnYtAccDetail")]
        public IActionResult GetReconnYtAccDetail(string code, long groupId, long userId)
        {
            try
            {
                var lstYoutubeProfiles = new List<YoutubeProfiles>();
                var dbr = new DatabaseRepository(_logger, _appEnv);
                lstYoutubeProfiles = GoogleHelper.GetYoutubeAccount(code, _appSettings, dbr);
                var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == SocialProfileType.YouTube).ToList();
                var lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0) lstYoutubeProfiles.Where(t => lstStr.Contains(t.YtChannelId)).ToList();
                return Ok(lstYoutubeProfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetGetYoutubeAccount" + ex.StackTrace);
                _logger.LogError("GetGetYoutubeAccount" + ex.Message);
                return Ok(new List<YoutubeProfiles>());
            }
        }

        [HttpPost("AddYoutubeChannels")]
        public IActionResult AddYoutubeChannels(long groupId, long userId)
        {
            string data = Request.Form["profileaccesstoken"];
            var dbr = new DatabaseRepository(_logger, _appEnv);
            string[] profiledata = null;

            profiledata = data.Split(',');
            var savedStatus = "";
            foreach (var item in profiledata)
                savedStatus =
                    GplusRepository.AddYoutubeChannels(item, userId, groupId, _redisCache, _appSettings, dbr, _appEnv);

            if (savedStatus == "Youtube already added by you")
                return BadRequest("Youtube channel is already added by you");
            if (savedStatus == "Youtube added by any other")
                return BadRequest("Youtube channel is already added by someone else");
            return Ok("Added Successfully");
        }

        [HttpGet("GetYTChannelsSB")]
        public IActionResult GetYTChannelsSB(long groupId)
        {
            var lstYoutubeChannel = new List<YoutubeChannel>();
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var lstGrpProfiles = GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);

                foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.YouTube))
                {
                    var YTChnl = GplusRepository.getYTChannel(item.profileId, _redisCache, dbr);
                    if (YTChnl != null) lstYoutubeChannel.Add(YTChnl);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return Ok(lstYoutubeChannel);
        }

        [HttpGet("GetAllYTChannelsSB")]
        public IActionResult GetAllYTChannelsSB(long groupId)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            var lstGrpProfiles = GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            var lstYoutubeChannel = new List<YoutubeChannel>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == SocialProfileType.YouTube))
            {
                var YTChnl = GplusRepository.getYTChannel(item.profileId, _redisCache, dbr);
                if (YTChnl != null) lstYoutubeChannel.Add(YTChnl);
            }

            return Ok(lstYoutubeChannel);
        }

        [HttpPost("AddYoutubeFeed")]
        public IActionResult AddYoutubeFeed(string accesstoken, string channelid)
        {
            //connected to gplusrepository for add data in mongodb
            GplusRepository.InitialYtFeedsAdd(channelid, accesstoken, _appSettings, _logger);
            Thread.Sleep(26000);
            GplusRepository.InitialYtCommentsAdd(channelid, accesstoken, _appSettings, _logger);
            Thread.Sleep(26000);
            GplusRepository.InitialYtReplyCommentsAdd(channelid, accesstoken, _appSettings, _logger);
            return Ok("");
        }


        //Fetch youtube videos data from MongoDB

        [HttpGet("GetYTVideos")]
        public IActionResult GetYTVideos(string ChannelId, string sortType)
        {
            return Ok(GplusRepository.GetYoutubeFeeds(ChannelId, sortType, _redisCache, _appSettings));
        }

        [HttpGet("GetYtVdoComments")]
        public IActionResult GetYtVdoComments(string VideoId)
        {
            return Ok(GplusRepository.GetYoutubeComments(VideoId, _redisCache, _appSettings));
        }

        [HttpPost("PostCommentsYoutube")]
        public IActionResult PostCommentsYoutube(string channelId, string videoId, string commentText)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            GplusRepository.PostCommentsYt(channelId, videoId, commentText, _appSettings, _logger, dbr);
            return Ok("");
        }

        [HttpPost("uploadyoutube")]
        public IActionResult uploadyoutube(string channelid, string title, string descrip, string category,
            string status, IFormFile files)
        {
            var updatevideo = files;
            var postmessage = "";
            var titlemsg = "";
            var updatedmessgae = Regex.Split(descrip, "<br>");
            var updatedTitle = Regex.Split(title, "<br>");

            foreach (var item in updatedmessgae)
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.Contains("hhh") || item.Contains("nnn") || item.Contains("ppp") || item.Contains("jjj"))
                    {
                        if (item.Contains("hhh")) postmessage = postmessage + item.Replace("hhh", "#");
                        if (item.Contains("nnn")) postmessage = postmessage.Replace("nnn", "&");
                        if (item.Contains("ppp")) postmessage = postmessage.Replace("ppp", "+");
                        if (item.Contains("jjj")) postmessage = postmessage.Replace("jjj", "-+");
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r" + item;
                    }
                }

            descrip = postmessage;


            foreach (var itemTitle in updatedTitle)
                if (!string.IsNullOrEmpty(itemTitle))
                {
                    if (itemTitle.Contains("hhh") || itemTitle.Contains("nnn") || itemTitle.Contains("ppp") ||
                        itemTitle.Contains("jjj"))
                    {
                        if (itemTitle.Contains("hhh")) titlemsg = titlemsg + itemTitle.Replace("hhh", "#");
                        if (itemTitle.Contains("nnn")) titlemsg = titlemsg.Replace("nnn", "&");
                        if (itemTitle.Contains("ppp")) titlemsg = titlemsg.Replace("ppp", "+");
                        if (itemTitle.Contains("jjj")) titlemsg = titlemsg.Replace("jjj", "-+");
                    }
                    else
                    {
                        titlemsg = titlemsg + "\n\r" + itemTitle;
                    }
                }

            title = titlemsg;


            var arrdata = new string[4];
            arrdata[0] = title;
            arrdata[1] = descrip;
            arrdata[2] = category;
            arrdata[3] = status;

            var filename = "";
            var fileName = ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
            filename = ContentDispositionHeaderValue
                .Parse(files.ContentDisposition)
                .FileName
                .Trim('"');
            var tempName = SBHelper.RandomString(10) + '.' + fileName.Split('.')[1];
            filename = _appEnv.WebRootPath + "\\upload" + $@"\{tempName}";
            var dbr = new DatabaseRepository(_logger, _appEnv);
            try
            {
                using (var fs = System.IO.File.Create(filename))
                {
                    files.CopyTo(fs);
                    fs.Flush();
                }
            }
            catch (Exception ex)
            {
            }

            var lstchannels = dbr.Find<YoutubeChannel>(t => t.YtubeChannelId == channelid).ToList();
            var _resp = UploadVideo.videosss(channelid, lstchannels.First().RefreshToken, files, filename,
                lstchannels.First().Channel_EmailId, arrdata, _appSettings);
            if (_resp == 0)
                return Ok("Posted");
            return Ok("error");
        }


        [HttpGet("GetAllYtComments")]
        public IActionResult GetAllYtComments(string ChannelId)
        {
            return Ok(GplusRepository.GetAllYoutubeComments(ChannelId, _redisCache, _appSettings));
        }

        [HttpGet("GetYtVdoCommentsWithReply")]
        public IActionResult GetYtVdoCommentsWithReply(string VideoId)
        {
            return Ok(GplusRepository.GetYoutubeCommentsWithReply(VideoId, _redisCache, _appSettings));
        }

        [HttpPost("PostCommentsYoutubeReply")]
        public IActionResult PostCommentsYoutubeReply(string channelId, string idParentComment, string commentText,
            string videoId)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            GplusRepository.PostCommentsYtReply(channelId, idParentComment, commentText, videoId, _appSettings, _logger,
                dbr);
            return Ok("");
        }

        [HttpPost("ReviewedComment")]
        public IActionResult ReviewedComment(string commentId, string sbUserName, long sbUserId, bool status,
            string commentType)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            GplusRepository.ReviewedComment(commentId, sbUserName, sbUserId, status, commentType, _appSettings, _logger,
                dbr);
            return Ok();
        }
    }
}