using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using System.Net.Http;
using Domain.Socioboard.Helpers;
using Socioboard.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class LogoutController : Controller
    {

        private readonly AppSettings _appSettings;

        public LogoutController(Microsoft.Extensions.Options.IOptions<AppSettings> settings)
        {
            _appSettings = settings.Value;
        }



        // [ResponseCache(Duration = 100)]
        [HttpGet]
        public IActionResult Logout()
        {
            try
            {
                HttpContext.Session.Remove("User");
                HttpContext.Session.Remove("selectedGroupId");
                HttpContext.Session.SetObjectAsJson("User", null);
                HttpContext.Session.SetObjectAsJson("selectedGroupId", null);
                CustomTaskFactory.Instance.Start(async () => { await LogoutSession(); });
                HttpContext.Session.Clear();
                ViewBag.user = null;
                ViewBag.selectedGroupId = null;
                ViewBag.groupProfiles = null;
                return Content("logout");
            }
            catch (Exception)
            {
                HttpContext.Session.SetObjectAsJson("User", null);
                HttpContext.Session.SetObjectAsJson("selectedGroupId", null);
                HttpContext.Session.Clear();
                ViewBag.user = null;
                ViewBag.selectedGroupId = null;
                ViewBag.groupProfiles = null;
                return Content("logout");
            }
        }

        private async Task LogoutSession()
        {
            var session = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.SessionHistory>("revokedata");

            if (session != null)
            {
                var param = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("systemId", session.systemId),
                    new KeyValuePair<string, string>("sessionId", session.id.ToString())
                };

                var response = await WebApiReq.PostReq("/api/User/RevokeSession", param, "", "", _appSettings.ApiDomain);

                if (response.IsSuccessStatusCode)
                    HttpContext.Session.Remove("revokedata");                
            }
        }
    }
}
