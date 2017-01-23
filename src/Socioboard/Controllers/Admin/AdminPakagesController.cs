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
    public class AdminPakagesController : Controller
    {
        private Helpers.AppSettings _appSettings;
        public AdminPakagesController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public async Task<IActionResult> Getpackages()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.Package> package = new List<Domain.Socioboard.Models.Package>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetPackageAdmin", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    package = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Package>>();

                }
                ViewBag.details = package;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("ManagePackage");
            }
           
            //return Json(user);

        }
    }
}
