using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Helpers;
using System.Net.Http;
using Socioboard.Extensions;
using Domain.Socioboard.ViewModels;
using Microsoft.Extensions.Logging;





// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class IndexController : Controller
    {

        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;


        public IndexController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings, ILogger<IndexController> logger)
        {
            _appSettings = settings.Value;
            _logger = logger;

        }


        // GET: /<controller>/
       // [ResponseCache(Duration = 604800)]
        public IActionResult Index()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Login(UserLoginViewModel userViewModel)
        {
            string output = string.Empty;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("UserName", userViewModel.UserName));
            Parameters.Add(new KeyValuePair<string, string>("Password", userViewModel.Password));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/Login", Parameters, "", "",_appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    Domain.Socioboard.Models.User user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                    HttpContext.Session.SetObjectAsJson("User", user);
                    
                    output = "1";
                    if (user.ExpiryDate < DateTime.UtcNow)
                    {
                        //return RedirectToAction("UpgradePlans", "Index");
                        return Content("UpgradePlans");

                    }
                }
                catch (Exception e)
                {
                    try
                    {
                        output = await response.Content.ReadAsStringAsync();
                    }
                    catch(Exception ex)
                    {
                        _logger.LogError(ex.StackTrace);
                    }
                    return Content(output);
                }

            }
            return Content(output);
        }


        public async Task<IActionResult> PaymentSuccessful()
        {
            string output = "false";
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            Domain.Socioboard.Models.Package _Package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            Parameters.Add(new KeyValuePair<string, string>("UserName", user.FirstName + " " + user.LastName));
            Parameters.Add(new KeyValuePair<string, string>("email", user.EmailId));
            Parameters.Add(new KeyValuePair<string, string>("amount", _Package.amount));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/PaymentTransaction/UpgradeAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    string data = await response.Content.ReadAsStringAsync();
                    if (data == "payment done")
                    {
                        List<KeyValuePair<string, string>> _Parameters = new List<KeyValuePair<string, string>>();
                        _Parameters.Add(new KeyValuePair<string, string>("Id", user.Id.ToString()));
                        HttpResponseMessage _response = await WebApiReq.PostReq("/api/User/GetUser", _Parameters, "", "", _appSettings.ApiDomain);
                        if (response.IsSuccessStatusCode)
                        {
                            try
                            {
                                Domain.Socioboard.Models.User _user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                                HttpContext.Session.SetObjectAsJson("User", _user);
                                output = "true";
                            }
                            catch { }
                        }
                    }
                }
                catch (Exception e)
                {
                    return Content(output);
                }

            }
            return Content(output);
        }
        public IActionResult PaymentFailed()
        {
            return Content("");
        }
        public IActionResult PaymentCancel()
        {
            return Content("");
        }


        public IActionResult UpgradePlans()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> UpgradeAccount(string packagename)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            if (packagename != "Free")
            {
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("packagename", packagename));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", Parameters, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        Domain.Socioboard.Models.Package _Package = await response.Content.ReadAsAsync<Domain.Socioboard.Models.Package>();
                        HttpContext.Session.SetObjectAsJson("Package", _Package);
                        return Content(Helpers.Payment.RecurringPaymentWithPayPal(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
                    }
                    catch { }

                } 
            }
            else
            {
                List<KeyValuePair<string, string>> _Parameters = new List<KeyValuePair<string, string>>();
                _Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                HttpResponseMessage _response = await WebApiReq.PostReq("/api/User/UpdateFreeUser", _Parameters, "", "", _appSettings.ApiDomain);
                if (_response.IsSuccessStatusCode)
                {
                    try
                    {
                        Domain.Socioboard.Models.User _user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                        HttpContext.Session.SetObjectAsJson("User", _user);
                        return Content("");
                    }
                    catch { }
                }
            }
            return RedirectToAction("Index", "Index");
        }



        public IActionResult Company()
        {
            return View();
        }
        public IActionResult Products()
        {
            return View();
        }

        public IActionResult Agency()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }
        public IActionResult Enterprise()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }

        public IActionResult Plans()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }

        public IActionResult Download()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }

        public IActionResult Careers()
        {
            return View();
        }

        public IActionResult Training()
        {
            return View();
        }

        public IActionResult FAQ()
        {
            return View();
        }

        public IActionResult ResetPassword()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }


    }
}
