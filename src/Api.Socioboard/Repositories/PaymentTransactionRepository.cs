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
        public static int AddPaymentTransaction(long userId,string amount,string email,Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.PaymentTransaction _PaymentTransaction = new Domain.Socioboard.Models.PaymentTransaction();
                _PaymentTransaction.amount = amount;
                _PaymentTransaction.email = email;
                _PaymentTransaction.paymentdate = DateTime.UtcNow;
                _PaymentTransaction.userid = userId;
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
