using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;


namespace Socioboard.Controllers
{
    public class HomeController : Controller
    {
        private Helpers.AppSettings _appSettings;

        public HomeController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
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
                if (user.ExpiryDate < DateTime.UtcNow)
                {
                    return RedirectToAction("UpgradePlans", "Index");

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

        [HttpGet]
        public bool IsSessionExist()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return false;
            }
            else
            {
                try
                {
                    if (user.ExpiryDate < DateTime.UtcNow)
                    {
                        return false;

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
                if(res.Equals("updated"))
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
                            package = "SocioBasic";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                        {
                            package = "SocioDeluxe";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Gold)
                        {
                            package = "SocioPremium";

                        }
                        else if (user.AccountType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                        {
                            package = "SocioStandard";

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
                                    Domain.Socioboard.Models.Package _Package = await respons.Content.ReadAsAsync<Domain.Socioboard.Models.Package>();
                                    HttpContext.Session.SetObjectAsJson("Package", _Package);
                                    return Redirect(Helpers.Payment.RecurringPaymentWithPayPal(_Package.amount, _Package.packagename, user.FirstName + " " + user.LastName, user.PhoneNumber, user.EmailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.callBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
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

    }
}
