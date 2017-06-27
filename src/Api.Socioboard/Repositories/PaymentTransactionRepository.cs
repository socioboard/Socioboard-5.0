using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class PaymentTransactionRepository
    {
        public static Domain.Socioboard.Models.Package GetPackage(string packagename,Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.Package _package = dbr.Single<Domain.Socioboard.Models.Package>(t=>t.packagename.Equals(packagename));
                return _package;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public static int AddPaymentTransaction(long userId,string amount,string email,Domain.Socioboard.Enum.PaymentType PaymentType, string paymentId,string trasactionId,DateTime subscr_date, string payer_email, string Payername, string payment_status, string item_name, string media,Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.PaymentTransaction _PaymentTransaction = new Domain.Socioboard.Models.PaymentTransaction();
                _PaymentTransaction.amount = amount;
                _PaymentTransaction.email = email;
                _PaymentTransaction.paymentdate = DateTime.UtcNow;
                _PaymentTransaction.userid = userId;
                _PaymentTransaction.PaymentType = PaymentType;
                _PaymentTransaction.trasactionId = trasactionId;
                _PaymentTransaction.paymentId = paymentId;
                _PaymentTransaction.payeremail = payer_email;
                _PaymentTransaction.Payername = Payername;
                _PaymentTransaction.paymentstatus = payment_status;
                _PaymentTransaction.itemname = item_name;
                _PaymentTransaction.media = media;
                _PaymentTransaction.subscrdate = subscr_date;
                int isaved= dbr.Add<Domain.Socioboard.Models.PaymentTransaction>(_PaymentTransaction);
                return isaved;
            }
            catch (Exception)
            {
                return 0;
            }
        }

    }
}
