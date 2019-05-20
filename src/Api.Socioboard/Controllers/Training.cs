using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;



// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class Training : Controller
    {
        public Training(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
          
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        [HttpPost("getTrainingDetails")]
        public IActionResult getTrainingDetails(string firstName, string lastName, string company, string emailId, string phoneNumber, string message, string demoPlanType, string amount)
        {
            Domain.Socioboard.Models.Training _trainingDetails = new Domain.Socioboard.Models.Training();
            _trainingDetails.FirstName = firstName;
            _trainingDetails.LastName = lastName;
            _trainingDetails.Company = company;
            _trainingDetails.EmailId = emailId;
            _trainingDetails.PhoneNo = phoneNumber;
            _trainingDetails.Message = message;
            //_trainingDetails.PaymentAmount = double.Parse(amount);
            //HttpContext.Session.SetObjectAsJson();
            //return Content(Helpers.Payment.AgencyPayment(amount, demoPlanType, firstName + " " + lastName, phoneNumber, emailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.AgencycallBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
            return Ok("true"); 
        }


        
    }
}
