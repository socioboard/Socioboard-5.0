using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Domain.Socioboard.Models;
using Domain.Socioboard.Interfaces.Services;
using System.Net;
using System.Text;
using System.IO;
using System.Xml;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Api.Socioboard.Model;
using Domain.Socioboard.Enum;

namespace Api.Socioboard.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class PaymentTransactionController : Controller
    {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="settings"></param>
        /// <param name="appEnv"></param>
        /// <param name="emailSender"></param>
        public PaymentTransactionController(ILogger<PaymentTransactionController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv, IEmailSender emailSender)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _appEnv = appEnv;
            _emailSender = emailSender;

        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _appEnv;
        private readonly IEmailSender _emailSender;


        /// <summary>
        /// 
        /// </summary>
        /// <param name="packagename"></param>
        /// <returns></returns>
        [HttpPost("GetPackage")]
        public IActionResult GetPackage(string packagename)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.PaymentTransactionRepository.GetPackage(packagename, dbr));
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("GetPaymentTransactiondata")]
        public IActionResult GetPaymentTransactiondata(long id)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            var paymentTransaction = dbr.FindFirstMatch<PaymentTransaction>(t => t.id == id);
            return Ok(paymentTransaction);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="amount"></param>
        /// <param name="UserName"></param>
        /// <param name="email"></param>
        /// <param name="PaymentType"></param>
        /// <param name="trasactionId"></param>
        /// <param name="paymentId"></param>
        /// <param name="accType"></param>
        /// <param name="subscr_date"></param>
        /// <param name="payer_email"></param>
        /// <param name="Payername"></param>
        /// <param name="payment_status"></param>
        /// <param name="item_name"></param>
        /// <param name="media"></param>
        /// <returns></returns>
        [HttpPost("UpgradeAccount")]
        public IActionResult UpgradeAccount(string userId, string amount, string UserName, string email, Domain.Socioboard.Enum.PaymentType PaymentType, string trasactionId, string paymentId, Domain.Socioboard.Enum.SBAccountType accType, DateTime subscr_date, string payer_email, string Payername, string payment_status, string item_name, string media)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            try
            {
                var path = _appEnv.WebRootPath + "\\views\\mailtemplates\\invoice.html";
                var html = System.IO.File.ReadAllText(path);
                html = html.Replace("[paymentId]", paymentId);
                html = html.Replace("[subscr_date]", subscr_date.ToString());
                html = html.Replace("[payer_email]", payer_email);
                html = html.Replace("[Payername]", Payername);
                html = html.Replace("[payment_status]", payment_status);
                html = html.Replace("[item_name]", item_name);
                html = html.Replace("[amount]", amount + "$");
                html = html.Replace("[media]", media);
                _emailSender.SendMailSendGrid(_appSettings.frommail, "", payer_email, "", "", "Socioboard Payment Invoice", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
            }
            catch (Exception)
            {
            }
            try
            {
                var inMemUser = _redisCache.Get<User>(UserName);

                if (inMemUser != null)
                {
                    inMemUser.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                    inMemUser.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                    inMemUser.ExpiryDate = DateTime.UtcNow.AddDays(30);
                    inMemUser.Id = Convert.ToInt64(userId);
                    inMemUser.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                    inMemUser.AccountType = accType;
                    dbr.Update(inMemUser);
                }
                else
                {
                    var _user = dbr.FindFirstMatch<User>(t => t.Id == Convert.ToInt64(userId));
                    if (_user != null)
                    {
                        _user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                        _user.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                        _user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                        _user.Id = Convert.ToInt64(userId);
                        _user.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                        _user.AccountType = accType;
                        dbr.Update(_user);
                    }
                }
                int isaved = Repositories.PaymentTransactionRepository.AddPaymentTransaction(Convert.ToInt64(userId), amount, email, PaymentType, paymentId, trasactionId, subscr_date, payer_email, Payername, payment_status, item_name, media, dbr);
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


        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="amount"></param>
        /// <param name="UserName"></param>
        /// <param name="email"></param>
        /// <param name="PaymentType"></param>
        /// <param name="trasactionId"></param>
        /// <param name="paymentId"></param>
        /// <param name="accType"></param>
        /// <param name="subscr_date"></param>
        /// <param name="payer_email"></param>
        /// <param name="Payername"></param>
        /// <param name="payment_status"></param>
        /// <param name="item_name"></param>
        /// <param name="media"></param>
        /// <returns></returns>
        [HttpPost("UpdateTransactionDetails")]
        public IActionResult UpdateTransactionDetails(string userId, string amount, string UserName, string email, Domain.Socioboard.Enum.PaymentType PaymentType, string trasactionId, string paymentId, Domain.Socioboard.Enum.SBAccountType accType, DateTime subscr_date, string payer_email, string Payername, string payment_status, string item_name, string media)
        {
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);
                var inMemUser = _redisCache.Get<User>(UserName);

                if (inMemUser != null)
                {
                    inMemUser.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Processing;
                    inMemUser.AccountType = accType;
                    inMemUser.ExpiryDate = DateTime.UtcNow.AddDays(1);
                    inMemUser.TrailStatus = UserTrailStatus.active;
                    dbr.Update(inMemUser);
                }
                else
                {
                    var user = dbr.FindFirstMatch<User>(t => t.Id == Convert.ToInt64(userId));
                    if (user != null)
                    {
                        user.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Processing;
                        user.AccountType = accType;
                        user.ExpiryDate = DateTime.UtcNow.AddDays(1);
                        user.TrailStatus = UserTrailStatus.active;
                        dbr.Update(user);
                    }
                }
                var isSaved = Repositories.PaymentTransactionRepository.AddPaymentTransaction(Convert.ToInt64(userId), amount, email, PaymentType, paymentId, trasactionId, subscr_date, payer_email, Payername, "Processing", item_name, media, dbr);
                if (isSaved == 1)
                {
                    return Ok("processing");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return Ok();
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="information"></param>
        /// <returns></returns>
        [HttpPost("UpdatePaypalTransactions")]
        public IActionResult UpdatePaypalTransactions(string information)
        {
            try
            {
                var dbr = new DatabaseRepository(_logger, _appEnv);

                var userDetails = JsonConvert.DeserializeObject<PaymentTransaction>(
                    information);

                var user = dbr.FindFirstMatch<User>(t => t.Id == Convert.ToInt64(userDetails.userid));


                var package = SBAccountType.Standard;
                try
                {
                    var packageName = userDetails.itemname.Replace("Socioboard_", "");
                    package = (SBAccountType)Enum.Parse(typeof(SBAccountType), packageName);
                }
                catch (Exception e)
                {
                    _logger.LogError($"Can't fetch the package details for transaction {userDetails.trasactionId}");
                    _logger.LogError(e.StackTrace);               
                }

                if (user != null)
                {
                    user.PaymentStatus = SBPaymentStatus.Paid;
                    user.ExpiryDate = DateTime.UtcNow.AddDays(30);
                    user.AccountType = package;
                    dbr.Update(user);
                }

                var paymentTransactions = dbr.FindFirstMatch<PaymentTransaction>(t => t.trasactionId == userDetails.trasactionId);

                if (paymentTransactions == null)
                    dbr.Add(userDetails);
                else
                {
                    paymentTransactions.paymentId = userDetails.paymentId;
                    paymentTransactions.paymentdate = userDetails.paymentdate;
                    paymentTransactions.subscrdate = userDetails.subscrdate;
                    paymentTransactions.paymentstatus = userDetails.paymentstatus;

                    dbr.Update(paymentTransactions);
                }

                return Ok("Completed");
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return Ok();
        }


        [HttpPost("UpdateRecurringUser")]
        public IActionResult UpdateRecurringUser(string subscr_id, string txn_id, DateTime subscr_date, string payer_email, string Payername, string payment_status, string item_name, string amount, string media)
        {
            try
            {

                string path = _appEnv.WebRootPath + "\\views\\mailtemplates\\invoice.html";
                string html = System.IO.File.ReadAllText(path);
                html = html.Replace("[paymentId]", txn_id);
                html = html.Replace("[subscr_date]", subscr_date.ToString());
                html = html.Replace("[payer_email]", payer_email);
                html = html.Replace("[Payername]", Payername);
                html = html.Replace("[payment_status]", payment_status);
                html = html.Replace("[item_name]", item_name);
                html = html.Replace("[amount]", amount + "$");
                html = html.Replace("[media]", media);
                _emailSender.SendMailSendGrid(_appSettings.frommail, "", payer_email, "", "", "Socioboard Payment Invoice", html, _appSettings.SendgridUserName, _appSettings.SendGridPassword);

                Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
                Domain.Socioboard.Models.PaymentTransaction _PaymentTransaction = dbr.FindSingle<Domain.Socioboard.Models.PaymentTransaction>(t => t.paymentId.Contains(subscr_id));
                Domain.Socioboard.Models.User _user = dbr.FindSingle<Domain.Socioboard.Models.User>(x => x.Id == _PaymentTransaction.userid);
                _user.ExpiryDate = _user.ExpiryDate.AddDays(30);
                _user.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                dbr.Update<Domain.Socioboard.Models.User>(_user);
                _PaymentTransaction.trasactionId = txn_id;
                _PaymentTransaction.paymentdate = DateTime.UtcNow;
                _PaymentTransaction.payeremail = payer_email;
                _PaymentTransaction.Payername = Payername;
                _PaymentTransaction.paymentstatus = payment_status;
                _PaymentTransaction.itemname = item_name;
                _PaymentTransaction.media = media;
                _PaymentTransaction.subscrdate = subscr_date;
                _PaymentTransaction.amount = amount;
                dbr.Update(_PaymentTransaction);
            }
            catch (Exception ex)
            {
                _logger.LogError("UpdateRecurringUser======" + ex.StackTrace);
                _logger.LogError("UpdateRecurringUser=========" + ex.Message);
            }
            return Ok();
        }


        [HttpPost("PostBlueSnapSubscription")]
        public IActionResult PostBlueSnapSubscription(string XMLData, string emailId)
        {
            string responseFromServer = string.Empty;
            try
            {
                // Create a request using a URL that can receive a post. 
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://sandbox.bluesnap.com/services/2/recurring/subscriptions");
                // Set the Method property of the request to POST.
                request.Method = "POST";
                request.Headers["Authorization"] = "Basic " + _appSettings.bluesnapBase64;
                request.UserAgent = ".NET Framework Test Client";
                string postData = XMLData;
                byte[] byteArray = Encoding.UTF8.GetBytes(postData);
                request.ContentType = "application/xml";
                request.ContentLength = byteArray.Length;

                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                Stream dataStream = request.GetRequestStream();
                dataStream.Write(byteArray, 0, byteArray.Length);
                dataStream.Close();

                // Get the response.

                HttpWebResponse myHttpWebResponse = (HttpWebResponse)request.GetResponse();
                Console.WriteLine((myHttpWebResponse.StatusDescription));
                dataStream = myHttpWebResponse.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
                reader.Close();
                dataStream.Close();
                myHttpWebResponse.Close();
            }
            catch (WebException wex)
            {
                var pageContent = new StreamReader(wex.Response.GetResponseStream())
                                      .ReadToEnd();

                Console.WriteLine(wex.Message);
                return BadRequest();
            }



            DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            try
            {

                //JSON
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(responseFromServer);
                JObject jsonTextResponse = JObject.Parse(JsonConvert.SerializeXmlNode(doc));


                User userObj = dbr.FindSingle<User>(t => t.EmailId == emailId);

                PaymentTransaction objPaymentTransaction = new PaymentTransaction();
                objPaymentTransaction.amount = jsonTextResponse["recurring-subscription"]["recurring-charge-amount"].ToString();
                objPaymentTransaction.userid = userObj.Id;
                objPaymentTransaction.email = userObj.EmailId;
                objPaymentTransaction.paymentdate = DateTime.UtcNow;
                objPaymentTransaction.trasactionId = jsonTextResponse["recurring-subscription"]["subscription-id"].ToString();
                try
                {
                    objPaymentTransaction.paymentId = jsonTextResponse["recurring-subscription"]["charge"]["charge-id"].ToString();
                }
                catch
                {
                    objPaymentTransaction.paymentId = "NA";
                }
                objPaymentTransaction.PaymentType = Domain.Socioboard.Enum.PaymentType.bluesnap;
                try
                {
                    objPaymentTransaction.paymentstatus = jsonTextResponse["recurring-subscription"]["status"].ToString();
                }
                catch
                {
                    objPaymentTransaction.paymentstatus = "NA";
                }
                objPaymentTransaction.itemname = "Socioboard" + userObj.AccountType.ToString();
                objPaymentTransaction.Payername = userObj.FirstName + " " + userObj.LastName;
                objPaymentTransaction.email = userObj.EmailId;
                dbr.Add<PaymentTransaction>(objPaymentTransaction);

                userObj.ExpiryDate = DateTime.Now.AddYears(1);
                userObj.PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.Paid;
                userObj.TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.active;
                userObj.PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.added;
                userObj.PaymentType = Domain.Socioboard.Enum.PaymentType.bluesnap;

                dbr.Update<User>(userObj);

                return Ok();
            }
            catch
            {
                return BadRequest();
            }


        }

        [HttpPost("PostBlueSnapPlan")]
        public IActionResult PostBlueSnapPlan(string XMLData)
        {
            string responseFromServer = string.Empty;
            try
            {
                // Create a request using a URL that can receive a post. 
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://sandbox.bluesnap.com/services/2/recurring/plans");
                // Set the Method property of the request to POST.
                request.Method = "POST";
                request.Headers["Authorization"] = "Basic " + _appSettings.bluesnapBase64;
                request.UserAgent = ".NET Framework Test Client";
                string postData = XMLData;
                byte[] byteArray = Encoding.UTF8.GetBytes(postData);
                request.ContentType = "application/xml";
                request.ContentLength = byteArray.Length;

                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                Stream dataStream = request.GetRequestStream();
                dataStream.Write(byteArray, 0, byteArray.Length);
                dataStream.Close();

                // Get the response.

                HttpWebResponse myHttpWebResponse = (HttpWebResponse)request.GetResponse();
                Console.WriteLine((myHttpWebResponse.StatusDescription));
                dataStream = myHttpWebResponse.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
                reader.Close();
                dataStream.Close();
                myHttpWebResponse.Close();
            }
            catch (WebException wex)
            {
                var pageContent = new StreamReader(wex.Response.GetResponseStream())
                                      .ReadToEnd();

                Console.WriteLine(wex.Message);
            }


            return Ok(responseFromServer);
        }


        [HttpPost("GetBlueSnapPlan")]
        public IActionResult GetBlueSnapPlan(string planId)
        {
            string responseFromServer = string.Empty;
            try
            {
                // Create a request using a URL that can receive a post. 
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://sandbox.bluesnap.com/services/2/recurring/plans/" + planId);
                // Set the Method property of the request to POST.
                request.Method = "GET";
                request.Headers["Authorization"] = "Basic " + _appSettings.bluesnapBase64;
                request.UserAgent = ".NET Framework Test Client";
                request.ContentType = "application/json";
                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                // Get the response.
                HttpWebResponse myHttpWebResponse = (HttpWebResponse)request.GetResponse();
                Console.WriteLine((myHttpWebResponse.StatusDescription));
                Stream dataStream = myHttpWebResponse.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
                reader.Close();
                dataStream.Close();
                myHttpWebResponse.Close();
            }
            catch (WebException wex)
            {
                var pageContent = new StreamReader(wex.Response.GetResponseStream())
                                      .ReadToEnd();

                Console.WriteLine(wex.Message);
            }


            Dictionary<string, string> planValues = new Dictionary<string, string>();
            //XML
            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(responseFromServer);
            foreach (XmlNode childrenNode in xmlDoc)
            {
                if (childrenNode.Name == "plan")
                {
                    foreach (XmlNode items in childrenNode.ChildNodes)
                    {
                        planValues.Add(items.Name, items.InnerText);
                    }
                }
            }

            return Ok(responseFromServer);
        }

        /// <summary>
        /// Get bluesnap subscription ipn
        /// </summary>
        /// <param name="subscriptionId"></param>
        /// <returns></returns>
        [HttpPost("GetBlueSnapSubscription")]
        public IActionResult GetBlueSnapSubscription(string subscriptionId)
        {
            string responseFromServer = string.Empty;
            try
            {
                // Create a request using a URL that can receive a post. 
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://sandbox.bluesnap.com/services/2/recurring/subscriptions/" + subscriptionId);
                // Set the Method property of the request to POST.
                request.Method = "GET";
                request.Headers["Authorization"] = "Basic " + _appSettings.bluesnapBase64;
                request.UserAgent = ".NET Framework Test Client";
                request.ContentType = "application/json";
                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                // Get the response.
                HttpWebResponse myHttpWebResponse = (HttpWebResponse)request.GetResponse();
                Console.WriteLine((myHttpWebResponse.StatusDescription));
                Stream dataStream = myHttpWebResponse.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
                reader.Close();
                dataStream.Close();
                myHttpWebResponse.Close();
            }
            catch (WebException wex)
            {
                var pageContent = new StreamReader(wex.Response.GetResponseStream())
                                      .ReadToEnd();

                Console.WriteLine(wex.Message);
            }


            Dictionary<string, string> planValues = new Dictionary<string, string>();
            //XML
            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(responseFromServer);



            try
            {
                string jsonText = JsonConvert.SerializeXmlNode(xmlDoc);

                JObject responseJson = JObject.Parse(jsonText);


                string temp = responseJson["recurring-subscription"]["plan-id"].ToString();

                DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);

                try
                {
                    PaymentTransaction objPaymentTransaction = dbr.Single<PaymentTransaction>(t => t.trasactionId == subscriptionId);
                    if (objPaymentTransaction.paymentdate.Date != DateTime.Now.Date && objPaymentTransaction != null)
                    {
                        objPaymentTransaction.amount = responseJson["recurring-subscription"]["recurring-charge-amount"].ToString();
                        objPaymentTransaction.paymentdate = DateTime.UtcNow;
                        objPaymentTransaction.bluesnapSubscriptions++;
                        dbr.Update(objPaymentTransaction);
                    }
                }
                catch
                {

                }
            }
            catch
            {

            }

            return Ok();
        }


    }
}
