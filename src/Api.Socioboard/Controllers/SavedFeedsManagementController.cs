using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Api.Socioboard.Repositories;
using Domain.Socioboard.Interfaces.Services;
using Domain.Socioboard.Models.Mongo;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class SavedFeedsManagementController : Controller
    {
        public SavedFeedsManagementController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
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


        [HttpPost("SavePost")]
        public IActionResult SavePost(SavedFeedsManagement objData, IFormFile files)
        {
            if (files != null)
            {
                objData.url = MediaHelper.UploadMedia(files, _appSettings, _appEnv);
            }
            bool status = SavedFeedsManagementRepository.SavePost(objData, _appSettings);
            return Ok(status);
        }

        [HttpPost("DeletePost")]
        public IActionResult DeletePost(string postId)
        {
            bool status = SavedFeedsManagementRepository.DeletePost(postId, _appSettings);
            return Ok(status);
        }

        [HttpPost("SaveComment")]
        public IActionResult SaveComment(SavedFeedsComments objData)
        {
            bool status = SavedFeedsManagementRepository.SaveComment(objData, _appSettings);
            return Ok(status);
        }

        [HttpPost("UpdateComment")]
        public IActionResult UpdateComment(string commentId, string updateText)
        {
            bool status = SavedFeedsManagementRepository.UpdateComment(commentId, updateText, _appSettings);
            return Ok(status);
        }
        [HttpPost("DeleteComment")]
        public IActionResult DeleteComment(string commentId)
        {
            bool status = SavedFeedsManagementRepository.DeleteComment(commentId, _appSettings);
            return Ok(status);
        }

        [HttpGet("GetSavedFeeds")]
        public IActionResult GetSavedFeeds(string profileId,long groupId)
        {
            return Ok(SavedFeedsManagementRepository.GetSavedFeeds(profileId, groupId, _appSettings));
        }

        [HttpGet("GetComments")]
        public IActionResult GetComments(string postId, long groupId)
        {
            return Ok(SavedFeedsManagementRepository.GetComments(postId, groupId, _appSettings));
        }
    }
}
