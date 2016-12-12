using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Helpers;
using System.Net.Http;
using Socioboard.Extensions;
using Domain.Socioboard.ViewModels;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using System.Compat.Web;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using Facebook;

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
            //  return RedirectToAction("paymentWithPayUMoney", "Index");
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

        //public IActionResult facebooknotification()
        //{
        //    FacebookClient fb = new FacebookClient();
        //    fb.Get("v2.7 / " + _appSettings.FacebookClientId + "/subscriptions");
        //    return Content("");
        //}


        [HttpPost]
        public async Task<IActionResult> Login(UserLoginViewModel userViewModel)
        {
            string output = string.Empty;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("UserName", userViewModel.UserName));
            Parameters.Add(new KeyValuePair<string, string>("Password", userViewModel.Password));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/Login", Parameters, "", "", _appSettings.ApiDomain);
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
                        // return Content("UpgradePlans");
                        List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
                        Param.Add(new KeyValuePair<string, string>("Id", user.Id.ToString()));
                        HttpResponseMessage respon = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", Param, "", "", _appSettings.ApiDomain);
                        if (respon.IsSuccessStatusCode)
                        {
                            Domain.Socioboard.Models.User _user = await respon.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                            HttpContext.Session.SetObjectAsJson("User", _user);
                            return Content("Trail Expire");
                        }
                    }
                    else if ((user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.notadded || user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.inprogress) && (user.AccountType != Domain.Socioboard.Enum.SBAccountType.Free))
                    {
                        //return RedirectToAction("PayPalAccount", "Home", new { emailId = user.EmailId,IsLogin = false });
                        return Content("2");
                    }
                }
                catch (Exception e)
                {
                    try
                    {
                        output = await response.Content.ReadAsStringAsync();
                    }
                    catch (Exception ex)
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
            string plan = "";

            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            Domain.Socioboard.Models.Package _Package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");
            string trasactionId = Generatetxnid();
            string paymentId = Request.Form["subscr_id"];
            if (_Package.packagename == "Free")
            {
                plan = "Free";
            }
            else if (_Package.packagename == "Deluxe")
            {
                plan = "Deluxe";

            }
            else if (_Package.packagename == "Premium")
            {
                plan = "Premium";

            }
            else if (_Package.packagename == "Topaz")
            {
                plan = "Topaz";

            }
            else if (_Package.packagename == "Platinum")
            {
                plan = "Platinum";

            }
            else if (_Package.packagename == "Gold")
            {
                plan = "Gold";

            }
            else if (_Package.packagename == "Ruby")
            {
                plan = "Ruby";

            }
            else if (_Package.packagename == "Standard")
            {
                plan = "Standard";

            }
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            Parameters.Add(new KeyValuePair<string, string>("UserName", user.FirstName + " " + user.LastName));
            Parameters.Add(new KeyValuePair<string, string>("email", user.EmailId));
            Parameters.Add(new KeyValuePair<string, string>("amount", _Package.amount));
            Parameters.Add(new KeyValuePair<string, string>("PaymentType", user.PaymentType.ToString()));
            Parameters.Add(new KeyValuePair<string, string>("trasactionId", trasactionId));
            Parameters.Add(new KeyValuePair<string, string>("paymentId", paymentId));
            Parameters.Add(new KeyValuePair<string, string>("accType", plan));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/PaymentTransaction/UpgradeAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    string data = await response.Content.ReadAsStringAsync();
                    if (data == "payment done")
                    {
                        List<KeyValuePair<string, string>> _Parameters = new List<KeyValuePair<string, string>>();
                        //_Parameters.Add(new KeyValuePair<string, string>("Id", user.Id.ToString()));
                        HttpResponseMessage _response = await WebApiReq.GetReq("/api/User/GetUser?Id=" + user.Id.ToString(), "", "", _appSettings.ApiDomain);
                        if (response.IsSuccessStatusCode)
                        {
                            try
                            {
                                Domain.Socioboard.Models.User _user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                                HttpContext.Session.SetObjectAsJson("User", _user);
                                return RedirectToAction("Index", "Index");
                            }
                            catch { }
                        }
                    }
                }
                catch (Exception e)
                {
                    return RedirectToAction("Index", "Index");
                }

            }
            return Content(output);
        }




        public IActionResult PaymentFailed()
        {
            return RedirectToAction("Index", "Index");
        }
        public IActionResult PaymentCancel()
        {
            return RedirectToAction("Index", "Index");
        }


        public async void PaymentNotify(string code)
        {
            //_logger.LogError("paypalnotifications start");
            //foreach (var key in Request.Form.Keys)
            //{
            //    _logger.LogError(key+":"+Request.Form[key]);
            //}
            //_logger.LogError("paypalnotifications end");
            //return RedirectToAction("Index", "Index");
            string subscr_id = Request.Form["subscr_id"];
            string payment_status = Request.Form["payment_status"];
            string txn_id = Request.Form["txn_id"];
            if (payment_status == "Completed")
            {
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("subscr_id", subscr_id));
                Parameters.Add(new KeyValuePair<string, string>("txn_id", txn_id));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/PaymentTransaction/UpdateRecurringUser", Parameters, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                }
            }
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

                        if (user.CreateDate.AddDays(29) <= DateTime.UtcNow)
                        {
                            if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                            {
                                return Content(Helpers.Payment.RecurringPaymentWithPayPalUpgrade(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL));
                            }
                            else
                            {
                                return RedirectToAction("paymentWithPayUMoney", "Index");
                            }
                        }
                        else
                        {
                            if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                            {
                                return Content(Helpers.Payment.RecurringPaymentWithPayPalUpgrade(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL));
                            }
                            else
                            {
                                return RedirectToAction("paymentWithPayUMoney", "Index");
                            }
                        }
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
        public async Task<IActionResult> AgencyPlan(string firstName, string lastName, string company, string emailId, string phoneNumber, string message, string demoPlanType, string amount)
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


        [HttpGet]
        public async Task<IActionResult> paymentWithPayUMoney(bool contesnt)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            Domain.Socioboard.Models.Package _Package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("key", _appSettings.key));
            string amount = (Convert.ToDouble(_Package.amount) * Convert.ToDouble(_appSettings.moneyconvertion)).ToString();
            string txnid = Generatetxnid();
            Parameters.Add(new KeyValuePair<string, string>("txnid", txnid));
            Parameters.Add(new KeyValuePair<string, string>("amount", amount));
            Parameters.Add(new KeyValuePair<string, string>("productinfo", _Package.packagename));
            Parameters.Add(new KeyValuePair<string, string>("firstname", user.FirstName));
            Parameters.Add(new KeyValuePair<string, string>("email", user.EmailId));
            Parameters.Add(new KeyValuePair<string, string>("phone", user.PhoneNumber));
            Parameters.Add(new KeyValuePair<string, string>("surl", _appSettings.surl));
            Parameters.Add(new KeyValuePair<string, string>("furl", _appSettings.failUrl));
            string hashString = _appSettings.key.ToString() + "|" + txnid + "|" + amount + "|" + _Package.packagename.ToString() + "|" + user.FirstName.ToString() + "|" + user.EmailId.ToString() + "|||||||||||" + _appSettings.salt.ToString();
            string hash = Generatehash512(hashString);
            Parameters.Add(new KeyValuePair<string, string>("hash", hash));
            Parameters.Add(new KeyValuePair<string, string>("service_provider", "payu_paisa"));
            HttpResponseMessage response = await WebApiReq.PostReq("/_payment", Parameters, "", "", "https://secure.payu.in");
            if (response.IsSuccessStatusCode)
            {
                // string data = await response.Content.ReadAsStringAsync();
                if (contesnt!=false)
                {
                    return Content(response.RequestMessage.RequestUri.OriginalString);
                }
                else
                {
                    return Redirect(response.RequestMessage.RequestUri.OriginalString);
                }
            }
            else
            {
                return null;
            }
        }

        public async Task<IActionResult> PayUMoneySuccessful(FormCollection form)
        {
            string status = Request.Form["status"].ToString();

            string output = "false";
            if (status == "success")
            {
                string payuMoneyId = Request.Form["payuMoneyId"].ToString();
                string PG_TYPE = Request.Form["PG_TYPE"].ToString();
                string txnid = Request.Form["txnid"].ToString();
                string amount = Request.Form["amount"].ToString();
                string productinfo = Request.Form["productinfo"].ToString();
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                Domain.Socioboard.Models.Package _Package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                Parameters.Add(new KeyValuePair<string, string>("UserName", user.FirstName + " " + user.LastName));
                Parameters.Add(new KeyValuePair<string, string>("email", user.EmailId));
                Parameters.Add(new KeyValuePair<string, string>("amount", amount));
                Parameters.Add(new KeyValuePair<string, string>("PaymentType", user.PaymentType.ToString()));
                Parameters.Add(new KeyValuePair<string, string>("trasactionId", txnid));
                Parameters.Add(new KeyValuePair<string, string>("paymentId", payuMoneyId));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/PaymentTransaction/UpgradeAccount", Parameters, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        string data = await response.Content.ReadAsStringAsync();
                        if (data == "payment done")
                        {
                            List<KeyValuePair<string, string>> _Parameters = new List<KeyValuePair<string, string>>();
                            // _Parameters.Add(new KeyValuePair<string, string>("Id", user.Id.ToString()));
                            HttpResponseMessage _response = await WebApiReq.GetReq("/api/User/GetUser?Id=" + user.Id.ToString(), "", "", _appSettings.ApiDomain);
                            if (response.IsSuccessStatusCode)
                            {
                                try
                                {
                                    Domain.Socioboard.Models.User _user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                                    HttpContext.Session.SetObjectAsJson("User", _user);
                                    //SendInvoiceMerchant(_user.PhoneNumber, _user.EmailId, _user.FirstName, amount, productinfo, txnid, _appSettings.PayUMoneyURL);
                                    // output = "true";
                                    return RedirectToAction("Index", "Home");
                                }
                                catch { }
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        return RedirectToAction("Index", "Index");
                    }

                }
            }
            return RedirectToAction("Index", "Index");
        }

        public async void SendInvoiceMerchant(string customerPhone, string customerEmail, string customerName, string amount, string paymentDescription, string transactionId, string PayUMoneyURL)
        {
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("customerPhone", customerPhone));
            Parameters.Add(new KeyValuePair<string, string>("customerEmail", customerEmail));
            Parameters.Add(new KeyValuePair<string, string>("customerName", customerName));
            Parameters.Add(new KeyValuePair<string, string>("amount", amount));
            Parameters.Add(new KeyValuePair<string, string>("paymentDescription", paymentDescription));
            Parameters.Add(new KeyValuePair<string, string>("transactionId", transactionId));
            try
            {
                HttpResponseMessage response = await WebApiReq.PostReqPayUMoney("payment/payment/addInvoiceMerchantAPI?", Parameters, "", "", _appSettings.payurl, _appSettings.AuthorizationKey);
                if (response.IsSuccessStatusCode)
                {
                    Redirect(response.RequestMessage.RequestUri.OriginalString);
                }
            }
            catch (Exception ex)
            {
            }
        }

        public string Generatetxnid()
        {

            Random rnd = new Random();
            string strHash = Generatehash512(rnd.ToString() + DateTime.Now);
            string txnid1 = strHash.ToString().Substring(0, 20);

            return txnid1;
        }
        public string Generatehash512(string text)
        {

            byte[] message = Encoding.UTF8.GetBytes(text);

            UnicodeEncoding UE = new UnicodeEncoding();
            byte[] hashValue;
            SHA512Managed hashString = new SHA512Managed();
            string hex = "";
            hashValue = hashString.ComputeHash(message);
            foreach (byte x in hashValue)
            {
                hex += String.Format("{0:x2}", x);
            }
            return hex;

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


        [HttpGet]
        public async Task<IActionResult> board(string boardName)
        {
            HttpResponseMessage response = await WebApiReq.GetReq("/api/BoardMe/getBoardByName?boardName=" + boardName, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    ViewBag.board = await response.Content.ReadAsAsync<Domain.Socioboard.Models.Mongo.MongoBoards>();
                    return View();
                }
                catch (Exception e)
                {
                    string output = string.Empty;
                    try
                    {
                        output = await response.Content.ReadAsStringAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.StackTrace);
                    }
                    return Content(output);
                }

            }



            return View();
        }

    }
}
