using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class EwalletWithdrawRepository
    {
        public static void AddRequestToWithdraw(string WithdrawAmount, string PaymentMethod, string PaypalEmail, string IbanCode, string SwiftCode, string Other, long UserID,Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.User _User = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == UserID).First();
            Domain.Socioboard.Models.EwalletWithdrawRequest _EwalletWithdrawRequest = new Domain.Socioboard.Models.EwalletWithdrawRequest();
            _EwalletWithdrawRequest.UserID = _User.Id;
            _EwalletWithdrawRequest.Other = Other;
            _EwalletWithdrawRequest.PaymentMethod = PaymentMethod;
            _EwalletWithdrawRequest.PaypalEmail = PaypalEmail;
            _EwalletWithdrawRequest.RequestDate = DateTime.UtcNow;
            _EwalletWithdrawRequest.Status = Domain.Socioboard.Enum.EwalletStatus.pending;
            _EwalletWithdrawRequest.SwiftCode = SwiftCode;
            _EwalletWithdrawRequest.UserEmail = _User.EmailId;
            _EwalletWithdrawRequest.UserName = _User.FirstName+ " "+ _User.LastName;
            _EwalletWithdrawRequest.WithdrawAmount = WithdrawAmount;
            dbr.Add(_EwalletWithdrawRequest);
            _User.Ewallet = (Double.Parse(_User.Ewallet) - Double.Parse(WithdrawAmount)).ToString();
            dbr.Update(_User);
        }

        public static List<Domain.Socioboard.Models.EwalletWithdrawRequest> GetEwalletWithdraw(long userId,Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.EwalletWithdrawRequest> lstEwalletWithdrawRequest = dbr.Find<Domain.Socioboard.Models.EwalletWithdrawRequest>(t => t.UserID == userId).ToList();
            if(lstEwalletWithdrawRequest!=null)
            {
                return lstEwalletWithdrawRequest;
            }
            else
            {
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.EwalletWithdrawRequest> GetEwalletWithdraw(Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.EwalletWithdrawRequest> lstEwalletWithdrawRequest = dbr.FindAll<Domain.Socioboard.Models.EwalletWithdrawRequest>().ToList();
            if (lstEwalletWithdrawRequest != null)
            {
                return lstEwalletWithdrawRequest;
            }
            else
            {
                return null;
            }
        }

        public static void UpdatePaymentStatus(long EwalletWithdrawid,Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.EwalletWithdrawRequest _EwalletWithdrawRequest = dbr.Find<Domain.Socioboard.Models.EwalletWithdrawRequest>(t => t.Id == EwalletWithdrawid).First();
            _EwalletWithdrawRequest.Status = Domain.Socioboard.Enum.EwalletStatus.compleate;
            dbr.Update(_EwalletWithdrawRequest);
        }
    }
}
