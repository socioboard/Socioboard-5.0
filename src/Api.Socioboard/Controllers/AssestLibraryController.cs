using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using System.Xml;
using System.Text.RegularExpressions;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using Domain.Socioboard.Models;
using Microsoft.AspNetCore.Http;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AssestLibraryController : Controller
    {
        public AssestLibraryController(ILogger<AssestLibraryController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

         //Ads verfication

        [HttpPost("SaveImage")]
        public IActionResult SaveImage(long userId,string imgName, IFormFile files)
        {

            var filename = "";
            var apiimgPath = "";
            var uploads = string.Empty;
            string imgPath = string.Empty;
            string imagePath= string.Empty;
            if (files != null)
            {

                if (files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    var tempName = Domain.Socioboard.Helpers.SBHelper.RandomString(10) + '.' + fileName.Split('.')[1];
                    //apiimgPath = _appSettings.ApiDomain + "/api/Media/get?id=" + $@"{tempName}";

                    filename = _env.WebRootPath + "\\upload\\UserImages" + $@"\{tempName}";
                    imgPath = filename;
                    uploads = _appSettings.ApiDomain + "/api/Media/getUserImages?id=" + $@"{tempName}";
                    // size += file.Length;
                    try
                    {
                        using (FileStream fs = System.IO.File.Create(filename))
                        {
                            files.CopyTo(fs);
                            fs.Flush();
                        }
                        filename = uploads;
                        long length = new System.IO.FileInfo(fileName).Length;
                    }
                    catch (System.Exception ex)
                    {
                        if (!string.IsNullOrEmpty(imagePath))
                        {
                            uploads = imagePath;
                        }
                    }

                }
            }
            else 
            {
            }
            Domain.Socioboard.Models.AssestLibrary Imglibrary = new AssestLibrary();
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            //long len = (new System.IO.FileInfo(filename)).Length;
            Imglibrary.UserId = userId;
            Imglibrary.ImageName = imgName;
            Imglibrary.ImagePath = filename;
            Imglibrary.ImageSize = 25;
            Imglibrary.Imageuploadeddate = DateTime.UtcNow;
            int SavedStatus = dbr.Add<Domain.Socioboard.Models.AssestLibrary>(Imglibrary);
            if(SavedStatus==1)
            {
                return Ok("Image saved successfully");
            }
            else
            {
                return BadRequest("Something went wrong");
            }


            
        }

        [HttpPost("DeleteImage")]
        public IActionResult DeleteImage(long userId, long imgid)
        {
            try
            {
                Domain.Socioboard.Models.AssestLibrary Imglibrary = new AssestLibrary();
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                AssestLibrary lstImages = dbr.Single<AssestLibrary>(t => t.UserId == userId && t.Id==imgid);
                dbr.Delete<Domain.Socioboard.Models.AssestLibrary>(lstImages);
                return Ok("Deleted");
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong please try after sometime");
            }

            // return Ok();
        }

        [HttpGet("LoadImages")]
        public IActionResult LoadImages(long userid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<AssestLibrary> lstImages = dbr.Find<AssestLibrary>(t => t.UserId == userid).ToList();
            if (lstImages != null)
            {
                return Ok(lstImages);
            }
            else
            {
                return NotFound();
            }

        }
    }
}
