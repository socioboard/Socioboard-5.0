using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using System.Xml;
using System.Text.RegularExpressions;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class BillingController : Controller
    {
        public BillingController(ILogger<BillingController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        //Current Plan details
        [HttpGet("CurrentPlanDetails")]
        public IActionResult CurrentPlanDetails(long userid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.PaymentTransaction details = new PaymentTransaction();
            User lsturl = dbr.Single<User>(t => t.Id == userid);
            Domain.Socioboard.Enum.SBAccountType type= lsturl.AccountType;
            if(type==0)
            {
                details.amount = "0";
            }
            else
            {
                try
                {
                    IList<PaymentTransaction> lstpayment = dbr.Find<PaymentTransaction>(t => t.userid == userid);
                    foreach (Domain.Socioboard.Models.PaymentTransaction payment in lstpayment)
                    {
                        if (payment.paymentdate.Date.Month == DateTime.UtcNow.Date.Month)
                        {
                            details.id = payment.id;
                            details.itemname = payment.itemname;
                            details.media = payment.media;
                            details.payeremail = payment.payeremail;
                            details.Payername = payment.Payername;
                            details.paymentdate = payment.paymentdate;
                            details.paymentId = payment.paymentId;
                            details.paymentstatus = payment.paymentstatus;
                            details.PaymentType = payment.PaymentType;
                            details.subscrdate = payment.subscrdate;
                            details.trasactionId = payment.trasactionId;
                            details.userid = payment.userid;
                            details.amount = payment.amount;
                            details.email = payment.email;

                        }
                    }
                }
                catch(Exception ex)
                {

                }
                
            }
           return Ok(details);
        }
    }
}
