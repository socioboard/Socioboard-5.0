using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Socioboard.LinkedIn.Authentication;
using System.Text.RegularExpressions;
using MongoDB.Driver;
using System.Collections.Specialized;
using Api.Socioboard.Helper;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class LinkedInController : Controller
    {
        public LinkedInController(ILogger<LinkedInController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        /// <summary>
        /// Add new Linkedin Account
        /// </summary>
        /// <param name="Code"> Code obtained after successfull authentication from facebook. </param>
        /// <param name="groupId"> Id of the group to which account is to be added. </param>
        /// <param name="userId"> Id of the user. </param>
        /// <remarks>Add new Linkedin account.</remarks>
        /// <response code="400">Invalid Access Token.</response>
        /// <response code="500">Internal Server Erro.r</response>
        [HttpPost("AddLinkedInAccount")]
        public IActionResult AddLinkedInAccount(string Code, long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string accesstoken = Helper.LinkedInHelper.GetAccessToken(Code, _appSettings);
            if (!string.IsNullOrEmpty(accesstoken))
            {
                oAuthLinkedIn _oauth = new oAuthLinkedIn();
                _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                _oauth.Token = accesstoken;
                dynamic profile = Helper.LinkedInHelper.getLinkedInProfile(_oauth);
                string linkedinId = profile.id.ToString();
                Domain.Socioboard.Models.LinkedInAccount linaccount = Repositories.LinkedInAccountRepository.getLinkedInAccount(linkedinId, _redisCache, dbr);
                if (linaccount != null && linaccount.IsActive == true)
                {
                    if (linaccount.UserId == userId)
                    {
                      
                      
                        return BadRequest("LinkedIn account already added by you.");
                       
                    }
                    return BadRequest("LinkedIn account added by other user.");
                }
                else
                {
                    Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
                    if (ngrp == null)
                    {
                        return Ok("Wrong Group Id");
                    }
                    int i = Repositories.LinkedInAccountRepository.AddLinkedInAccount(_oauth, profile, dbr, userId, groupId, accesstoken, _redisCache, _appSettings, _logger);
                    if (i == 1)
                    {
                        return Ok("LinkedIn Added Successfully");
                    }
                    else
                    {
                        return BadRequest("Error while Adding Account");
                    }
                }
            }
            else
            {
                return Ok("Issue In Fetching Access Token");
            }
            
        }


        [HttpGet("GetLinkedInCompanyPagesProfiles")]
        public IActionResult GetLinkedInCompanyPagesProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.LinkedinCompanyPage> lstInsAcc = new List<Domain.Socioboard.Models.LinkedinCompanyPage>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage))
            {
                Domain.Socioboard.Models.LinkedinCompanyPage insAcc = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpGet("GetLinkedAccountProfiles")]
        public IActionResult GetLinkedAccountProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.LinkedInAccount> lstInsAcc = new List<Domain.Socioboard.Models.LinkedInAccount>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn))
            {
                Domain.Socioboard.Models.LinkedInAccount insAcc = Repositories.LinkedInAccountRepository.getLinkedInAccount(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpGet("GetAllLinkedAccountProfiles")]
        public IActionResult GetAllLinkedAccountProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.LinkedInAccount> lstInsAcc = new List<Domain.Socioboard.Models.LinkedInAccount>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn))
            {
                Domain.Socioboard.Models.LinkedInAccount insAcc = Repositories.LinkedInAccountRepository.getLinkedInAccount(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpGet("GetAllLinkedInCompanyPagesProfiles")]
        public IActionResult GetAllLinkedInCompanyPagesProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.LinkedinCompanyPage> lstInsAcc = new List<Domain.Socioboard.Models.LinkedinCompanyPage>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage))
            {
                Domain.Socioboard.Models.LinkedinCompanyPage insAcc = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(item.profileId, _redisCache, dbr);
                if (insAcc != null)
                {
                    lstInsAcc.Add(insAcc);
                }
            }
            return Ok(lstInsAcc);
        }

        [HttpPost("GetLinkedInCompanyPages")]
        public IActionResult GetLinkedInCompanyPages(string Code, long groupId, long userId)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Domain.Socioboard.Models.AddlinkedinCompanyPage> lstcompanypages = Helper.LinkedInHelper.GetLinkedinCompanyPage(Code, _appSettings);
                List<Domain.Socioboard.Models.Groupprofiles> lstgroupprofile = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
                lstgroupprofile = lstgroupprofile.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage).ToList();
                string[] lstStr = lstgroupprofile.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                {
                    lstcompanypages.Where(t => lstStr.Contains(t.PageId)).Select(s => { s.connected = 1; return s; }).ToList();
                }
                return Ok(lstcompanypages);
            }
            catch (Exception ex)
            {

                _logger.LogError("GetLinkedInCompanyPages" + ex.StackTrace);
                _logger.LogError("GetLinkedInCompanyPages" + ex.Message);
                return Ok(new List<Domain.Socioboard.Models.AddlinkedinCompanyPage>());
            }
        }

        [HttpPost("AddLinkedInPages")]
        public IActionResult AddLinkedInPages(long groupId, long userId)
        {
            string data = Request.Form["profileaccesstoken"];
            DatabaseRepository dbr = new DatabaseRepository(_logger,_env);
            string[] profiledata = null;
            int lstAddedAccounts = 0;
            int lstNotAddedAccounts = 0;
            ListDictionary listStatus = new ListDictionary();
            string i = "0";
            profiledata = data.Split(',');
            foreach (var item in profiledata)
            {
                string[] lindata = Regex.Split(item, "<:>");
                oAuthLinkedIn _oauth = new oAuthLinkedIn();
                _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                _oauth.Token = lindata[1];
                try
                {
                    dynamic profile = Helper.LinkedInHelper.GetCompanyPageData(_oauth, lindata[0]);
                    i = Repositories.LinkedInAccountRepository.AddLinkedInCompantPage(_oauth, profile, dbr, userId, groupId, lindata[1], _redisCache, _appSettings, _logger);

                    if(i== "added by other")
                    {
                        lstNotAddedAccounts++;
                    }
                    else
                    {
                        lstAddedAccounts++;
                    }
                }
                catch (Exception ex)
                {
                    return Ok("something went wrong while adding pages");
                }
                  
            }
            listStatus.Add("added", lstAddedAccounts);
            listStatus.Add("notadded", lstNotAddedAccounts);

            if (lstAddedAccounts != 0 && lstNotAddedAccounts == 0)
            {
                return Ok("LinkedIn Company Page Added Successfully");
            }
            else
            {
                return Ok(listStatus);
            }
        }


        /// <summary>
        /// Get feeds of a linkedin comany page profile  
        /// </summary>
        /// <param name="pageId"> Token obtained after successfull authentication from linked company page id. </param>
        /// <param name="userId"> Id of the user </param>
        /// <remarks>Insert new student</remarks>
        /// <response code="400">Invalid Access Token</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet("GetTopCompanyPagePosts")]
        public IActionResult GetTopCompanyPagePosts(string pageId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                DatabaseRepository dbr=new DatabaseRepository (_logger,_env);
                return Ok(Repositories.LinkedInAccountRepository.GetTopCompanyPagePosts(pageId, userId, _redisCache, _appSettings,dbr,skip,count));
            }
            else
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                MongoRepository _linkedincompanypagereppo = new MongoRepository("LinkedinCompanyPagePosts", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>.Sort;
                var sort = builder.Descending(t => t.PostDate);
                var ret = _linkedincompanypagereppo.FindWithRange<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>(t => t.PageId.Equals(pageId), sort, 0, 100);
                var task = Task.Run(async () => {
                    return await ret;
                });
                List<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts> lstCompanyPagePosts = task.Result.ToList();
                Domain.Socioboard.Models.LinkedInData _LinkedInData = new Domain.Socioboard.Models.LinkedInData();
                _LinkedInData._LinkedinCompanyPage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(pageId, _redisCache, dbr);
                _LinkedInData._LinkedinCompanyPagePosts = lstCompanyPagePosts;
                return Ok(_LinkedInData);
            }
            
        }

        [HttpGet("GetLinkdeinPagePostComment")]
        public IActionResult GetLinkdeinPagePostComment(string pageId, long userId, string updatekey, string OAuthToken)
        {
            oAuthLinkedIn _oAuthLinkedIn = new oAuthLinkedIn();
            _oAuthLinkedIn.ConsumerKey = _appSettings.LinkedinApiKey;
            _oAuthLinkedIn.ConsumerSecret = _appSettings.LinkedinSecretKey;
            _oAuthLinkedIn.Token = OAuthToken;
            List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment> lstLinkdeinPageComment = Repositories.LinkedInAccountRepository.GetLinkdeinPagePostComment(_oAuthLinkedIn, pageId, updatekey);
            return Ok(lstLinkdeinPageComment);
        }

        [HttpPost("PostCommentOnLinkedinCompanyPage")]
        public IActionResult PostCommentOnLinkedinCompanyPage(string pageId,long userId,string updatekey,string comment)
        {
            string postmessage = "";
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            comment = comment.Replace("hhh", "#").Replace("nnn", "&");
            string[] updatedmessgae = Regex.Split(comment, "<br>");
            foreach (var item in updatedmessgae)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.Contains("https://") || item.Contains("http://"))
                    {
                        try
                        {
                            comment = "http" + Utility.getBetween(item, "http", " ");
                            try
                            {
                                comment = comment.Split(' ')[0].ToString();
                            }
                            catch (Exception)
                            {

                                comment = "http" + Utility.getBetween(item, "http", " ");
                            }
                        }
                        catch
                        {
                            string temp_item = item + "###";
                            comment = "http" + Utility.getBetween(temp_item, "http", "###");
                            try
                            {
                                comment = comment.Split(' ')[0].ToString();
                            }
                            catch (Exception)
                            {

                                comment = "http" + Utility.getBetween(temp_item, "http", "###");
                            }
                        }
                    }
                    if (item.Contains("hhh"))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + "\n\r" + item.Replace("hhh", "#");
                        }
                    }
                    else
                    {
                        //postmessage = postmessage + "\n\r" + item;
                    }
                    if(item.Contains("nnn"))
                    {
                        postmessage = postmessage + "\n\r" + item.Replace("nnn", "&");
                    }
                    else
                    {
                        //postmessage = postmessage + "\n\r" + item;
                    }
                    postmessage = postmessage + "\n\r" + item;


                }
                
            }
            try
            {
                //comment = "";
                //updatedtext = postmessage.Replace(url, "");
                // updatedtext = postmessage;
                comment = postmessage;
            }
            catch (Exception ex)
            {
                comment = postmessage;
            }
            string postdata = Repositories.LinkedInAccountRepository.PostCommentOnLinkedinCompanyPage(pageId, updatekey, comment, userId, _redisCache, _appSettings, dbr);
            return Ok(postdata);
        }

    }
}
