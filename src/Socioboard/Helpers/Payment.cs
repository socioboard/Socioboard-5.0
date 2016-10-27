using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
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
                redirecturl += "&item_name=" + itemInfo;

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



                redirecturl += "&a1=0.0";//"&a1=0.0"; //Trial period 1 price. For a free trial period, specify 0

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
                redirecturl += "&item_name=" + itemInfo;

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
                redirecturl += "&item_name=" + itemInfo;

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


    }
}