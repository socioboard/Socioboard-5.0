using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;

//using System.Web.Script.Serialization;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers.Admin
{

    public class AdminUserController : Controller
    {
        private Helpers.AppSettings _appSettings;
        public AdminUserController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public async Task<IActionResult> ManageUser()
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUserAdmin", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                }
                ViewBag.details = user;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("ManageUser");
            }


            //return Json(user);

        }

        public async Task<IActionResult> DeletedUser()
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetDeletedUserAdmin", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                }
                ViewBag.details = user;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("DeletedUser");
            }

            //return Json(user);

        }
        public async Task<IActionResult> DeleteUser(long Id)
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                bool result = false;
                int deletemessage = 0;

                List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();

                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/DeleteUserAdmin?Id=" + Id, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                }
                if (result == true)
                {
                    deletemessage = 1;
                }

                return View("ManageUser");
            }

        }

    }
}
