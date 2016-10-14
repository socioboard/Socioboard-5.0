using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class PaymentTransactionController : Controller
    {

        public PaymentTransactionController(ILogger<PaymentTransactionController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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
        [HttpPost("GetPackage")]
        public IActionResult GetPackage(string packagename)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.PaymentTransactionRepository.GetPackage(packagename, dbr));
        }

        [HttpPost("UpgradeAccount")]
        public IActionResult UpgradeAccount(string userId, string amount, string UserName, string email)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            try
            {
                User inMemUser = _redisCache.Get<User>(UserName);

                if (inMemUser != null)
                {
                    inMemUser.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                    inMemUser.ExpiryDate = DateTime.UtcNow.AddDays(30);
                    inMemUser.Id = Convert.ToInt64(userId);
                    dbr.Update<User>(inMemUser);
                }
                else
                {
                    User _user = dbr.Single<User>(t => t.Id == Convert.ToInt64(userId));
                    if (_user != null)
                    {
                        _user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                        _user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                        _user.Id = Convert.ToInt64(userId);
                        dbr.Update<User>(_user);
                    }
                }
                int isaved = Repositories.PaymentTransactionRepository.AddPaymentTransaction(Convert.ToInt64(userId), amount, email, dbr);
                if (isaved == 1)
                {
                    return Ok("payment done");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return Ok();
        }
    }
}
