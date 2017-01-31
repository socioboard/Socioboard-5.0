using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using Domain.Socioboard.Interfaces.Services;



// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class TrainingController : Controller
    {
        public TrainingController(ILogger<TrainingController> logger, IEmailSender emailSender, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _emailSender = emailSender;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
            
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private readonly IEmailSender _emailSender;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        //[HttpPost("getTrainingDetails")]
        //public IActionResult getTrainingDetails(string firstName, string lastName, string company, string emailId, string phoneNumber, string message, string demoPlanType, string amount)
        //{
        //    Domain.Socioboard.Models.Training _trainingDetails = new Domain.Socioboard.Models.Training();
        //    _trainingDetails.FirstName = firstName;
        //    _trainingDetails.LastName = lastName;
        //    _trainingDetails.Company = company;
        //    _trainingDetails.EmailId = emailId;
        //    _trainingDetails.PhoneNo = phoneNumber;
        //    _trainingDetails.Message = message;
        //    //_trainingDetails.PaymentAmount = double.Parse(amount);
        //    //HttpContext.Session.SetObjectAsJson();
        //    //return Content(Helpers.Payment.AgencyPayment(amount, demoPlanType, firstName + " " + lastName, phoneNumber, emailId, "USD", _appSettings.paypalemail, _appSettings.callBackUrl, _appSettings.failUrl, _appSettings.AgencycallBackUrl, _appSettings.cancelurl, "", "", _appSettings.PaypalURL));
        //    return Ok("true"); 
        //}


        [HttpPost("updateTrainingDetails")]
        public IActionResult updateTrainingDetails(Domain.Socioboard.Models.Training _training)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _env);
            _training.CreatedDate = DateTime.UtcNow;

            int SavedStatus = dbr.Add<Domain.Socioboard.Models.Training>(_training);

            if (SavedStatus == 1 && _training != null)
            {

                try
                {
                    string path = _env.WebRootPath + "\\views\\mailtemplates\\plan.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", _training.FirstName);
                    html = html.Replace("[AccountType]", "Training");
                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", _training.EmailId, "", "", "hello", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
                    Mailforsocioboard(_training);
                    return Ok("Demo Requested Added");
                }
                catch (Exception ex)
                {
                    return Ok("Issue while sending mail.");
                }
            }
            else
            {
                return Ok("problem while saving,pls try after some time");
            }
        }


        [HttpPost("demoReq")]
        public ActionResult Mailforsocioboard(Domain.Socioboard.Models.Training _training)
        {
            string path = _env.WebRootPath + "\\views\\mailtemplates\\registrationmail.html";
            string html = System.IO.File.ReadAllText(path);
            html = html.Replace("[FirstName]", _training.FirstName);
            html = html.Replace("[AccountType]", "Training");
            // _emailSender.SendMail("", "", "sumit@socioboard.com", "", "", "Customer requested for demo enterprise plan ", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
            _emailSender.SendMailSendGrid("", "", "sumit@socioboard.com", "", _appSettings.ccmail, "Customer requested for demo enterprise plan ", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
            return Ok("Mail Sent Successfully.");

        }


    }



}

