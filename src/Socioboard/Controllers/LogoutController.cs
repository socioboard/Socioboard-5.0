using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using System.Net.Http;
using Socioboard.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class LogoutController : Controller
    {

        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _appEnv;
        public LogoutController(ILogger<LogoutController> logger, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
            _appEnv = appEnv;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }


        [ResponseCache(Duration = 100)]
        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("User");
            HttpContext.Session.Remove("selectedGroupId");
            // await Task.Run(() =>
            // {
            //     logoutsessiondata();
            // }
            //);
            // Task.Run(logoutsessiondata);
             logoutsessiondata();
            //await logoutsessiondata();
            HttpContext.Session.Clear();
            ViewBag.user = null;
            ViewBag.selectedGroupId = null;
            ViewBag.groupProfiles = null;

            return Content("logout");
            // return RedirectToAction("Index", "Index");
        }

        private async Task logoutsessiondata()
        {
            Domain.Socioboard.Models.SessionHistory session = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.SessionHistory>("revokedata");
            if (session != null)
            {
                List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
                Param.Add(new KeyValuePair<string, string>("systemId", session.systemId));
                Param.Add(new KeyValuePair<string, string>("sessionId", session.id.ToString()));
                HttpResponseMessage respon = await WebApiReq.PostReq("/api/User/RevokeSession", Param, "", "", _appSettings.ApiDomain);
                if (respon.IsSuccessStatusCode)
                {
                    HttpContext.Session.Remove("revokedata");
                }
            }
        }
    }
}
