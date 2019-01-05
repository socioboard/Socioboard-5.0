using System;
using System.Collections.Generic;
using System.Compat.Web;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Socioboard.Extensions;
using Socioboard.Helpers;

namespace Socioboard.Controllers
{
    public class PaymentController : SocioboardController
    {
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _appEnv;
        private readonly ILogger _logger;
        public PaymentController(ILogger<PaymentController> logger, IOptions<AppSettings> settings, IHostingEnvironment appEnv) : base(settings)
        {
            _appSettings = settings.Value;
            _appEnv = appEnv;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult> Test(string info)
        {
            ProcessVerificationResponseTest(info);
            return Ok("Got");
        }

        [HttpGet]
        public async Task<ActionResult> Index(string emailId)
        {
            var userResponse = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + emailId, "", "",
                _appSettings.ApiDomain);

            if (userResponse.IsSuccessStatusCode)
            {
                var user = await userResponse.Content.ReadAsAsync<User>();
                HttpContext.Session.SetObjectAsJson("User", user);
                var package = user.AccountType.ToString();

                var parameter = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("packagename", package)
                };

                var paymentResponse = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", parameter, "", "",
                    _appSettings.ApiDomain);

                if (!paymentResponse.IsSuccessStatusCode)
                    return Content("");

                try
                {
                    var sessionPackage = await paymentResponse.Content.ReadAsAsync<Package>();
                    HttpContext.Session.SetObjectAsJson("Package", sessionPackage);
                    HttpContext.Session.SetObjectAsJson("paymentsession", true);

                    if (user.PaymentType == PaymentType.paypal)
                        return Content(Payment.PaypalRecurringPayment(sessionPackage.amount,
                            sessionPackage.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber,
                            user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl,
                            _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl,
                            _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id));

                    if (user.PaymentType == PaymentType.bluesnap)
                    {
                        return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });
                    }

                    return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });
                }
                catch (Exception ex)
                {
                    //_logger.LogError(ex.StackTrace);
                }
            }

            return Content("");
        }


        #region Payment services

        public Dictionary<string, string> VerifyPdt(string authToken, string transactionId, string paypalUrl)
        {

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

        public async Task<IActionResult> PaypalSuccess()
        {
            var authToken = _appSettings.PaypalPdtToken;
            var txToken = Utils.GetBetween(Request.QueryString + "<:>$", "&tx=", "<:>$");

            //Post back to either sandbox or live
            var paypalUrl = $"{_appSettings.PaypalURL}/cgi-bin/webscr";

            var successResult = VerifyPdt(authToken, txToken, paypalUrl);

            // var successResult = VerifyPdt(authToken, txToken, paypalUrl);

            if (successResult.Count > 0)
            {
                var user = HttpContext.Session.GetObjectFromJson<User>("User");
                var package = HttpContext.Session.GetObjectFromJson<Package>("Package");

                #region Fetching the details from Paypal

                #endregion

                var plan = package.packagename;

                var paidAmount = successResult["payment_gross"];

                if (successResult.ContainsKey("mc_gross") && string.IsNullOrEmpty(paidAmount))
                    paidAmount = successResult["mc_gross"];
                

                var paidDate = successResult["payment_date"];
                var paymentDate = DateTime.Parse(paidDate.Replace(" PDT", "").Replace(" PST", ""));
                var payerEmail = successResult["payer_email"];
                var payerName = $"{successResult["first_name"]} {successResult["last_name"]}";
                var paymentStatus = successResult["payment_status"];

                var itemName = $"Socioboard_{plan}";
                if (successResult.ContainsKey("item_name"))
                    itemName = successResult["item_name"];

                var charset = successResult["charset"];

                var subscriptionId = string.Empty;

                if (successResult.ContainsKey("subscr_id"))
                    subscriptionId = successResult["subscr_id"];

                var parameters = new List<KeyValuePair<string, string>>
                {
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

                var response = await WebApiReq.PostReq("/api/PaymentTransaction/UpdateTransactionDetails", parameters, "", "",
                    _appSettings.ApiDomain);

                if (response.IsSuccessStatusCode)
                    try
                    {
                        var data = await response.Content.ReadAsStringAsync();

                        if (data == "processing")
                        {
                            var responseMessage = await WebApiReq.GetReq("/api/User/GetUser?Id=" + user.Id, "", "",
                                _appSettings.ApiDomain);

                            if (response.IsSuccessStatusCode)
                                try
                                {
                                    var userCurrentDetails = await responseMessage.Content.ReadAsAsync<User>();

                                    if (user.ReferralStatus == "InActive" && user.ReferdBy != null)
                                        await WebApiReq.PostReq("/api/User/UpdateRefrralStatus", parameters, "", "", _appSettings.ApiDomain);

                                    HttpContext.Session.SetObjectAsJson("User", userCurrentDetails);

                                    HttpContext.Session.SetObjectAsJson("paymentsession", false);

                                    return RedirectToAction("Index", "Home");
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine(ex.StackTrace);
                                }
                        }
                    }
                    catch (Exception)
                    {
                        return RedirectToAction("Index", "Index");
                    }
            }

            var output = "false";

            return Content(output);
        }

        public IActionResult PaypalFailed()
        {
            return RedirectToAction("Index", "Index");
        }

        public IActionResult PaypalCancel()
        {
            return RedirectToAction("Index", "Index");
        }

        [HttpPost]
        public IActionResult Notify()
        {
            var ipnContext = new IPNContext
            {
                IPNRequest = Request
            };

            using (var reader = new StreamReader(ipnContext.IPNRequest.Body, Encoding.ASCII))
            {
                ipnContext.RequestBody = reader.ReadToEnd();
            }


            //Store the IPN received from PayPal
            //LogRequest(ipnContext);

            //Fire and forget verification task           
            CustomTaskFactory.Instance.Start(() => { VerifyTask(ipnContext); });

            //Reply back a 200 code
            return Ok();
        }

        private class IPNContext
        {
            public HttpRequest IPNRequest { get; set; }

            public string RequestBody { get; set; }

            public string Verification { get; set; } = string.Empty;
        }

        private void VerifyTask(IPNContext ipnContext)
        {
            try
            {
                var paypalUrl = $"{_appSettings.PaypalURL}/cgi-bin/webscr";

                var verificationRequest = WebRequest.Create(paypalUrl);

                //Set values for the verification request
                verificationRequest.Method = "POST";
                verificationRequest.ContentType = "application/x-www-form-urlencoded";

                //Add cmd=_notify-validate to the payload
                var strRequest = "cmd=_notify-validate&" + ipnContext.RequestBody;
                verificationRequest.ContentLength = strRequest.Length;

                //Attach payload to the verification request
                using (var writer = new StreamWriter(verificationRequest.GetRequestStream(), Encoding.ASCII))
                {
                    writer.Write(strRequest);
                }

                //Send the request to PayPal and get the response
                using (var reader = new StreamReader(verificationRequest.GetResponse().GetResponseStream()))
                {
                    ipnContext.Verification = reader.ReadToEnd();
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.StackTrace);
                //Capture exception for manual investigation
            }

            ProcessVerificationResponse(ipnContext);
        }

        private void LogRequest(IPNContext ipnContext)
        {
            try
            {
                CustomTaskFactory.Instance.Start(() =>
                   {
                       var fileName = $"Transaction_{DateTime.Now.ToUnixTimestamp()}.txt";
                       var filePath = _appEnv.WebRootPath + $"\\contents\\socioboard\\Invoice\\{fileName}";
                       System.IO.File.WriteAllText(filePath, ipnContext.RequestBody);
                   });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                _logger.LogError(ex.Message);
            }

        }

        private async void ProcessVerificationResponse(IPNContext ipnContext)
        {

            #region Sample Response

            //mc_gross=19.99&
            //protection_eligibility=Eligible
            //&address_status=confirmed
            //&payer_id=J9VSKE27GQU6S
            //&address_street=1+Main+St
            //&payment_date=22%3A40%3A17+Dec+06%2C+2018+PST
            //&payment_status=Completed
            //&charset=windows-1252
            //&address_zip=95131
            //&first_name=Raushan
            //&mc_fee=0.88
            //&address_country_code=US
            //&address_name=Raushan+Kumar
            //&notify_version=3.9
            //&subscr_id=I-KU5HKAR9DHJ9
            //&custom=satishkumar%40globussoft.in_Socioboard
            //&payer_status=verified
            //&business=dina%40merchent.com
            //&address_country=United+States
            //&address_city=San+Jose
            //&verify_sign=AEG1gtsEQXalp1rIUipNGZfVSdbnApglfmb4V-KKjhy0JdI7U4uSbQYh
            //&payer_email=satishbuyer%40globussoft.in
            //&txn_id=31P59983HU0109310
            //&payment_type=instant
            //&last_name=Kumar
            //&address_state=CA
            //&receiver_email=dina%40merchent.com
            //&payment_fee=0.88
            //&receiver_id=WEZW9GMYEZM3L
            //&txn_type=subscr_payment
            //&item_name=Socioboard_Deluxe
            //&mc_currency=USD
            //&residence_country=US
            //&test_ipn=1
            //&transaction_subject=Socioboard_Deluxe
            //&payment_gross=19.99
            //&ipn_track_id=9d8b4603f06e2

            #endregion


            if (ipnContext.Verification.Equals("VERIFIED"))
            {


                var transactionType = Utils.GetBetween(ipnContext.RequestBody, "txn_type=", "&");

                if (!transactionType.Equals("subscr_payment"))
                    return;

                var subscriptionId = Utils.GetBetween(ipnContext.RequestBody, "subscr_id=", "&");
                var transactionId = Utils.GetBetween(ipnContext.RequestBody, "txn_id=", "&");
                var customValue = Utils.GetBetween(ipnContext.RequestBody, "custom=", "&");
                var emailInformation = Uri.UnescapeDataString(Utils.GetBetween(ipnContext.RequestBody, "custom=", "_Socioboard"));
                var userId = Utils.GetBetween(customValue + "<:>", "Id_", "<:>");
                var amount = Utils.GetBetween(ipnContext.RequestBody, "payment_gross=", "&");
                var payerEmail = Uri.UnescapeDataString(Utils.GetBetween(ipnContext.RequestBody, "payer_email=", "&"));
                var payerName = $"{Utils.GetBetween(ipnContext.RequestBody, "first_name=", "&")} {Utils.GetBetween(ipnContext.RequestBody, "last_name=", "&")}"; ;
                var paymentStatus = Utils.GetBetween(ipnContext.RequestBody, "payment_status=", "&");
                var itemName = Utils.GetBetween(ipnContext.RequestBody, "item_name=", "&");
                var charset = Utils.GetBetween(ipnContext.RequestBody, "charset=", "&");
                var subscriptionDate = Uri.UnescapeDataString(Utils.GetBetween(ipnContext.RequestBody, "payment_date=", "&").Replace("+", " "));


                var paymentTransaction = new PaymentTransaction
                {
                    amount = amount,
                    email = emailInformation,
                    paymentdate = DateTime.UtcNow,
                    userid = long.Parse(userId),
                    PaymentType = PaymentType.paypal,
                    trasactionId = transactionId,
                    paymentId = subscriptionId,
                    payeremail = payerEmail,
                    Payername = payerName,
                    paymentstatus = paymentStatus,
                    itemname = itemName,
                    media = charset,
                    subscrdate = DateTime.Parse(subscriptionDate.Replace(" PDT", "").Replace(" PST", ""))
                };

                var passingData = Newtonsoft.Json.JsonConvert.SerializeObject(paymentTransaction);

                var param = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("information", passingData)
                };

                await WebApiReq.PostReq("/api/PaymentTransaction/UpdatePaypalTransactions", param, "", "", _appSettings.ApiDomain);

                // check that Payment_status=Completed
                // check that Txn_id has not been previously processed
                // check that Receiver_email is your Primary PayPal email
                // check that Payment_amount/Payment_currency are correct
                // process payment
            }
            else if (ipnContext.Verification.Equals("INVALID"))
            {
                _logger.LogError(ipnContext.Verification + "_SocioboardPayment_Failed");
                _logger.LogError(ipnContext.RequestBody);
                LogRequest(ipnContext);
                //Log for manual investigation
            }
            else
            {
                //Log error
                _logger.LogError(ipnContext.Verification + "_SocioboardPayment_Failed");
                _logger.LogError(ipnContext.RequestBody);
                LogRequest(ipnContext);
            }
        }


        #region Test

        private async void ProcessVerificationResponseTest(string ipnContext)
        {

            #region Sample Response

            //mc_gross=19.99&
            //protection_eligibility=Eligible
            //&address_status=confirmed
            //&payer_id=J9VSKE27GQU6S
            //&address_street=1+Main+St
            //&payment_date=22%3A40%3A17+Dec+06%2C+2018+PST
            //&payment_status=Completed
            //&charset=windows-1252
            //&address_zip=95131
            //&first_name=Raushan
            //&mc_fee=0.88
            //&address_country_code=US
            //&address_name=Raushan+Kumar
            //&notify_version=3.9
            //&subscr_id=I-KU5HKAR9DHJ9
            //&custom=satishkumar%40globussoft.in_Socioboard
            //&payer_status=verified
            //&business=dina%40merchent.com
            //&address_country=United+States
            //&address_city=San+Jose
            //&verify_sign=AEG1gtsEQXalp1rIUipNGZfVSdbnApglfmb4V-KKjhy0JdI7U4uSbQYh
            //&payer_email=satishbuyer%40globussoft.in
            //&txn_id=31P59983HU0109310
            //&payment_type=instant
            //&last_name=Kumar
            //&address_state=CA
            //&receiver_email=dina%40merchent.com
            //&payment_fee=0.88
            //&receiver_id=WEZW9GMYEZM3L
            //&txn_type=subscr_payment
            //&item_name=Socioboard_Deluxe
            //&mc_currency=USD
            //&residence_country=US
            //&test_ipn=1
            //&transaction_subject=Socioboard_Deluxe
            //&payment_gross=19.99
            //&ipn_track_id=9d8b4603f06e2

            #endregion


            var transactionType = Utils.GetBetween(ipnContext, "txn_type=", "&");

            if (!transactionType.Equals("subscr_payment"))
                return;

            var subscriptionId = Utils.GetBetween(ipnContext, "subscr_id=", "&");
            var transactionId = Utils.GetBetween(ipnContext, "txn_id=", "&");
            var customValue = Utils.GetBetween(ipnContext, "custom=", "&");
            var emailInformation = Uri.UnescapeDataString(Utils.GetBetween(ipnContext, "custom=", "_Socioboard"));
            var userId = Utils.GetBetween(customValue + "<:>", "Id_", "<:>");
            var amount = Utils.GetBetween(ipnContext, "payment_gross=", "&");
            var payerEmail = Uri.UnescapeDataString(Utils.GetBetween(ipnContext, "payer_email=", "&"));
            var payerName = $"{Utils.GetBetween(ipnContext, "first_name=", "&")} {Utils.GetBetween(ipnContext, "last_name=", "&")}"; ;
            var paymentStatus = Utils.GetBetween(ipnContext, "payment_status=", "&");
            var itemName = Utils.GetBetween(ipnContext, "item_name=", "&");
            var charset = Utils.GetBetween(ipnContext, "charset=", "&");
            var subscriptionDate = Uri.UnescapeDataString(Utils.GetBetween(ipnContext, "payment_date=", "&").Replace("+", " "));



            var paymentTransaction = new PaymentTransaction
            {
                amount = amount,
                email = emailInformation,
                paymentdate = DateTime.UtcNow,
                userid = long.Parse(userId),
                PaymentType = PaymentType.paypal,
                trasactionId = transactionId,
                paymentId = subscriptionId,
                payeremail = payerEmail,
                Payername = payerName,
                paymentstatus = paymentStatus,
                itemname = itemName,
                media = charset,
                subscrdate = DateTime.Parse(subscriptionDate.Replace(" PDT", "").Replace(" PST", ""))
            };

            var passingData = Newtonsoft.Json.JsonConvert.SerializeObject(paymentTransaction);

            var param = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("information", passingData)
                };

            await WebApiReq.PostReq("/api/PaymentTransaction/UpdatePaypalTransactions", param, "", "", _appSettings.ApiDomain);

            // check that Payment_status=Completed
            // check that Txn_id has not been previously processed
            // check that Receiver_email is your Primary PayPal email
            // check that Payment_amount/Payment_currency are correct
            // process payment

        }

        #endregion

        public async void PaymentNotify(string code)
        {

            string media = Request.Form["charset"];
            string subscr_date = Request.Form["subscr_date"];
            string ipn_track_id = Request.Form["ipn_track_id"];
            string payer_email = Request.Form["payer_email"];
            string amount = Request.Form["amount3"];
            string mc_currency = Request.Form["mc_currency"];
            var Payername = Request.Form["first_name"] + " " + Request.Form["last_name"];
            string txn_type = Request.Form["txn_type"];
            string item_name = Request.Form["item_name"];
            string subscr_id = Request.Form["subscr_id"];
            string payment_status = Request.Form["payment_status"];
            if (string.IsNullOrEmpty(payment_status)) payment_status = "Completed";
            string txn_id = Request.Form["txn_id"];
            if (payment_status == "Completed")
            {
                var Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("subscr_id", subscr_id));
                Parameters.Add(new KeyValuePair<string, string>("txn_id", txn_id));
                Parameters.Add(new KeyValuePair<string, string>("subscr_date",
                    subscr_date.Replace("PDT", "").Replace("PST", "")));
                Parameters.Add(new KeyValuePair<string, string>("payer_email", payer_email));
                Parameters.Add(new KeyValuePair<string, string>("Payername", Payername));
                Parameters.Add(new KeyValuePair<string, string>("payment_status", payment_status));
                Parameters.Add(new KeyValuePair<string, string>("item_name", item_name));
                Parameters.Add(new KeyValuePair<string, string>("amount", amount));
                Parameters.Add(new KeyValuePair<string, string>("media", media));
                var response = await WebApiReq.PostReq("/api/PaymentTransaction/UpdateRecurringUser", Parameters, "",
                    "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                }
            }
        }


        [HttpGet]
        public async Task<IActionResult> UpgradeAccount(string packagename)
        {
            var user = HttpContext.Session.GetObjectFromJson<User>("User");

            if (user == null)
                return RedirectToAction("Index", "Index");

            if (packagename != "Free")
            {
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("packagename", packagename)
                };

                var response = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", parameters, "", "",
                    _appSettings.ApiDomain);

                if (!response.IsSuccessStatusCode)
                    return RedirectToAction("Index", "Index");

                try
                {
                    var package = await response.Content.ReadAsAsync<Package>();
                    HttpContext.Session.SetObjectAsJson("Package", package);

                    if (user.CreateDate.AddDays(29) > DateTime.UtcNow)
                        return user.PaymentType == PaymentType.paypal
                            ? (IActionResult)Content(Payment.PaypalRecurringPayment(package.amount,
                                package.packagename,
                                user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD",
                                _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl,
                                _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "",
                                _appSettings.PaypalURL, user.Id))
                            : RedirectToAction("paymentWithPayUMoney", "Index");


                    if (user.PaymentType == PaymentType.paypal)
                        return Content(Payment.PaypalRecurringPayment(package.amount, package.packagename,
                            user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD",
                            _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl,
                            _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "",
                            _appSettings.PaypalURL, user.Id));

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

                    var response = await WebApiReq.PostReq("/api/User/UpdateFreeUser", parameters, "", "",
                        _appSettings.ApiDomain);

                    if (!response.IsSuccessStatusCode)
                        return RedirectToAction("Index", "Index");

                    var userCurrentDetails = await response.Content.ReadAsAsync<User>();

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

        #endregion
    }
}