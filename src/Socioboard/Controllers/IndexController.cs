using System;
using System.Collections.Generic;
using System.Compat.Web;
using System.Globalization;
using System.IO;
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
using Socioboard.Helper;
using System.Linq;
using System.Net;
using Domain.Socioboard.Enum;


namespace Socioboard.Controllers
{
    public class IndexController : SocioboardController
    {
        private AppSettings _appSettings;
        private readonly ILogger _logger;

        public IndexController(Microsoft.Extensions.Options.IOptions<AppSettings> settings, ILogger<IndexController> logger) : base(settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }

        #region Login Services

        [HttpGet]
        public ActionResult SignIn()
        {
            try
            {
                var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

                var paymentsession = HttpContext.Session.GetObjectFromJson<bool>("paymentsession");

                if (paymentsession)
                {
                    user = null;
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("revokedata");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Remove("paymentsession");
                    HttpContext.Session.Clear();
                }

                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;

                if (user == null)
                    return View();

                var twoStepLogin = HttpContext.Session.GetObjectFromJson<string>("twosteplogin");
                if (twoStepLogin == "true")
                    return View("TwoStepOtp");

                if (user.ExpiryDate < DateTime.UtcNow)
                    return RedirectToAction("UpgradePlans", "Index");

            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Index");
            }

            return RedirectToAction("Index", "Home");
        }

        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> Index()
        {
            try
            {
                var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

                var paymentSession = HttpContext.Session.GetObjectFromJson<bool>("paymentsession");

                if (paymentSession)
                {
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Clear();
                    HttpContext.Session.Remove("revokedata");
                    user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                }

                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;

                if (user == null)
                    return View();

                var twoStepLogin = HttpContext.Session.GetObjectFromJson<string>("twosteplogin");

                if (twoStepLogin == "true")
                    return View("TwoStepOtp");

                if (user.ExpiryDate < DateTime.UtcNow)
                    return RedirectToAction("UpgradePlans", "Index");

            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Index");
            }

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(UserLoginViewModel userViewModel)
        {
            var output = string.Empty;

            var parameters = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("UserName", userViewModel.UserName),
                new KeyValuePair<string, string>("Password", userViewModel.Password)
            };

            var response = await WebApiReq.PostReq("/api/User/Login", parameters, "", "", _appSettings.ApiDomain);

            if (!response.IsSuccessStatusCode)
                return Content(output);

            try
            {
                var user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                HttpContext.Session.SetObjectAsJson("User", user);

                if (user.UserType == "SuperAdmin")
                    return Content("SuperAdmin");

                if (user.ExpiryDate >= DateTime.UtcNow)
                    return Content(user.TwostepEnable ? "TwoStepLogin" : "Success");

                var param = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("Id", user.Id.ToString())
                };

                HttpContext.Session.Remove("User");

                var trialStatus = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", param, "", "", _appSettings.ApiDomain);

                if (!trialStatus.IsSuccessStatusCode)
                    return Content("Payment not Confirmed");

                var userDetails = await trialStatus.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                HttpContext.Session.SetObjectAsJson("User", userDetails);
                return Content("Trail Expire");

            }
            catch (Exception)
            {
                try
                {
                    output = await response.Content.ReadAsStringAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                    return Content("Payment not Confirmed");
                }
                return Content(output);
            }


        }

        public ActionResult TwoStepOtp()
        {
            HttpContext.Session.SetObjectAsJson("twosteplogin", "true");
            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            if (user == null)
                return RedirectToAction("Index", "Index");

            ViewBag.emailId = user.EmailId;
            ViewBag.phonenumber = user.PhoneNumber;
            return View();

        }

        #endregion

        #region Payment services




        public Dictionary<string, string> VerifyPdt(string authToken, string transactionId, string paypalUrl)
        {
            //authToken = "bMPBeGIWniPy5AuCIirDe-wxMMkArzoOwJIQ35fmpcQR2JXKoK0ljHqpU_W";

            //transactionId = "53P212638S931512B";

            //3EY5607635819474D
            var query = "cmd=_notify-synch&tx=" + transactionId + "&at=" + authToken;

            var req = (HttpWebRequest)WebRequest.Create(paypalUrl);


            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            req.Method = "POST";
            req.ContentType = "application/x-www-form-urlencoded";
            req.ContentLength = query.Length;

            //Send the request to PayPal and get the response
            var streamOut = new StreamWriter(req.GetRequestStream(), Encoding.ASCII);
            streamOut.Write(query);
            streamOut.Close();

            var streamIn = new StreamReader(req.GetResponse().GetResponseStream());
            var strResponse = streamIn.ReadToEnd();
            streamIn.Close();

            var results = new Dictionary<string, string>();
            if (strResponse != "")
            {
                var reader = new StringReader(strResponse);
                var line = reader.ReadLine();

                if (line == "SUCCESS")
                {
                    while ((line = reader.ReadLine()) != null)
                    {
                        var header = line.Split('=')[0];
                        var value = line.Split('=')[1];
                        value = HttpUtility.UrlDecode(value);

                        results.Add(header, value);
                    }
                    return results;
                }
            }
            return new Dictionary<string, string>();
        }


        public async Task<IActionResult> PaymentSuccessful()
        {
            var authToken = _appSettings.PaypalPdtToken;
            var txToken = Utils.GetBetween(Request.QueryString + "<:>$", "&tx=", "<:>$");

            //Post back to either sandbox or live
            var paypalUrl = $"{_appSettings.PaypalURL}/cgi-bin/webscr";

            var successResult = VerifyPdt(authToken, "99X63908G1498834B", paypalUrl);

            // var successResult = VerifyPdt(authToken, txToken, paypalUrl);

            if (successResult.Count > 0)
            {
                var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                var package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");

                #region Fetching the details from Paypal

                #endregion

                var plan = package.packagename;

                var paidAmount = successResult["payment_gross"];

                var paidDate = successResult["payment_date"];
                var paymentDate = DateTime.Parse(paidDate.Replace(" PDT", "").Replace(" PST", ""));
                var payerEmail = successResult["payer_email"];
                var payerName = $"{successResult["first_name"]} {successResult["last_name"]}";
                var paymentStatus = successResult["payment_status"];
                var itemName = successResult["item_name"];
                var charset = successResult["charset"];

                var subscriptionId = string.Empty;

                if (successResult.ContainsKey("subscr_id"))
                    subscriptionId = successResult["subscr_id"];


                var parameters = new List<KeyValuePair<string, string>> {
                new KeyValuePair<string, string>("userId", user.Id.ToString()),
                new KeyValuePair<string, string>("UserName", user.FirstName + " " + user.LastName),
                new KeyValuePair<string, string>("email", user.EmailId),
                new KeyValuePair<string, string>("amount", paidAmount),
                new KeyValuePair<string, string>("PaymentType", user.PaymentType.ToString()),
                new KeyValuePair<string, string>("trasactionId", txToken),
                new KeyValuePair<string, string>("paymentId", subscriptionId),
                new KeyValuePair<string, string>("accType", plan),
                new KeyValuePair<string, string>("subscr_date", paymentDate.ToString(CultureInfo.InvariantCulture)),
                new KeyValuePair<string, string>("payer_email", payerEmail),
                new KeyValuePair<string, string>("Payername", payerName),
                new KeyValuePair<string, string>("payment_status", paymentStatus),
                new KeyValuePair<string, string>("item_name", itemName),
                new KeyValuePair<string, string>("media", charset)
                };

                var response = await WebApiReq.PostReq("/api/PaymentTransaction/UpgradeAccount", parameters, "", "", _appSettings.ApiDomain);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        var data = await response.Content.ReadAsStringAsync();

                        if (data == "payment done")
                        {
                            var responseMessage = await WebApiReq.GetReq("/api/User/GetUser?Id=" + user.Id, "", "", _appSettings.ApiDomain);

                            if (response.IsSuccessStatusCode)
                            {
                                try
                                {
                                    var userCurrentDetails = await responseMessage.Content.ReadAsAsync<Domain.Socioboard.Models.User>();

                                    if (user.ReferralStatus == "InActive" && user.ReferdBy != null)
                                        await WebApiReq.PostReq("/api/User/UpdateRefrralStatus", parameters, "", "", _appSettings.ApiDomain);

                                    HttpContext.Session.SetObjectAsJson("User", userCurrentDetails);

                                    return RedirectToAction("Index", "Index");
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine(ex.StackTrace);
                                }
                            }
                        }
                    }
                    catch (Exception)
                    {
                        return RedirectToAction("Index", "Index");
                    }
                }
            }

            var output = "false";

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
            string media = Request.Form["charset"];
            string subscr_date = Request.Form["subscr_date"];
            string ipn_track_id = Request.Form["ipn_track_id"];
            string payer_email = Request.Form["payer_email"];
            string amount = Request.Form["amount3"];
            string mc_currency = Request.Form["mc_currency"];
            string Payername = Request.Form["first_name"] + " " + Request.Form["last_name"];
            string txn_type = Request.Form["txn_type"];
            string item_name = Request.Form["item_name"];
            string subscr_id = Request.Form["subscr_id"];
            string payment_status = Request.Form["payment_status"];
            if (string.IsNullOrEmpty(payment_status))
            {
                payment_status = "Completed";
            }
            string txn_id = Request.Form["txn_id"];
            if (payment_status == "Completed")
            {
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("subscr_id", subscr_id));
                Parameters.Add(new KeyValuePair<string, string>("txn_id", txn_id));
                Parameters.Add(new KeyValuePair<string, string>("subscr_date", subscr_date.Replace("PDT", "").Replace("PST", "")));
                Parameters.Add(new KeyValuePair<string, string>("payer_email", payer_email));
                Parameters.Add(new KeyValuePair<string, string>("Payername", Payername));
                Parameters.Add(new KeyValuePair<string, string>("payment_status", payment_status));
                Parameters.Add(new KeyValuePair<string, string>("item_name", item_name));
                Parameters.Add(new KeyValuePair<string, string>("amount", amount));
                Parameters.Add(new KeyValuePair<string, string>("media", media));
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
            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            if (user == null)
                return RedirectToAction("Index", "Index");

            if (packagename != "Free")
            {
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("packagename", packagename)
                };

                var response = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", parameters, "", "", _appSettings.ApiDomain);

                if (!response.IsSuccessStatusCode)
                    return RedirectToAction("Index", "Index");

                try
                {
                    var package = await response.Content.ReadAsAsync<Domain.Socioboard.Models.Package>();
                    HttpContext.Session.SetObjectAsJson("Package", package);

                    if (user.CreateDate.AddDays(29) > DateTime.UtcNow)
                    {
                        return user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal
                            ? (IActionResult)Content(Payment.PaypalRecurringPayment(package.amount,
                                package.packagename,
                                user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD",
                                _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl,
                                _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "",
                                _appSettings.PaypalURL, user.Id))
                            : RedirectToAction("paymentWithPayUMoney", "Index");
                    }


                    if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                        return Content(Payment.PaypalRecurringPayment(package.amount, package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id));

                    return RedirectToAction("paymentWithPayUMoney", "Index");

                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
            }
            else
            {
                try
                {
                    var parameters = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("userId", user.Id.ToString())
                    };

                    var response = await WebApiReq.PostReq("/api/User/UpdateFreeUser", parameters, "", "", _appSettings.ApiDomain);

                    if (!response.IsSuccessStatusCode)
                        return RedirectToAction("Index", "Index");

                    var userCurrentDetails = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();

                    HttpContext.Session.SetObjectAsJson("User", userCurrentDetails);

                    return Content("");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
            }
            return RedirectToAction("Index", "Index");
        }

        [HttpGet]
        public async Task<IActionResult> AgencyPlan(string firstName, string lastName, string company, string emailId, string phoneNumber, string message, string demoPlanType, string amount)
        {
            var agencyUser = new Domain.Socioboard.Models.AgencyUser
            {
                userName = firstName + " " + lastName,
                company = company,
                email = emailId,
                message = message,
                phnNumber = phoneNumber,
                planType = demoPlanType,
                amount = double.Parse(amount)
            };
            HttpContext.Session.SetObjectAsJson("AgencyUser", agencyUser);
            return Content(Payment.AgencyPayment(amount, demoPlanType, firstName + " " + lastName, phoneNumber, emailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.AgencycallBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
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
                if (contesnt != false)
                {
                    return Content(response.RequestMessage.RequestUri.OriginalString);
                }
                else
                {
                    //return Redirect(response.RequestMessage.RequestUri.OriginalString);
                    //return Redirect(response.RequestMessage.RequestUri.OriginalString);
                    return Content(response.RequestMessage.RequestUri.OriginalString);
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
            string plan = string.Empty;
            string output = "false";
            Domain.Socioboard.Models.Package _Package = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Package>("Package");
            if (status == "success")
            {
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
                string payuMoneyId = Request.Form["payuMoneyId"].ToString();
                string PG_TYPE = Request.Form["PG_TYPE"].ToString();
                string txnid = Request.Form["txnid"].ToString();
                string amount = Request.Form["amount"].ToString();
                string productinfo = Request.Form["productinfo"].ToString();
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                Parameters.Add(new KeyValuePair<string, string>("UserName", user.FirstName + " " + user.LastName));
                Parameters.Add(new KeyValuePair<string, string>("email", user.EmailId));
                Parameters.Add(new KeyValuePair<string, string>("amount", amount));
                Parameters.Add(new KeyValuePair<string, string>("PaymentType", user.PaymentType.ToString()));
                Parameters.Add(new KeyValuePair<string, string>("trasactionId", txnid));
                Parameters.Add(new KeyValuePair<string, string>("paymentId", payuMoneyId));
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
            var rnd = new Random();
            var strHash = Generatehash512(rnd.ToString() + DateTime.Now);
            var txnid1 = strHash.Substring(0, 20);

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



        [HttpGet]
        public async Task<IActionResult> TrainingPlan(string firstName, string lastName, string company, string emailId, string phoneNumber, string message, string planType, string amount)
        {
            Domain.Socioboard.Models.Training _Training = new Domain.Socioboard.Models.Training();
            _Training.FirstName = firstName;
            _Training.LastName = lastName;
            _Training.EmailId = emailId;
            _Training.Message = message;
            _Training.PhoneNo = phoneNumber;
            _Training.Company = company;
            // HttpResponseMessage response = await WebApiReq.PostReq("/api/Training/updateTrainingDetails", Parameters, "", "", _appSettings.ApiDomain);
            _Training.PaymentStatus = planType;
            _Training.PaymentAmount = double.Parse(amount);
            HttpContext.Session.SetObjectAsJson("Training", _Training);
            HttpContext.Session.SetObjectAsJson("paymentsession", true);
            return Content(Helpers.Payment.AgencyPayment(amount, planType, firstName + " " + lastName, phoneNumber, emailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.TrainingcallBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));

        }


        public async Task<IActionResult> TrainingPaymentSuccessful()
        {
            Domain.Socioboard.Models.Training _training = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.Training>("Training");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("firstname", _training.FirstName));
            Parameters.Add(new KeyValuePair<string, string>("lastname", _training.LastName));
            Parameters.Add(new KeyValuePair<string, string>("phoneNo", _training.PhoneNo));
            Parameters.Add(new KeyValuePair<string, string>("message", _training.Message));
            Parameters.Add(new KeyValuePair<string, string>("emailId", _training.EmailId));
            Parameters.Add(new KeyValuePair<string, string>("company", _training.Company));
            Parameters.Add(new KeyValuePair<string, string>("amount", _training.PaymentAmount.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Training/updateTrainingDetails", Parameters, "", "", _appSettings.ApiDomain);
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




        #endregion

        #region Plugin Services

        [HttpPost]
        public async Task<IActionResult> AjaxPluginLogin()
        {
            string output = string.Empty;
            string uname = Request.Form["email"].ToString();
            string pass = Request.Form["password"].ToString();
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("UserName", uname));
            Parameters.Add(new KeyValuePair<string, string>("Password", pass));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/Login", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {

                try
                {
                    var user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                    HttpContext.Session.SetObjectAsJson("User", user);


                    if (user.UserType == "SuperAdmin")
                        return Content("SuperAdmin");

                    if (user.ExpiryDate >= DateTime.UtcNow)
                        return Content(user.TwostepEnable ? "TwoStepLogin" : "Success");

                    var param = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("Id", user.Id.ToString())
                    };

                    HttpContext.Session.Remove("User");

                    var trialStatus = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", param, "", "", _appSettings.ApiDomain);

                    if (!trialStatus.IsSuccessStatusCode)
                        return Content("Payment not Confirmed");

                    var userDetails = await trialStatus.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                    HttpContext.Session.SetObjectAsJson("User", userDetails);
                    return Content("Trail Expire");



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

        [HttpGet]
        public async Task<IActionResult> SBApp(string profileType, string url, string content, string imageUrl, string name, string userImage, string screenName, string tweet, string tweetId, string type, string EmailId)
        {
            var password = "";

            var pluginData = new Domain.Socioboard.Helpers.PluginData
            {
                profileType = profileType,
                content = content,
                imageUrl = imageUrl,
                name = name,
                screenName = screenName,
                tweet = tweet,
                tweetId = tweetId,
                url = url,
                userImage = userImage,
                type = type
            };

            if (!string.IsNullOrEmpty(imageUrl))
            {
                if (imageUrl.Equals(url))
                {
                    if (type == "timeline-image")                    
                        pluginData.url = string.Empty;
                    
                    if (profileType == "image")                    
                        pluginData.url = string.Empty;                    
                }
            }

            if (profileType == "website")
            {
                if (url.Contains(".jpg") || url.Contains(".png"))
                {
                    pluginData.imageUrl = url;
                    pluginData.url = string.Empty;
                }
            }

            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            if (user == null)
            {
                if (Request.Cookies["socioboardpluginemailId"] != null)
                {
                    EmailId = Request.Cookies["socioboardpluginemailId"];
                    EmailId = PluginHelper.Base64Decode(EmailId);
                }

                if (Request.Cookies["socioboardpluginToken"] != null)
                {
                    password = Request.Cookies["socioboardpluginToken"];
                    password = PluginHelper.Base64Decode(password);
                }

                if (!string.IsNullOrEmpty(EmailId) && !string.IsNullOrEmpty(password))
                {
                    var parameters = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("UserName", EmailId),
                        new KeyValuePair<string, string>("Password", password)
                    };

                    var loginResponse = await WebApiReq.PostReq("/api/User/CheckUserLogin", parameters, "", "", _appSettings.ApiDomain);

                    if (loginResponse.IsSuccessStatusCode)
                    {
                        try
                        {
                            user = await loginResponse.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                            HttpContext.Session.SetObjectAsJson("User", user);
                        }
                        catch (Exception e) { _logger.LogError(e.Message); }
                    }
                    else
                    {
                        ViewBag.User = "false";
                        return View("Rlogin");
                    }
                }
            }

            if (user == null)
                return View("Rlogin");

            if (!string.IsNullOrEmpty(url) && profileType != "pinterest")
            {
                var plugindata = PluginHelper.CreateThumbnail(url);
                pluginData._ThumbnailDetails = plugindata;
            }

            ViewBag.plugin = pluginData;
            ViewBag.emailId = user.EmailId;
            ViewBag.password = user.Password;
            ViewBag.userId = user.Id.ToString();

            var response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId=" + user.Id, "", "", _appSettings.ApiDomain);

            if (!response.IsSuccessStatusCode)
                return View("Rlogin");

            try
            {
                var groups = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groups>>();

                var selectedGroupId = groups.FirstOrDefault(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName)?.id;

                if (selectedGroupId != null)
                {
                    var pluginProfileResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetPluginProfile?groupId=" + selectedGroupId, "", "", _appSettings.ApiDomain);

                    if (pluginProfileResponse.IsSuccessStatusCode)
                    {
                        try
                        {
                            var pluginProfiles = await pluginProfileResponse.Content.ReadAsAsync<List<Domain.Socioboard.Helpers.PluginProfile>>();
                            return View("RMain", pluginProfiles);
                        }
                        catch (Exception e) { _logger.LogError(e.Message); }
                    }
                }
            }
            catch (Exception e) { _logger.LogError(e.Message); }

            return View("Rlogin");
        }

        [HttpPost]
        public ActionResult IsUserSessionPlugin()
        {
            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            return Content(user != null ? user.EmailId : "");
        }

        [HttpPost]
        public async Task<IActionResult> PluginSignUp()
        {
            string output = "";
            string name = Request.Form["name"].ToString();
            string email = Request.Form["email"].ToString();
            string password = Request.Form["password"].ToString();
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("FirstName", name));
            Parameters.Add(new KeyValuePair<string, string>("EmailId", email));
            Parameters.Add(new KeyValuePair<string, string>("Password", password));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/Register", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                output = await response.Content.ReadAsStringAsync();
            }
            return Content(output);
        }

        #endregion

        #region Other Services


        [HttpGet]
        public async Task<IActionResult> plans()
        {
            HttpResponseMessage _response = await WebApiReq.GetReq("/api/User/GetPlans", "", "", _appSettings.ApiDomain);
            List<Domain.Socioboard.Models.Package> lstsb = new List<Domain.Socioboard.Models.Package>();
            lstsb = await _response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Package>>();

            ViewBag.plugin = lstsb;
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return View("Plans");
        }



        [HttpGet]
        public async Task<IActionResult> board(string boardName)
        {
            HttpResponseMessage response = await WebApiReq.GetReq("/api/BoardMe/getBoardByName?boardName=" + boardName, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    ViewBag.board = await response.Content.ReadAsAsync<Domain.Socioboard.Models.MongoBoards>();
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




        #endregion

        #region SignIn Page Details - Only Static Pages 

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

        //public IActionResult Plans()
        //{
        //    ViewBag.ApiDomain = _appSettings.ApiDomain;
        //    return View();
        //}


        [Route("TermsConditions")]

        public IActionResult Conditions()
        {
            return View();
        }


        public IActionResult Download()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            return View();
        }

        [HttpGet]
        public IActionResult Careers()
        {
            return View();
        }

        [Route("PrivacyPolicy")]
        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Refund_Policy()
        {
            return View();
        }
        public IActionResult Training()
        {
            return View();
        }
        public IActionResult Sitemap()
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

        public IActionResult friendRemove()
        {
            return View();
        }


        #endregion

    }
}
