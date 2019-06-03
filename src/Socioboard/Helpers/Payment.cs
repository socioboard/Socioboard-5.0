using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Domain.Socioboard.Models;

namespace Socioboard.Helpers
{
    public class Payment
    {

        private readonly AppSettings _appSettings;

        public Payment(AppSettings settings)
        {
            _appSettings = settings;
        }

        public static string RecurringPaymentWithPayPal(string amount, string itemInfo, string name, string phone, string email, string currency, string paypalemail, string successUrl, string failUrl, string callBackUrl, string cancelurl, string notifyurl, string custom, string PaypalURL)
        {
            string redirecturl = "";
            try
            {

                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" + paypalemail;

                //redirecturl += "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                //   paypalemail;

                //First name i assign static based on login details assign this value
                redirecturl += "&first_name=" + name;

                //redirecturl += "&rm=2";
                //City i assign static based on login user detail you change this value
                //  redirecturl += "&city=bhubaneswar";

                //State i assign static based on login user detail you change this value
                //  redirecturl += "&state=Odisha";

                //Product Name
                redirecturl += "&item_name=" + "Socioboard" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product Name
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Product Name
                //            redirecturl += "&item_name=" + itemInfo;

                //Address 
                redirecturl += "&address1=" + email;

                //Business contact id
                // redirecturl += "&business=k.tapankumar@gmail.com";

                // when payment will done
                //redirecturl += "&invoice_date=2014-05-27 PST";

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity i added one only statically 
                redirecturl += "&quantity=1";

                //Currency code 
                //redirecturl += "&currency=" + currency;

                redirecturl += "&currency_code=" + currency;



                //Success return page url
                redirecturl += "&return=" + callBackUrl;

                //Failed return page url
                redirecturl += "&cancel_return=" + cancelurl;

                redirecturl += "&notify_url=" + notifyurl;

                redirecturl += "&custom=" + custom;

                // redirecturl += "&a1=0.0";//"&a1=0.0"; //Trial period 1 price. For a free trial period, specify 0
                redirecturl += "&a1=" + amount;
                redirecturl += "&p1=1";

                redirecturl += "&t1=M";

                ////"<input type='hidden' name='p3' value='1'>". 

                //redirecturl += "&p1=1"; //Trial period 1 duration
                ////Trial period 1 duration. Required if you specify a1. Specify an integer value in the allowable range for the units of duration that you specify with t1.

                ////"<input type='hidden' name='t3' value='M'>".

                //redirecturl += "&t1=D"; //Trial period 1 units of duration. Required if you specify a1.
                //Allowable values are:

                //D – for days; allowable range for p2 is 1 to 90
                //W – for weeks; allowable range for p2 is 1 to 52
                //M – for months; allowable range for p2 is 1 to 24
                //Y – for years; allowable range for p2 is 1 to 5


                //Subscription Params   

                //"<input type='hidden' name='a3' value=$nettotal>".

                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence

                //For the example above, the variables would be:
                //$5.00 USD (a3) every 1 (p3) month (t3)




                redirecturl += "&a3=" + amount;

                //"<input type='hidden' name='p3' value='1'>". 

                redirecturl += "&p3=1";

                //"<input type='hidden' name='t3' value='M'>". 

                redirecturl += "&t3=M";


                //<!-- Set recurring payments until canceled. -->  

                //"<input type='hidden' name='src' value='1'>".

                redirecturl += "&src=1"; //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:

                //0 – subscription payments do not recur
                //1 – subscription payments recur
                //The default is 0.

                //<!-- Set recurring payments Retry if Failed  -->

                //"<input type='hidden' name='sra' value='1'>".

                redirecturl += "&sra=1";//"&sra=3"; //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:

                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                //The default is 1.

                redirecturl += "&rm=2"; //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                                        //Allowable values are:

                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                //The default is 0.

                //redirecturl += "&subscr_effective=2014-05-05T10%3A27%3A52.000Z";
                // redirecturl += "&srt=2";//instalments value* instead of 2 you can put any value

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return redirecturl;
        }

        public static string RecurringPaymentWithPayPalUpgrade(string amount, string itemInfo, string name, string phone, string email, string currency, string paypalemail, string successUrl, string failUrl, string callBackUrl, string cancelurl, string notifyurl, string custom, string PaypalURL)
        {
            string redirecturl = "";
            try
            {


                //Mention URL to redirect content to paypal site
                //redirecturl += "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                //                      paypalemail;
                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                                     paypalemail;

                //redirecturl += "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                //   paypalemail;

                //First name i assign static based on login details assign this value
                redirecturl += "&first_name=" + name;

                //redirecturl += "&rm=2";
                //City i assign static based on login user detail you change this value
                //  redirecturl += "&city=bhubaneswar";

                //State i assign static based on login user detail you change this value
                //  redirecturl += "&state=Odisha";

                //Product Name
                redirecturl += "&item_name=" + "Socioboard" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product Name
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Product Name
                //            redirecturl += "&item_name=" + itemInfo;

                //Address 
                redirecturl += "&address1=" + email;

                //Business contact id
                // redirecturl += "&business=k.tapankumar@gmail.com";

                // when payment will done
                //redirecturl += "&invoice_date=2014-05-27 PST";

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity i added one only statically 
                redirecturl += "&quantity=1";

                //Currency code 
                //redirecturl += "&currency=" + currency;

                redirecturl += "&currency_code=" + currency;



                //Success return page url
                redirecturl += "&return=" +
                              callBackUrl;
                //Failed return page url
                redirecturl += "&cancel_return=" +
                             cancelurl;
                redirecturl += "&notify_url=" + notifyurl;

                redirecturl += "&custom=" + custom;



                //  redirecturl += "&a1="+ amount;//"&a1=0.0"; //Trial period 1 price. For a free trial period, specify 0

                // redirecturl += "&p1=1";

                // redirecturl += "&t1=M";

                ////"<input type='hidden' name='p3' value='1'>". 

                //redirecturl += "&p1=1"; //Trial period 1 duration
                ////Trial period 1 duration. Required if you specify a1. Specify an integer value in the allowable range for the units of duration that you specify with t1.

                ////"<input type='hidden' name='t3' value='M'>".

                //redirecturl += "&t1=D"; //Trial period 1 units of duration. Required if you specify a1.
                //Allowable values are:

                //D – for days; allowable range for p2 is 1 to 90
                //W – for weeks; allowable range for p2 is 1 to 52
                //M – for months; allowable range for p2 is 1 to 24
                //Y – for years; allowable range for p2 is 1 to 5


                //Subscription Params   

                //"<input type='hidden' name='a3' value=$nettotal>".

                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence

                //For the example above, the variables would be:
                //$5.00 USD (a3) every 1 (p3) month (t3)




                redirecturl += "&a3=" + amount;

                //"<input type='hidden' name='p3' value='1'>". 

                redirecturl += "&p3=1";

                //"<input type='hidden' name='t3' value='M'>". 

                redirecturl += "&t3=M";


                //<!-- Set recurring payments until canceled. -->  

                //"<input type='hidden' name='src' value='1'>".

                redirecturl += "&src=1"; //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:

                //0 – subscription payments do not recur
                //1 – subscription payments recur
                //The default is 0.

                //<!-- Set recurring payments Retry if Failed  -->

                //"<input type='hidden' name='sra' value='1'>".

                redirecturl += "&sra=1";//"&sra=3"; //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:

                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                //The default is 1.

                redirecturl += "&rm=2"; //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                                        //Allowable values are:

                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                //The default is 0.

                //redirecturl += "&subscr_effective=2014-05-05T10%3A27%3A52.000Z";
                // redirecturl += "&srt=2";//instalments value* instead of 2 you can put any value
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return redirecturl;
        }

        public static string AgencyPayment(string amount, string itemInfo, string name, string phone, string email, string currency, string paypalemail, string successUrl, string failUrl, string callBackUrl, string cancelurl, string notifyurl, string custom, string PaypalURL)
        {
            string redirecturl = "";

            try
            {


                //Mention URL to redirect content to paypal site
                //redirecturl += "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                //                      paypalemail;
                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick&business=" +
                                     paypalemail;

                //redirecturl += "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                //   paypalemail;

                //First name i assign static based on login details assign this value
                redirecturl += "&first_name=" + name;

                //redirecturl += "&rm=2";
                //City i assign static based on login user detail you change this value
                //  redirecturl += "&city=bhubaneswar";

                //State i assign static based on login user detail you change this value
                //  redirecturl += "&state=Odisha";

                //Product Name
                redirecturl += "&item_name=" + "Socioboard" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product Name
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Product Name
                //            redirecturl += "&item_name=" + itemInfo;

                //Address 
                redirecturl += "&address1=" + email;

                //Business contact id
                // redirecturl += "&business=k.tapankumar@gmail.com";

                // when payment will done
                //redirecturl += "&invoice_date=2014-05-27 PST";

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity i added one only statically 
                redirecturl += "&quantity=1";

                //Currency code 
                //redirecturl += "&currency=" + currency;

                redirecturl += "&currency_code=" + currency;



                //Success return page url
                redirecturl += "&return=" +
                              callBackUrl;
                //Failed return page url
                redirecturl += "&cancel_return=" +
                             cancelurl;
                //redirecturl += "&notify_url=" + notifyurl;

                redirecturl += "&custom=" + custom;



                //  redirecturl += "&a1="+ amount;//"&a1=0.0"; //Trial period 1 price. For a free trial period, specify 0

                // redirecturl += "&p1=1";

                // redirecturl += "&t1=M";

                ////"<input type='hidden' name='p3' value='1'>". 

                //redirecturl += "&p1=1"; //Trial period 1 duration
                ////Trial period 1 duration. Required if you specify a1. Specify an integer value in the allowable range for the units of duration that you specify with t1.

                ////"<input type='hidden' name='t3' value='M'>".

                //redirecturl += "&t1=D"; //Trial period 1 units of duration. Required if you specify a1.
                //Allowable values are:

                //D – for days; allowable range for p2 is 1 to 90
                //W – for weeks; allowable range for p2 is 1 to 52
                //M – for months; allowable range for p2 is 1 to 24
                //Y – for years; allowable range for p2 is 1 to 5


                //Subscription Params   

                //"<input type='hidden' name='a3' value=$nettotal>".

                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence

                //For the example above, the variables would be:
                //$5.00 USD (a3) every 1 (p3) month (t3)




                redirecturl += "&a3=" + amount;

                //"<input type='hidden' name='p3' value='1'>". 

                redirecturl += "&p3=1";

                //"<input type='hidden' name='t3' value='M'>". 

                redirecturl += "&t3=M";


                //<!-- Set recurring payments until canceled. -->  

                //"<input type='hidden' name='src' value='1'>".

                redirecturl += "&src=1"; //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:

                //0 – subscription payments do not recur
                //1 – subscription payments recur
                //The default is 0.

                //<!-- Set recurring payments Retry if Failed  -->

                //"<input type='hidden' name='sra' value='1'>".

                redirecturl += "&sra=1";//"&sra=3"; //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:

                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                //The default is 1.

                redirecturl += "&rm=2"; //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                                        //Allowable values are:

                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                //The default is 0.

                //redirecturl += "&subscr_effective=2014-05-05T10%3A27%3A52.000Z";


            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return redirecturl;
        }

        public static string PaypalRecurringPayment(string amount, string itemInfo, string name, string phone, string email, string currency, string paypalemail, string successUrl, string failUrl, string callBackUrl, string cancelurl, string notifyurl, string custom, string PaypalURL,long userId)
        {
            #region Recurring Payment

            var baseUrl = $"{PaypalURL}/cgi-bin/webscr?";

            var itemName = $"Socioboard_{itemInfo}";

            // Paypal Settings
            const string p3 = "1";
            const string t3 = "M";
            const string src = "1";
            const string sra = "1";
            custom = $"{email}_Socioboard_Id_{userId}";

            var paypalRecurringUrl = $"{baseUrl}cmd=_xclick-subscriptions&business={paypalemail}&item_name={itemName}&currency_code={currency}&a3={amount}&p3={p3}&t3={t3}&src={src}&sra={sra}&no_note=1&custom={custom}&return={callBackUrl}&cancel_return={cancelurl}&notify_url={notifyurl}";

            return paypalRecurringUrl;
            #endregion
        }


        public async Task<string> PaypalExpressPayment(string amount, string currency, string description, string email, long userId, string invoiceNumber)
        {
            var redirectUrl = string.Empty;


            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                new KeyValuePair<string, string>("METHOD", "SetExpressCheckout"),
                new KeyValuePair<string, string>("VERSION", "204.0"),
                new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                new KeyValuePair<string, string>("PAYMENTREQUEST_0_AMT", amount),
                new KeyValuePair<string, string>("L_BILLINGTYPE0","RecurringPayments"),
                new KeyValuePair<string, string>("L_BILLINGAGREEMENTDESCRIPTION0","SocioboardMembership"),
                new KeyValuePair<string, string>("returnUrl", _appSettings.PaypalSuccessUrl),
                new KeyValuePair<string, string>("cancelUrl", _appSettings.failUrl),
            };

                var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        var data = await response.Content.ReadAsStringAsync();
                        var token = Uri.UnescapeDataString(Utils.GetBetween(data, "TOKEN=", "&"));

                        redirectUrl = $"{_appSettings.PaypalRedirectUrl}?cmd=_express-checkout&token={token}";
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        throw;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            return redirectUrl;
        }

        public async Task<string> GetPayPalPayerId(string token)
        {
            var payerId = string.Empty;
            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                    new KeyValuePair<string, string>("METHOD", "GetExpressCheckoutDetails"),
                    new KeyValuePair<string, string>("VERSION", "204.0"),
                    new KeyValuePair<string, string>("TOKEN",  HttpUtility.UrlEncode(token)),
                    new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                    new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                    new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                };

                var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        var data = await response.Content.ReadAsStringAsync();
                        payerId = Uri.UnescapeDataString(Utils.GetBetween(data, "PAYERID=", "&"));
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return payerId;
        }

        public async Task<string> PaypalInitialPayment(string token, string payerId, string description, string amount)
        {
            var responseData = string.Empty;
            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                new KeyValuePair<string, string>("METHOD", "DoExpressCheckoutPayment"),
                new KeyValuePair<string, string>("VERSION", "204.0"),
                new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                new KeyValuePair<string, string>("TOKEN",token),
                new KeyValuePair<string, string>("PAYERID",payerId),
                new KeyValuePair<string, string>("PAYMENTREQUEST_0_PAYMENTACTION", "Sale"),
                new KeyValuePair<string, string>("PAYMENTREQUEST_0_AMT", amount),
                new KeyValuePair<string, string>("PAYMENTREQUEST_0_CURRENCYCODE", "USD"),
                new KeyValuePair<string, string>("PAYMENTREQUEST_0_DESC", "Initial Payment")
            };
                var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        responseData = await response.Content.ReadAsStringAsync();
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        throw;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            return responseData;
        }

        public async Task<string> PaypalRecurringCreation(string token, string payerId, string description, string amount)
        {
            var recurringResponse = string.Empty;
            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                new KeyValuePair<string, string>("METHOD", "CreateRecurringPaymentsProfile"),
                new KeyValuePair<string, string>("VERSION", "204.0"),
                new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                new KeyValuePair<string, string>("TOKEN",token),
                new KeyValuePair<string, string>("PAYERID",payerId),
                new KeyValuePair<string, string>("PROFILESTARTDATE", $"{DateTime.UtcNow.AddMonths(1):yyyy-MM-ddTHH:mm:ss.FFFZ}"),
                new KeyValuePair<string, string>("DESC", "SocioboardMembership"),
                new KeyValuePair<string, string>("BILLINGPERIOD", "Month"),
                new KeyValuePair<string, string>("BILLINGFREQUENCY","1"),
                new KeyValuePair<string, string>("AMT", amount),
                new KeyValuePair<string, string>("CURRENCYCODE", "USD"),
                new KeyValuePair<string, string>("COUNTRYCODE","US"),
                new KeyValuePair<string, string>("MAXFAILEDPAYMENTS","3")
            };
                var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        recurringResponse = await response.Content.ReadAsStringAsync();
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        throw;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            return recurringResponse;
        }

        public async Task<string> GetRecurringProfileDetails(string profileId)
        {
            var responseData = string.Empty;

            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                    new KeyValuePair<string, string>("METHOD", "GetRecurringPaymentsProfileDetails"),
                    new KeyValuePair<string, string>("VERSION", "204.0"),
                    new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                    new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                    new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                    new KeyValuePair<string, string>("PROFILEID", profileId),
                };
                var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        responseData = await response.Content.ReadAsStringAsync();
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        throw;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return responseData;
        }

        public async Task<string> CancelRecurring(string userId = null, string profileId = null)
        {
            var responseData = string.Empty;

            try
            {
                var parameters = new List<KeyValuePair<string, string>>{
                    new KeyValuePair<string, string>("METHOD", "ManageRecurringPaymentsProfileStatus"),
                    new KeyValuePair<string, string>("VERSION", "204.0"),
                    new KeyValuePair<string, string>("USER", _appSettings.PaypalApiUsername),
                    new KeyValuePair<string, string>("PWD", _appSettings.PaypalApiPassword),
                    new KeyValuePair<string, string>("SIGNATURE", _appSettings.PaypalApiSignature),
                    new KeyValuePair<string, string>("ACTION","Cancel")
                };


                if (!string.IsNullOrEmpty(userId))
                {
                    var paymentResponse = await WebApiReq.GetReq($"/api/PaymentTransaction/GetUserPaymentProfiles?id={userId}", "", "", _appSettings.ApiDomain);
                    if (paymentResponse.IsSuccessStatusCode)
                    {
                        var payments = await paymentResponse.Content.ReadAsAsync<PaymentTransaction>();
                        profileId = payments.paymentId;
                    }
                }

                if (!string.IsNullOrEmpty(profileId))
                {
                    parameters.Add(new KeyValuePair<string, string>("PROFILEID", profileId));

                    var response = await WebApiReq.PostReq("", parameters, "", "", _appSettings.PaypalExpressUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        try
                        {
                            responseData = await response.Content.ReadAsStringAsync();
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                            throw;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return responseData;

        }

    }
}