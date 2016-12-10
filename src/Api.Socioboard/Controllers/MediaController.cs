using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using System.Drawing.Imaging;
using System.Reflection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using System.Net.Http.Headers;
using System.Drawing;
using System.Net;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class MediaController : Controller
    {

        public MediaController(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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
        

        public static ImageFormat GetImageFormat(string extension)
        {
            if (extension.ToLower().Equals("jpg"))
            {
                extension = "Jpeg";
            }
            ImageFormat result = null;
            PropertyInfo prop = typeof(ImageFormat).GetProperties().Where(p => p.Name.Equals(extension, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
            if (prop != null)
            {
                result = prop.GetValue(prop) as ImageFormat;
            }
            return result;
        }

     

        [HttpGet("Get")]
        public IActionResult Get(string id)
        {
            MemoryStream ms = null;
            //Limit access only to images folder at root level  
            string filePath = _appEnv.WebRootPath + string.Concat("/upload/", id);
            string extension = Path.GetExtension(id);
            if (System.IO.File.Exists(filePath))
            {
                if (!string.IsNullOrWhiteSpace(extension))
                {
                    extension = extension.Substring(extension.IndexOf(".") + 1);
                }

                //If requested file is an image than load file to memory  
                if (GetImageFormat(extension) != null)
                {
                    return Ok( new FileStream(filePath, FileMode.Open));

                    //ms = CopyFileToMemory(filePath);
                }
            }

           
            return BadRequest();
        }




    }
}
