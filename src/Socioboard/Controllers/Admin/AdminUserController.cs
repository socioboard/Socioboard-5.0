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
        public static int j = 0;
        // public static int k = 0;
        public static int count = 0;
        private Helpers.AppSettings _appSettings;
        public AdminUserController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public async Task<IActionResult> ManageUser(string param)
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
               Domain.Socioboard.Models.UserDetails user = new Domain.Socioboard.Models.UserDetails();
               if(param==null)
                {
                   if (j==0)
                    {
                        try
                        {
                            HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUserAdmin?value=" + 0, "", "", _appSettings.ApiDomain);
                            if (response.IsSuccessStatusCode)
                            {
                                user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.UserDetails>();
                            }
                            //count = 100;
                            //j = j + 500;
                            // ViewBag.Count = user.Count();
                            ViewBag.TotalCount = user.count;
                            ViewBag.Count = user._user.Count();
                            ViewBag.details = user._user;
                            ViewBag.ApiDomain = _appSettings.ApiDomain;
                            ViewBag.Domain = _appSettings.Domain;
                            return View("ManageUser");
                        }
                        catch (Exception ex)
                        {
                            return View("ManageUser");
                        }
                    }
                   else
                    {
                        HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUserAdmin?value=" + j, "", "", _appSettings.ApiDomain);
                         if (response.IsSuccessStatusCode)
                        {
                            user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.UserDetails>();
                        }
                        // j = j + 500;
                        ViewBag.details = user._user;
                        ViewBag.Count = user._user.Count() +j;
                        ViewBag.TotalCount = user.count;
                        ViewBag.ApiDomain = _appSettings.ApiDomain;
                        ViewBag.Domain = _appSettings.Domain;
                        return View("ManageUser");
                    }
                   
                }
               else if (param =="Next")
                {
                    j = j + 500;
                    return RedirectToAction("ManageUser");
                }
               else 
                {
                   
                    j = j - 500;
                    return RedirectToAction("ManageUser");
                }
               
                
                  
               
              

                //HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUserAdmin", "", "", _appSettings.ApiDomain);
                //if (response.IsSuccessStatusCode)
                //{
                //    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                //}
                //ViewBag.details = user;
                //ViewBag.ApiDomain = _appSettings.ApiDomain;
                //ViewBag.Domain = _appSettings.Domain;
                //return View("ManageUser");
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


        public async Task<IActionResult> DisabledUser()
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();
                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetDisabledUserAdmin", "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                }
                ViewBag.details = user;
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View("DisabledUser");
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

        public async Task<IActionResult> UndoUser(long Id)
        {
            Domain.Socioboard.Models.User _user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (_user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                bool result = false;
                int undomessage = 0;

                List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();

                HttpResponseMessage response = await WebApiReq.GetReq("/api/User/UndoUserAdmin?Id=" + Id, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

                }
                if (result == true)
                {
                    undomessage = 1;
                }

                return View("DeletedUser");
            }

        }



    }
}
