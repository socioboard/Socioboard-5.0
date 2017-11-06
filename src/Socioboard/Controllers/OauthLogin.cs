using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class OauthLogin : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public ActionResult oauthlogin()
        {
            return null;
        }
        [HttpPost]
        public ActionResult oauthlogin(string data)
        {
            return null;
        }

    }
}
