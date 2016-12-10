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
        public IActionResult UpgradeAccount(string userId, string amount, string UserName, string email,Domain.Socioboard.Enum.PaymentType PaymentType,string trasactionId,string paymentId, Domain.Socioboard.Enum.SBAccountType accType)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            try
            {
                User inMemUser = _redisCache.Get<User>(UserName);

                if (inMemUser != null)
                {
                    inMemUser.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                    inMemUser.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                     inMemUser.ExpiryDate = DateTime.UtcNow.AddDays(30);
                    inMemUser.Id = Convert.ToInt64(userId);
                    inMemUser.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                    if (accType == Domain.Socioboard.Enum.SBAccountType.Free)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Deluxe;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Premium)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Premium;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Topaz;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Platinum;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Gold)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Gold;

                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Ruby;
    
                    }
                    else if (accType == Domain.Socioboard.Enum.SBAccountType.Standard)
                    {
                        inMemUser.AccountType = Domain.Socioboard.Enum.SBAccountType.Standard;

                    }
                    dbr.Update<User>(inMemUser);
                }
                else
                {
                    User _user = dbr.Single<User>(t => t.Id == Convert.ToInt64(userId));
                    if (_user != null)
                    {
                        _user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                        _user.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                     _user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                        _user.Id = Convert.ToInt64(userId);
                        _user.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                        if (accType == Domain.Socioboard.Enum.SBAccountType.Free)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Deluxe)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Deluxe;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Premium)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Premium;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Topaz)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Topaz;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Platinum)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Platinum;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Gold)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Gold;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Ruby)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Ruby;

                        }
                        else if (accType == Domain.Socioboard.Enum.SBAccountType.Standard)
                        {
                            _user.AccountType = Domain.Socioboard.Enum.SBAccountType.Standard;

                        }
                        dbr.Update<User>(_user);
                    }
                }
                int isaved = Repositories.PaymentTransactionRepository.AddPaymentTransaction(Convert.ToInt64(userId), amount, email, PaymentType,paymentId,trasactionId ,dbr);
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

        [HttpPost("UpdateRecurringUser")]
        public IActionResult UpdateRecurringUser(string subscr_id,string txn_id)
        {
            try
            {
                Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
                Domain.Socioboard.Models.PaymentTransaction _PaymentTransaction = dbr.FindSingle<Domain.Socioboard.Models.PaymentTransaction>(t => t.paymentId.Contains(subscr_id));
                Domain.Socioboard.Models.User _user = dbr.FindSingle<Domain.Socioboard.Models.User>(x => x.Id == _PaymentTransaction.userid);
                _user.ExpiryDate = _user.ExpiryDate.AddDays(30);
                _user.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                dbr.Update<Domain.Socioboard.Models.User>(_user);
                _PaymentTransaction.trasactionId = txn_id;
                dbr.Update<Domain.Socioboard.Models.PaymentTransaction>(_PaymentTransaction);
            }
            catch (Exception ex)
            {
                _logger.LogError("UpdateRecurringUser======"+ex.StackTrace);
                _logger.LogError("UpdateRecurringUser========="+ex.Message);
            }
            return Ok();
        }
    }
}
