using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Socioboard.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Socioboard.Extensions;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class BoardMeController : Controller
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user != null)
            {
                SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
                strdic.Add("emailId", user.EmailId);
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
                    Domain.Socioboard.Models.User _user = Newtonsoft.Json.JsonConvert.DeserializeObject<Domain.Socioboard.Models.User>(response);
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

        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;


        public BoardMeController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings, ILogger<IndexController> logger)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }
        

        [HttpGet]
        [Route("board/{boardName}")]
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
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> getTwitterFeeds(long boardId, int skip, int count)
        {
            HttpResponseMessage response = await WebApiReq.GetReq("/api/BoardMe/getTwitterFeeds?boardId=" + boardId+ "&skip="+skip+ "&count="+count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                   var boardTwitterFeeds = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.MongoBoardTwtFeeds>>();
                    return View(boardTwitterFeeds);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }

            }

            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> getInstagramFeeds(long boardId, int skip, int count)
        {
            HttpResponseMessage response = await WebApiReq.GetReq("/api/BoardMe/getInstagramFeeds?boardId=" + boardId + "&skip=" + skip + "&count=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var boardInstagramFeeds = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.MongoBoardInstagramFeeds>>();
                    return View(boardInstagramFeeds);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }

            }

            return View();
        }
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> getGplusFeeds(long boardId, int skip, int count)
        {
            HttpResponseMessage response = await WebApiReq.GetReq("/api/BoardMe/getGplusfeeds?boardId=" + boardId + "&skip=" + skip + "&count=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var boardGplusFeeds = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.MongoBoardGplusFeeds>>();
                    return View(boardGplusFeeds);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }

            }

            return View();
        }
    }
}
