using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc.Filters;


namespace Socioboard.Controllers
{
    public class HomeController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;
        public HomeController(ILogger<HomeController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }
        

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user != null)
            {
                SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
                strdic.Add("UserName", user.EmailId);
                if (string.IsNullOrEmpty(user.Password))
                {
                    strdic.Add("Password", "sociallogin");
                }
                else
                {
                    strdic.Add("Password", user.Password);
                }
                

                string response = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/CheckUserLogin", strdic, _appSettings.ApiDomain);

                if (!string.IsNullOrEmpty(response))
                {
                    Domain.Socioboard.Models.User _user= Newtonsoft.Json.JsonConvert.DeserializeObject<Domain.Socioboard.Models.User>(response);
                    HttpContext.Session.SetObjectAsJson("User", _user);
                }
                else
                {
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Clear();
                }
            }
            base.OnActionExecuting(filterContext);
        }

        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> Index()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }

            try
            {
                if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Free)
                {
                    ViewBag.AccountType = "Free";
                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                {
                    ViewBag.AccountType = "Deluxe";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Premium)
                {
                    ViewBag.AccountType = "Premium";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                {
                    ViewBag.AccountType = "Topaz";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                {
                    ViewBag.AccountType = "Platinum";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Gold)
                {
                    ViewBag.AccountType = "Gold";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                {
                    ViewBag.AccountType = "Ruby";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Standard)
                {
                    ViewBag.AccountType = "Standard";

                }
                if (user.ExpiryDate < DateTime.UtcNow)
                {
                    //return RedirectToAction("UpgradePlans", "Index");
                    if (user.TrailStatus != Domain.Socioboard.Enum.UserTrailStatus.inactive)
                    {
                        List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
                        Param.Add(new KeyValuePair<string, string>("Id", user.Id.ToString()));
                        HttpResponseMessage respon = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", Param, "", "", _appSettings.ApiDomain);
                        if (respon.IsSuccessStatusCode)
                        {
                            Domain.Socioboard.Models.User _user = await respon.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                            HttpContext.Session.SetObjectAsJson("User", _user);
                            user = _user;
                        }
                    }

                }
                else if ((user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.notadded || user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.inprogress) && (user.AccountType != Domain.Socioboard.Enum.SBAccountType.Free))
                {
                    HttpContext.Session.SetObjectAsJson("paymentsession", true);
                    return RedirectToAction("PayPalAccount", "Home", new { emailId = user.EmailId, IsLogin = true });
                }
            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Index");
            }
            HttpResponseMessage response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId=" + user.Id, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    List<Domain.Socioboard.Models.Groups> groups = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groups>>();
                    ViewBag.groups = Newtonsoft.Json.JsonConvert.SerializeObject(groups);
                    string sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
                    if (!string.IsNullOrEmpty(sessionSelectedGroupId))
                    {
                        ViewBag.selectedGroupId = sessionSelectedGroupId;
                        HttpResponseMessage groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + sessionSelectedGroupId, "", "", _appSettings.ApiDomain);
                        if (groupProfilesResponse.IsSuccessStatusCode)
                        {
                            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                            ViewBag.groupProfiles = Newtonsoft.Json.JsonConvert.SerializeObject(groupProfiles);
                           // string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
                            // int count = Convert.ToInt32(profileCount);
                            int count = groupProfiles.Count;
                            int MaxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);
                            ViewBag.profileCount = count;
                            ViewBag.MaxCount = MaxCount;
                            ViewBag.AccountType = user.AccountType;
                            if (count > MaxCount)
                            {
                                ViewBag.downgrade = "true";
                            }
                            else
                            {
                                ViewBag.downgrade = "false";
                            }
                        }



                    }
                    else
                    {
                        long selectedGroupId = groups.FirstOrDefault(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).id;
                        HttpContext.Session.SetObjectAsJson("selectedGroupId", selectedGroupId);
                        ViewBag.selectedGroupId = selectedGroupId;
                        HttpResponseMessage groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + selectedGroupId, "", "", _appSettings.ApiDomain);
                        if (groupProfilesResponse.IsSuccessStatusCode)
                        {
                            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                            ViewBag.groupProfiles = Newtonsoft.Json.JsonConvert.SerializeObject(groupProfiles);
                            //string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
                            // int count = Convert.ToInt32(profileCount);
                            int count = groupProfiles.Count;
                            int MaxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);
                            ViewBag.profileCount = count;
                            ViewBag.MaxCount = MaxCount;
                            if (count > MaxCount)
                            {
                                ViewBag.downgrade = "true";
                            }
                            else
                            {
                                ViewBag.downgrade = "false";
                            }
                        }

                    }
                }
                catch (Exception e)
                {
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Clear();
                    ViewBag.user = null;
                    ViewBag.selectedGroupId = null;
                    ViewBag.groupProfiles = null;
                    TempData["Error"] = "Some thing went wrong.";
                    return RedirectToAction("Index", "Index");
                }
            }
            else
            {
                return RedirectToAction("Index", "Index");
            }
            ViewBag.user = Newtonsoft.Json.JsonConvert.SerializeObject(user);
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> PluginComposeMessage()
        {
            string profile = Request.Form["profile"];
            string twitterText = Request.Form["twitterText"];
            string tweetId = Request.Form["tweetId"];
            string tweetUrl = Request.Form["tweetUrl"];
            string facebookText = Request.Form["facebookText"];
            string url = Request.Form["url"];
            string imgUrl = Request.Form["imgUrl"];
            string output = "";
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return View("Rlogin");
            }
            List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
            Param.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            Param.Add(new KeyValuePair<string, string>("tweetUrl", tweetUrl));
            Param.Add(new KeyValuePair<string, string>("facebookText", facebookText));
            Param.Add(new KeyValuePair<string, string>("url", url));
            Param.Add(new KeyValuePair<string, string>("imgUrl", imgUrl));
            Param.Add(new KeyValuePair<string, string>("tweetId", tweetId));
            Param.Add(new KeyValuePair<string, string>("twitterText", twitterText));
            Param.Add(new KeyValuePair<string, string>("profile", profile));
            HttpResponseMessage respon = await WebApiReq.PostReq("/api/SocialMessages/PluginComposemessage", Param, "", "", _appSettings.ApiDomain);
            if (respon.IsSuccessStatusCode)
            {
                output= await respon.Content.ReadAsStringAsync();
            }
            return Content(output);
        }


        [HttpPost]
        public async Task<IActionResult> PluginScheduleMessage(string scheduleTime, string clientTime)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return View("Rlogin");
            }
            string profiles = Request.Form["profile"];
            string twitterText = Request.Form["twitterText"];
            string tweetId = Request.Form["tweetId"];
            string tweetUrl = Request.Form["tweetUrl"];
            string facebookText = Request.Form["facebookText"];
            string url = Request.Form["url"];
            string imgUrl = Request.Form["imgUrl"];
            string sdTime = Convert.ToDateTime(scheduleTime).ToString("yyyy-MM-dd HH:mm:ss");
            List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
            Param.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            Param.Add(new KeyValuePair<string, string>("tweetUrl", tweetUrl));
            Param.Add(new KeyValuePair<string, string>("facebookText", facebookText));
            Param.Add(new KeyValuePair<string, string>("url", url));
            Param.Add(new KeyValuePair<string, string>("imgUrl", imgUrl));
            Param.Add(new KeyValuePair<string, string>("tweetId", tweetId));
            Param.Add(new KeyValuePair<string, string>("twitterText", twitterText));
            Param.Add(new KeyValuePair<string, string>("profile", profiles));
            Param.Add(new KeyValuePair<string, string>("scheduleTime", sdTime));
            Param.Add(new KeyValuePair<string, string>("localscheduleTime", clientTime));
            HttpResponseMessage respon = await WebApiReq.PostReq("/api/SocialMessages/PluginScheduleMessage", Param, "", "", _appSettings.ApiDomain);
            if (respon.IsSuccessStatusCode)
            {
            }
            return Content("");
        }



        [HttpGet]
        public string changeSelectdGroupId(long groupId)
        {
            HttpContext.Session.SetObjectAsJson("selectedGroupId", groupId);
            return "changed";
        }
        [ResponseCache(Duration = 100)]
        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("User");
            HttpContext.Session.Remove("selectedGroupId");
            HttpContext.Session.Clear();
            ViewBag.user = null;
            ViewBag.selectedGroupId = null;
            ViewBag.groupProfiles = null;
            //return RedirectToAction("Index", "Index");
            return Ok();
        }

        [ResponseCache(Duration = 100)]
        [HttpGet]
        public IActionResult AdminLogout()
        {
            HttpContext.Session.Remove("User");
            HttpContext.Session.Remove("selectedGroupId");
            HttpContext.Session.Clear();
            ViewBag.user = null;
            ViewBag.selectedGroupId = null;
            ViewBag.groupProfiles = null;
            //return View("Company");
            //return RedirectToAction("Index", "Company");
            return Ok();
        }

        [HttpGet]
        public bool IsSessionExist()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return false;
            }
            {
                try
                {
                    if (user.ExpiryDate < DateTime.UtcNow)
                    {
                        // return false;

                    }
                }
                catch (Exception)
                {
                    return false;
                }
                return true;
            }
        }

        [HttpPost]
        public async Task<IActionResult> UserAuth()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return Json(null);
            }
            else
            {
                try
                {
                    if (user.ExpiryDate < DateTime.UtcNow)
                    {
                        return Json(user);

                    }
                }
                catch (Exception)
                {
                    return Json(null);
                }
                return Json(user);
            }
        }

        [HttpGet]
        public async Task<ActionResult> UpdateUser()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUser?Id=" + user.Id, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                HttpContext.Session.SetObjectAsJson("User", user);
            }
            return Json(user);
        }

        public IActionResult Error()
        {
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> GroupInvite(string token, string email, long id)
        {

            string res = string.Empty;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("email", email));
            Parameters.Add(new KeyValuePair<string, string>("code", token));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/GroupMember/ActivateGroupMember", Parameters, "", "", _appSettings.ApiDomain);

            if (response.IsSuccessStatusCode)
            {
                res = await response.Content.ReadAsStringAsync();
                if (res.Equals("updated"))
                {
                    TempData["Success"] = "Added Successfully to group.";
                    return RedirectToAction("index", "Home");
                }
                else
                {
                    TempData["Error"] = "Invalid Link.";
                    return RedirectToAction("index", "Home");
                }

            }
            else
            {
                TempData["Error"] = "Error while hiting api";
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpGet]
        public async Task<ActionResult> ForgotPassword(string emailId, string token)
        {
            string res = string.Empty;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("emailId", emailId));
            Parameters.Add(new KeyValuePair<string, string>("accessToken", token));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/validateforgotpwdToken", Parameters, "", "", _appSettings.ApiDomain);

            if (response.IsSuccessStatusCode)
            {
                res = await response.Content.ReadAsStringAsync();
                if (res.Equals("You can change the password"))
                {
                    TempData["res"] = res;
                    TempData["EmailId"] = emailId;
                    TempData["token"] = token;
                    return RedirectToAction("ResetPassword", "Index");
                }
                else if (res.Equals("Link Expired."))
                {
                    TempData["Error"] = res;
                    return RedirectToAction("Index", "Index");


                }
                else if (res.Equals("Wrong Link"))
                {
                    TempData["Wrong Link"] = res;
                    return RedirectToAction("Index", "Index");

                }
                else
                {
                    TempData["EmailId does not exist"] = "Email id does not exist";
                    return RedirectToAction("Index", "Index");
                }
            }
            else
            {
                TempData["Error"] = "Error while hiting api";
                return RedirectToAction("Index", "Index");
            }

        }


        [HttpGet]
        public async Task<ActionResult> Active(string id, string Token)
        {
            string res = string.Empty;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("Id", id));
            Parameters.Add(new KeyValuePair<string, string>("Token", Token));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/User/VerifyEmail", Parameters, "", "", _appSettings.ApiDomain);

            HttpResponseMessage userresponse = await WebApiReq.GetReq("/api/User/GetUser?Id=" + id, "", "", _appSettings.ApiDomain);
            try
            {
                if (response.IsSuccessStatusCode)
                {
                    //res = await response.Content.ReadAsStringAsync();
                    //TempData["Error"] = res;
                    //return RedirectToAction("index", "index");
                    if (userresponse.IsSuccessStatusCode)
                    {
                        string package = string.Empty;
                        User user = await userresponse.Content.ReadAsAsync<User>();
                        if (user != null)
                        {
                            HttpContext.Session.SetObjectAsJson("User", user);
                        }
                        else
                        {
                            return RedirectToAction("index", "index");
                        }


                        List<KeyValuePair<string, string>> Parameter = new List<KeyValuePair<string, string>>();
                        if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Free)
                        {
                            package = "Free";
                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                        {
                            package = "Deluxe";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Premium)
                        {
                            package = "Premium";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                        {
                            package = "Topaz";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                        {
                            package = "Platinum";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Gold)
                        {
                            package = "Gold";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                        {
                            package = "Ruby";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Standard)
                        {
                            package = "Standard";

                        }

                        if (package != "Free")
                        {
                            Parameter.Add(new KeyValuePair<string, string>("packagename", package));
                            HttpResponseMessage respons = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", Parameter, "", "", _appSettings.ApiDomain);
                            if (respons.IsSuccessStatusCode)
                            {
                                try
                                {
                                    if ((user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.notadded || user.PayPalAccountStatus == Domain.Socioboard.Enum.PayPalAccountStatus.inprogress) && (user.AccountType != Domain.Socioboard.Enum.SBAccountType.Free))
                                    {

                                        Domain.Socioboard.Models.Package _Package = await respons.Content.ReadAsAsync<Domain.Socioboard.Models.Package>();
                                        HttpContext.Session.SetObjectAsJson("Package", _Package);
                                        if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                                        {
                                            HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                            return Redirect(Helpers.Payment.RecurringPaymentWithPayPal(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL));
                                        }
                                        else
                                        {
                                            HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                            return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });
                                        }
                                    }
                                    else
                                    {
                                        return RedirectToAction("Index", "Home");
                                    }
                                }
                                catch (Exception ex) { }

                            }
                        }
                        else
                        {
                            List<KeyValuePair<string, string>> _Parameters = new List<KeyValuePair<string, string>>();
                            _Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                            HttpResponseMessage _response = await WebApiReq.PostReq("/api/User/UpdateFreeUser", _Parameters, "", "", _appSettings.ApiDomain);
                            if (response.IsSuccessStatusCode)
                            {
                                try
                                {
                                    Domain.Socioboard.Models.User _user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                                    HttpContext.Session.SetObjectAsJson("User", _user);
                                    return RedirectToAction("Index", "Home");
                                }
                                catch { }
                            }
                        }
                        return RedirectToAction("index", "index");
                    }
                }
                else
                {
                    TempData["Error"] = "Error while hiting api";
                    return RedirectToAction("index", "index");
                }
                return RedirectToAction("index", "index");
            }
            catch (Exception ex)
            {
                return RedirectToAction("index", "index");
            }

        }


        [HttpGet]
        public async Task<ActionResult> PayPalAccount(string emailId, bool IsLogin)
        {
            HttpResponseMessage userresponse = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + emailId, "", "", _appSettings.ApiDomain);
            if (userresponse.IsSuccessStatusCode)
            {
                string package = string.Empty;
                User user = await userresponse.Content.ReadAsAsync<User>();
                HttpContext.Session.SetObjectAsJson("User", user);
                if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Free)
                {
                    package = "Free";
                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                {
                    package = "Deluxe";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Premium)
                {
                    package = "Premium";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                {
                    package = "Topaz";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                {
                    package = "Platinum";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Gold)
                {
                    package = "Gold";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                {
                    package = "Ruby";

                }
                else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Standard)
                {
                    package = "Standard";

                }
                List<KeyValuePair<string, string>> Parameter = new List<KeyValuePair<string, string>>();
                Parameter.Add(new KeyValuePair<string, string>("packagename", package));
                HttpResponseMessage respons = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", Parameter, "", "", _appSettings.ApiDomain);
                if (respons.IsSuccessStatusCode)
                {
                    try
                    {
                        Domain.Socioboard.Models.Package _Package = await respons.Content.ReadAsAsync<Domain.Socioboard.Models.Package>();
                        HttpContext.Session.SetObjectAsJson("Package", _Package);
                        if (!IsLogin)
                        {
                            if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                            {
                                HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                string paypalUrl = Helpers.Payment.RecurringPaymentWithPayPal(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL);
                                return Content(paypalUrl);
                            }
                            else
                            {
                                HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                return RedirectToAction("paymentWithPayUMoney", "Index");
                            }
                        }
                        else
                        {
                            if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                            {
                                HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                return Redirect(Helpers.Payment.RecurringPaymentWithPayPal(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL));
                            }
                            else
                            {
                                HttpContext.Session.SetObjectAsJson("paymentsession", true);
                                return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });
                            }
                        }
                    }
                    catch (Exception ex) { }

                }

            }
            return Content("");
        }


    }
}
