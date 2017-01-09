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



        /// <summary>
        /// To register the new user.
        /// </summary>
        /// <param name="user">data of the user for registration</param>
        /// <returns></returns>
        [HttpPost("Register")]
        public IActionResult Register(User user)
        {
            user.CreateDate = DateTime.UtcNow;
            user.ExpiryDate = DateTime.UtcNow.AddDays(1);
            user.EmailValidateToken = SBHelper.RandomString(20);
            user.ValidateTokenExpireDate = DateTime.UtcNow.AddDays(1);
            user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.MailSent;
            user.Password = SBHelper.MD5Hash(user.Password);
            user.UserName = "Socioboard";
            user.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.notadded;
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
            IList<User> lstUser1 = dbr.Find < User>(a => a.PhoneNumber.Equals(user.PhoneNumber));
            if (lstUser1 != null && lstUser1.Count() > 0)
            {
                return BadRequest("Phone Number Exist");
            }
            int SavedStatus = dbr.Add<Domain.Socioboard.Models.User>(user);
            User nuser = dbr.Single<User>(t => t.EmailId.Equals(user.EmailId));
            if (SavedStatus == 1 && nuser != null)
            {
                Groups group = new Groups();
                group.adminId = nuser.Id;
               // group.id = nuser.Id;
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
                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", nuser.EmailId, "", "", "Socioboard Email conformation Link", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
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


        /// <summary>
        /// To login page.
        /// </summary>
        /// <param name="user">User login details :EmailId and password</param>
        /// <returns>Success:user can login successfully ,Failure: entered wrong password or EmailId does not exist</returns>
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
                    DateTime d1 = DateTime.UtcNow;
                    //User userTable = dbr.Single < User>(t => t.EmailId == user.UserName);
                    lstUser.First().LastLoginTime = d1;
                    //userTable.LastLoginTime = d1;
                    dbr.Update < User>(lstUser.First());

                    // _memoryCache.Set(lstUser.First().EmailId, lstUser.First());
                    _redisCache.Set<User>(lstUser.First().EmailId, lstUser.First());
                    if(lstUser.First().ActivationStatus == Domain.Socioboard.Enum.SBUserActivationStatus.Active)
                    {
                        return Ok(lstUser.First());
                    }
                    else
                    {
                        return Ok("Account not activated.");
                    }
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


        /// <summary>
        /// To check EmailId exist or not.
        /// </summary>
        /// <param name="Email">Email id of user</param>
        /// <returns>Success: if EmailId exist in db,Failure: if EmailId does not exist in db</returns>
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


        /// <summary>
        /// To get the user datails.
        /// </summary>
        /// <param name="Id">id of the user </param>
        /// <returns>
        /// 1. success: if the user id is exist in db.
        /// 2. failure: if user id does not exist in db
        /// </returns>
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

        [HttpGet("GetUserData")]
        public IActionResult GetUserData(string emailId)
        {
            DatabaseRepository dbr = new Model.DatabaseRepository(_logger,_appEnv);
            User user = dbr.Single<User>(t => t.EmailId == emailId);
            if(user!=null)
            {
                return Ok(user);
            }
            else
            {
                return NotFound();
            }
        }


        /// <summary>
        /// For varifying the emailId after registration
        /// </summary>
        /// <param name="Id"> Id of the user</param>
        /// <param name="Token">Generated token id after registration </param>
        /// <returns>Account Activated:if token id exist in user db 
        /// Failed to Activate:if user details does not update.
        /// Link Expired:if user does not activate his account in a given expire time.
        /// Wrong Link:when user use false link or unautorize link.
        /// </returns>
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
                        if (user.PayPalAccountStatus!=Domain.Socioboard.Enum.PayPalAccountStatus.added)
                        {
                            user.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.inprogress; 
                        }
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


        [HttpGet("ResendMail")]
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
                    string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\registrationmail.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", user.FirstName);
                    html = html.Replace("[AccountType]", user.AccountType.ToString());
                    html = html.Replace("[ActivationLink]", "http://localhost:9821/Home/Active?Token=" + user.EmailValidateToken + "&id=" + user.Id);


                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", user.EmailId, "", "", "Socioboard Email conformation Link", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);

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


        /// <summary>
        /// To validate the access token before login facebook
        /// </summary>
        /// <param name="AccessToken">Code obtained after successfull authentication from facebook.</param>
        /// <returns>Success:added su</returns>
        [HttpPost("FacebookLogin")]
        public IActionResult FacebookLogin(string AccessToken , Domain.Socioboard.Enum.SBAccountType accType)
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
                    DateTime d1 = DateTime.UtcNow;
                    //User userTable = dbr.Single<User>(t => t.EmailId == EmailId);
                    //userTable.LastLoginTime = d1;
                    lstUser.First().LastLoginTime = d1;
                    dbr.Update<User>(lstUser.First());
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
                    if (accType == Domain.Socioboard.Enum.SBAccountType.Free)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Deluxe;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Premium)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Premium;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Topaz;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Platinum;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Gold)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Gold;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Ruby;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Standard)
                    {
                        user.AccountType = Domain.Socioboard.Enum.SBAccountType.Standard;

                    }
                   
                    user.ActivationStatus = Domain.Socioboard.Enum.SBUserActivationStatus.Active;
                    user.CreateDate = DateTime.UtcNow;
                    user.EmailId = EmailId;
                    user.ExpiryDate = DateTime.UtcNow.AddDays(1);
                    user.PaymentType = Domain.Socioboard.Enum.PaymentType.paypal;
                    user.UserName = "Socioboard";
                    user.EmailValidateToken = "Facebook";
                    try
                    {
                        user.ProfilePicUrl = "https://graph.facebook.com/" + Convert.ToString(profile["id"]) + "/picture?type=small";
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


        /// <summary>
        /// To count the user profiles .
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns></returns>
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
                    else
                    {
                        user.UserName = userName;
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
                    imgPath = _appEnv.WebRootPath + "\\upload" + $@"\{Domain.Socioboard.Helpers.SBHelper.RandomString(11) + '.' + fileName.Split('.')[1]}";
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


        /// <summary>
        /// To change the password when user request it.
        /// </summary>
        /// <param name="userId">id of the user</param>
        /// <param name="currentPassword">password which is using currently</param>
        /// <param name="newPassword">A new password given by the user</param>
        /// <param name="conformPassword">confirm password </param>
        /// <returns></returns>
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
                //return Unauthorized();
                return BadRequest("Please Follow The Password Policy One Capital letter, One Small letter, One number, One special character and min lenght must be 8");
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


        /// <summary>
        /// To send the mail to user :for reseting the password when user forgot it and request for change.
        /// </summary>
        /// <param name="emailId">User email id</param>
        /// <returns>Eemail sent successfully:when email id existin db,
        /// Emaild does not exist or falil to send:email does not exist in db
        /// </returns>
        [HttpPost("ForgotPasswordSendMail")]
        public IActionResult ForgotPasswordSendMail(string emailId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = null;
            try
            {
                user = dbr.Single<User>(t => t.EmailId.Equals(emailId));
            }
            catch (Exception ex)
            {
            }
            if (user != null)
            {
                if (user.EmailValidateToken.Equals("Facebook"))
                {
                    return Ok("you can login wiht facebook.");
                }
                else if (user.EmailValidateToken.Equals("Google"))
                {
                    return Ok("you can login wiht Google.");
                }
                user.forgotPasswordKeyToken = SBHelper.RandomString(20);
                user.forgotPasswordExpireDate = DateTime.UtcNow.AddDays(1);
                user.EmailId = emailId;
                user.Id = user.Id;

                int result = dbr.Update<Domain.Socioboard.Models.User>(user);

                if (result == 1)
                {
                    try
                    {
                        string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\forogtPassword.html";
                        string html = System.IO.File.ReadAllText(path);
                        html = html.Replace("[FirstName]", user.FirstName);
                        html = html.Replace("[AccountType]", user.AccountType.ToString());
                        html = html.Replace("[ActivationLink]", _appSettings.Domain + "/Home/ForgotPassword?Token=" + user.forgotPasswordKeyToken + "&emailId=" + user.EmailId);

                        _emailSender.SendMailSendGrid(_appSettings.frommail, "", user.EmailId, "", "", "You requested for reset password of your account", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
                        

                    }
                    catch (Exception ex)
                    {

                    }
                    return Ok("Mail Sent Successfully.");
                }
                else
                {
                    return Ok("Failed to send mail.");
                }
            }
            else
            {
                return Ok("EmailId does not exist");
            }
        }


        /// <summary>
        /// To validate the tokenId after getting forgot password mail.
        /// </summary>
        /// <param name="emailId">User email id</param>
        /// <param name="accessToken">Forgot token id </param>
        /// <returns>You can change the password:when tokane validate successfully.
        /// Link expired:when user does not change the password for given period. 
        /// Wrong link: when user use unauthorize link
        /// Email Id does not exist: When email id does not exist in db.
        /// </returns>
        [HttpPost("ValidateforgotpwdToken")]
        public IActionResult validateforgotpwdToken(string emailId, string accessToken)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = null;
            try
            {
                user = dbr.Single<User>(t => t.EmailId == emailId);
            }
            catch (Exception ex)
            {
            }
            if (user != null)
            {
                if (user.forgotPasswordKeyToken.Equals(accessToken))
                {
                    if (user.forgotPasswordExpireDate >= DateTime.UtcNow)
                    {
                        return Ok("You can change the password");
                    }
                    else
                    {
                        return Ok("Link Expired.");
                    }

                }
                else
                {
                    return Ok("Wrong Link");
                }
            }
            else
            {
                return Ok("EmailId does not exist");
            }
        }


        /// <summary>
        /// sending mail to user after reseting the password.
        /// </summary>
        /// <param name="emailId">User email id </param>
        /// <param name="changePassword">changed password</param>
        /// <param name="token">Forgot password token</param>
        /// <returns>Password changed successfully:if user data present in db and validate token.
        /// EmailId does not exist:when user emailid does not exist
        /// </returns>
        [HttpPost("ResetPasswordMail")]
        public IActionResult ResetPasswordMail(string emailId, string changePassword, string token)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User user = null;
            try
            {
                user = dbr.Single<User>(t => t.EmailId == emailId);
            }
            catch
            { }

            if (user != null)
            {
                if (user.forgotPasswordKeyToken.Equals(token))
                {
                    user.Password = SBHelper.MD5Hash(changePassword);
                    int res = dbr.Update<User>(user);
                    if (res == 1)
                    {
                        return Ok("Password changed successfully");
                    }
                    else
                    {
                        return BadRequest("error while updating password, pls try after some time.");
                    }
                }
                else
                {
                    return Ok("wrong link");
                }

            }
            else
            {
                return Ok("EmailId does not exist");
            }
        }

        /// <summary>
        /// when user request for demo enterprise. 
        /// </summary>
        /// <param name="demoRequest">user data for demo enterprise</param>
        /// <returns>EmailId exist: if user already resisterd.
        /// Mail Sent Successfully:if mail sent successfully to user given mailid.
        /// Demo requested added:if successfully added the user for demo enterprise
        /// </returns>
        [HttpPost("DemoRequest")]
        public IActionResult DemoRequest(DemoRequest demoRequest)
        {


            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<DemoRequest> lstUser = dbr.Find<DemoRequest>(t => t.emailId.Equals(demoRequest.emailId));
            if (lstUser != null && lstUser.Count() > 0)
            {
                return BadRequest("EmailId Exist");
            }
            int SavedStatus = dbr.Add<Domain.Socioboard.Models.DemoRequest>(demoRequest);

            if (SavedStatus == 1 && demoRequest != null)
            {

                try
                {
                    string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\plan.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", demoRequest.firstName);
                    html = html.Replace("[AccountType]", demoRequest.demoPlanType.ToString());

                    //_emailSender.SendMail("", "", demoRequest.emailId, "", "", "You requested for Demo plan", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
                    //Mailforsocioboard(demoRequest);
                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", demoRequest.emailId, "", "", "You requested for Demo plan", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
                    Mailforsocioboard(demoRequest);
                    return Ok("Demo Requested Added");
                    // return Ok("Mail Sent Successfully.");
                }
                catch(Exception ex)
                {
                    return Ok("Issue while sending mail.");
                }
            }
            else
            {
                return Ok("problem while saving,pls try after some time");
            }
            
        }

        [HttpPost("SendAgencyMail")]
        public IActionResult SendAgencyMail(DemoRequest demoRequest)
        {
            string ret = string.Empty;
            string tomail = _appSettings.ZohoMailUserName;
            
            string subject = "Socioboard Agency";
            string Body = "Name: " + demoRequest.firstName + "" + demoRequest.lastName + "</br>" + "Email: " + demoRequest.emailId + "</br>" + "Company: " + demoRequest.company + "</br>" + "Message: " + demoRequest.message + "</br>" + "Phone: " + demoRequest.phoneNumber + "</br>";
            
            try
            {
                ret = _emailSender.SendMail(tomail, "", tomail, "", "", subject, Body, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
            }
            catch (Exception ex)
            {
                _logger.LogError("MailSender = > " + ex.StackTrace);
                _logger.LogError("MailSender = > " + ex.Message);
            }
         
            return Ok();
        }


        [HttpPost("demoReq")]
        public ActionResult Mailforsocioboard(DemoRequest demoRequest)
        {
            //string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\registrationmail.html";
            //string html = System.IO.File.ReadAllText(path);
            //html = html.Replace("[FirstName]", demoReq.firstName);
            //html = html.Replace("[AccountType]", demoReq.demoPlanType.ToString());
            string Body = "Name: " + demoRequest.firstName + "" + demoRequest.lastName + "</br>" + "Email: " + demoRequest.emailId + "</br>" + "Company: " + demoRequest.company + "</br>" + "Message: " + demoRequest.message + "</br>" + "Phone: " + demoRequest.phoneNumber + "</br>";
            //  _emailSender.SendMail("", "", _appSettings.frommail, "",_appSettings.ccmail, "Customer requested for demo enterprise plan ", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
            _emailSender.SendMailSendGrid(_appSettings.frommail, "", _appSettings.frommail, "", _appSettings.ccmail, "Customer requested for demo enterprise plan ", Body, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
            return Ok("Mail Sent Successfully.");
           
        }


        [HttpPost("UpdateFreeUser")]
        public IActionResult UpdateFreeUser(string userId)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            User _user = dbr.Single<User>(t => t.Id == Convert.ToInt64(userId));
            if (_user != null)
            {
                _user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                _user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                _user.Id = Convert.ToInt64(userId);
                dbr.Update<User>(_user);
            }
            return Ok(_user);
        }

        [HttpPost("UpdateTrialStatus")]
        public IActionResult UpdateTrialStatus(Int64 Id)
        {
            Model.DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            User _user = dbr.Single<User>(t => t.Id == Id);
            if(_user!=null)
            {
                _user.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.inactive;
                _user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                dbr.Update<User>(_user);
            }
            return Ok(_user);
        }


    }
}
