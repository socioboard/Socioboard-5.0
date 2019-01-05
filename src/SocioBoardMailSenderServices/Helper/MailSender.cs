using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
//using SocioBoardMailSenderServices.Domain;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;

namespace SocioBoardMailSenderServices.Helper
{
    public class MailSender
    {
        public static string SendAccountExpiryMail(string from, string FirstName, string tomail, string UserId, string Pass, string SenderName)
        {
            string html = "<!DOCTYPE html PUBLIC><html lang=\"en\"><head>" +
            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">" +
            "<meta name=\"format-detection\" content=\"telephone=no\" /><title>Notification of Account Expiry - SocioBoard</title>" +
            "<link rel=\"stylesheet\" href=\"email.css\" />" +
            "<style>body {font-family: \"Source Sans Pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;}</style></head>" +
            "<body bgcolor=\"#E1E1E1\" leftmargin=\"0\" marginwidth=\"0\" topmargin=\"0\" marginheight=\"0\" offset=\"0\"><center style=\"background-color:#E1E1E1;\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" id=\"bodyTable\" style=\"table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;\">" +
            "<tr><td align=\"center\" valign=\"top\" id=\"bodyCell\">" +
            "<table bgcolor=\"#FFFFFF\"  border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"700\" id=\"emailBody\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#fff\">" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr><td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\">" +
            "<table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td align=\"center\" valign=\"top\" class=\"textContent\"><center><img src=\"http://imgur.com/nvNPyAp.png\" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr>" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#ffaa7b\">" +
            "<tr style=\"padding-top:0;\"><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"700\" class=\"flexibleContainer\"><tr><td style=\"padding-top:0;\" align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"90%\" style=\"margin-top:10%;\"><tr><td align=\"left\"><p>Hi " + FirstName + ",</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 7%;\">Your socioboard account has been expired .</p></td></tr>" +
          "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">You can continue using socioboard by upgrading your account or downgrading to basic version in a very short span of time.</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">You can look into more exciting options</p></td></tr>" +
             "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">Login to socioboard <a href=\"https://www.socioboard.com/Home#/profilesettings\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">click here</span></a>.</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align=\"left\">" +
            "<p style=\"margin-top: 10%; margin-bottom:5%;\">Best regards<br/>Support Team<br/>Socioboard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table>" +
            "<table bgcolor=\"#E1E1E1\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" id=\"emailFooter\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr>" +
            "<td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td valign=\"top\" bgcolor=\"#E1E1E1\">" +
            "<div style=\"font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;\">" +
            "<div>Copyright &copy; 2017 <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div>" +
            "<div></div>" +
            "</div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>";
            html = html.Replace("[UserName]", FirstName);
            string subject = "Notification of Account Expiry";
            MailHelper mh = new MailHelper();
            string rtn = mh.SendMailSendGrid(from, html, subject, tomail, UserId, Pass);
            //string rtn = mh.SendEmailbyelastic(from, html, subject, tomail, UserId, Pass);

            if (rtn == "Success")
            {
                return rtn;
            }
            else
            {
                return null;
            }
        }
        public static string SendbeforeAccountExpiryMail(string from, string FirstName, string tomail,DateTime date, string UserId, string Pass, string SenderName)
        {
            string html = "<!DOCTYPE html PUBLIC><html lang=\"en\"><head>" +
            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">" +
            "<meta name=\"format-detection\" content=\"telephone=no\" /><title>Notification of Account Expiry - SocioBoard</title>" +
            "<link rel=\"stylesheet\" href=\"email.css\" />" +
            "<style>body {font-family: \"Source Sans Pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;}</style></head>" +
            "<body bgcolor=\"#E1E1E1\" leftmargin=\"0\" marginwidth=\"0\" topmargin=\"0\" marginheight=\"0\" offset=\"0\"><center style=\"background-color:#E1E1E1;\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" id=\"bodyTable\" style=\"table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;\">" +
            "<tr><td align=\"center\" valign=\"top\" id=\"bodyCell\">" +
            "<table bgcolor=\"#FFFFFF\"  border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"700\" id=\"emailBody\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#fff\">" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr><td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\">" +
            "<table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td align=\"center\" valign=\"top\" class=\"textContent\"><center><img src=\"http://imgur.com/nvNPyAp.png\" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr>" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#ffaa7b\">" +
            "<tr style=\"padding-top:0;\"><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"700\" class=\"flexibleContainer\"><tr><td style=\"padding-top:0;\" align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"90%\" style=\"margin-top:10%;\"><tr><td align=\"left\"><p>Hi " + FirstName + ",</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 7%;\">Your account will expire on " +date.ToShortDateString()+ " .</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">You can continue using socioboard by upgrading your account or downgrading to basic version in a very short span of time.</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">You can look into more exciting options</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">Login to socioboard <a href=\"https://www.socioboard.com/Home#/profilesettings\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">click here</span></a>.</p></td></tr>" +
            "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align=\"left\">" +
            "<p style=\"margin-top: 10%; margin-bottom:5%;\">Best regards<br/>Support Team<br/>Socioboard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table>" +
            "<table bgcolor=\"#E1E1E1\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" id=\"emailFooter\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
            "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr>" +
            "<td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td valign=\"top\" bgcolor=\"#E1E1E1\">" +
            "<div style=\"font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;\">" +
            "<div>Copyright &copy; 2017 <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div>" +
            "<div></div>" +
            "</div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>";
            html = html.Replace("[UserName]", FirstName);
            string subject = "Your account will expire soon";
            MailHelper mh = new MailHelper();
            string rtn = mh.SendMailSendGrid(from, html, subject, tomail, UserId, Pass);
            //string rtn = mh.SendEmailbyelastic(from, html, subject, tomail, UserId, Pass);

            if (rtn == "Success")
            {
                return rtn;
            }
            else
            {
                return null;
            }
        }
        public static string Sendnewsletter(string FirstName, string toEmail, string body, string sub, string EmailId, string Password)
        {
            string html = "<!DOCTYPE html><html lang=\"en\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /><title>Email Template</title>" +
            "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.2/css/bootstrap.min.css\" />" +
            "<style>body {font-family:\"Segoe UI\";	background-color:#eff3f6;}</style></head><body><div class=\"container\" style=\"margin-top: 1.5%;\">" +
            "<div class=\"row\"><div class=\"col-md-6 col-md-offset-3\"><div class=\"panel\"><div class=\"panel-heading row\"><div class=\"col-md-9\" style=\"margin-top:2%;\">" +
            "<img src=\"http://imgur.com/nvNPyAp.png\" alt=\"SocioBoard\"><br/>&nbsp;</div><div class=\"col-md-3\" style=\"margin-top:3%;\">" +
            "<a href=\"https://www.facebook.com/SocioBoard\" style=\"text-decoration: none\" target=\"_blank\"><img src=\"http://i.imgur.com/tJumoLd.png\" alt=\"Like us on Facebook\">" +
            "</a><a href=\"https://twitter.com/Socioboard\" style=\"text-decoration: none\" target=\"_blank\"><img src=\"http://i.imgur.com/KLMlRoB.png\" alt=\"Follow us on Twitter\"></a>" +
            "<!--  <a href=\"#\" style=\"text-decoration: none\"><img src=\"http://i.imgur.com/YSivij0.png\" alt=\"Follow our LinkedIn\"></a>--></div></div><div class=\"panel-body\" style=\"color:#3F3D51;\"><div class=\"panel panel-default\"><div class=\"panel-body\"><div class=\"row\">" +
            "<div class=\"col-md-12\"><h3 style=\"color: #3F3D51;\">Hi [UserName], </h3><img src=" + body + " ></div></div></div> </div><!--<p><center><font size=\"2\">This email was sent by: SocioBoard., 7th Block, 80 Feet Road, Koramangala Layout, Bangalore-560095, INDIA </font></center></p>--></div></div></div></div></div></body></html>";
            html = html.Replace("[UserName]", FirstName);
            string userid = EmailId;
            string password = Password;
            string subject = sub.ToString();

            MailHelper mh = new MailHelper();
            string ret = mh.SendMailSendGrid(userid, html, subject, toEmail);
            //string ret = mh.SendEmailbyelastic(userid, html, subject, toEmail, userid, password);
            //string ret = mh.SendEmailbyelastic(userid, str, subject, toEmail, userid, password);
            if (ret == "Success")
            {
                return ret;
            }
            else
            {
                return null;
            }
        }

        public static string SendInActiveUsermail(string from, string FirstName, string tomail, string UserId, string Pass, string SenderName, DateTime LastLoginTime)
        {
            string html1 = LastLoginTime.ToShortDateString();
            string html = "<!DOCTYPE html PUBLIC><html lang=\"en\"><head>" +
             "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
             "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
             "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">" +
             "<meta name=\"format-detection\" content=\"telephone=no\" /><title>Account Expiry - SocioBoard</title>" +
             "<link rel=\"stylesheet\" href=\"email.css\" />" +
             "<style>body {font-family: \"Source Sans Pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;}</style></head>" +
             "<body bgcolor=\"#E1E1E1\" leftmargin=\"0\" marginwidth=\"0\" topmargin=\"0\" marginheight=\"0\" offset=\"0\"><center style=\"background-color:#E1E1E1;\">" +
             "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" id=\"bodyTable\" style=\"table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;\">" +
             "<tr><td align=\"center\" valign=\"top\" id=\"bodyCell\">" +
             "<table bgcolor=\"#FFFFFF\"  border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"700\" id=\"emailBody\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#fff\">" +
             "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr><td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\">" +
             "<table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td align=\"center\" valign=\"top\" class=\"textContent\"><center><img src=\"http://imgur.com/nvNPyAp.png\" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr>" +
             "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" bgcolor=\"#ffaa7b\">" +
             "<tr style=\"padding-top:0;\"><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"700\" class=\"flexibleContainer\"><tr><td style=\"padding-top:0;\" align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"90%\" style=\"margin-top:10%;\"><tr><td align=\"left\"><p>Hi " + FirstName + ",</p></td></tr>" +
             "<tr><td align=\"left\"><p style=\"margin-top: 7%;\">You have not logged in to your SocioBoard account since  " + html1 + ".We miss you. </p></td></tr>" +
             "<tr><td align=\"left\"><p style=\"margin-top: 2%;\"> Please login to SocioBoard account by <a href=\"https://www.socioboard.com/#\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#2979ff;\">clicking here</span></a>" +
             "<tr><td align=\"left\"><p style=\"margin-top: 5%;\">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align=\"left\">" +
             "<p style=\"margin-top: 10%; margin-bottom:5%;\">Best regards<br/>Support Team<br/>SocioBoard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table>" +
             "<table bgcolor=\"#E1E1E1\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" id=\"emailFooter\"><tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
             "<tr><td align=\"center\" valign=\"top\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"flexibleContainer\"><tr>" +
             "<td align=\"center\" valign=\"top\" width=\"500\" class=\"flexibleContainerCell\"><table border=\"0\" cellpadding=\"30\" cellspacing=\"0\" width=\"100%\"><tr><td valign=\"top\" bgcolor=\"#E1E1E1\">" +
             "<div style=\"font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;\">" +
             "<div>Copyright &copy; 2017 <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div>" +
             "<div>If you do not want to recieve emails from us, you can <a href=\"https://www.socioboard.com/Home#/profilesettings\" target=\"_blank\" style=\"text-decoration:none;color:#828282;\"><span style=\"color:#828282;\">unsubscribe</span></a>.</div>" +
             "</div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>";

            string subject = "Last login reminder";
            MailHelper mh = new MailHelper();
            //string rtn = mh.SendEmailbyelastic(from, html, subject, tomail, UserId, Pass);
            string rtn = mh.SendMailSendGrid(from, html, subject, tomail, UserId, Pass);
            if (rtn == "Success")
            {
                return rtn;
            }
            else
            {
                return null;
            }
        }

        public static string SendGroupReporsForElastic(string GroupName, string toEmail, SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat, SocioBoardMailSenderServices.EmailServices.FbPageStat _FacebookStats, SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat, string EmailId, string Password, int serverValue)
        {
            string date = DateTime.UtcNow.AddDays(-1).ToString("MMMM dd");
            string _GroupName = GroupName;
            string email = toEmail;
            int i = 0;
            string str = "<!DOCTYPE html><html lang=\"en\"><head><title>Socioboard | Group Reports</title><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css\" />" +
                "<style type=\"text/css\">	#outlook a {padding: 0;}.ReadMsgBody {width: 100%;}.ExternalClass {width: 100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%;}" +
            "body,table,td,a {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}	table,td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}		img {-ms-interpolation-mode: bicubic;}body {margin: 0;padding: 0;}img {border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;}" +
            "table {border-collapse: collapse !important;}	body {height: 100% !important;margin: 0;padding: 0;width: 100% !important;font-family: segoe UI;}.appleBody a {color: #68440a;text-decoration: none;}.appleFooter a {color: #999999;text-decoration: none;}" +
            "@media screen and (max-width: 525px) {table[class=\"wrapper\"] {width: 100% !important;}td[class=\"logo\"] {text-align: left;padding: 20px 0 20px 0 !important;}td[class=\"logo\"] img {margin: 0 auto!important;}td[class=\"mobile-hide\"] {display: none;}img[class=\"mobile-hide\"] {display: none !important;}img[class=\"img-max\"] {max-width: 100% !important;height: auto !important;}" +
            "table[class=\"responsive-table\"] {width: 100%!important;}td[class=\"padding\"] {padding: 10px 5% 15px 5% !important;}td[class=\"padding-copy\"] {padding: 10px 5% 10px 5% !important;text-align: center;}td[class=\"padding-meta\"] {padding: 30px 5% 0px 5% !important;text-align: center;}" +
            "td[class=\"no-pad\"] {padding: 0 0 20px 0 !important;}td[class=\"no-padding\"] {padding: 0 !important;}td[class=\"section-padding\"] {padding: 50px 15px 50px 15px !important;}td[class=\"section-padding-bottom-image\"] {padding: 50px 15px 0 15px !important;}td[class=\"mobile-wrapper\"] {padding: 10px 5% 15px 5% !important;}table[class=\"mobile-button-container\"] {margin: 0 auto;width: 100% !important;}" +
            "a[class=\"mobile-button\"] {width: 80% !important;padding: 15px !important;border: 0 !important;font-size: 16px !important;}}</style></head>" +

            "<body style=\"margin: 0; padding: 0;\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-6 col-md-offset-3\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\">" +
            "<div align=\"center\" style=\"padding: 0px 15px 0px 15px;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"wrapper\"><tr><td style=\"padding: 20px 0px 30px 0px;\" class=\"logo\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
            "<tr><td bgcolor=\"#ffffff\" width=\"200\" align=\"left\"><a href=\"http://socioboard.com\" target=\"_blank\"><img alt=\"Logo\" src=\"http://imgur.com/nvNPyAp.png\" width=\"250\" height=\"50\" style=\"display: block; font-family: Helvetica, Arial, sans-serif; color: #666666; font-size: 16px;\" border=\"0\" /></a></td>" +
            "<td align=\"right\" style=\"padding: 0 0 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none; font-weight:bold;\">" +
            "</td></tr></table></td></tr></table></td></tr></table></div></td></tr></table>" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 0px 15px 0px 15px;\" class=\"section-padding\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\"><tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr><td class=\"padding-copy\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td style=\"background-color:#F8680D; height:100px; text-align:center;\"><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 28px; font-weight: 700;\">Group Report Summary</a>" +
            "<br/><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 16px;\">Daily Digest</a></a></td></tr>" +
            "<tr><td><a href=\"#\" target=\"_blank\"><img src=\"http://i.imgur.com/RwgxMKl.png\" width=\"500\" height=\"100\" border=\"0\" alt=\"Can an email really be responsive?\" style=\"display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; width: 500px; height: 75px;\" class=\"img-max\">" +
            "</a></td></tr></table></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;font-size:16px\"><tbody>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-left:50px;padding-right:50px;padding-top:50px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:700;line-height:13px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:0;margin-bottom:10px;padding:0;font-family:Helvetica,Arial,sans-serif\">" +
            "<img width=\"16\" height=\"13\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/KPEaTAm.png\" />Your Group</h3>" +
            "<p style=\"color:#F8680D;font-weight:400;line-height:34x;font-size:26px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">" + _GroupName + "</p>" +
            "<p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:10px;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group associated with <a target=\"_blank\" href=\"mailto:vikaskumar@globussoft.com\">" + email + "</a></p>" +
            "<hr style=\"padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;background-color:#dddddd;border-bottom:0 solid #ffffff;border-left:0 solid #ffffff;border-right:0 solid #ffffff;border-top:0 solid #ffffff;min-height:1px\">" +
            "<p style=\"color:#808080;font-weight:700;line-height:18px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:10px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Report Date: <span style=\"color:#4d4d4d;text-transform:none;letter-spacing:0;font-weight:400;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\"><span><span>" + date + "</span></span>" +
            "</span></span></p><p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Latest data may be missing from summary</p></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #2caae1\" colspan=\"2\">" +
            "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Twitter Stats</h2></th>" +
            "<th width=\"140\" style=\"text-align:right;border-bottom:3px solid #2caae1\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/hDNrQdO.png\" class=\"CToWUd\"> </th></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\"> <img width=\"10\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/QTwQyVL.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.male + "%</span> Male Followers </td>" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\"> <img width=\"12\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/LvOezOQ.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.female + "%</span> Female Followers </td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">Total </td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "@Mentions Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Mentions + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Direct Messages Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Direct_Message + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Messages Sent </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Messages_Sent + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> New Followers </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.New_Followers + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Retweets </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Retweets + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Clicks </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Clicks + "</td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#2caae1\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/twitterreports\">View Full Twitter Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
            "</tr></tbody></table></td></tr></tbody></table></td></tr>" +
            //connected twitter profiles
            "<tr><td>";
            if (_SocialStat.lsttwitterfollower.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Profiles (" + _SocialStat.lsttwitterfollower.Count + ")</h3>" +
            "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itemtwt in _SocialStat.lsttwitterfollower)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itemtwt.twitterScreenName + "\" src=\"" + itemtwt.profileImageUrl.Replace("_normal", "") + "\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itemtwt.twitterScreenName + " </p></td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding:0 0 10px;text-align:left\">";
                str += "<img style=\"width: 100%;\" src=\"http://i.imgur.com/14HBiIA.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#2CAAE1\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Twitter Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>" +
                "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left;\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
            //twitter profile followers
            i = 0;
            foreach (var itemfollower in _SocialStat.lsttwitterfollower)
            {
                str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;\" cellspacing=\"0\" cellpadding=\"0\">";
                str += "<strong style=\"width:112px;color:#808080;line-height:28px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> NEW FOLLOWERS (" + _SocialStat.New_Followers + ")</strong>";
                if (i < 4)
                {
                    int p = 0;
                    //foreach (var itemfollowers in itemfollower.value)
                    //{
                    //    if (p < 5)
                    //    {
                    //        str += "<p style=\"width:112px;color:#f8680d;font-weight:500;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:3%;padding-left:0;padding-right:0;font-family:Segoe UI;text-decoration: underline;\">" + itemfollowers.FromName + "</p>";
                    //        p++;
                    //    }
                    //}
                }
                i++;
                str += "</td>";
            }
            str += "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook
            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #3B5998\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Facebook</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #3B5998\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/0zEBmAn.png\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Total Likes</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TotalLikes + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Talking About</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TalkingAbout + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Like</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageLike + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Impression </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageImpression + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Unlike </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageUnlike + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#3B5998\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/facebookreport.html\">View Full Facebook Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook pages
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookpage.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Pages (" + _FacebookStats.lstFacebookpage.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itempage in _FacebookStats.lstFacebookpage)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itempage.FbUserName + "\" src=\"http://graph.facebook.com/" + itempage.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itempage.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/IiIjgHU.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Page<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //facebook account
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _FacebookStats.lstFacebookAccount.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var intemaccount in _FacebookStats.lstFacebookAccount)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + intemaccount.FbUserName + "\" src=\"http://graph.facebook.com/" + intemaccount.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + intemaccount.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/1S5DOzR.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }


            ////sharethon
            //str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
            //str += "<tbody><tr width=\"500\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\" >";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonGroupData item in _SharethonStat.lstSharethonGroupData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.groupName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\"><p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\">";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Page Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonPageData item in _SharethonStat.lstSharethonPageData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item._FacebookAccount.FbUserName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td></tr></tbody></table></td></tr>";
            //instagram

            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #A97F67\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Instagram</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #A97F67\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://goo.gl/wQGirq\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followers</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.LikesCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followings</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.NewFollowings + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Image Count</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.ImageCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Video Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.VideoCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Likes Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.LikesCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Comment Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.CommentCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#A97F67\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/instagramreport.html\">View Full Instagram Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";
            //Instagram Account

            str += "<tr><td>";
            if (_InstagramStat.lstInstagramAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                 "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _InstagramStat.lstInstagramAccount.Count + ")</h3>" +
                 "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
                 "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                 "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var iteminsta in _InstagramStat.lstInstagramAccount)
                {
                    str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                    str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + iteminsta.InsUserName + "\" src=\"" + iteminsta.ProfileUrl + "\" class=\"CToWUd\">";
                    str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + iteminsta.InsUserName + " </p>";
                    str += "</td>";
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"> <img style=\"width: 100%;\" src=\"http://imgur.com/PiEIiBY.png\" class=\"img-responsive\"> </td>";
                str += "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#A97F67\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Instagram Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //footer
            str += "</table></td></tr></table></td></tr></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr>" +
                "<td bgcolor=\"#FA7318\" align=\"center\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\"><tr><td style=\"padding: 20px 0px 20px 0px;\">" +
                "<table width=\"500\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" class=\"responsive-table\"><tr><td align=\"center\" valign=\"middle\" style=\"font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#FFF;\">" +
                "<span class=\"appleFooter\" style=\"color:#FFF;\">Copyright &copy; 2017 <a href=\"https://www.socioboard.com/\" style=\"color:#000;\">Socioboard</a>. All rights reserved.</span>" +
                "<br><a href=\"https://www.socioboard.com/Home#/profilesettings\" class=\"original-only\" style=\"color: #FFF;\">Unsubscribe</a><span class=\"original-only\" style=\"font-family: Arial, sans-serif; font-size: 12px; color: #CCC;\">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span><a style=\"color: #FFF; text-decoration: none;\">If you do not want to recieve emails from us, you can unsubscribe.</a>" +
                "</td></tr></table></td></tr></table></td></tr></table></div></div></div></body></html>";

            string subject = _GroupName + "'s Social Media Activity Summary for " + date;
            string userid = EmailId;
            string password = Password;
            MailHelper mh = new MailHelper();
            string ret = mh.SendMailSendGrid(userid, str, subject, toEmail);
            //string ret = mh.SendEmailbyelasticDifferentServer(userid, str, subject, toEmail, userid, password,serverValue);
            //string message = Uri.EscapeDataString(ret);
            //string ret = mh.SendMailBySmtp(str, subject, toEmail, userid,password );
            return ret;
        }

        public static string SendGroupRepors(string GroupName, string toEmail, SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat, SocioBoardMailSenderServices.EmailServices.FbPageStat _FacebookStats, SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat, string EmailId, string Password)
        {
            string date = DateTime.UtcNow.AddDays(-1).ToString("MMMM dd");
            string _GroupName = GroupName;
            string email = toEmail;
            int i = 0;
            string str = "<!DOCTYPE html><html lang=\"en\"><head><title>Socioboard | Group Reports</title><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css\" />" +
                "<style type=\"text/css\">	#outlook a {padding: 0;}.ReadMsgBody {width: 100%;}.ExternalClass {width: 100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%;}" +
            "body,table,td,a {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}	table,td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}		img {-ms-interpolation-mode: bicubic;}body {margin: 0;padding: 0;}img {border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;}" +
            "table {border-collapse: collapse !important;}	body {height: 100% !important;margin: 0;padding: 0;width: 100% !important;font-family: segoe UI;}.appleBody a {color: #68440a;text-decoration: none;}.appleFooter a {color: #999999;text-decoration: none;}" +
            "@media screen and (max-width: 525px) {table[class=\"wrapper\"] {width: 100% !important;}td[class=\"logo\"] {text-align: left;padding: 20px 0 20px 0 !important;}td[class=\"logo\"] img {margin: 0 auto!important;}td[class=\"mobile-hide\"] {display: none;}img[class=\"mobile-hide\"] {display: none !important;}img[class=\"img-max\"] {max-width: 100% !important;height: auto !important;}" +
            "table[class=\"responsive-table\"] {width: 100%!important;}td[class=\"padding\"] {padding: 10px 5% 15px 5% !important;}td[class=\"padding-copy\"] {padding: 10px 5% 10px 5% !important;text-align: center;}td[class=\"padding-meta\"] {padding: 30px 5% 0px 5% !important;text-align: center;}" +
            "td[class=\"no-pad\"] {padding: 0 0 20px 0 !important;}td[class=\"no-padding\"] {padding: 0 !important;}td[class=\"section-padding\"] {padding: 50px 15px 50px 15px !important;}td[class=\"section-padding-bottom-image\"] {padding: 50px 15px 0 15px !important;}td[class=\"mobile-wrapper\"] {padding: 10px 5% 15px 5% !important;}table[class=\"mobile-button-container\"] {margin: 0 auto;width: 100% !important;}" +
            "a[class=\"mobile-button\"] {width: 80% !important;padding: 15px !important;border: 0 !important;font-size: 16px !important;}}</style></head>" +

            "<body style=\"margin: 0; padding: 0;\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-6 col-md-offset-3\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\">" +
            "<div align=\"center\" style=\"padding: 0px 15px 0px 15px;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"wrapper\"><tr><td style=\"padding: 20px 0px 30px 0px;\" class=\"logo\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
            "<tr><td bgcolor=\"#ffffff\" width=\"200\" align=\"left\"><a href=\"http://socioboard.com\" target=\"_blank\"><img alt=\"Logo\" src=\"http://imgur.com/nvNPyAp.png\" width=\"250\" height=\"50\" style=\"display: block; font-family: Helvetica, Arial, sans-serif; color: #666666; font-size: 16px;\" border=\"0\" /></a></td>" +
            "<td align=\"right\" style=\"padding: 0 0 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none; font-weight:bold;\">" +
            "</td></tr></table></td></tr></table></td></tr></table></div></td></tr></table>" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 0px 15px 0px 15px;\" class=\"section-padding\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\"><tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr><td class=\"padding-copy\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td style=\"background-color:#F8680D; height:100px; text-align:center;\"><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 28px; font-weight: 700;\">Group Report Summary</a>" +
            "<br/><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 16px;\">Daily Digest</a></a></td></tr>" +
            "<tr><td><a href=\"#\" target=\"_blank\"><img src=\"http://i.imgur.com/RwgxMKl.png\" width=\"500\" height=\"100\" border=\"0\" alt=\"Can an email really be responsive?\" style=\"display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; width: 500px; height: 75px;\" class=\"img-max\">" +
            "</a></td></tr></table></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;font-size:16px\"><tbody>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-left:50px;padding-right:50px;padding-top:50px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:700;line-height:13px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:0;margin-bottom:10px;padding:0;font-family:Helvetica,Arial,sans-serif\">" +
            "<img width=\"16\" height=\"13\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/KPEaTAm.png\" />Your Group</h3>" +
            "<p style=\"color:#F8680D;font-weight:400;line-height:34x;font-size:26px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">" + _GroupName + "</p>" +
            "<p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:10px;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group associated with <a target=\"_blank\" href=\"mailto:vikaskumar@globussoft.com\">" + email + "</a></p>" +
            "<hr style=\"padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;background-color:#dddddd;border-bottom:0 solid #ffffff;border-left:0 solid #ffffff;border-right:0 solid #ffffff;border-top:0 solid #ffffff;min-height:1px\">" +
            "<p style=\"color:#808080;font-weight:700;line-height:18px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:10px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Report Date: <span style=\"color:#4d4d4d;text-transform:none;letter-spacing:0;font-weight:400;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\"><span><span>" + date + "</span></span>" +
            "</span></span></p><p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Latest data may be missing from summary</p></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #2caae1\" colspan=\"2\">" +
            "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Twitter Stats</h2></th>" +
            "<th width=\"140\" style=\"text-align:right;border-bottom:3px solid #2caae1\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/hDNrQdO.png\" class=\"CToWUd\"> </th></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\"> <img width=\"10\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/QTwQyVL.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.male + "%</span> Male Followers </td>" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\"> <img width=\"12\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/LvOezOQ.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.female + "%</span> Female Followers </td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">Total </td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "@Mentions Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Mentions + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Direct Messages Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Direct_Message + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Messages Sent </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Messages_Sent + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> New Followers </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.New_Followers + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Retweets </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Retweets + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Clicks </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Clicks + "</td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#2caae1\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/twitterreports\">View Full Twitter Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
            "</tr></tbody></table></td></tr></tbody></table></td></tr>" +
            //connected twitter profiles
            "<tr><td>";
            if (_SocialStat.lsttwitterfollower.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Profiles (" + _SocialStat.lsttwitterfollower.Count + ")</h3>" +
            "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itemtwt in _SocialStat.lsttwitterfollower)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itemtwt.twitterScreenName + "\" src=\"" + itemtwt.profileImageUrl.Replace("_normal", "") + "\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itemtwt.twitterScreenName + " </p></td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding:0 0 10px;text-align:left\">";
                str += "<img style=\"width: 100%;\" src=\"http://i.imgur.com/14HBiIA.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#2CAAE1\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Twitter Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>" +
                "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left;\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
            //twitter profile followers
            i = 0;
            foreach (var itemfollower in _SocialStat.lsttwitterfollower)
            {
                str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;\" cellspacing=\"0\" cellpadding=\"0\">";
                str += "<strong style=\"width:112px;color:#808080;line-height:28px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> NEW FOLLOWERS (" + _SocialStat.New_Followers + ")</strong>";
                if (i < 4)
                {
                    int p = 0;
                    //foreach (var itemfollowers in itemfollower.value)
                    //{
                    //    if (p < 5)
                    //    {
                    //        str += "<p style=\"width:112px;color:#f8680d;font-weight:500;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:3%;padding-left:0;padding-right:0;font-family:Segoe UI;text-decoration: underline;\">" + itemfollowers.FromName + "</p>";
                    //        p++;
                    //    }
                    //}
                }
                i++;
                str += "</td>";
            }
            str += "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook
            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #3B5998\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Facebook</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #3B5998\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/0zEBmAn.png\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Total Likes</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TotalLikes + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Talking About</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TalkingAbout + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Like</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageLike + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Impression </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageImpression + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Unlike </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageUnlike + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#3B5998\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/facebookreport.html\">View Full Facebook Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook pages
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookpage.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Pages (" + _FacebookStats.lstFacebookpage.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itempage in _FacebookStats.lstFacebookpage)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itempage.FbUserName + "\" src=\"http://graph.facebook.com/" + itempage.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itempage.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/IiIjgHU.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Page<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //facebook account
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _FacebookStats.lstFacebookAccount.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var intemaccount in _FacebookStats.lstFacebookAccount)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + intemaccount.FbUserName + "\" src=\"http://graph.facebook.com/" + intemaccount.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + intemaccount.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/1S5DOzR.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }


            ////sharethon
            //str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
            //str += "<tbody><tr width=\"500\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\" >";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonGroupData item in _SharethonStat.lstSharethonGroupData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.groupName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\"><p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\">";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Page Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonPageData item in _SharethonStat.lstSharethonPageData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item._FacebookAccount.FbUserName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td></tr></tbody></table></td></tr>";
            //instagram

            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #A97F67\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Instagram</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #A97F67\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://goo.gl/wQGirq\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followers</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.LikesCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followings</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.NewFollowings + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Image Count</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.ImageCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Video Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.VideoCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Likes Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.LikesCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Comment Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.CommentCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#A97F67\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/instagramreport.html\">View Full Instagram Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";
            //Instagram Account

            str += "<tr><td>";
            if (_InstagramStat.lstInstagramAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                 "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _InstagramStat.lstInstagramAccount.Count + ")</h3>" +
                 "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
                 "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                 "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var iteminsta in _InstagramStat.lstInstagramAccount)
                {
                    str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                    str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + iteminsta.InsUserName + "\" src=\"" + iteminsta.ProfileUrl + "\" class=\"CToWUd\">";
                    str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + iteminsta.InsUserName + " </p>";
                    str += "</td>";
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"> <img style=\"width: 100%;\" src=\"http://imgur.com/PiEIiBY.png\" class=\"img-responsive\"> </td>";
                str += "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#A97F67\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Instagram Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //footer
            str += "</table></td></tr></table></td></tr></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr>" +
                "<td bgcolor=\"#FA7318\" align=\"center\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\"><tr><td style=\"padding: 20px 0px 20px 0px;\">" +
                "<table width=\"500\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" class=\"responsive-table\"><tr><td align=\"center\" valign=\"middle\" style=\"font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#FFF;\">" +
                "<span class=\"appleFooter\" style=\"color:#FFF;\">Copyright &copy; 2017 <a href=\"https://www.socioboard.com/\" style=\"color:#000;\">Socioboard</a>. All rights reserved.</span>" +
                "<br><a href=\"https://www.socioboard.com/Home#/profilesettings\" class=\"original-only\" style=\"color: #FFF;\">Unsubscribe</a><span class=\"original-only\" style=\"font-family: Arial, sans-serif; font-size: 12px; color: #CCC;\">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span><a style=\"color: #FFF; text-decoration: none;\">If you do not want to recieve emails from us, you can unsubscribe.</a>" +
                "</td></tr></table></td></tr></table></td></tr></table></div></div></div></body></html>";

            string subject = _GroupName + "'s Social Media Activity Summary for " + date;
            string userid = EmailId;
            string password = Password;
            MailHelper mh = new MailHelper();
            string ret = mh.SendMailSendGrid(userid, str, subject, toEmail);
            //string ret = mh.SendEmailbyelasticDifferentServer(userid, str, subject, toEmail, userid, password,serverValue);
            //string message = Uri.EscapeDataString(ret);
            //string ret = mh.SendMailBySmtp(str, subject, toEmail, userid,password );
            return ret;
        }

        public static string SendGroupReporsByDay(string GroupName, string toEmail, SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat, SocioBoardMailSenderServices.EmailServices.FbPageStat _FacebookStats, SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat, int days, string EmailId, string Password)
        {
            string date = DateTime.UtcNow.AddDays(-days).ToString("MMMM dd") + " to " + DateTime.UtcNow.ToString("MMMM dd");
            string _GroupName = GroupName;
            string email = toEmail;
            int i = 0;
            string str = "<!DOCTYPE html><html lang=\"en\"><head><title>Socioboard | Group Reports</title><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css\" />" +
                "<style type=\"text/css\">	#outlook a {padding: 0;}.ReadMsgBody {width: 100%;}.ExternalClass {width: 100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%;}" +
            "body,table,td,a {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}	table,td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}		img {-ms-interpolation-mode: bicubic;}body {margin: 0;padding: 0;}img {border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;}" +
            "table {border-collapse: collapse !important;}	body {height: 100% !important;margin: 0;padding: 0;width: 100% !important;font-family: segoe UI;}.appleBody a {color: #68440a;text-decoration: none;}.appleFooter a {color: #999999;text-decoration: none;}" +
            "@media screen and (max-width: 525px) {table[class=\"wrapper\"] {width: 100% !important;}td[class=\"logo\"] {text-align: left;padding: 20px 0 20px 0 !important;}td[class=\"logo\"] img {margin: 0 auto!important;}td[class=\"mobile-hide\"] {display: none;}img[class=\"mobile-hide\"] {display: none !important;}img[class=\"img-max\"] {max-width: 100% !important;height: auto !important;}" +
            "table[class=\"responsive-table\"] {width: 100%!important;}td[class=\"padding\"] {padding: 10px 5% 15px 5% !important;}td[class=\"padding-copy\"] {padding: 10px 5% 10px 5% !important;text-align: center;}td[class=\"padding-meta\"] {padding: 30px 5% 0px 5% !important;text-align: center;}" +
            "td[class=\"no-pad\"] {padding: 0 0 20px 0 !important;}td[class=\"no-padding\"] {padding: 0 !important;}td[class=\"section-padding\"] {padding: 50px 15px 50px 15px !important;}td[class=\"section-padding-bottom-image\"] {padding: 50px 15px 0 15px !important;}td[class=\"mobile-wrapper\"] {padding: 10px 5% 15px 5% !important;}table[class=\"mobile-button-container\"] {margin: 0 auto;width: 100% !important;}" +
            "a[class=\"mobile-button\"] {width: 80% !important;padding: 15px !important;border: 0 !important;font-size: 16px !important;}}</style></head>" +

            "<body style=\"margin: 0; padding: 0;\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-6 col-md-offset-3\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\">" +
            "<div align=\"center\" style=\"padding: 0px 15px 0px 15px;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"wrapper\"><tr><td style=\"padding: 20px 0px 30px 0px;\" class=\"logo\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
            "<tr><td bgcolor=\"#ffffff\" width=\"200\" align=\"left\"><a href=\"http://socioboard.com\" target=\"_blank\"><img alt=\"Logo\" src=\"http://imgur.com/nvNPyAp.png\" width=\"250\" height=\"50\" style=\"display: block; font-family: Helvetica, Arial, sans-serif; color: #666666; font-size: 16px;\" border=\"0\" /></a></td>" +
            "<td align=\"right\" style=\"padding: 0 0 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none; font-weight:bold;\">" +
            "</td></tr></table></td></tr></table></td></tr></table></div></td></tr></table>" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr><td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 0px 15px 0px 15px;\" class=\"section-padding\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\"><tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr><td class=\"padding-copy\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr><td style=\"background-color:#F8680D; height:100px; text-align:center;\"><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 28px; font-weight: 700;\">Group Report Summary</a>" +
            "<br/><a href=\"#\" target=\"_blank\" style=\"text-align:center; color:#FFF; text-transform:uppercase; text-decoration:none; letter-spacing: 2px; font-size: 16px;\">" + days.ToString() + " - Days Digest</a></a></td></tr>" +
            "<tr><td><a href=\"#\" target=\"_blank\"><img src=\"http://i.imgur.com/RwgxMKl.png\" width=\"500\" height=\"100\" border=\"0\" alt=\"Can an email really be responsive?\" style=\"display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; width: 500px; height: 75px;\" class=\"img-max\">" +
            "</a></td></tr></table></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;font-size:16px\"><tbody>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-left:50px;padding-right:50px;padding-top:50px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:700;line-height:13px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:0;margin-bottom:10px;padding:0;font-family:Helvetica,Arial,sans-serif\">" +
            "<img width=\"16\" height=\"13\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/KPEaTAm.png\" />Your Group</h3>" +
            "<p style=\"color:#F8680D;font-weight:400;line-height:34x;font-size:26px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">" + _GroupName + "</p>" +
            "<p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:10px;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group associated with <a target=\"_blank\" href=\"mailto:vikaskumar@globussoft.com\">" + email + "</a></p>" +
            "<hr style=\"padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;background-color:#dddddd;border-bottom:0 solid #ffffff;border-left:0 solid #ffffff;border-right:0 solid #ffffff;border-top:0 solid #ffffff;min-height:1px\">" +
            "<p style=\"color:#808080;font-weight:700;line-height:18px;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:10px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Report Date Range: <span style=\"color:#4d4d4d;text-transform:none;letter-spacing:0;font-weight:400;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\"><span><span>" + date + "</span></span>" +
            "</span></span></p><p style=\"color:#b3b3b3;font-weight:400;line-height:18x;font-size:12px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Latest data may be missing from summary</p></td></tr></tbody></table></td></tr>" +

            "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #2caae1\" colspan=\"2\">" +
            "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Twitter Stats</h2></th>" +
            "<th width=\"140\" style=\"text-align:right;border-bottom:3px solid #2caae1\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/hDNrQdO.png\" class=\"CToWUd\"> </th></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\"> <img width=\"10\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/QTwQyVL.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.male + "%</span> Male Followers </td>" +
            //"<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\"> <img width=\"12\" height=\"25\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/LvOezOQ.png\" class=\"CToWUd\"> <span style=\"font-size:32px;font-weight:700\">" + _SocialStat.female + "%</span> Female Followers </td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">Total </td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "@Mentions Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Mentions + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Direct Messages Received </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Direct_Message + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
            "Messages Sent </td><td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Messages_Sent + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> New Followers </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.New_Followers + "</td>" +
            "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Retweets </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Retweets + "</td>" +
            "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Clicks </td>" +
            "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\">" + _SocialStat.Clicks + "</td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
            "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#2caae1\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/twitterreports\">View Full Twitter Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
            "</tr></tbody></table></td></tr></tbody></table></td></tr>" +
            //connected twitter profiles
            "<tr><td>";
            if (_SocialStat.lsttwitterfollower.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
            "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Profiles (" + _SocialStat.lsttwitterfollower.Count + ")</h3>" +
            "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
            "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
            "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
            "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itemtwt in _SocialStat.lsttwitterfollower)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itemtwt.twitterScreenName + "\" src=\"" + itemtwt.profileImageUrl.Replace("_normal", "") + "\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itemtwt.twitterScreenName + " </p></td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding:0 0 10px;text-align:left\">";
                str += "<img style=\"width: 100%;\" src=\"http://i.imgur.com/14HBiIA.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#2CAAE1\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Twitter Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>" +
                "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left;\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
            //twitter profile followers
            i = 0;
            foreach (var itemfollower in _SocialStat.lsttwitterfollower)
            {
                str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;\" cellspacing=\"0\" cellpadding=\"0\">";
                str += "<strong style=\"width:112px;color:#808080;line-height:28px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> NEW FOLLOWERS (" + _SocialStat.New_Followers + ")</strong>";
                if (i < 4)
                {
                    int p = 0;
                    //foreach (var itemfollowers in itemfollower.value)
                    //{
                    //    if (p < 5)
                    //    {
                    //        str += "<p style=\"width:112px;color:#f8680d;font-weight:500;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:3%;padding-left:0;padding-right:0;font-family:Segoe UI;text-decoration: underline;\">" + itemfollowers.FromName + "</p>";
                    //    }
                    //    p++;
                    //}
                }
                i++;
                str += "</td>";
            }
            str += "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook
            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #3B5998\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Facebook</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #3B5998\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://i.imgur.com/0zEBmAn.png\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Total Likes</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TotalLikes + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Talking About</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.TalkingAbout + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Like</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageLike + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Impression </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageImpression + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Unlike </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _FacebookStats.PageUnlike + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#3B5998\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/facebookreport.html\">View Full Facebook Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";

            //facebook pages
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookpage.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Connected Pages (" + _FacebookStats.lstFacebookpage.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";

                foreach (var itempage in _FacebookStats.lstFacebookpage)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + itempage.FbUserName + "\" src=\"http://graph.facebook.com/" + itempage.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + itempage.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/IiIjgHU.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Page<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //facebook account
            str += "<tr><td>";
            i = 0;
            if (_FacebookStats.lstFacebookAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _FacebookStats.lstFacebookAccount.Count + ")</h3>" +
                "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\">" +
                "<br></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var intemaccount in _FacebookStats.lstFacebookAccount)
                {
                    if (i < 4)
                    {
                        str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                        str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + intemaccount.FbUserName + "\" src=\"http://graph.facebook.com/" + intemaccount.FbUserId + "/picture?type=large\" class=\"CToWUd\">";
                        str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + intemaccount.FbUserName + " </p>";
                        str += "</td>";
                    }
                    i++;
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"><img style=\"width: 100%;\" src=\"http://imgur.com/1S5DOzR.png\" class=\"img-responsive\"></td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#3B5998\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Facebook Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }


            //sharethon
            //str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
            //str += "<tbody><tr width=\"500\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\" >";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Group Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonGroupData item in _SharethonStat.lstSharethonGroupData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.groupName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\"><p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td><td width=\"250\" style=\"padding:0 0 10px;text-align:left;vertical-align:top\">";
            //str += "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0px;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Page Shareathon </h3>";
            //str += "<table width=\"250\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;margin-top: 5%;font-size:16px\"><tbody>";
            //foreach (SharethonPageData item in _SharethonStat.lstSharethonPageData)
            //{
            //    str += "<tr width=\"250\" cellpadding=\"0\" cellspacing=\"0\"><td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item._FacebookAccount.FbUserName + " </p></td>";
            //    str += "<td width=\"112\" valign=\"top\" height=\"10\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding-right:10px;text-align:left;\">";
            //    str += "<p style=\"width:112px;color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + item.postCount + " </p></td></tr>";
            //}

            //str += "</tbody></table></td></tr></tbody></table></td></tr>";
            //instagram

            str += "<tr><td><table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\"><tbody>" +
                "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:50px;padding-bottom:50px;text-align:left\">" +
                "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><th width=\"360\" style=\"text-align:left;border-bottom:3px solid #A97F67\" colspan=\"2\">" +
                "<h2 style=\"margin-top:0;margin-bottom:5px;padding-top:0;padding-bottom:0;color:#4d4d4d;font-weight:400;font-size:20px;line-height:28px;font-family:Helvetica,Arial,sans-serif\">Instagram</h2>" +
                "</th><th width=\"140\" style=\"text-align:right;border-bottom:3px solid #A97F67\" colspan=\"2\"> <img width=\"17\" height=\"14\" style=\"padding-right:2px;font-family:Helvetica,Arial,sans-serif\" src=\"http://goo.gl/wQGirq\" class=\"CToWUd\"> </th>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#00417b;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:10px;padding-right:20px;font-family:Helvetica,Arial,sans-serif\">&nbsp;</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"55\" style=\"text-align:center;color:#ff9393;font-weight:400;line-height:32x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:0;padding-left:0;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">&nbsp;</td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"350\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#b3b3b3;font-weight:400;line-height:20x;font-size:11px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:253px;padding-right:10px;font-family:Helvetica,Arial,sans-serif\" colspan=\"3\">" +
                "Total</td></tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followers</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.NewFollowers + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "New Followings</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.NewFollowings + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\">" +
                "Image Count</td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.ImageCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Video Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.VideoCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Likes Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.LikesCount + " </td>" +
                "</tr><tr style=\"background-color:#eeeeee\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:left;color:#4d4d4d;font-weight:400;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:10px;padding-right:0;font-family:Segoe UI;\"> Comment Count </td>" +
                "<td width=\"250\" valign=\"middle\" height=\"40\" style=\"text-align:center;color:#4d4d4d;font-weight:700;line-height:20x;font-size:14px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\" colspan=\"2\"> " + _InstagramStat.CommentCount + " </td>" +
                "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">" +
                "<td width=\"500\" height=\"40\" style=\"text-align:right;background-color:#A97F67\" colspan=\"4\"> <a target=\"_blank\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding-left:0px;padding-right:10px;padding-top:13.5px;padding-bottom:13.5px\" href=\"https://www.socioboard.com/Home#/instagramreport.html\">View Full Instagram Report <img width=\"4\" height=\"7\" style=\"font-family:Segoe UI;color:#ffffff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none\" src=\"http://i.imgur.com/Ec4giNS.png\" class=\"CToWUd\"></a> </td>" +
                "</tr></tbody></table></td></tr></tbody></table></td></tr>";
            //Instagram Account

            str += "<tr><td>";
            if (_InstagramStat.lstInstagramAccount.Count > 0)
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"400\" style=\"padding:0 0 10px;text-align:left\">" +
                 "<h3 style=\"color:#808080;font-weight:400;line-height:24px;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Helvetica,Arial,sans-serif\">Personal Profiles (" + _InstagramStat.lstInstagramAccount.Count + ")</h3>" +
                 "</td><td width=\"100\" style=\"padding-left:0;padding-right:50px;padding-top:0;padding-bottom:10px;text-align:right\"><br></td></tr>" +
                 "<tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\"><td width=\"500\" style=\"padding-top:0;text-align:left\" colspan=\"2\">" +
                 "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#808080;font-size:16px\">" +
                 "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"510\">";
                foreach (var iteminsta in _InstagramStat.lstInstagramAccount)
                {
                    str += "<td width=\"112\" valign=\"top\" height=\"155\" style=\"padding-right:10px;text-align:center\" cellspacing=\"0\" cellpadding=\"0\">";
                    str += "<img width=\"112\" height=\"112\" style=\"font-size:11px;font-weight:700;color:#2caae1;font-family:Helvetica,Arial,sans-serif;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0\" alt=\"" + iteminsta.InsUserName + "\" src=\"" + iteminsta.ProfileUrl + "\" class=\"CToWUd\">";
                    str += "<p style=\"color:#808080;font-weight:400;line-height:14px;font-size:11px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0;font-family:Segoe UI;\"> " + iteminsta.InsUserName + " </p>";
                    str += "</td>";
                }
                str += "</tr></tbody></table></td></tr></tbody></table>";
            }
            else
            {
                str += "<table width=\"500\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"background-color:#ffffff;line-height:1.6em;color:#535353;font-size:16px\">";
                str += "<tbody><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" style=\"padding:0 0 10px;text-align:left\"> <img style=\"width: 100%;\" src=\"http://imgur.com/PiEIiBY.png\" class=\"img-responsive\"> </td>";
                str += "</tr><tr cellspacing=\"0\" cellpadding=\"0\" width=\"500\">";
                str += "<td width=\"500\" height=\"40\" style=\"text-align:center;background-color:#A97F67\"><a href=\"https://www.socioboard.com\" style=\"width:100%;color:#fff;line-height:13px;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13.5px 10px 13.5px 0;float:left;\" target=\"_blank\">Add Instagram Account<img width=\"4\" height=\"7\" class=\"CToWUd\" src=\"http://i.imgur.com/Ec4giNS.png\"></a> </td>";
                str += "</tr></tbody></table>";
            }
            str += "</td></tr>";
            //footer
            str += "</table></td></tr></table></td></tr></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\"><tr>" +
                "<td bgcolor=\"#FA7318\" align=\"center\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\"><tr><td style=\"padding: 20px 0px 20px 0px;\">" +
                "<table width=\"500\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" class=\"responsive-table\"><tr><td align=\"center\" valign=\"middle\" style=\"font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#FFF;\">" +
                "<span class=\"appleFooter\" style=\"color:#FFF;\">Copyright &copy; 2017 <a href=\"https://www.socioboard.com/\" style=\"color:#000;\">Socioboard</a>. All rights reserved.</span>" +
                "<br><a href=\"https://www.socioboard.com/Home#/profilesettings\" class=\"original-only\" style=\"color: #FFF;\">Unsubscribe</a><span class=\"original-only\" style=\"font-family: Arial, sans-serif; font-size: 12px; color: #CCC;\">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span><a style=\"color: #FFF; text-decoration: none;\">If you do not want to recieve emails from us, you can unsubscribe.</a>" +
                "</td></tr></table></td></tr></table></td></tr></table></div></div></div></body></html>";

            string subject = _GroupName + "'s Social Media Activity Summary for " + date;
            string userid = EmailId;
            string password = Password;
            MailHelper mh = new MailHelper();

            string ret = mh.SendMailSendGrid(userid, str, subject, toEmail);

            //string ret = mh.SendEmailbyelastic(userid, str, subject, toEmail, userid, password);
            // string ret = mh.SendMailBySmtp(str, subject, toEmail, userid, password);
            return ret;
        }
    }
}
