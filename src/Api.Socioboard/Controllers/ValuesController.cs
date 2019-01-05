using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Api.Socioboard.Controllers
{
    [Route("")]
    public class ValuesController : Controller
    {
       
        [HttpGet]
        public string Get()
        {
            return "Socioboard API has been started!";
        }

    }
}
