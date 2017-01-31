using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Socioboard.Controllers
{
    public class AdminHomeController : Controller
    {

        private Helpers.AppSettings _appSettings;
        public AdminHomeController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/
        public async Task<IActionResult> ManagePaidUser()
        {
            List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();
           

            HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetPaidUserAdmin", "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

            }
            List<Domain.Socioboard.Models.PiadUser> paidUser = new List<PiadUser>();
            string month = string.Empty;
            DateTime date = DateTime.UtcNow.AddDays(-(DateTime.UtcNow.Day - 1)).AddMonths(-11);
            do
            {
                try
                {
                    Domain.Socioboard.Models.PiadUser _paidUser = new PiadUser();
                    List<User> results = user.Where(t => t.CreateDate.Date > date.Date && t.CreateDate.Date < date.AddMonths(1).Date && t.PaymentStatus == Domain.Socioboard.Enum.SBPaymentStatus.Paid).ToList();
                    _paidUser.month = date.ToString("MMM yy");
                    _paidUser.paiduser = results.Count();
                    paidUser.Add(_paidUser);
                }
                catch (Exception ex)
                {
                   
                }


                date = date.AddMonths(1);
            }
            while (DateTime.Now.AddMonths(1).Month != date.Month);
            
            string abc = JsonConvert.SerializeObject(paidUser);
            return Json(abc);

            //return Json(user);

        }

        public async Task<IActionResult> ManageUnPaidUser()
        {
            List<Domain.Socioboard.Models.User> user = new List<Domain.Socioboard.Models.User>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUnPaidUserAdmin", "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                user = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.User>>();

            }


            List<Domain.Socioboard.Models.UnPiadUser> paidUser = new List<UnPiadUser>();
            string month = string.Empty;
            DateTime date = DateTime.UtcNow.AddDays(-(DateTime.UtcNow.Day - 1)).AddMonths(-11);
            do
            {
                try
                {
                    Domain.Socioboard.Models.UnPiadUser _paidUser = new UnPiadUser();
                    List<User> results = user.Where(t => t.CreateDate > date.Date && t.CreateDate < date.AddMonths(1).Date && t.PaymentStatus == Domain.Socioboard.Enum.SBPaymentStatus.UnPaid).ToList();
                    _paidUser.month = date.ToString("MMM yy");
                    _paidUser.Unpaiduser = results.Count();
                    paidUser.Add(_paidUser);
                }
                catch (Exception ex)
                {

                }


                date = date.AddMonths(1);
            }
            while (DateTime.Now.AddMonths(1).Month != date.Month);
            string abc = JsonConvert.SerializeObject(paidUser);
            return Json(abc);


        }

        public ActionResult Dashboard()
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
                return View();
            }
           
        }
        
        
    }
}
