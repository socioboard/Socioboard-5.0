using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.Interface
{
    public interface IEmailSender
    {
        string SendMailBySmtp(string html, string subject, string tomail, string UserId="", string Password="");
        string SendMailSendGrid(string from, string html, string subject, string tomail, string UserId = "", string Password = "");

    }
}
