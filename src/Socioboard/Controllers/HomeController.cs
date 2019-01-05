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
using iTextSharp.text.pdf;
using iTextSharp.text;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Socioboard.Helper;
using Newtonsoft.Json;
using System.Net;
using Domain.Socioboard.Enum;

namespace Socioboard.Controllers
{
    public class HomeController : SocioboardController
    {

        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _appEnv;

        public HomeController(ILogger<HomeController> logger, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings) : base(settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
            _appEnv = appEnv;
        }




        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> Index()
        {
            var user = HttpContext.Session.GetObjectFromJson<User>("User");

            HttpContext.Session.SetObjectAsJson("twosteplogin", "false");

            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            await UpdateSessionData();

            try
            {
                ViewBag.AccountType = user.AccountType.ToString();

                //if user has crossed the expire date, then switch the user into free plan with 30 days expire
                if (user.ExpiryDate < DateTime.UtcNow)
                {
                    if (user.TrailStatus != UserTrailStatus.inactive)
                    {
                        var param = new List<KeyValuePair<string, string>>
                        {
                            new KeyValuePair<string, string>("Id", user.Id.ToString())
                        };

                        var trailResponse = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", param, "", "", _appSettings.ApiDomain);

                        if (trailResponse.IsSuccessStatusCode)
                        {
                            var currentUser = await trailResponse.Content.ReadAsAsync<User>();
                            HttpContext.Session.SetObjectAsJson("User", currentUser);
                            user = currentUser;
                        }
                    }
                }

                else if (user.PaymentStatus == SBPaymentStatus.UnPaid && user.AccountType != SBAccountType.Free)
                {
                    HttpContext.Session.SetObjectAsJson("paymentsession", true);
                    return RedirectToAction("Index", "Payment", new { emailId = user.EmailId, IsLogin = true });
                }

            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Index");
            }
            string sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");

            HttpResponseMessage response = await WebApiReq.GetReq("/api/Groups/GetUserGroupData?userId=" + user.Id + "&groupId=" + sessionSelectedGroupId, "", "", _appSettings.ApiDomain);

            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var groups = await response.Content.ReadAsAsync<GetUserGroupData>();

                    ViewBag.groups = JsonConvert.SerializeObject(groups.lstgroup);

                    if (!string.IsNullOrEmpty(sessionSelectedGroupId))
                    {
                        ViewBag.selectedGroupId = sessionSelectedGroupId;
                        try
                        {
                            var keyValuePairProfiles = groups.myProfiles.Single(x => x.Key == Convert.ToInt32(sessionSelectedGroupId));
                            var groupProfiles = keyValuePairProfiles.Value.ToList();
                            ViewBag.groupProfiles = JsonConvert.SerializeObject(groupProfiles);
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
                        catch (Exception)
                        {

                            ViewBag.groupProfiles = Newtonsoft.Json.JsonConvert.SerializeObject(new List<Groupprofiles>());
                            int count = 0;
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
                        try
                        {
                            long selectedGroupId = groups.lstgroup.Single(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).id;
                            HttpContext.Session.SetObjectAsJson("selectedGroupId", selectedGroupId);
                            ViewBag.selectedGroupId = selectedGroupId;
                            List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = new List<Groupprofiles>();
                            if (groups.myProfiles.Count != 0)
                            {
                                var keyValuePairProfiles = groups.myProfiles.Single(x => x.Key == selectedGroupId);
                                groupProfiles = keyValuePairProfiles.Value.ToList();
                            }
                            ViewBag.groupProfiles = Newtonsoft.Json.JsonConvert.SerializeObject(groupProfiles);
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
                        catch
                        {
                            ViewBag.groupProfiles = Newtonsoft.Json.JsonConvert.SerializeObject(new List<Groupprofiles>());
                            int count = 0;
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
                }
                catch (Exception ex)
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
            ViewBag.user = JsonConvert.SerializeObject(user);
            return View();
        }

        private async Task UpdateSessionData()
        {
            var session = HttpContext.Session.GetObjectFromJson<SessionHistory>("revokedata");

            if (session != null)
            {
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("systemId", session.systemId)
                };

                var respon = await WebApiReq.PostReq("/api/User/UpdateSessiondata", parameters, "", "", _appSettings.ApiDomain);

                if (respon.IsSuccessStatusCode)
                {
                    try
                    {
                        var sessionHistory = await respon.Content.ReadAsAsync<SessionHistory>();
                        HttpContext.Session.SetObjectAsJson("revokedata", sessionHistory);
                    }
                    catch (Exception)
                    {
                        HttpContext.Session.Remove("User");
                        HttpContext.Session.Remove("selectedGroupId");
                        HttpContext.Session.Clear();
                        HttpContext.Session.Remove("revokedata");
                    }
                }

            }
        }

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveSessiondata(string ip, string browserName, string userAgent)
        {
            var user = HttpContext.Session.GetObjectFromJson<User>("User");
            var systemId = string.Empty;
            userAgent = getBetween(userAgent, "Mozilla/5.0 (", ";");

            var browserData = browserName + " on " + userAgent;

            var param = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("ip", ip),
                new KeyValuePair<string, string>("browserOs", browserData),
                new KeyValuePair<string, string>("userId", user.Id.ToString())
            };

            var httpResponseMessage = await WebApiReq.PostReq("/api/User/SaveSessiondata", param, "", "", _appSettings.ApiDomain);


            if (!httpResponseMessage.IsSuccessStatusCode)
                return Content(systemId);

            var sessionHistory = await httpResponseMessage.Content.ReadAsAsync<SessionHistory>();
            systemId = sessionHistory.systemId;
            HttpContext.Session.SetObjectAsJson("revokedata", sessionHistory);

            return Content(systemId);
        }




        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> IndexForTwoStep(string EmailId)
        {
            var userDetails = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + EmailId, "", "", _appSettings.ApiDomain);

            if (userDetails.IsSuccessStatusCode)
            {
                var userResponse = await userDetails.Content.ReadAsAsync<User>();
                HttpContext.Session.SetObjectAsJson("User", userResponse);
            }

            var user = HttpContext.Session.GetObjectFromJson<User>("User");

            if (user == null)
                return RedirectToAction("Index", "Index");

            try
            {
                ViewBag.AccountType = user.AccountType.ToString();

                if (user.ExpiryDate < DateTime.UtcNow)
                {
                    if (user.TrailStatus != Domain.Socioboard.Enum.UserTrailStatus.inactive)
                    {
                        var param = new List<KeyValuePair<string, string>>
                        {
                            new KeyValuePair<string, string>("Id", user.Id.ToString())
                        };

                        var trialResponse = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", param, "", "", _appSettings.ApiDomain);

                        if (trialResponse.IsSuccessStatusCode)
                        {
                            user = await trialResponse.Content.ReadAsAsync<User>();
                            HttpContext.Session.SetObjectAsJson("User", user);
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

            var response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId=" + user.Id, "", "", _appSettings.ApiDomain);

            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var groups = await response.Content.ReadAsAsync<List<Groups>>();
                    ViewBag.groups = JsonConvert.SerializeObject(groups);

                    var sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");

                    if (!string.IsNullOrEmpty(sessionSelectedGroupId))
                    {
                        ViewBag.selectedGroupId = sessionSelectedGroupId;

                        var groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + sessionSelectedGroupId, "", "", _appSettings.ApiDomain);
                        if (groupProfilesResponse.IsSuccessStatusCode)
                        {
                            var groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Groupprofiles>>();
                            ViewBag.groupProfiles = JsonConvert.SerializeObject(groupProfiles);

                            var count = groupProfiles.Count;
                            ViewBag.MaxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);
                            ViewBag.profileCount = count;
                            ViewBag.AccountType = user.AccountType;
                            ViewBag.downgrade = count > ViewBag.MaxCount ? "true" : "false";
                        }
                    }
                    else
                    {
                        var selectedGroupId = groups.FirstOrDefault(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).id;

                        HttpContext.Session.SetObjectAsJson("selectedGroupId", selectedGroupId);
                        ViewBag.selectedGroupId = selectedGroupId;
                        var groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + selectedGroupId, "", "", _appSettings.ApiDomain);

                        if (groupProfilesResponse.IsSuccessStatusCode)
                        {
                            var groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Groupprofiles>>();
                            ViewBag.groupProfiles = JsonConvert.SerializeObject(groupProfiles);
                            var count = groupProfiles.Count;
                            var maxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);

                            ViewBag.profileCount = count;
                            ViewBag.MaxCount = maxCount;

                            ViewBag.downgrade = count > maxCount ? "true" : "false";
                        }

                    }
                }
                catch (Exception)
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

            ViewBag.user = JsonConvert.SerializeObject(user);

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
                output = await respon.Content.ReadAsStringAsync();
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


        private async Task logoutsessiondata()
        {
            Domain.Socioboard.Models.SessionHistory session = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.SessionHistory>("revokedata");
            if (session != null)
            {
                List<KeyValuePair<string, string>> Param = new List<KeyValuePair<string, string>>();
                Param.Add(new KeyValuePair<string, string>("systemId", session.systemId));
                Param.Add(new KeyValuePair<string, string>("sessionId", session.id.ToString()));
                HttpResponseMessage respon = await WebApiReq.PostReq("/api/User/RevokeSession", Param, "", "", _appSettings.ApiDomain);
                if (respon.IsSuccessStatusCode)
                {
                    HttpContext.Session.Remove("revokedata");
                }
            }
        }

        [ResponseCache(Duration = 100)]
        [HttpGet]
        public async Task<IActionResult> Revoke(string sessionId)
        {
            HttpContext.Session.Remove("User");
            HttpContext.Session.Remove("selectedGroupId");
            HttpContext.Session.Clear();
            ViewBag.user = null;
            ViewBag.selectedGroupId = null;
            ViewBag.groupProfiles = null;

            var param = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("sessionId", sessionId)
            };

            await WebApiReq.PostReq("/api/User/RevokeSession", param, "", "", _appSettings.ApiDomain);

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
            return Ok();
        }

        [HttpGet]
        public IActionResult IsSessionExist()
        {
            try
            {
                var user = HttpContext.Session.GetObjectFromJson<User>("User");

                if (user == null)
                    return Content("false");

                var twostep = HttpContext.Session.GetObjectFromJson<string>("twosteplogin");

                if (twostep == "true" || user.TwostepEnable)
                    return Content("TwoStepLogin");


                if (user.ExpiryDate < DateTime.UtcNow)
                {
                    // return false;
                }
            }
            catch (Exception)
            {
                return Content("false");
            }
            return Content("true");
        }

        [HttpGet]
        public async Task<IActionResult> UserSession()
        {
            var user = HttpContext.Session.GetObjectFromJson<User>("User");

            var emailId = string.Empty;
            var password = string.Empty;
            var sociorevtoken = string.Empty;

            try
            {
                if (user == null)
                {
                    if (Request.Cookies["sociorevtoken"] != null)
                    {

                        sociorevtoken = Request.Cookies["sociorevtoken"];
                        sociorevtoken = PluginHelper.Base64Decode(sociorevtoken);
                        var parameters = new List<KeyValuePair<string, string>>
                            {
                                new KeyValuePair<string, string>("systemId", sociorevtoken)
                            };
                        var responseMessage = await WebApiReq.PostReq("/api/User/checksociorevtoken", parameters, "", "", _appSettings.ApiDomain);

                        if (responseMessage.IsSuccessStatusCode)
                        {
                            try
                            {
                                var session = await responseMessage.Content.ReadAsAsync<SessionHistory>();
                                HttpContext.Session.SetObjectAsJson("revokedata", session);
                                sociorevtoken = "true";
                            }
                            catch (Exception)
                            {
                                sociorevtoken = "false";
                            }
                        }
                    }

                    if (sociorevtoken == "true")
                    {
                        if (Request.Cookies["socioboardemailId"] != null)
                        {
                            emailId = Request.Cookies["socioboardemailId"];
                            emailId = PluginHelper.Base64Decode(emailId);
                        }
                        if (Request.Cookies["socioboardToken"] != null)
                        {
                            password = Request.Cookies["socioboardToken"];
                            password = PluginHelper.Base64Decode(password);
                        }
                    }

                    if (!string.IsNullOrEmpty(emailId) && !string.IsNullOrEmpty(password))
                    {
                        List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                        Parameters.Add(new KeyValuePair<string, string>("UserName", emailId));
                        Parameters.Add(new KeyValuePair<string, string>("Password", password));
                        HttpResponseMessage _response = await WebApiReq.PostReq("/api/User/CheckUserLogin", Parameters, "", "", _appSettings.ApiDomain);
                        if (_response.IsSuccessStatusCode)
                        {
                            try
                            {
                                user = await _response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                                HttpContext.Session.SetObjectAsJson("User", user);
                                if (user.TwostepEnable == true)
                                {
                                    HttpContext.Session.SetObjectAsJson("twosteplogin", "true");
                                    return Content("false");
                                }
                                return Content("true");
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }

                }
                else
                {
                    return Content("true");
                }
            }
            catch (Exception ex)
            {

            }
            return Content("false");
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
                    TempData["Success"] = "Added Successfully to team";
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
            var parameters = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("Id", id), new KeyValuePair<string, string>("Token", Token)
            };

            var response = await WebApiReq.PostReq("/api/User/VerifyEmail", parameters, "", "", _appSettings.ApiDomain);

            try
            {
                if (response.IsSuccessStatusCode)
                {
                    var userResponse = await WebApiReq.GetReq("/api/User/GetUserDetails?email=" + id, "", "", _appSettings.ApiDomain);

                    if (!userResponse.IsSuccessStatusCode)
                        return RedirectToAction("index", "index");

                    var user = await userResponse.Content.ReadAsAsync<User>();

                    if (user == null)
                        return RedirectToAction("index", "index");

                    HttpContext.Session.SetObjectAsJson("User", user);
                    return RedirectToAction("index", "Home");

                    #region Unwanted Code
                    //var package = user.AccountType.ToString();


                    //var Parameter = new List<KeyValuePair<string, string>>();


                    //if (package != "Free")
                    //{
                    //    Parameter.Add(new KeyValuePair<string, string>("packagename", package));

                    //    var respons = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", Parameter, "", "", _appSettings.ApiDomain);

                    //    if (respons.IsSuccessStatusCode)
                    //    {
                    //        try
                    //        {
                    //            if (user.PayPalAccountStatus != Domain.Socioboard.Enum.PayPalAccountStatus.notadded &&
                    //                 user.PayPalAccountStatus != Domain.Socioboard.Enum.PayPalAccountStatus.inprogress
                    //                 || user.AccountType == Domain.Socioboard.Enum.SBAccountType.Free)
                    //                return RedirectToAction("Index", "Home");

                    //            var _Package = await respons.Content.ReadAsAsync<Package>();
                    //            HttpContext.Session.SetObjectAsJson("Package", _Package);

                    //            if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                    //            {
                    //                HttpContext.Session.SetObjectAsJson("paymentsession", true);
                    //                return Redirect(Payment.PaypalRecurringPayment(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id));
                    //            }

                    //            HttpContext.Session.SetObjectAsJson("paymentsession", true);
                    //            return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });

                    //        }
                    //        catch (Exception ex)
                    //        {
                    //            Console.WriteLine(ex.StackTrace);
                    //        }
                    //    }
                    //}
                    //else
                    //{
                    //    var userParameters = new List<KeyValuePair<string, string>>
                    //    {
                    //        new KeyValuePair<string, string>("userId", user.Id.ToString())
                    //    };

                    //    var freeUserResponse = await WebApiReq.PostReq("/api/User/UpdateFreeUser", userParameters, "", "", _appSettings.ApiDomain);

                    //    if (!response.IsSuccessStatusCode)
                    //        return RedirectToAction("index", "index");

                    //    try
                    //    {
                    //        var currentUserParameter = await freeUserResponse.Content.ReadAsAsync<User>();
                    //        HttpContext.Session.SetObjectAsJson("User", currentUserParameter);
                    //        return RedirectToAction("Index", "Home");
                    //    }
                    //    catch (Exception ex)
                    //    {
                    //        Console.WriteLine(ex.StackTrace);
                    //    }
                    //}

                    //return RedirectToAction("index", "index"); 
                    #endregion
                }

                TempData["Error"] = "Error while hiting api";
                return RedirectToAction("index", "index");
            }
            catch (Exception)
            {
                return RedirectToAction("index", "index");
            }
        }

        [Obsolete("Please use Payment/Index without isLogin property")]
        [HttpGet]
        public async Task<ActionResult> PayPalAccount(string emailId, bool isLogin)
        {
            var userResponse = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + emailId, "", "", _appSettings.ApiDomain);

            if (userResponse.IsSuccessStatusCode)
            {
                var user = await userResponse.Content.ReadAsAsync<User>();
                HttpContext.Session.SetObjectAsJson("User", user);
                var package = user.AccountType.ToString();

                var parameter = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("packagename", package)
                };

                var paymentResponse = await WebApiReq.PostReq("/api/PaymentTransaction/GetPackage", parameter, "", "", _appSettings.ApiDomain);

                if (!paymentResponse.IsSuccessStatusCode)
                    return Content("");

                try
                {
                    var sessionPackage = await paymentResponse.Content.ReadAsAsync<Package>();
                    HttpContext.Session.SetObjectAsJson("Package", sessionPackage);
                    HttpContext.Session.SetObjectAsJson("paymentsession", true);

                    if (user.PaymentType == Domain.Socioboard.Enum.PaymentType.paypal)
                        return Redirect(Payment.PaypalRecurringPayment(sessionPackage.amount,
                            sessionPackage.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber,
                            user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl,
                            _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl,
                            _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id));

                    return RedirectToAction("paymentWithPayUMoney", "Index", new { contesnt = false });

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }

            }
            return Content("");
        }


        BaseFont f_cb = BaseFont.CreateFont("c:\\windows\\fonts\\calibrib.ttf", BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont f_cn = BaseFont.CreateFont("c:\\windows\\fonts\\calibri.ttf", BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        private void writeText(PdfContentByte cb, string Text, int X, int Y, BaseFont font, int Size)
        {
            cb.SetFontAndSize(font, Size);
            cb.ShowTextAligned(PdfContentByte.ALIGN_LEFT, Text, X, Y, 0);
        }

        private PdfTemplate PdfFooter(PdfContentByte cb)//, DataRow drFoot)
        {
            // Create the template and assign height
            PdfTemplate tmpFooter = cb.CreateTemplate(580, 100);
            // Move to the bottom left corner of the template
            tmpFooter.MoveTo(1, 1);
            // Place the footer content
            tmpFooter.Stroke();
            // Begin writing the footer
            tmpFooter.BeginText();
            // Set the font and size
            tmpFooter.SetFontAndSize(f_cn, 8);
            // Write out details from the payee table


            string supplier = "Socioboard";
            string address1 = "TV Complex, 2, 60 Feet Rd, 6th Block";
            string address2 = " Koramangala, Bengaluru, Karnataka";
            string zip = "560034";

            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, supplier.ToString(), 0, 50, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, address1.ToString(), 0, 42, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, address2.ToString(), 0, 34, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, zip.ToString(), 0, 26, 0);

            // Bold text for ther headers
            tmpFooter.SetFontAndSize(f_cb, 8);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, "Phone :", 215, 50, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, "Mail   :", 215, 42, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, "Web   :", 215, 34, 0);
            //tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, "Legal info", 400, 53, 0);
            // Regular text for infomation fields

            string phone = "+91 7406317771";
            string mail = "sumit@socioboard.com";
            string web = "https://www.socioboard.com";
            tmpFooter.SetFontAndSize(f_cn, 8);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, phone.ToString(), 265, 50, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, mail.ToString(), 265, 42, 0);
            tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, web.ToString(), 265, 34, 0);
            //tmpFooter.ShowTextAligned(PdfContentByte.ALIGN_LEFT, drFoot["xtrainfo"].ToString(), 400, 45, 0);
            // End text
            tmpFooter.EndText();
            // Stamp a line above the page footer
            cb.SetLineWidth(0f);
            cb.MoveTo(30, 60);
            cb.LineTo(570, 60);
            cb.Stroke();
            // Return the footer template
            return tmpFooter;
        }

        public async Task<FileContentResult> generatePaymentInvoicePdf(string id, string package)
        {

            var invoiceId = (int)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;

            var filename = "Invoice_" + invoiceId + ".pdf";

            var reportFilePath = _appEnv.WebRootPath + "\\contents\\socioboard\\Invoice\\" + filename;

            var parameter = new List<KeyValuePair<string, string>> { new KeyValuePair<string, string>("id", id) };

            var respons = await WebApiReq.PostReq("/api/PaymentTransaction/GetPaymentTransactiondata", parameter, "", "", _appSettings.ApiDomain);

            if (respons.IsSuccessStatusCode)
            {
                var _PaymentTransaction = await respons.Content.ReadAsAsync<PaymentTransaction>();

                try
                {
                    using (var fs = new FileStream(_appEnv.WebRootPath + "\\contents\\socioboard\\Invoice\\" + "Invoice_" + invoiceId + ".pdf", FileMode.Create))
                    {
                        var document = new Document(PageSize.A4, 25, 25, 30, 1);

                        // Add meta information to the document
                        document.AddAuthor("Socioboard");
                        document.AddCreator("Socioboard Team");
                        document.AddKeywords("User Invoice");
                        document.AddSubject("Invoice");
                        document.AddTitle("User invoice");

                        // Open the document to enable you to write to the document
                        document.Open();

                        var writer = PdfWriter.GetInstance(document, fs);


                        document.Open();
                        // Makes it possible to add text to a specific place in the document using 
                        // a X & Y placement syntax.
                        var cb = writer.DirectContent;

                        var png = Image.GetInstance("https://www.socioboard.com/contents/socioboard/images/Socioboard.png");
                        png.ScaleAbsolute(200, 55);
                        png.SetAbsolutePosition(40, 750);
                        cb.AddImage(png);

                        // First we must activate writing
                        cb.BeginText();

                        // First we write out the header information

                        //User Value
                        var invoiceType = "";
                        var invoiceDate = DateTime.Now;
                        var dueDate = DateTime.Now.AddMonths(1);



                        // Start with the invoice type header
                        writeText(cb, invoiceType, 350, 820, f_cb, 14);
                        // HEader details; invoice number, invoice date, due date and customer Id
                        writeText(cb, "Invoice No    :", 350, 800, f_cb, 10);
                        writeText(cb, invoiceId.ToString(), 420, 800, f_cn, 10);
                        writeText(cb, "Invoice date :", 350, 788, f_cb, 10);
                        writeText(cb, invoiceDate.ToString("dd/MM/yyyy"), 420, 788, f_cn, 10);
                        writeText(cb, "Due date      :", 350, 776, f_cb, 10);
                        writeText(cb, dueDate.ToString("dd/MM/yyyy"), 420, 776, f_cn, 10);
                        string delCustomerName = _PaymentTransaction.Payername;
                        string email = _PaymentTransaction.payeremail;
                        string media = _PaymentTransaction.media;

                        int left_margin = 40;
                        int top_margin = 720;
                        writeText(cb, "User Details :-", left_margin, top_margin, f_cb, 10);
                        writeText(cb, delCustomerName, left_margin, top_margin - 12, f_cn, 10);
                        writeText(cb, email, left_margin, top_margin - 24, f_cn, 10);
                        writeText(cb, media, left_margin, top_margin - 36, f_cn, 10);
                        cb.EndText();
                        // Separate the header from the rows with a line
                        // Draw a line by setting the line width and position
                        cb.SetLineWidth(0f);
                        cb.MoveTo(40, 670);
                        cb.LineTo(560, 670);
                        cb.Stroke();
                        // Don't forget to call the BeginText() method when done doing graphics!
                        cb.BeginText();

                        // Before we write the lines, it's good to assign a "last position to write"
                        // variable to validate against if we need to make a page break while outputting.
                        // Change it to 510 to write to test a page break; the fourth line on a new page
                        int lastwriteposition = 100;

                        // Loop thru the rows in the rows table
                        // Start by writing out the line headers
                        top_margin = 645;
                        left_margin = 40;
                        // Line headers
                        writeText(cb, "Package", left_margin, top_margin, f_cb, 10);
                        writeText(cb, "Description", left_margin + 70, top_margin, f_cb, 10);
                        cb.ShowTextAligned(PdfContentByte.ALIGN_RIGHT, "Payment Date", left_margin + 285, top_margin, 0);
                        writeText(cb, "TransactionId", left_margin + 322, top_margin, f_cb, 10);
                        cb.ShowTextAligned(PdfContentByte.ALIGN_RIGHT, "PaymentStatus ", left_margin + 455, top_margin, 0);
                        writeText(cb, "Paid Amount", left_margin + 475, top_margin, f_cb, 10);


                        cb.EndText();
                        // Separate the header from the rows with a line
                        // Draw a line by setting the line width and position
                        cb.SetLineWidth(0f);
                        cb.MoveTo(40, 630);
                        cb.LineTo(560, 630);
                        cb.Stroke();
                        // Don't forget to call the BeginText() method when done doing graphics!
                        cb.BeginText();
                        // First item line position starts here
                        top_margin = 600;

                        package = package.Replace("Socioboard_", "");
                        var Description = "This package provide .... facilities";
                        var paymentDate = _PaymentTransaction.paymentdate;
                        var paymentStatus = _PaymentTransaction.paymentstatus;
                        var paidAmount = _PaymentTransaction.amount;
                        var transactionId = _PaymentTransaction.trasactionId;


                        writeText(cb, package, left_margin, top_margin, f_cn, 10);
                        writeText(cb, Description, left_margin + 65, top_margin, f_cn, 10);
                        cb.ShowTextAligned(PdfContentByte.ALIGN_RIGHT, paymentDate.ToString("dd/MM/yyyy"), left_margin + 285, top_margin, 0);
                        writeText(cb, transactionId, left_margin + 322, top_margin, f_cn, 10);
                        cb.ShowTextAligned(PdfContentByte.ALIGN_RIGHT, paymentStatus.ToString(), left_margin + 455, top_margin, 0);
                        writeText(cb, paidAmount, left_margin + 475, top_margin, f_cn, 10);
                        cb.EndText();

                        // Close the document, the writer and the filestream!
                        document.Close();
                        writer.Close();
                        fs.Close();

                    }
                }
                catch (Exception error)
                {
                }

                // return File(pdfBytes, "application/pdf", filename);

            }
            byte[] pdfBytes = System.IO.File.ReadAllBytes(reportFilePath);
            if (System.IO.File.Exists(reportFilePath))
            {
                System.IO.File.Delete(reportFilePath);
            }
            // return new FileStreamResult(new MemoryStream(pdfBytes), "application / pdf") { FileDownloadName = filename };

            return File(pdfBytes, "application/pdf", filename);
        }



        [HttpGet]
        public async Task<ActionResult> ActiveYoutubeGroup(string Token)
        {
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("Token", Token));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/YoutubeGroup/ValidateEmail", Parameters, "", "", _appSettings.ApiDomain);

            return RedirectToAction("Index", "Home");
        }


        [HttpGet]
        public async Task<ActionResult> BluesnapAccount(string emailId, bool IsLogin)
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
                                string paypalUrl = Helpers.Payment.PaypalRecurringPayment(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id);
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
                                return Redirect(Helpers.Payment.PaypalRecurringPayment(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, _appSettings.notifyUrl, "", _appSettings.PaypalURL, user.Id));
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


        [HttpPost]
        public async Task<ActionResult> bluesnapCardPaymentEncp()
        {
            string content = await new StreamReader(Request.Body).ReadToEndAsync();
            content = (("{\"" + content).Replace("=", "\":\"").Replace("&", "\",\"") + "\"}").Replace("exp-year", "expyear").Replace("exp-month", "expmonth").Replace("cardholder-name", "cardholdername");

            creditCard creditCardObj = JsonConvert.DeserializeObject<creditCard>(content);
            User user = new Domain.Socioboard.Models.User();
            try
            {
                user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            }
            catch
            {
                user = null;
            }
            string planId = "";

            if (user != null)
            {
                string tempPlan = user.AccountType.ToString();
                //object value = Enum.Parse(Domain.Socioboard.Enum.SBAccountTypeBlueSnap, tempPlan);
                Domain.Socioboard.Enum.SBAccountTypeBlueSnap myStatus;
                Enum.TryParse(tempPlan, out myStatus);
                planId = ((int)myStatus).ToString();


                string xmlData = "<?xml version='1.0'?>" +
                                "<recurring-subscription xmlns='http://ws.plimus.com'>" +
                                "<plan-id>" + planId + "</plan-id>" +
                                "<payer-info>" +
                                "<first-name>" + creditCardObj.cardholdername + "</first-name>" +
                                "<last-name>" + creditCardObj.cardholdername + "</last-name>" +
                                "<zip>12345</zip>" +
                                "<phone>1234567890</phone>" +
                                "</payer-info>" +
                                "<payment-source>" +
                                "<credit-card-info>" +
                                "<credit-card>" +
                                "<encrypted-card-number>" + creditCardObj.encryptedCreditCard + "</encrypted-card-number>" +
                                "<encrypted-security-code>" + creditCardObj.encryptedCvv + "</encrypted-security-code>" +
                                "<expiration-month>" + creditCardObj.expmonth + "</expiration-month>" +
                                "<expiration-year>" + creditCardObj.expyear + "</expiration-year>" +
                                "</credit-card>" +
                                "</credit-card-info>" +
                                "</payment-source>" +
                                "<transaction-fraud-info>" +
                                "<fraud-session-id>1234</fraud-session-id>" +
                                "</transaction-fraud-info>" +
                                "</recurring-subscription>";

                List<KeyValuePair<string, string>> Parameter = new List<KeyValuePair<string, string>>();
                Parameter.Add(new KeyValuePair<string, string>("XMLData", xmlData));
                Parameter.Add(new KeyValuePair<string, string>("emailId", user.EmailId));
                HttpResponseMessage respons = await WebApiReq.PostReq("/api/PaymentTransaction/PostBlueSnapSubscription", Parameter, "", "", _appSettings.ApiDomain);

                if (respons.StatusCode == HttpStatusCode.OK)
                {
                    HttpResponseMessage userresponse = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + user.EmailId, "", "", _appSettings.ApiDomain);
                    if (userresponse.IsSuccessStatusCode)
                    {
                        User userTemp = await userresponse.Content.ReadAsAsync<User>();
                        HttpContext.Session.SetObjectAsJson("User", userTemp);
                    }
                    return RedirectToAction("SignIn", "Index");
                }

            }
            else
            {
                ViewBag.errorCard = "Error";
                return View("payBlueSnap");
            }
            ViewBag.errorCard = "Error";
            return View("payBlueSnap");
        }

        public class creditCard
        {
            public string cardholdername { get; set; }
            public string expmonth { get; set; }
            public string expyear { get; set; }
            public string ccLast4Digits { get; set; }
            public string encryptedCreditCard { get; set; }
            public string encryptedCvv { get; set; }
        }

        //Blue snap payment page
        [HttpGet]
        public async Task<IActionResult> payBlueSnap(string emailId)
        {
            HttpResponseMessage userresponse = await WebApiReq.GetReq("/api/User/GetUserData?emailId=" + emailId, "", "", _appSettings.ApiDomain);
            if (userresponse.IsSuccessStatusCode)
            {
                User user = await userresponse.Content.ReadAsAsync<User>();
                HttpContext.Session.SetObjectAsJson("User", user);
            }
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ipnBluesnap(string transactionType, long subscriptionId)
        {
            try
            {
                _logger.LogInformation("========================================transactiontype======================================");
                _logger.LogInformation(transactionType);
                _logger.LogInformation("========================================subscriptionId======================================");
                _logger.LogInformation(subscriptionId.ToString());



                List<KeyValuePair<string, string>> Parameter = new List<KeyValuePair<string, string>>();
                Parameter.Add(new KeyValuePair<string, string>("subscriptionId", subscriptionId.ToString()));

                HttpResponseMessage respons = await WebApiReq.PostReq("/api/PaymentTransaction/GetBlueSnapSubscription", Parameter, "", "", _appSettings.ApiDomain);
            }
            catch (Exception ex)
            {
                _logger.LogInformation("========================================exception======================================");

                _logger.LogInformation(ex.Message);
            }



            return Ok();
        }

    }
}
