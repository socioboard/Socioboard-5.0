using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace Socioboard.Helpers
{
    public  class Payment
    {
       
        public static  string RecurringPaymentWithPayPal(string amount, string itemInfo, string name, string phone, string email, string currency, string paypalemail, string successUrl, string failUrl, string callBackUrl, string cancelurl, string notifyurl, string custom,string PaypalURL)
        {
            string redirecturl = "";
            try
            {

                //Mention URL to redirect content to paypal site
                //cmd=_xclick-subscriptions for subscription.
                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                                     paypalemail;
                //First name 
                redirecturl += "&first_name=" + name;

                //Product Name
                redirecturl += "&item_name=" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product Amount
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Address 
                redirecturl += "&address1=" + email;

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity 
                redirecturl += "&quantity=1";

                //Currency code 
                redirecturl += "&currency_code=" + currency;



                //Success return page url 
                redirecturl += "&return=" +
                              callBackUrl;
                //Failed return page url
                redirecturl += "&cancel_return=" +
                             cancelurl;

                //Notify return page url
                redirecturl += "&notify_url=" + notifyurl;

                //Trial period  amount
                redirecturl += "&a1=" + amount;

                //Trial period  duration time 
                redirecturl += "&p1=1";

                //Trial period  units of duration
                //Allowable values are:
                //D – for days; 
                //W – for weeks;
                //M – for months;
                //Y – for years;   
                redirecturl += "&t1=M";


                //Subscription Params   
                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence
                redirecturl += "&a3=" + amount;
                redirecturl += "&p3=1";
                redirecturl += "&t3=M";


                //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:
                //0 – subscription payments do not recur
                //1 – subscription payments recur
                redirecturl += "&src=1"; 
               



                //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:
                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                 redirecturl += "&sra=1";





                //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                //Allowable values are:
                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                redirecturl += "&rm=2"; 
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
                //cmd=_xclick-subscriptions for subscription.
                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick-subscriptions&business=" +
                                     paypalemail;

                //First name 
                redirecturl += "&first_name=" + name;


                //Product Name
                redirecturl += "&item_name=" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product amount
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Address 
                redirecturl += "&address1=" + email;

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity i added one only statically 
                redirecturl += "&quantity=1";

                //Currency code 

                redirecturl += "&currency_code=" + currency;



                //Success return page url
                redirecturl += "&return=" +
                              callBackUrl;
                //Failed return page url
                redirecturl += "&cancel_return=" +
                             cancelurl;
                //NOtify return page url
                redirecturl += "&notify_url=" + notifyurl;



                //Subscription Params   

                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence

                redirecturl += "&a3=" + amount;

                redirecturl += "&p3=1";

                redirecturl += "&t3=M";

                //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:
                //0 – subscription payments do not recur
                //1 – subscription payments recur
                redirecturl += "&src=1";




                //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:
                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                redirecturl += "&sra=1";





                //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                //Allowable values are:
                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                redirecturl += "&rm=2";  


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
                //cmd=_xclick for one time payment.
                redirecturl += PaypalURL + @"/cgi-bin/webscr?cmd=_xclick&business=" +
                                     paypalemail;

                //First name 
                redirecturl += "&first_name=" + name;

                //Product Name
                redirecturl += "&item_name=" + itemInfo;

                //item_number
                redirecturl += "&item_number=" + 1;

                //Product amount
                redirecturl += "&amount=" + amount;

                //Phone No
                redirecturl += "&night_phone_a=" + phone;

                //Address 
                redirecturl += "&address1=" + email;

                //Shipping charges if any
                redirecturl += "&shipping=0";

                //Handling charges if any
                redirecturl += "&handling=0";

                //Tax amount if any
                redirecturl += "&tax=0";

                //Add quatity i added one only statically 
                redirecturl += "&quantity=1";

                //Currency code 
                redirecturl += "&currency_code=" + currency;



                //Success return page url
                redirecturl += "&return=" +
                              callBackUrl;
                //Failed return page url
                redirecturl += "&cancel_return=" +
                             cancelurl;

                //Subscription Params   
                //    a3 - amount to be invoiced each recurrence
                //    t3 - time period (D=days, W=weeks, M=months, Y=years)
                //    p3 - number of time periods between each recurrence

                redirecturl += "&a3=" + amount;
                redirecturl += "&p3=1";
                redirecturl += "&t3=M";



                //Recurring payments. Subscription payments recur unless subscribers cancel their subscriptions before the end of the current billing cycle or you limit the number of times that payments recur with the value that you specify for srt.
                //Allowable values are:
                //0 – subscription payments do not recur
                //1 – subscription payments recur
                redirecturl += "&src=1";


                //Reattempt on failure. If a recurring payment fails, PayPal attempts to collect the payment two more times before canceling the subscription.
                //Allowable values are:
                //0 – do not reattempt failed recurring payments
                //1 – reattempt failed recurring payments before canceling
                redirecturl += "&sra=1";




                //Return method. The FORM METHOD used to send data to the URL specified by the return variable.
                //Allowable values are:
                //0 – all shopping cart payments use the GET method
                //1 – the buyer's browser is redirected to the return URL by using the GET method, but no payment variables are included
                //2 – the buyer's browser is redirected to the return URL by using the POST method, and all payment variables are included
                redirecturl += "&rm=2"; 

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return redirecturl;
        }

      
    }
}