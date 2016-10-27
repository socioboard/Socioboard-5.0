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
      [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
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
                try
                {
                    if (user.ExpiryDate < DateTime.UtcNow)
                    {
                        return RedirectToAction("UpgradePlans", "Index");

                    }
                }
                catch (Exception)
                {
                    return RedirectToAction("Index", "Index");
                }
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
           ViewBag.user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

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
                        return Content(Helpers.Payment.RecurringPaymentWithPayPalUpgrade(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
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


        [HttpGet]
        public async Task<IActionResult> AgencyPlan(string firstName,string lastName,string company,string emailId,string phoneNumber,string message,string demoPlanType,string amount)
        {
            Domain.Socioboard.Models.AgencyUser _AgencyUser = new Domain.Socioboard.Models.AgencyUser();
            _AgencyUser.userName = firstName + " " + lastName;
            _AgencyUser.company = company;
            _AgencyUser.email = emailId;
            _AgencyUser.message = message;
            _AgencyUser.phnNumber = phoneNumber;
            _AgencyUser.planType = demoPlanType;
            _AgencyUser.amount = double.Parse(amount);
            HttpContext.Session.SetObjectAsJson("AgencyUser", _AgencyUser);
            return Content(Helpers.Payment.AgencyPayment(amount, demoPlanType, firstName + " " + lastName, phoneNumber, emailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.AgencycallBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
        }

        public async Task<IActionResult> AgencyPaymentSuccessful()
        {
            Domain.Socioboard.Models.AgencyUser _AgencyUser = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.AgencyUser>("AgencyUser");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("userName", _AgencyUser.userName));
            Parameters.Add(new KeyValuePair<string, string>("planType", _AgencyUser.planType));
            Parameters.Add(new KeyValuePair<string, string>("phnNumber", _AgencyUser.phnNumber));
            Parameters.Add(new KeyValuePair<string, string>("message", _AgencyUser.message));
            Parameters.Add(new KeyValuePair<string, string>("email", _AgencyUser.email));
            Parameters.Add(new KeyValuePair<string, string>("company", _AgencyUser.company));
            Parameters.Add(new KeyValuePair<string, string>("amount", _AgencyUser.amount.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/AgencyUser/UpdateUserInfo", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    string returndata = await response.Content.ReadAsStringAsync();
                    return Content("");
                }
                catch { }

            }
            return Content("");
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
