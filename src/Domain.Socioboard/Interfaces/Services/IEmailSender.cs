using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Interfaces.Services
{
    public interface IEmailSender
    {
         string SendMail(string from, string passsword, string to, string bcc, string cc, string subject, string body, string UserName = "", string Password = "");

    }
}
