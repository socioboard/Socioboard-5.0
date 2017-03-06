using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Domain.Socioboard.Models;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers.Admin
{
    public class AdminElasticmailController : Controller
    {
        private Helpers.AppSettings _appSettings;
        public AdminElasticmailController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
        }
        // [ResponseCache(Duration = 100)]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        // GET: /<controller>/


        public ActionResult GetReport()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View();
            }

        }

        public async Task<IActionResult> GetSentMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailSentReportData?daysCount="+count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.SentMail = lstelasticmails.Count();
          
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetSentMailReportPartial");

        }
        public async Task<IActionResult> GetOpenedMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailOpenedReportData?daysCount=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.OpenedMail = lstelasticmails.Count();
          
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetOpenedMailReportPartial");

        }
        public async Task<IActionResult> GetClickedMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailClickedReportData?daysCount=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.ClickedMail = lstelasticmails.Count();
          
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetClickedMailReportPartial");

        }
        public async Task<IActionResult> GetBouncedMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailBouncedReportData?daysCount=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.BouncedMail = lstelasticmails.Count();
           
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetBouncedMailReportPartial");

        }
        public async Task<IActionResult> GetUnsubscribedMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailUnsubscribedReportData?daysCount=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.Unsubscribed = lstelasticmails.Count();
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetUnsubscribedMailReportPartial");

        }
        public async Task<IActionResult> GetAbuseReportedMailReport(int count)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getElasticMailAbuseReportReportData?daysCount=" + count, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.AbuseReportedMail = lstelasticmails.Count();
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetAbuseReportedMailReportPartial");

        }

        public ActionResult CustomReport()
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user == null)
            {
                return RedirectToAction("Index", "Index");
            }
            else
            {
                ViewBag.ApiDomain = _appSettings.ApiDomain;
                ViewBag.Domain = _appSettings.Domain;
                return View();
            }

        }

        #region Custom reports data start
        public async Task<IActionResult> GetCustomSentMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailSentReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.SentMail = lstelasticmails.Count();

            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetSentMailReportPartial");

        }
        public async Task<IActionResult> GetCustomOpenedMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailOpenedReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.OpenedMail = lstelasticmails.Count();

            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetOpenedMailReportPartial");

        }
        public async Task<IActionResult> GetCustomClickedMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailClickedReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.ClickedMail = lstelasticmails.Count();

            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetClickedMailReportPartial");

        }
        public async Task<IActionResult> GetCustomBouncedMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailBouncedReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.BouncedMail = lstelasticmails.Count();

            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetBouncedMailReportPartial");

        }
        public async Task<IActionResult> GetCustomUnsubscribedMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailUnsubscribedReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.Unsubscribed = lstelasticmails.Count();
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetUnsubscribedMailReportPartial");

        }
        public async Task<IActionResult> GetCustomAbuseReportedMailReport(DateTime sdate, DateTime edate)
        {
            List<Domain.Socioboard.Models.Mongo.ElasticmailReport> lstelasticmails = new List<Domain.Socioboard.Models.Mongo.ElasticmailReport>();
            HttpResponseMessage response = await WebApiReq.GetReq("/api/ElasticMailReport/getCustomElasticMailAbuseReportReportData?sdate=" + sdate + "&edate=" + edate, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                lstelasticmails = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Mongo.ElasticmailReport>>();

            }
            ViewBag.AbuseReportedMail = lstelasticmails.Count();
            ViewBag.ApiDomain = _appSettings.ApiDomain;
            ViewBag.Domain = _appSettings.Domain;
            return PartialView("_GetAbuseReportedMailReportPartial");

        }
        #endregion

    }
}
