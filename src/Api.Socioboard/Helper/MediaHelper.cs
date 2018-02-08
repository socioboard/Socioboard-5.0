using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public class MediaHelper
    {
        public static string UploadMedia(IFormFile files, Helper.AppSettings _appSettings, IHostingEnvironment _appEnv)
        {
            var filename = string.Empty;
            var uploads = string.Empty;
            var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
            filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                    .Parse(files.ContentDisposition)
                    .FileName
                    .Trim('"');
            var tempName = Domain.Socioboard.Helpers.SBHelper.RandomString(10) + '.' + fileName.Split('.')[1];

            filename = _appEnv.WebRootPath + "\\upload" + $@"\{tempName}";
            uploads = _appSettings.ApiDomain + "/api/Media/get?id=" + $@"{tempName}";
            try
            {
                using (FileStream fs = System.IO.File.Create(filename))
                {
                    files.CopyTo(fs);
                    fs.Flush();
                }
                filename = uploads;
                return filename;
            }
            catch (System.Exception ex)
            {
                return null;
            }
        }
    }
}
