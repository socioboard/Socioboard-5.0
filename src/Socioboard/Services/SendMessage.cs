using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Xml;
//using System;
//using Twilio;
//using Twilio.Rest.Api.V2010.Account;
//using Twilio.Types;
//using System.Collections.Generic;

namespace Socioboard.Services
{
   
    public class SendMessage
    {

        //way2sms not working
        string uid = "9210663604";
        string password = "";
        string message = "hi";
        string no = "9210663604";
        //com.experttexting.www.ExptTextingAPI ExptTexting = new com.experttexting.www.ExptTextingAPI();
        //XmlNode x = ExptTexting.SendSMS("experttexting", "1234", "7c11788D062843",
        //"DEFAULT", "1732512526", "TEST SMS");
        public void send(string uid, string password, string message, string no)
        {
            HttpWebRequest myReq = (HttpWebRequest)WebRequest.Create("http://ubaid.tk/sms/sms.aspx?uid=" + uid + "&pwd=" + password + "&msg=" + message + "&phone=" + no + "&provider=way2sms");
            HttpWebResponse myResp = (HttpWebResponse)myReq.GetResponse();
            System.IO.StreamReader respStreamReader = new System.IO.StreamReader(myResp.GetResponseStream());
            string responseString = respStreamReader.ReadToEnd();
            respStreamReader.Close();
            myResp.Close();
        }

        //twilio
        //public void sendmsg(string phno,string otp)
        //{
        //    try
        //    {
        //        var accountSid = "ACf1ba2f1dfca5a4074c9545bda8b901b4";
        //        // Your Auth Token from twilio.com/console
        //        var authToken = "9d9568786ee2a1df54c9cb336247a48b";

        //        TwilioClient.Init(accountSid, authToken);

        //        var message = MessageResource.Create(
        //            //to: new PhoneNumber("+919210663604"),
        //            to: new PhoneNumber("+917000608042"),
        //            // to: new PhoneNumber(phno),
        //            from: new PhoneNumber("+14158497650"),
        //            body: "Your 2 step otp is " + otp);

        //        Console.WriteLine(message.Sid);
        //    }
        //   catch(Exception ex)
        //    {
        //        //Console.WriteLine(message.Sid);
        //    }
            
        //}



        //Site2sms
        public void sent()

        {
            bool isSent = SendOTPSMS("", "", "", "", "");
        }
        public  bool SendOTPSMS(string senderMobileNo, string senderPassword, string MshapeKey, string receiverMobileNo, string Message)
        {
            bool isSent = true;
            try
            {
                WebRequest request = WebRequest.Create("https://site2sms.p.mashape.com/index.php?msg="
                + Message + "&phone=" + receiverMobileNo + "&pwd=" + senderPassword + "&uid=" + senderMobileNo);
                request.Headers.Add("X-Mashape-Key", MshapeKey);
                WebResponse response = request.GetResponse();
                return isSent;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }

    

}
