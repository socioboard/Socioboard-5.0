using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Models;
using Api.Socioboard.Model;
using Domain.Socioboard.Interfaces.Services;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.ViewModels;
using Api.Socioboard.Repositories;
using Microsoft.AspNetCore.Hosting;
using Socioboard.Facebook.Data;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class UserController : Controller
    {

        public UserController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
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


        [HttpPost("Register")]
        public IActionResult Register(User user)
        {
            user.CreateDate = DateTime.UtcNow;
            user.ExpiryDate = DateTime.UtcNow.AddDays(30);
            user.EmailValidateToken = SBHelper.RandomString(20);
            user.ValidateTokenExpireDate = DateTime.UtcNow.AddDays(1);
            user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.MailSent;
            user.Password = SBHelper.MD5Hash(user.Password);
            user.UserName = "Socioboard";

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<User> lstUser = dbr.Find<User>(t => t.EmailId.Equals(user.EmailId));
            if (lstUser != null && lstUser.Count() > 0)
            {
                return BadRequest("EmailID Exist");
            }

            int SavedStatus = dbr.Add<Domain.Socioboard.Models.User>(user);
            User nuser = dbr.Single<User>(t => t.EmailId.Equals(user.EmailId));
            if (SavedStatus == 1 && nuser != null)
            {
                Groups group = new Groups();
                group.adminId = nuser.Id;
                group.id = nuser.Id;
                group.createdDate = DateTime.UtcNow;
                group.groupName = Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName;
                SavedStatus = dbr.Add<Groups>(group);
                if (SavedStatus == 1)
                {
                    long GroupId = dbr.FindSingle<Domain.Socioboard.Models.Groups>(t => t.adminId == group.adminId && t.groupName.Equals(group.groupName)).id;
                    GroupMembersRepository.createGroupMember(GroupId, nuser, _redisCache, dbr);
                }
                try
                {
                    string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\registrationmail.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", nuser.FirstName);
                    html = html.Replace("[AccountType]", nuser.AccountType.ToString());
                    html = html.Replace("[ActivationLink]", _appSettings.Domain + "/Home/Active?Token=" + nuser.EmailValidateToken + "&id=" + nuser.Id);
                    _emailSender.SendMail("", "", nuser.EmailId, "", "", "Socioboard Email conformation Link", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
                }
                catch
                {
                    return Ok();
                }
            }
            else
            {
                return BadRequest("Can't create user");
            }
            return Ok("Email verification mail sent successfully.");
        }

        [HttpPost("Login")]
        public IActionResult Login(UserLoginViewModel user)
        {
            try
            {
                User inMemUser = _redisCache.Get<User>(user.UserName);
                // User inMemUser = (User)_memoryCache.Get(user.UserName);
                if (inMemUser != null)
                {
                    if (inMemUser.Password.Equals(SBHelper.MD5Hash(user.Password)))
                    {
                        return Ok(inMemUser);
                    }
                    else
                    {
                        return Ok("Wrong Password");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }



            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<User> lstUser = dbr.Find<User>(t => t.EmailId.Equals(user.UserName));
            if (lstUser != null && lstUser.Count() > 0)
            {
                if (lstUser.First().Password != null && lstUser.First().Password.Equals(SBHelper.MD5Hash(user.Password)))
                {
                    // _memoryCache.Set(lstUser.First().EmailId, lstUser.First());
                    _redisCache.Set<User>(lstUser.First().EmailId, lstUser.First());
                    return Ok(lstUser.First());
                }
                else
                {
                    return Ok("Wrong Password");
                }
            }
            else
            {
                return Ok("EmailId Not Exist");
            }
        }

        [HttpPost("IsEmailExst")]
        public IActionResult IsEmailExst(string Email)
        {
            try
            {
                User inMemUser = _redisCache.Get<User>(Email);
                if (inMemUser != null)
                {
                    return Ok("Email Exist");
                }
            }
            catch (Exception ex)
            {

                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            if (dbr.Find<User>(t => t.EmailId.Equals(Email)).Count() > 0)
            {
                return Ok("Email Exist");
            }
            else
            {
                return Ok("Not Exist");
            }

        }


        [HttpGet("GetUser")]
        public IActionResult GetUser(Int64 Id)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);

            User user = dbr.Single<User>(t => t.Id == Id);
            if (user != null)
            {
                return Ok(user);
            }
            else
            {
                return NotFound();
            }

        }


        [HttpPost("VerifyEmail")]
        public IActionResult VerifyEmail(Int64 Id, string Token)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = null;
            try
            {
                user = dbr.Single<User>(t => t.Id == Id);
            }
            catch { }
            if (user != null)
            {
                if (user.EmailValidateToken.Equals(Token))
                {
                    if (user.ValidateTokenExpireDate >= DateTime.UtcNow)
                    {
                        user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.Active;
                        int result = dbr.Update<User>(user);
                        if (result == 1)
                        {
                            return Ok("Account Activated.");
                        }
                        else
                        {
                            return Ok("Failed to Activate.");
                        }
                    }
                    else
                    {
                        return Ok("Link Expired.");
                    }
                }
                else
                {
                    return Ok("Wrong Link.");
                }
            }
            else
            {
                return Ok("Wrong Link.");
            }
        }


        [HttpPost("ResendMail")]
        public IActionResult ResendMail(string Email)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = null;
            try
            {
                user = dbr.Single<User>(t => t.EmailId.Equals(Email));
            }
            catch { }
            if (user != null)
            {
                user.EmailValidateToken = SBHelper.RandomString(20);
                user.ValidateTokenExpireDate = DateTime.UtcNow.AddDays(1);
                int result = dbr.Update<User>(user);
                if (result == 1)
                {
                    string path = System.IO.Path.Combine(_appEnv.WebRootPath, "views/registrationmail.html");
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", user.FirstName);
                    html = html.Replace("[AccountType]", user.AccountType.ToString());
                    html = html.Replace("[ActivationLink]", "http://localhost:9821/Home/Active?Token=" + user.EmailValidateToken + "&id=" + user.Id);


                    _emailSender.SendMail("", "", user.EmailId, "", "", "Socioboard Email conformation Link", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
                    return Ok("Mail Sent Successfully.");
                }
                else
                {
                    return Ok("Failed to send mail.");
                }


            }
            else
            {
                return Ok("Wrong Email");
            }
        }


        [HttpPost("FacebookLogin")]
        public IActionResult FacebookLogin(string AccessToken)
        {
            dynamic profile = FbUser.getFbUser(AccessToken);

            if (Convert.ToString(profile) == "Invalid Access Token")
            {
                return Ok("Invalid Access Token");
            }
            try
            {
                string EmailId = string.Empty;
                try
                {
                    EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                if (string.IsNullOrEmpty(EmailId))
                {
                    return Ok("Facebook Not retuning Email");
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
                    Domain.Socioboard.Models.Facebookaccounts fbacc = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
                    if (fbacc != null && fbacc.IsActive == true)
                    {
                        return Ok("Facebook account added by other user.");
                    }

                    Domain.Socioboard.Models.User user = new Domain.Socioboard.Models.User();
                    user.AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                    user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.Active;
                    user.CreateDate = DateTime.UtcNow;
                    user.EmailId = EmailId;
                    user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                    user.UserName = "Socioboard";
                    user.EmailValidateToken = "Facebook";
                    try
                    {
                        user.ProfilePicUrl = "http://graph.facebook.com/" + Convert.ToString(profile["id"]) + "/picture?type=small";
                    }
                    catch { }
                    user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.UnPaid;
                    try
                    {
                        user.FirstName = (Convert.ToString(profile["name"]));
                    }
                    catch { }
                    user.RegistrationType = Domain.Socioboard.Enum.SBRegistrationType.Faceboook;

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
                            // Adding Facebook Profile
                            Api.Socioboard.Repositories.FacebookRepository.AddFacebookAccount(profile, FbUser.getFbFriends(AccessToken), dbr, nuser.Id, ngrp.id, Domain.Socioboard.Enum.FbProfileType.FacebookProfile, AccessToken, _redisCache, _appSettings, _logger);
                        }
                    }
                    return Ok(nuser);
                }
            }
            catch
            {
                return Ok("Invalid Access Token");
            }
        }

        [HttpGet("GetUserProfileCount")]
        public IActionResult GetUserProfileCount(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);

            return Ok(GroupProfilesRepository.getAllProfilesCountOfUser(userId, _redisCache, dbr));
        }

        [HttpPost("UpdateUser")]
        public IActionResult UpdateUser(string firstName, string lastName, string userName, string phoneNumber, DateTime dob, string aboutMe, long userId, IFormFile files)
        {
            
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = dbr.Single<User>(t => t.Id == userId);

            if (!userName.Equals("Socioboard"))
            {
                if (!user.UserName.Equals(userName))
                {
                    if (dbr.Find<User>(t => t.UserName.Equals(userName)).Count() > 0)
                    {
                        return Ok("UserName already Taken.");
                    }
                }
            }

            if (user != null)
            {

                var imgPath = "";
                if (files != null && files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    imgPath = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    imgPath = _appEnv.WebRootPath + $@"\{fileName}";
                    // size += file.Length;
                    try
                    {
                        using (FileStream fs = System.IO.File.Create(imgPath))
                        {
                            files.CopyTo(fs);
                            fs.Flush();
                            user.ProfilePicUrl = imgPath;
                        }
                    }
                    catch (Exception ex)
                    {
                        
                    }
                }

                user.FirstName = firstName;
                user.LastName = lastName;
                user.PhoneNumber = phoneNumber;
                try
                {
                    user.dateOfBirth = dob;
                }
                catch (Exception ex)
                {

                    // throw;
                }
                user.aboutMe = aboutMe;
                int res = dbr.Update<User>(user);
                if (res == 1)
                {
                    _redisCache.Delete(user.EmailId);
                    return Ok("updated");
                }
                else
                {
                    return Ok("issue while updating.");
                }
            }
            else
            {
                return NotFound("user not found");
            }
        }


        [HttpPost("ChangePassword")]
        public IActionResult ChangePassword(long userId, string currentPassword, string newPassword, string conformPassword)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = dbr.Single<User>(t => t.Id == userId);
            if (user != null && user.Password != null)
            {
                if (user.Password.Equals(SBHelper.MD5Hash(currentPassword)))
                {
                    if(user.Password.Equals(SBHelper.MD5Hash(newPassword)))
                    {
                        return Ok("Current Password and New Password are same.Try with New Password");
                    }
                    if (newPassword.Equals(conformPassword))
                    {
                        user.Password = SBHelper.MD5Hash(newPassword);
                        int res = dbr.Update<User>(user);
                        if (res == 1)
                        {
                            return Ok("Password Updated");
                        }
                        else
                        {
                            return BadRequest("error while updating password, pls try after some time.");
                        }

                    }
                    else
                    {
                        return BadRequest("new password and conform password are not matching.");
                    }
                }
                else
                {
                    return BadRequest("Wrong password");
                }
            }
            else
            {
                return Unauthorized();
            }

        }


        [HttpPost("UpdateMailSettings")]
        public IActionResult UpdateMailSettings(long userId, bool dailyGrpReportsSummery, bool weeklyGrpReportsSummery, bool days15GrpReportsSummery, bool monthlyGrpReportsSummery, bool days60GrpReportsSummery, bool days90GrpReportsSummery, bool otherNewsLetters)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = dbr.Single<User>(t => t.Id == userId);
            if (user != null)
            {
                user.dailyGrpReportsSummery = dailyGrpReportsSummery;
                user.weeklyGrpReportsSummery = weeklyGrpReportsSummery;
                user.days15GrpReportsSummery = days15GrpReportsSummery;
                user.monthlyGrpReportsSummery = monthlyGrpReportsSummery;
                user.days60GrpReportsSummery = days60GrpReportsSummery;
                user.days90GrpReportsSummery = days90GrpReportsSummery;
                user.otherNewsLetters = otherNewsLetters;
                int res = dbr.Update<User>(user);
                if (res == 1)
                {
                    _redisCache.Delete(user.EmailId);
                    return Ok("Mail Settings Updated.");
                }
                else
                {
                    return BadRequest("Issue while updating, pls try after some time.");
                }
            }
            else
            {
                return Unauthorized();
            }
        }
    }
}
