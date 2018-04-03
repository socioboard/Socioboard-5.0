using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PayPal.Api;
using PayPal.PayPalAPIInterfaceService;
using PayPal.PayPalAPIInterfaceService.Model;
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
        public static string CancelRecurringPayment(string ProfileID,long UserId,string paypalapiusername,string paypalpassword,string paypalsignature,Model.DatabaseRepository dbr)
        {
            try
            {
                ManageRecurringPaymentsProfileStatusRequestType request =
                new ManageRecurringPaymentsProfileStatusRequestType();
                ManageRecurringPaymentsProfileStatusRequestDetailsType details =
                    new ManageRecurringPaymentsProfileStatusRequestDetailsType();
                request.ManageRecurringPaymentsProfileStatusRequestDetails = details;

                details.ProfileID = ProfileID;

                details.Action = StatusChangeActionType.CANCEL;

                // Invoke the API
                ManageRecurringPaymentsProfileStatusReq wrapper = new ManageRecurringPaymentsProfileStatusReq();
                wrapper.ManageRecurringPaymentsProfileStatusRequest = request;

                Dictionary<string, string> configurationMap = new Dictionary<string, string>();

                configurationMap.Add("mode", "live");

                // Signature Credential
                configurationMap.Add("account1.apiUsername", paypalapiusername);
                configurationMap.Add("account1.apiPassword", paypalpassword);
                configurationMap.Add("account1.apiSignature", paypalsignature);

                // Create the PayPalAPIInterfaceServiceService service object to make the API call
                PayPalAPIInterfaceServiceService service = new PayPalAPIInterfaceServiceService(configurationMap);

                ManageRecurringPaymentsProfileStatusResponseType manageProfileStatusResponse =
                            service.ManageRecurringPaymentsProfileStatus(wrapper);

                // Check for API return status

                Dictionary<string, string> responseParams = new Dictionary<string, string>();
                responseParams.Add("API Status", manageProfileStatusResponse.Ack.ToString());

                if (manageProfileStatusResponse.Ack.Equals(AckCodeType.FAILURE) || (manageProfileStatusResponse.Errors != null && manageProfileStatusResponse.Errors.Count > 0))
                {
                    //FAILURE
                    //Console.WriteLine(manageProfileStatusResponse.Errors.ToString());
                    return manageProfileStatusResponse.Errors.ToString();
                }
                else
                {
                    return "Success";
                    //SUCCESS
                    //Console.Write("Success!");
                }
            }
            catch(Exception ex)
            {
                return "Failure";
            }
          
        }

    }
}
