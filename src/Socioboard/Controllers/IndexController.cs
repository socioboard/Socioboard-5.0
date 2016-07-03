using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Helpers;
using System.Net.Http;
using Socioboard.Extensions;
using Domain.Socioboard.ViewModels;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class IndexController : Controller
    {

        private Helpers.AppSettings _appSettings;

        public IndexController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }


        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return View();
        }

        [HttpPost]
        public async Task<string> Login(UserLoginViewModel userViewModel)
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
                }
                catch (Exception e)
                {
                    output = await response.Content.ReadAsStringAsync();
                }

            }

            return output;
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
            return View();
        }
        public IActionResult Enterprise()
        {
            return View();
        }

        public IActionResult Plans()
        {
            return View();
        }

        public IActionResult Download()
        {
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

    }
}
