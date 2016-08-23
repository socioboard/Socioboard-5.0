using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AffiliatesController : Controller
    {
        public AffiliatesController(ILogger<AffiliatesController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _appEnv = appEnv;

        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _appEnv;

        [HttpGet("AddAffiliate")]
        public IActionResult AddAffiliate(long userId, long friendId, double amount)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Repositories.AffiliatesRepository.AddAffiliate(userId, friendId, amount,dbr);
            return Ok();
        }

        [HttpGet("GetAffiliateData")]
        public IActionResult GetAffiliateData(long userId, long friendId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.AffiliatesRepository.GetAffiliateDataByUserId(userId, friendId, dbr, _redisCache));
        }

        [HttpGet("GetAffiliateDataUserId")]
        public IActionResult GetAffiliateDataUserId(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.AffiliatesRepository.GetAffilieteDetailbyUserId(userId, dbr, _redisCache));
        }

        [HttpGet("AddRequestToWithdraw")]
        public IActionResult AddRequestToWithdraw(string WithdrawAmount, string PaymentMethod, string PaypalEmail, string IbanCode, string SwiftCode, string Other, long UserID)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Repositories.EwalletWithdrawRepository.AddRequestToWithdraw(WithdrawAmount, PaymentMethod, PaypalEmail, IbanCode, SwiftCode, Other, UserID, dbr);
            return Ok();
        }

        [HttpGet("GetEwalletWithdraw")]
        public IActionResult GetEwalletWithdraw(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.EwalletWithdrawRepository.GetEwalletWithdraw(userId, dbr));
        }

        [HttpGet("GetAllEwalletWithdraw")]
        public IActionResult GetAllEwalletWithdraw()
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.EwalletWithdrawRepository.GetEwalletWithdraw(dbr));
        }

        [HttpGet("UpdatePaymentStatus")]
        public IActionResult UpdatePaymentStatus(long EwalletWithdrawid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger,_appEnv);
            Repositories.EwalletWithdrawRepository.UpdatePaymentStatus(EwalletWithdrawid, dbr);
            return Ok();
        }

    }
}
