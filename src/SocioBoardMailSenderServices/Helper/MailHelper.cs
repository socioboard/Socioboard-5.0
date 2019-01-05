using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Net.Mime;
using SocioBoardMailSenderServices.Interface;
using System.Collections.Specialized;
using System.Text.RegularExpressions;

namespace SocioBoardMailSenderServices.Helper
{
    public class MailHelper : IEmailSender
    {
       
        //public string Password = "75SDF/@#$fds";
      

        
        public string SendEmailbyelastic(string from, string html, string subject, string tomail, string UserId, string Pass)
        {
            string frommail = "support@socioboard.com";
            string USERNAME = "support@socioboard.com";
            string API_KEY = "3eb5a724-e696-40fc-8d4f-7b33f488f3a3";
            WebClient client = new WebClient();
            NameValueCollection values = new NameValueCollection();
            values.Add("username", USERNAME);
            values.Add("api_key", API_KEY);
            values.Add("from", frommail);
            //values.Add("from_name", fromName);
            values.Add("subject", subject);
            if (html != null)
                values.Add("body_html", html);
            if (html != null)
                values.Add("body_text", html);
            values.Add("to", tomail);

            byte[] response = client.UploadValues("https://api.elasticemail.com/mailer/send", values);
            return Encoding.UTF8.GetString(response);
        }

        public string SendEmailbyelasticDifferentServer(string from, string html, string subject, string tomail, string UserId, string Pass,int severvalue)
        {
            string[] USERNAME = {"socioboardmailer@eyotmail.com", "socioboardmailer@conymail.com", "socioboardmailer@maileld.com", "socioboardmailer@eldmail.com", "MattGrant98@hotmail.com", "ConnorPaterson95@hotmail.com" };
            string[] API_KEY = {"7fc66317-898e-4a09-9516-de53d527953d", "c88a8062-c240-4eb6-8648-ce833e2af165", "b1cb6821-e6ca-49fd-af08-e00f371a141c", "25274610-3dcb-49ee-aaf2-778efe4d7250", "862ec8a0-2094-4e60-a1ec-3121361f7d4c", "1a4224e4-f24d-4317-b032-56c7f4391f9c" };
          
            string uname = USERNAME[severvalue];
            string apikey = API_KEY[severvalue];


            string frommail = "support@socioboard.com";
            WebClient client = new WebClient();
            NameValueCollection values = new NameValueCollection();
            values.Add("username", uname);
            values.Add("api_key", apikey);
            values.Add("from", frommail);
            //values.Add("from_name", fromName);
            values.Add("subject", subject);
            if (html != null)
                values.Add("body_html", html);
            if (html != null)
                values.Add("body_text", html);
            values.Add("to", tomail);

            byte[] response = client.UploadValues("https://api.elasticemail.com/mailer/send", values);
            //count = count + 1;
            //if (count == 500)
            //{
            //    selectothermailuser();
            //    count = 1;
            //}
            string text = System.Text.Encoding.UTF8.GetString(response);
            return Encoding.UTF8.GetString(response);
        }


       

        //public string USERNAME = "socioboardmailer@eyotmail.com";
        //public string API_KEY = "7fc66317-898e-4a09-9516-de53d527953d";
        // public string Password = "75SDF/@#$fds";
        //public string SendEmailbyelastic(string from, string html, string subject, string tomail,string UserId,string Pass)
        //{


        //    WebClient client = new WebClient();
        //    NameValueCollection values = new NameValueCollection();
        //    values.Add("username", USERNAME);
        //    values.Add("api_key", API_KEY);
        //    values.Add("from", frommail);
        //    //values.Add("from_name", fromName);
        //    values.Add("subject", subject);
        //    if (html != null)
        //        values.Add("body_html", html);
        //    if (html != null)
        //        values.Add("body_text", html);
        //    values.Add("to", tomail);

        //    byte[] response = client.UploadValues("https://api.elasticemail.com/mailer/send", values);
        //   //string message = Uri.EscapeDataString(response);
        //    return Encoding.UTF8.GetString(response);


        //}

        public  string SendMailSendGrid(string from, string html, string subject, string tomail, string UserId = "socioboard007", string Password = "SB125@#$$@d!&&&!")
        {
            try
            {

                try
                {
                    MailMessage mailMsg = new MailMessage();

                    // To
                    mailMsg.To.Add(new MailAddress(tomail));

                    // From
                    mailMsg.From = new MailAddress(from, "Socioboard");

                    // Subject and multipart/alternative Body
                    mailMsg.Subject = subject;
                    mailMsg.Body = html;
                    mailMsg.IsBodyHtml = true;
                    mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html));

                    // Init SmtpClient and send
                    SmtpClient smtpClient = new SmtpClient("smtp.sendgrid.net", Convert.ToInt32(587));
                    System.Net.NetworkCredential credentials = new System.Net.NetworkCredential(UserId, Password);
                    smtpClient.Credentials = credentials;
                    smtpClient.Send(mailMsg);
                    return "Success";
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return "Mail Not Send";
                }

               
               // return "success";
            }
            catch (Exception ex)
            {
                return "Mail Not Send";
            }
        }


        public  string SendMailBySmtp(string html, string subject, string tomail, string UserId= "sumit@socioboardmail.com", string Password= "75SDF/@#$fds")
        {
            string response = "";
            try
            {
                using (SmtpClient smtp = new SmtpClient())
                {
                    MailMessage mail = new MailMessage();
                    mail.To.Add(tomail);
                    mail.From = new MailAddress(UserId, "Socioboard");
                    mail.Subject = subject;
                    mail.Body = html;
                    mail.IsBodyHtml = true;
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.UseDefaultCredentials = false;
                    smtp.EnableSsl = true;
                    smtp.Host = "smtp.zoho.com";
                    smtp.Port = 587;
                    smtp.Credentials = new NetworkCredential(UserId, Password);
                    smtp.Send(mail);
                    response = "Success";
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("5.5.1 Authentication Required"))
                {
                    response = "Blocked";
                }
            }

            return response;
        }

      

    }
}
