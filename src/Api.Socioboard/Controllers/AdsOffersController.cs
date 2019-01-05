using System;
using System.Linq;
using System.Text.RegularExpressions;
using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Api.Socioboard.Repositories;
using Domain.Socioboard.Enum;
using Domain.Socioboard.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    /// <summary>
    /// Ad Details Controller
    /// </summary>
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class AdsOffersController : Controller
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger _logger;
       
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger">logger information</param>
        /// <param name="settings">app settings</param>
        /// <param name="env">environment details</param>
        public AdsOffersController(ILogger<AdsOffersController> logger, IOptions<AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;                   
            _env = env;
        }

        /// <summary>
        /// To add a url to particular user where socioboards ads specifies
        /// </summary>
        /// <param name="userId">user Id</param>
        /// <param name="url">url</param>
        /// <returns></returns>
        [HttpGet("AddAdsUrl")]
        public IActionResult AddAdsUrl(long userId, string url)
        {
            try
            {
                var ads = new AdsOffers();

                var dbr = new DatabaseRepository(_logger, _env);

                var match = Regex.Match(url, @"^(?:\w+://)?([^/?]*)");

                var homePageUrl = match.Value;

                var lstAdsOffers = dbr.Find<AdsOffers>(t => t.UserId == userId || t.WebsiteUrl.Contains(homePageUrl));

                if (lstAdsOffers.Count != 0)
                    return BadRequest("Sorry, Either user or given url already register for this offer!");

                var contents = AdsOffersRepository.FindUrlForAds(homePageUrl);

                if (contents != "Ads found on website")
                    return BadRequest("Ads not found on website");

                var lstUser = dbr.Find<User>(t => t.Id == userId);

                var mailId = lstUser.First().EmailId;

                if (lstUser.Count > 0)
                {
                    ads.adsaccountstatus = AdsOfferAccountStatus.Active;
                    ads.adcreateddate = DateTime.UtcNow;
                    ads.UserId = userId;
                    ads.Verified = AdsStatus.Verified;
                    ads.WebsiteUrl = homePageUrl;
                    ads.EmailId = mailId;
                    ads.Verifieddate = DateTime.UtcNow.Date;
                    var savedStatus = dbr.Add(ads);

                    if (savedStatus != 1)
                        return Ok("Ads found on website");

                    lstUser.First().Adsstatus = AdsStatus.Verified;
                    lstUser.First().TrailStatus = UserTrailStatus.active;
                    lstUser.First().PaymentType = PaymentType.paypal;
                    lstUser.First().PayPalAccountStatus = PayPalAccountStatus.added;
                    lstUser.First().AccountType = SBAccountType.Standard;
                    lstUser.First().PaymentStatus = SBPaymentStatus.Paid;
                    dbr.Update(lstUser.First());
                }

                return Ok("Ads found on website");
            }
            catch (Exception)
            {
                return BadRequest("Something went wrong please try after sometime");
            }
        }


        /// <summary>
        /// Get the first registered url where ads present for particular user
        /// </summary>
        /// <param name="userid">user id</param>
        /// <returns></returns>
        [HttpGet("FindUrl")]
        public IActionResult FindUrl(long userid)
        {
            var dbRepository = new DatabaseRepository(_logger, _env);

            var userRegisteredUrl = dbRepository.Single<AdsOffers>(t => t.UserId == userid);

            if (userRegisteredUrl != null)
                return Ok(userRegisteredUrl);

            return NotFound();
        }
    }
}