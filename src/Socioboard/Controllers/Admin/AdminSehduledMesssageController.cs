using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers.Admin
{
    public class AdminSehduledMesssageController : Controller
    {
        // GET: /<controller>/
        private Helpers.AppSettings _appSettings;
        public AdminSehduledMesssageController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public async Task<IActionResult> GetSchedulemessage()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.ScheduledMessageAdmin> schemsg = new List<Domain.Socioboard.Models.ScheduledMessageAdmin>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetSchedulemsgAdmin", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    schemsg = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.ScheduledMessageAdmin>>();

                }
                ViewBag.details = schemsg;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("AdminSehduledMesssage");
            }
           
            //return Json(user);

        }
    }
}
