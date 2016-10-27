using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Domain.Socioboard.Interfaces.Services;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AgencyUserController : Controller
    {
        public AgencyUserController(ILogger<AgencyUserController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _appEnv = appEnv;

        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private readonly IEmailSender _emailSender;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _appEnv;


        [HttpPost("UpdateUserInfo")]
        public IActionResult UpdateUserInfo(Domain.Socioboard.Models.AgencyUser _AgencyUser)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger,_appEnv);
            _AgencyUser.createdDate = DateTime.UtcNow;
          int SavedStatus= dbr.Add<Domain.Socioboard.Models.AgencyUser>(_AgencyUser);

            if (SavedStatus == 1 && _AgencyUser != null)
            {

                try
                {
                    string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\plan.html";
                    string html = System.IO.File.ReadAllText(path);
                    html = html.Replace("[FirstName]", _AgencyUser.userName);
                    html = html.Replace("[AccountType]", _AgencyUser.planType.ToString());
                    _emailSender.SendMailSendGrid(_appSettings.frommail, "", _AgencyUser.email, "", "", "You requested for Demo plan", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
                    Mailforsocioboard(_AgencyUser);
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
        public ActionResult Mailforsocioboard(Domain.Socioboard.Models.AgencyUser _AgencyUser)
        {
            string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\registrationmail.html";
            string html = System.IO.File.ReadAllText(path);
            html = html.Replace("[FirstName]", _AgencyUser.userName);
            html = html.Replace("[AccountType]", _AgencyUser.planType.ToString());
            _emailSender.SendMail("", "", "sumit@socioboard.com", "", "", "Customer requested for demo enterprise plan ", html, _appSettings.ZohoMailUserName, _appSettings.ZohoMailPassword);
            return Ok("Mail Sent Successfully.");

        }


    }
}
