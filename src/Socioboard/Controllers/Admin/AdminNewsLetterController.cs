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
    public class AdminNewsLetterController : Controller
    {
        private Helpers.AppSettings _appSettings;
        public AdminNewsLetterController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public ActionResult AddNewsLetter()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("NewsLetter");
            }
           
        }

        public async Task<IActionResult> GetNewsLetter()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.NewsLetter> newsletter = new List<Domain.Socioboard.Models.NewsLetter>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetNewsLetter", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    newsletter = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.NewsLetter>>();

                }
                ViewBag.details = newsletter;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("ManageNewsLetter");
            }

         

        }



    }
}
