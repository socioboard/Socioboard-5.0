using System;
using System.Collections.Generic;
using PayPal.PayPalAPIInterfaceService;
using PayPal.PayPalAPIInterfaceService.Model;

namespace Api.Socioboard.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class PaymentTransactionRepository
    {
        /// <summary>
        /// To get the package full details
        /// </summary>
        /// <param name="packageName"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static Domain.Socioboard.Models.Package GetPackage(string packageName, Model.DatabaseRepository dbr)
        {
            try
            {
                var package = dbr.Single<Domain.Socioboard.Models.Package>(t => t.packagename.Equals(packageName));
                return package;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="amount"></param>
        /// <param name="email"></param>
        /// <param name="PaymentType"></param>
        /// <param name="paymentId"></param>
        /// <param name="trasactionId"></param>
        /// <param name="subscr_date"></param>
        /// <param name="payer_email"></param>
        /// <param name="Payername"></param>
        /// <param name="payment_status"></param>
        /// <param name="item_name"></param>
        /// <param name="media"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static int AddPaymentTransaction(long userId, string amount, string email, Domain.Socioboard.Enum.PaymentType PaymentType, string paymentId, string trasactionId, DateTime subscr_date, string payer_email, string Payername, string payment_status, string item_name, string media, Model.DatabaseRepository dbr)
        {
            try
            {
                var paymentTransaction = new Domain.Socioboard.Models.PaymentTransaction
                {
                    amount = amount,
                    email = email,
                    paymentdate = DateTime.UtcNow,
                    userid = userId,
                    PaymentType = PaymentType,
                    trasactionId = trasactionId,
                    paymentId = paymentId,
                    payeremail = payer_email,
                    Payername = Payername,
                    paymentstatus = payment_status,
                    itemname = item_name,
                    media = media,
                    subscrdate = subscr_date
                };
                return dbr.Add(paymentTransaction);

            }
            catch (Exception)
            {
                return 0;
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ProfileID"></param>
        /// <param name="UserId"></param>
        /// <param name="paypalapiusername"></param>
        /// <param name="paypalpassword"></param>
        /// <param name="paypalsignature"></param>
        /// <param name="dbr"></param>
        /// <returns></returns>
        public static string CancelRecurringPayment(string ProfileID, long UserId, string paypalapiusername, string paypalpassword, string paypalsignature, Model.DatabaseRepository dbr)
        {
            try
            {
                var request = new ManageRecurringPaymentsProfileStatusRequestType();

                var details = new ManageRecurringPaymentsProfileStatusRequestDetailsType();

                request.ManageRecurringPaymentsProfileStatusRequestDetails = details;

                details.ProfileID = ProfileID;

                details.Action = StatusChangeActionType.CANCEL;

                // Invoke the API
                var wrapper = new ManageRecurringPaymentsProfileStatusReq
                {
                    ManageRecurringPaymentsProfileStatusRequest = request
                };

                var configurationMap = new Dictionary<string, string>
                {
                    {"mode", "live"},
                    {"account1.apiUsername", paypalapiusername},
                    {"account1.apiPassword", paypalpassword},
                    {"account1.apiSignature", paypalsignature}
                };

                // Signature Credential

                // Create the PayPalAPIInterfaceServiceService service object to make the API call
                var service = new PayPalAPIInterfaceServiceService(configurationMap);

                var manageProfileStatusResponse = service.ManageRecurringPaymentsProfileStatus(wrapper);

                // Check for API return status

                var responseParams = new Dictionary<string, string>
                {
                    {"API Status", manageProfileStatusResponse.Ack.ToString()}
                };

                if (manageProfileStatusResponse.Ack.Equals(AckCodeType.FAILURE) || (manageProfileStatusResponse.Errors != null && manageProfileStatusResponse.Errors.Count > 0))
                {
                    //FAILURE
                    //Console.WriteLine(manageProfileStatusResponse.Errors.ToString());
                    return manageProfileStatusResponse.Errors.ToString();
                }
                return "Success";
            }
            catch (Exception)
            {
                return "Failure";
            }
        }

    }
}
