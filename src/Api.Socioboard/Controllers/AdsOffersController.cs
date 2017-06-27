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
    public class AdsOffersController : Controller
    {
        public AdsOffersController(ILogger<AdsOffersController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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

         //Ads verfication

        [HttpGet("AddAdsUrl")]
        public IActionResult AddAdsUrl(long userId,string url)
        {
            try
            {
                Domain.Socioboard.Models.AdsOffers ads = new AdsOffers();

                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                IList<AdsOffers> lstAdsOffers = dbr.Find<AdsOffers>(t => t.UserId == userId);
                if (lstAdsOffers.Count == 0)
                {
                    string lstcontent = Repositories.AdsOffersRepository.findUrlForAds(url);
                    if (lstcontent == "Ads found on website")
                    {
                        IList<User> lstUser = dbr.Find<User>(t => t.Id == userId);
                        string mailid = lstUser.First().EmailId;
                        if (lstUser != null && lstUser.Count() > 0)
                        {
                            ads.adsaccountstatus = Domain.Socioboard.Enum.AdsOfferAccountStatus.Active;
                            ads.adcreateddate = DateTime.UtcNow;
                            ads.UserId = userId;
                            ads.Verified = Domain.Socioboard.Enum.AdsStatus.Verified;
                            ads.WebsiteUrl = url;
                            ads.EmailId = mailid;
                            ads.Verifieddate = DateTime.UtcNow.Date;
                            int SavedStatus = dbr.Add<Domain.Socioboard.Models.AdsOffers>(ads);
                            if (SavedStatus == 1)
                            {
                                lstUser.First().Adsstatus = Domain.Socioboard.Enum.AdsStatus.Verified;
                                lstUser.First().TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                                lstUser.First().PaymentType = Domain.Socioboard.Enum.PaymentType.paypal;
                                lstUser.First().PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                                lstUser.First().AccountType = Domain.Socioboard.Enum.SBAccountType.Platinum;
                                lstUser.First().PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                                //int SavedUserStatus = dbr.Add<Domain.Socioboard.Models.User>(user);
                                int SavedUserStatus = dbr.Update<User>(lstUser.First());
                                // int SavedUserStatus = dbr.Update<User>(user);
                            }
                        }
                        return Ok("Ads found on website");
                    }
                    else
                    {
                        return BadRequest("Ads not found on website");
                    }
                }
                else
                {
                    return BadRequest("you already register for this offer");
                }
            }
            catch(Exception ex)
            {
                return BadRequest("Something went wrong please try after sometime");
            }
         
          // return Ok();
        }

        [HttpGet("FindUrl")]
        public IActionResult FindUrl(long userid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);

            AdsOffers lsturl = dbr.Single<AdsOffers>(t => t.UserId == userid);
            if (lsturl != null)
            {
                return Ok(lsturl);
            }
            else
            {
                return NotFound();
            }

        }
    }
}
