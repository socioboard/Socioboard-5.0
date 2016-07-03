using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.IO;
using Socioboard.Twitter.App.Core;
using Newtonsoft.Json.Linq;


namespace Socioboard.Twitter.App.Core
{
    public class TwitterWebRequest
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="twitterUser"></param>
        /// <param name="uri"></param>
        /// <param name="HTTPMethod"></param>
        /// <param name="IsAuthenticationRequire"></param>
        /// <param name="goodProxy"></param>
        /// <returns></returns>
        public string  PerformWebRequest(TwitterUser twitterUser,string uri, string HTTPMethod,bool IsAuthenticationRequire,string goodProxy)
        {
            HttpWebRequest Request = (HttpWebRequest)WebRequest.Create(uri );
            Request.Method = HTTPMethod;
            StreamReader readStream;
            Request.MaximumAutomaticRedirections = 4;
            Request.MaximumResponseHeadersLength = 4;
            Request.ContentLength = 0;
            //Globals.RequestCount++;
            if(IsAuthenticationRequire)
            Request.Credentials = new NetworkCredential(twitterUser.TwitterUserName , twitterUser.TwitterPassword);
            HttpWebResponse Response;
            string strResponse="";
            try
            {
                Response = (HttpWebResponse)Request.GetResponse();
                Stream receiveStream = Response.GetResponseStream();
                readStream = new StreamReader(receiveStream);
                strResponse = readStream.ReadToEnd();
                Response.Close();
                readStream.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message );
                strResponse = ex.Message;
                //Logger.LogText("Exception from Twitter:" + ex.Message,"");               
            }

            return strResponse;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="proxies"></param>
        /// <returns></returns>
        public string CheckProxy(List<string> proxies )
        {
            //Logger.LogText("Checking proxies............");
            string pr="";
            foreach (string proxy in proxies)
            {
                HttpWebRequest Request = (HttpWebRequest)WebRequest.Create("http://www.google.com");
                Request.Method = "GET";
                Request.Proxy = new WebProxy("http://"+proxy);
                HttpWebResponse Response;
                try
                {
                    Response = (HttpWebResponse)Request.GetResponse();
                    if (Response.StatusCode.ToString()=="OK")
                    {
                        //Logger.LogText("Proxy found : "+proxy);
                        pr= "http://" + proxy;
                    }
                    return proxy ;
                }
                catch
                {
                    return pr;
                }

            }
            return pr;
        }

        public JObject PerformWebRequest(string uri, string HTTPMethod)
        {

            JObject objJson = new JObject();
            HttpWebRequest Request = (HttpWebRequest)WebRequest.Create(uri);
            Request.Method = HTTPMethod;
            //Request.CookieContainer = new CookieContainer();
            StreamReader readStream;
            Request.MaximumAutomaticRedirections = 4;
            Request.MaximumResponseHeadersLength = 4;
            Request.ContentLength = 0;
            HttpWebResponse Response;
            string strResponse = "";
            try
            {
                Response = (HttpWebResponse)Request.GetResponse();
                Stream receiveStream = Response.GetResponseStream();
                readStream = new StreamReader(receiveStream);
                strResponse = readStream.ReadToEnd();
                Response.Close();
                readStream.Close();
                objJson = JObject.Parse(strResponse);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                strResponse = ex.Message;
                //Logger.LogText("Exception from Twitter:" + ex.Message,"");               
            }

            return objJson;
        }

    }


}
