using Domain.Socioboard.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Net.Mime;

namespace Domain.Socioboard.Services
{
    public class AuthMessageSender : IEmailSender, ISmsSender
    {

        public string SendMail(string from, string passsword, string to, string bcc, string cc, string subject, string body, string UserName = "mailer12@socioboardmails.com", string Password = "RDmgjwos165s")
        {
            string response = "";
            try
            {
                using (SmtpClient smtp = new SmtpClient())
                {
                    MailMessage mail = new MailMessage();
                    mail.To.Add(to);
                    mail.From = new MailAddress(UserName);
                    mail.Subject = subject;
                    mail.Body = body;
                    mail.IsBodyHtml = true;
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.UseDefaultCredentials = false;
                    smtp.EnableSsl = true;
                    smtp.Host = "smtp.zoho.com";
                    smtp.Port = 587;
                    smtp.Credentials = new NetworkCredential(UserName, Password);
                    smtp.Send(mail);
                    response = "Success";
                }
            }
            catch (Exception ex)
            {

            }

            return response;
        }


        public string SendMailSendGrid(string from, string passsword, string to, string bcc, string cc, string subject, string body, string UserName = "socioboard007", string Password = "SB125@#$$@d")
        {
            try
            {

                try
                {
                    MailMessage mailMsg = new MailMessage();

                    // To
                    mailMsg.To.Add(new MailAddress(to));

                    // From
                    mailMsg.From = new MailAddress(from);

                    // Subject and multipart/alternative Body
                    mailMsg.Subject = subject;
                    string html = @body;
                    mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html));

                    // Init SmtpClient and send
                    SmtpClient smtpClient = new SmtpClient("smtp.sendgrid.net", Convert.ToInt32(587));
                    System.Net.NetworkCredential credentials = new System.Net.NetworkCredential(UserName, Password);
                    smtpClient.Credentials = credentials;

                    smtpClient.Send(mailMsg);
                    return "success";
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return "Mail Not Send";
                }

                //string posturl = "https://api.sendgrid.com/api/mail.send.json";
                //string postdata = "api_user=" + UserName + "&api_key=" + Password + "&to=" + to + "&toname=" + to + "&subject=" + subject + "&text=" + body + "&from=" + from;
                //string ret = ApiSendGridHttp(posturl, postdata);
                //return ret;
                return "success";
            }
            catch (Exception ex)
            {
                return "Mail Not Send";
            }
        }

        public static string ApiSendGridHttp(string url, string postData)
        {

            Uri uri = new Uri(url);

            HttpWebRequest webRequest = null;
            webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            webRequest.Accept = "*/*";
            webRequest.ContentType = "application/x-www-form-urlencoded";
            webRequest.Method = "POST";
            webRequest.Credentials = CredentialCache.DefaultCredentials;
            webRequest.AllowWriteStreamBuffering = true;

            webRequest.PreAuthenticate = true;
            webRequest.ServicePoint.Expect100Continue = false;
            if (postData != null)
            {
                byte[] fileToSend = Encoding.UTF8.GetBytes(postData);
                webRequest.ContentLength = fileToSend.Length;

                Stream reqStream = webRequest.GetRequestStream();

                reqStream.Write(fileToSend, 0, fileToSend.Length);
                reqStream.Close();
            }

            string returned = WebResponseGet(webRequest);

            return returned;

        }


        public static string WebResponseGet(HttpWebRequest webRequest)
        {
            try
            {
                using (StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream()))
                {
                    string responseData = "";
                    try
                    {
                        responseData = responseReader.ReadToEnd();
                    }
                    catch (Exception Err)
                    {
                        Console.Write(Err.Message);
                    }

                    return responseData;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return string.Empty;
            }

        }


        public Task SendSmsAsync(string number, string message)
        {
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }
}
