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
    public class ImgLibraryController : Controller
    {
        public ImgLibraryController(ILogger<ImgLibraryController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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

         //Ads verfication

        [HttpPost("SaveImageforPrivate")]
        public IActionResult SaveImageforPrivate(long userId,string imgName, IFormFile files)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                double imgsize = dbr.Find<Domain.Socioboard.Models.ImgLibrary>(t => t.UserId == userId).Sum(t => t.ImageSize);
                if(imgsize <= 20971520)
                {
                    long imglength = 0;
                    var filename = "";
                    var apiimgPath = "";
                    var uploads = string.Empty;
                    string imgPath = string.Empty;
                    string imagePath = string.Empty;
                    string localpath = string.Empty;
                    string extension = string.Empty;
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
                            filename = _env.WebRootPath + "\\upload\\UserImages" + $@"\{tempName}";
                            localpath = filename;
                            imgPath = filename;
                            uploads = _appSettings.ApiDomain + "/api/Media/getUserImages?id=" + $@"{tempName}";
                            extension = Path.GetExtension(fileName).ToUpper();
                            if (extension != ".JFIF" && extension != ".JPG" && extension != ".JPEG" && extension != ".Exif" && extension != ".GIF" && extension != ".TIFF" && extension != ".PNG" && extension != ".PPM" && extension != ".BMP" && extension != ".PGM" && extension != ".PBM" && extension != ".PNM")
                            {
                                return BadRequest("Please select only image file");
                            }
                            //imglength = new System.IO.FileInfo(filenameforlength).Length;
                            // size += file.Length;
                            try
                            {
                                using (FileStream fs = System.IO.File.Create(filename))
                                {
                                    files.CopyTo(fs);
                                    fs.Flush();
                                }
                                imglength = new System.IO.FileInfo(filename).Length;
                                double totallength = imgsize + imglength;
                                if(totallength > 20971520)
                                {
                                    return BadRequest("You have reached maximum library sapce");
                                }
                                filename = uploads;
                                // long imglength = new System.IO.FileInfo(imagelocalPath).Length;
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
                    Domain.Socioboard.Models.ImgLibrary lstImglibrary = new ImgLibrary();
                    //long len = (new System.IO.FileInfo(filename)).Length;
                    lstImglibrary.UserId = userId;
                    lstImglibrary.ImageName = imgName;
                    lstImglibrary.ImagePath = filename;
                    lstImglibrary.ImageSize = imglength;
                    lstImglibrary.Imageuploadeddate = DateTime.UtcNow;
                    lstImglibrary.Tags = "";
                    lstImglibrary.FolderType = "Private";
                    lstImglibrary.LocalImagePath = localpath;
                    lstImglibrary.Fileextension = extension;
                    int SavedStatus = dbr.Add<Domain.Socioboard.Models.ImgLibrary>(lstImglibrary);
                    if (SavedStatus == 1)
                    {
                        return Ok("Image saved successfully");
                    }
                    else
                    {
                        return BadRequest("Something went wrong");
                    }
                }
                else
                {
                    return BadRequest("You have reached maximum library sapce");
                }
                
            }
            catch(Exception ex)
            {
                return BadRequest("Something went wrong");
            }
           


            
        }

        [HttpPost("SaveImageForPublic")]
        public IActionResult SaveImageForPublic(long userId, string imgName, IFormFile files)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                double imgsize = dbr.Find<Domain.Socioboard.Models.ImgLibrary>(t => t.UserId == userId).Sum(t => t.ImageSize);
                if(imgsize <= 20971520)
                {
                    long imglength = 0;
                    var filename = "";
                    var apiimgPath = "";
                    var uploads = string.Empty;
                    string imgPath = string.Empty;
                    string imagePath = string.Empty;
                    string localpath = string.Empty;
                    string extension= string.Empty;
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
                            filename = _env.WebRootPath + "\\upload\\UserImages" + $@"\{tempName}";
                            localpath = filename;
                            imgPath = filename;
                            uploads = _appSettings.ApiDomain + "/api/Media/getUserImages?id=" + $@"{tempName}";
                            //imglength = new System.IO.FileInfo(filenameforlength).Length;
                            // size += file.Length;
                            extension = Path.GetExtension(fileName).ToUpper();
                            if (extension != ".JFIF" && extension != ".JPG" && extension != ".JPEG" && extension != ".Exif" && extension != ".GIF" && extension != ".TIFF" && extension != ".PNG" && extension != ".PPM" && extension != ".BMP" && extension != ".PGM" && extension != ".PBM" && extension != ".PNM")
                            {
                                return BadRequest("Please select only image file");
                            }
                            try
                            {
                                using (FileStream fs = System.IO.File.Create(filename))
                                {
                                    files.CopyTo(fs);
                                    fs.Flush();
                                }
                                imglength = new System.IO.FileInfo(filename).Length;
                                double totallength = imgsize + imglength;
                                if (totallength > 20971520)
                                {
                                    return BadRequest("You have reached maximum library sapce");
                                }
                                filename = uploads;
                                // long imglength = new System.IO.FileInfo(imagelocalPath).Length;
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
                    Domain.Socioboard.Models.ImgLibrary lstImglibrary = new ImgLibrary();
                    //DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                    //long len = (new System.IO.FileInfo(filename)).Length;
                    lstImglibrary.UserId = userId;
                    lstImglibrary.ImageName = imgName;
                    lstImglibrary.ImagePath = filename;
                    lstImglibrary.ImageSize = imglength;
                    lstImglibrary.Imageuploadeddate = DateTime.UtcNow;
                    lstImglibrary.Tags = "";
                    lstImglibrary.FolderType = "Public";
                    lstImglibrary.LocalImagePath = localpath;
                    lstImglibrary.Fileextension = extension;
                    int SavedStatus = dbr.Add<Domain.Socioboard.Models.ImgLibrary>(lstImglibrary);
                    if (SavedStatus == 1)
                    {
                        return Ok("Image saved successfully");
                    }
                    else
                    {
                        return BadRequest("Something went wrong");
                    }
                }
               
                else
                {
                    return BadRequest("You have reached maximum library sapce");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong");
            }
            


        }

        [HttpPost("DeleteImage")]
        public IActionResult DeleteImage(long userId, long imgid)
        {
            try
            {
                Domain.Socioboard.Models.ImgLibrary Imglibrary = new ImgLibrary();
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                ImgLibrary lstImages = dbr.Single<ImgLibrary>(t => t.UserId == userId && t.Id==imgid);
                System.IO.File.Delete(lstImages.LocalImagePath);
                dbr.Delete<Domain.Socioboard.Models.ImgLibrary>(lstImages);
                return Ok("Deleted");
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong please try after sometime");
            }

            // return Ok();
        }

        [HttpGet("LoadImagesForPublic")]
        public IActionResult LoadImagesForPublic(long groupId, long userId)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                Groupmembers grpadmin = dbr.Single<Groupmembers>(t => t.groupid == groupId && t.isAdmin == true);
                List<ImgLibrary> lstImages = dbr.Find<ImgLibrary>(t => t.UserId == grpadmin.userId && t.FolderType == "Public").ToList();
                if (lstImages != null)
                {
                    return Ok(lstImages);
                }
                else
                {
                    return NotFound();
                }
            }
            catch(Exception ex)
            {
                return NotFound();
            }
           

        }

        [HttpGet("LoadImagesForPrivate")]
        public IActionResult LoadImagesForPrivate(long userid)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<ImgLibrary> lstImages = dbr.Find<ImgLibrary>(t => t.UserId == userid && t.FolderType == "Private").ToList();
                if (lstImages != null)
                {
                    return Ok(lstImages);
                }
                else
                {
                    return NotFound();
                }
            }
            catch(Exception ex)
            {
                return NotFound();
            }
            

        }

        [HttpGet("Totalimagesize")]
        public IActionResult Totalimagesize(long userid)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<maxsize> _maxsize = new List<maxsize>();
                double imgsize = dbr.Find<Domain.Socioboard.Models.ImgLibrary>(t => t.UserId == userid).Sum(t => t.ImageSize) / 1024;
                if (imgsize < 1024)
                {
                    Domain.Socioboard.Models.maxsize _imgsize = new maxsize();
                    string totalimgSize = Convert.ToString(Math.Round(imgsize, 2)) + "KB";
                    _imgsize.max = 20971520;
                    _imgsize.totalinbytes = imgsize;
                    _imgsize.totalsize = totalimgSize;
                    _maxsize.Add(_imgsize);
                    return Ok(_maxsize);
                }
                else
                {
                    Domain.Socioboard.Models.maxsize _imgsize = new maxsize();
                    double img = imgsize / 1024;
                    string totalimgSize = Convert.ToString(Math.Round(img, 2)) + "MB";
                    _imgsize.max = 20971520;
                    _imgsize.totalinbytes = imgsize;
                    _imgsize.totalsize = totalimgSize;
                    _maxsize.Add(_imgsize);
                    return Ok(_maxsize);
                }
            }
            catch(Exception ex)
            {
                return BadRequest();
            }
            
           

        }
    }
}
