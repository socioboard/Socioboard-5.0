using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Socioboard.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class BoardMeController : Controller
    {


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
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> getTwitterFeeds(string boardId, int skip, int count)
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
        public async Task<IActionResult> getInstagramFeeds(string boardId, int skip, int count)
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
        public async Task<IActionResult> getGplusFeeds(string boardId, int skip, int count)
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
