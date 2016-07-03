using Domain.Socioboard.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Net.Mail;
using System.Net;

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



        public Task SendSmsAsync(string number, string message)
        {
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }
}
