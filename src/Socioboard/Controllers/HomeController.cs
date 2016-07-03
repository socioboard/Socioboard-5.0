using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;

namespace Socioboard.Controllers
{
    public class HomeController : Controller
    {
        private Helpers.AppSettings _appSettings;

        public HomeController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }


        public async  Task<IActionResult> Index()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if(user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            HttpResponseMessage response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId="+user.Id, "", "", _appSettings.ApiDomain);
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
                        long selectedGroupId = groups.FirstOrDefault(t => t.GroupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).Id;
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


        public IActionResult Logout()
        {
            HttpContext.Session.Remove("User");
            HttpContext.Session.Remove("selectedGroupId");
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Index");
        }


        public IActionResult Error()
        {
            return View();
        }
        public IActionResult GroupInvite(string token, string email)
        {

            return View();
        }
    }
}
