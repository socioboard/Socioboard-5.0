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
    public class EwalletController : Controller
    {
        public EwalletController(ILogger<EwalletController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

         //Ads verfication

        [HttpGet("GetEwalletTransactions")]
        public IActionResult GetEwalletTransactions(long userid)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Ewallet> lsturl = dbr.Find<Ewallet>(t => t.UserId == userid).ToList();
                if (lsturl != null)
                {
                    return Ok(lsturl);
                }
                else
                {
                    return NotFound();
                }
            }
            catch(Exception ex)
            {
                return NotFound();
            }
           

        }

        [HttpGet("UserBalance")]
        public IActionResult UserBalance(long userid)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                double AddMoney = dbr.Find<Ewallet>(t => t.UserId == userid && t.TransactionStatus == "Money Added").Sum(t => t.Amount);
                double withdrawMoney = dbr.Find<Ewallet>(t => t.UserId == userid && t.TransactionStatus == "Money withdraw").Sum(t => t.Amount);
                double Balance = AddMoney - withdrawMoney;
                return Ok(Balance);
            }
            catch(Exception ex)
            {
                return BadRequest();
            }
           

        }
        
    }
}
