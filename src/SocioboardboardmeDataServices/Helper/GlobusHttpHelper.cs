using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Web;
using System.IO;
using System.Collections.Specialized;
using System.Text.RegularExpressions;
using System.Linq;
using System.Threading;

namespace BaseLib
{
    public class GlobusHttpHelper
    {
        public CookieCollection gCookies;
        public HttpWebRequest gRequest;
        public HttpWebResponse gResponse;
        public string responseURI = string.Empty;
        public static string qn = string.Empty;
      
       public static List<string> LstPicUrlsGroupCampaignManager
        {
            get;
            set;
        }



       ///public static string UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36";
       public static string UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393";

        public GlobusHttpHelper()
        {
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
        }

        /// <summary>
        /// Gets Html from a specified Url
        /// </summary>
        /// <param name="url">Http Url Link</param>
        /// <returns>HTML of the page in string format</returns>
        public string getHtmlfromUrl(Uri url, string refererUrl)
        {
            string responseString = string.Empty;
            try
            {
                //setExpect100Continue();
                gRequest = (HttpWebRequest)WebRequest.Create(url);
                gRequest.UserAgent = UserAgent;// "Mozilla/5.0 (Windows NT 6.1; rv:18.0) Gecko/20100101 Firefox/18.0";
               
                gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
                gRequest.Headers["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
                gRequest.Headers["Accept-Language"] = "en-us,en;q=0.5";
                gRequest.Referer = refererUrl;
                gRequest.KeepAlive = true;
                gRequest.Host = "www.facebook.com";
                    
                gRequest.AllowAutoRedirect = true;

                gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                gRequest.CookieContainer = new CookieContainer(); //gCookiesContainer;

                gRequest.Method = "GET";

                gRequest.Headers.Add("Javascript-enabled", "true");

                ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);

                #region CookieManagment

                if (this.gCookies != null && this.gCookies.Count > 0)
                {
                    setExpect100Continue();
                    gRequest.CookieContainer.Add(gCookies);

                }

                if (this.gCookies == null)
                {
                    this.gCookies = new CookieCollection();
                }

                

                //Get Response for this request url

                setExpect100Continue();
                gResponse = (HttpWebResponse)gRequest.GetResponse();

                //check if the status code is http 200 or http ok
                if (gResponse.StatusCode == HttpStatusCode.OK)
                {
                    //get all the cookies from the current request and add them to the response object cookies
                    setExpect100Continue();
                    gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);


                    //check if response object has any cookies or not
                    if (gResponse.Cookies.Count > 0)
                    {
                        //check if this is the first request/response, if this is the response of first request gCookies
                        //will be null
                        if (this.gCookies == null)
                        {
                            gCookies = gResponse.Cookies;
                        }
                        else
                        {
                            foreach (Cookie oRespCookie in gResponse.Cookies)
                            {
                                bool bMatch = false;
                                foreach (Cookie oReqCookie in this.gCookies)
                                {
                                    if (oReqCookie.Name == oRespCookie.Name)
                                    {
                                        oReqCookie.Value = oRespCookie.Value;
                                        bMatch = true;
                                        break; // 
                                    }
                                }
                                if (!bMatch)
                                    this.gCookies.Add(oRespCookie);
                            }
                        }
                    }
                #endregion

                    responseURI = gResponse.ResponseUri.AbsoluteUri;
                 

                StreamReader reader = new StreamReader(gResponse.GetResponseStream(), Encoding.ASCII);
                    responseString = reader.ReadToEnd();
                    reader.Close();
                    return responseString;
                }
                else
                {
                    return "Error";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            return responseString;
        }

        public string postFormData(Uri formActionUrl, string postData, string referer)
        {

            gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
            gRequest.UserAgent = UserAgent;
            gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
            //gRequest.Headers["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
            //gRequest.Headers["Cache-Control"] = "max-age=0";
            gRequest.Headers["Accept-Language"] = "en-us,en;q=0.5";
            gRequest.KeepAlive = true;
            gRequest.ContentType = @"application/x-www-form-urlencoded; charset=UTF-8";
            gRequest.Method = "POST";

            gRequest.KeepAlive = true;

            gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

            gRequest.CookieContainer = new CookieContainer();

            if (!string.IsNullOrEmpty(referer))
            {
                gRequest.Referer = referer;
            }

            ///Modified BySumit 18-11-2011
            ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);

            #region CookieManagement
            if (this.gCookies != null && this.gCookies.Count > 0)
            {
                setExpect100Continue();
                gRequest.CookieContainer.Add(gCookies);
            }

            //logic to postdata to the form
            try
            {
                setExpect100Continue();
                string postdata = string.Format(postData);
                byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                gRequest.ContentLength = postBuffer.Length;
                Stream postDataStream = gRequest.GetRequestStream();
                postDataStream.Write(postBuffer, 0, postBuffer.Length);
                postDataStream.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                // Logger.LogText("Internet Connectivity Exception : "+ ex.Message,null);
            }
            //post data logic ends

            //Get Response for this request url
            try
            {
                gResponse = (HttpWebResponse)gRequest.GetResponse();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                //Logger.LogText("Response from "+formActionUrl + ":" + ex.Message,null);
            }



            //check if the status code is http 200 or http ok

            if (gResponse.StatusCode == HttpStatusCode.OK)
            {
                //get all the cookies from the current request and add them to the response object cookies
                setExpect100Continue();
                gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);
                //check if response object has any cookies or not
                //Added by sandeep pathak
                //gCookiesContainer = gRequest.CookieContainer;  

                if (gResponse.Cookies.Count > 0)
                {
                    //check if this is the first request/response, if this is the response of first request gCookies
                    //will be null
                    if (this.gCookies == null)
                    {
                        gCookies = gResponse.Cookies;
                    }
                    else
                    {
                        foreach (Cookie oRespCookie in gResponse.Cookies)
                        {
                            bool bMatch = false;
                            foreach (Cookie oReqCookie in this.gCookies)
                            {
                                if (oReqCookie.Name == oRespCookie.Name)
                                {
                                    oReqCookie.Value = oRespCookie.Value;
                                    bMatch = true;
                                    break; // 
                                }
                            }
                            if (!bMatch)
                                this.gCookies.Add(oRespCookie);
                        }
                    }
                }
                #endregion

                string responseString = string.Empty;

                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                responseString = reader.ReadToEnd();
                reader.Close();

                //Console.Write("Response String:" + responseString);
                return responseString;
            }
            else
            {
                return "Error in posting data";
            }

        }
        public string postFormData(Uri formActionUrl, string postData)
        {
            // postData="charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=AVqEAf6F&locale=en_US&email=soni.sameer123%40rediffmail.com&pass=god@12345&persistent=1&default_persistent=1&charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=AVqEAf6F";

            gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
            // gRequest.UserAgent = "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2.16) Gecko/20110319 Firefox/3.6.16";
            //"Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0"
            // gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0";
            gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36";
            //  gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko";
            gRequest.CookieContainer = new CookieContainer();// gCookiesContainer;
            gRequest.Method = "POST";
            gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8, */*";
            gRequest.KeepAlive = true;
            gRequest.ContentType = @"application/x-www-form-urlencoded";
            //gRequest.Headers["Accept-Encoding"] = " gzip, deflate";
            //gRequest.Timeout = 2 * 30000;
            //gRequest.Referer = "https://www.facebook.com/events/upcoming";

            ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);

            #region CookieManagement
            if (this.gCookies != null && this.gCookies.Count > 0)
            {
                setExpect100Continue();
                gRequest.CookieContainer.Add(gCookies);
            }

            //logic to postdata to the form
            try
            {
                setExpect100Continue();
                string postdata = string.Format(postData);
                byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                gRequest.ContentLength = postBuffer.Length;
                Stream postDataStream = gRequest.GetRequestStream();
                postDataStream.Write(postBuffer, 0, postBuffer.Length);
                postDataStream.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);

            }

            try
            {
                gResponse = (HttpWebResponse)gRequest.GetResponse();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                //Logger.LogText("Response from "+formActionUrl + ":" + ex.Message,null);
            }



            //check if the status code is http 200 or http ok

            if (gResponse.StatusCode == HttpStatusCode.OK)
            {
                //get all the cookies from the current request and add them to the response object cookies
                setExpect100Continue();
                gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);

                if (gResponse.Cookies.Count > 0)
                {
                    //check if this is the first request/response, if this is the response of first request gCookies
                    //will be null
                    if (this.gCookies == null)
                    {
                        gCookies = gResponse.Cookies;
                    }
                    else
                    {
                        foreach (Cookie oRespCookie in gResponse.Cookies)
                        {
                            bool bMatch = false;
                            foreach (Cookie oReqCookie in this.gCookies)
                            {
                                if (oReqCookie.Name == oRespCookie.Name)
                                {
                                    oReqCookie.Value = oRespCookie.Value;
                                    bMatch = true;
                                    break; // 
                                }
                            }
                            if (!bMatch)
                                this.gCookies.Add(oRespCookie);
                        }
                    }
                }
                #endregion

                //Encoding responseEncoding = Encoding.GetEncoding(gResponse.CharacterSet);

                //  StreamReader reader = new StreamReader(gResponse.GetResponseStream() , Encoding.ASCII);
                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string TotalString = reader.ReadToEnd();
                string responseString = TotalString;
                //   string responseString = reader.ReadToEnd();
                reader.Close();
                //Console.Write("Response String:" + responseString);
                return responseString;
            }
            else
            {
                return "Error in posting data";
            }
        }

        public void ChangeProxy(string proxyAddress, int port, string proxyUsername, string proxyPassword)
        {
            try
            {
                if (!string.IsNullOrEmpty(proxyAddress))
                {
                    WebProxy myproxy = new WebProxy(proxyAddress, port);
                    myproxy.BypassProxyOnLocal = false;

                    if (!string.IsNullOrEmpty(proxyUsername) && !string.IsNullOrEmpty(proxyPassword))
                    {
                        myproxy.Credentials = new NetworkCredential(proxyUsername, proxyPassword);
                    }
                    gRequest.Proxy = myproxy;
                }
            }
            catch (Exception ex)
            {
               
            }

        }
        public void setExpect100Continue()
        {
            if (ServicePointManager.Expect100Continue == true)
            {
                ServicePointManager.Expect100Continue = false;
            }
        }
        public static string GetParamValue(string pgSrc, string paramName)
        {
            string valueparamName = string.Empty;
            try
            {
                if (pgSrc.Contains("name='" + paramName + "'"))
                {
                    string param = "name='" + paramName + "'";
                    int startparamName = pgSrc.IndexOf(param) + param.Length;
                    startparamName = pgSrc.IndexOf("value=", startparamName) + "value=".Length + 1;
                    int endparamName = pgSrc.IndexOf("'", startparamName);
                    valueparamName = pgSrc.Substring(startparamName, endparamName - startparamName);
                    return valueparamName;
                }
                else if (pgSrc.Contains("name=\"" + paramName + "\""))
                {
                    string param = "name=\"" + paramName + "\"";
                    int startparamName = pgSrc.IndexOf(param) + param.Length;
                    startparamName = pgSrc.IndexOf("value=", startparamName) + "value=".Length + 1;
                    int endcommentPostID = pgSrc.IndexOf("\"", startparamName);
                    valueparamName = pgSrc.Substring(startparamName, endcommentPostID - startparamName);
                    return valueparamName;
                }
                else if (pgSrc.Contains("name=\\\\\\\"" + paramName + "\\\\\\\""))
                {
                    string param = "name=\\\\\\\"" + paramName + "\\\\\\\"";
                    int startparamName = pgSrc.IndexOf(param) + param.Length;
                    startparamName = pgSrc.IndexOf("value=\\\\\\\"", startparamName) + "value=\\\\\\".Length + 1;
                    int endcommentPostID = pgSrc.IndexOf("\\\\\\\"", startparamName);
                    valueparamName = pgSrc.Substring(startparamName, endcommentPostID - startparamName);
                    return valueparamName;
                }
                else if (pgSrc.Contains("DTSGInitialData\",[]") && (paramName == "fb_dtsg"))
                {
                    string[] strSpit = Regex.Split(pgSrc, "DTSGInitialData\"");
                    valueparamName = Utils.getBetween(strSpit[1], "{\"token\":\"", "\"");
                    return valueparamName;
                }
                else if (paramName.Contains("user"))
                {
                    string value = string.Empty;
                    //  value = getBetween(pgSrc, "USER_ID", "ACCOUNT_ID").Replace("\"", string.Empty).Replace(",", string.Empty).Replace(":","");
                    value = getBetween(pgSrc, "CurrentUserInitialData", "}").Replace("id", string.Empty).Replace("\"", string.Empty).Replace("[]", string.Empty).Replace(",", string.Empty).Replace("{", string.Empty).Replace(":", string.Empty).Replace("is_employeefalse", "").Replace("is_grayfalse", "");
                    if (value.Contains("account"))
                    {
                        string[] arr = System.Text.RegularExpressions.Regex.Split(value, "account");
                        value = arr[0];
                    }
                    if (value.Contains("USER_ID"))
                    {
                        value = getBetween(pgSrc, "USER_ID", "ACCOUNT_ID").Replace("\"", string.Empty).Replace(",", string.Empty).Replace(":", "");
                    }
                    if (value.Contains("}"))
                    {
                        value = getBetween("$$$$$$" + value, "$$$$$$", "}").Replace("\"", string.Empty).Replace(",", string.Empty).Replace(":", "");
                    }

                    //  "}
                    return value;

                }
                return null;
            }
            catch (Exception ex)
            {
                // GlobusLogHelper.log.Error("Error : " + ex.StackTrace);
            }
            return valueparamName;
        }

        public string postFormDataSetCookie(Uri formActionUrl, string postData, string regCoockieval)
        {
            // postData="charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=AVqEAf6F&locale=en_US&email=soni.sameer123%40rediffmail.com&pass=god@12345&persistent=1&default_persistent=1&charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=AVqEAf6F";

            gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
            // gRequest.UserAgent = "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2.16) Gecko/20110319 Firefox/3.6.16";
            //"Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0"
            // gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0";
            gRequest.UserAgent = UserAgent;// "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36";
            gRequest.CookieContainer = new CookieContainer();// gCookiesContainer;
            gRequest.Method = "POST";
            gRequest.Accept = " text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8, */*";
            gRequest.KeepAlive = true;
            gRequest.ContentType = @"application/x-www-form-urlencoded";
            //gRequest.Timeout = 2 * 30000;
            // gRequest.Referer = "https://www.facebook.com/checkpoint/";

            ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);

            #region CookieManagement
            if (this.gCookies != null && this.gCookies.Count > 0)
            {
                setExpect100Continue();
                gRequest.CookieContainer.Add(gCookies);
            }

            Cookie ck = new Cookie();
            ck.Name = "_js_datr";
            ck.Value = regCoockieval;
            ck.Domain = "facebook.com";
            gRequest.CookieContainer.Add(ck);

            //logic to postdata to the form
            try
            {
                setExpect100Continue();
                string postdata = string.Format(postData);
                byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                gRequest.ContentLength = postBuffer.Length;
                Stream postDataStream = gRequest.GetRequestStream();
                postDataStream.Write(postBuffer, 0, postBuffer.Length);
                postDataStream.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                // Logger.LogText("Internet Connectivity Exception : "+ ex.Message,null);
            }
            //post data logic ends

            //Get Response for this request url
            try
            {
                gResponse = (HttpWebResponse)gRequest.GetResponse();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                //Logger.LogText("Response from "+formActionUrl + ":" + ex.Message,null);
            }



            //check if the status code is http 200 or http ok

            if (gResponse.StatusCode == HttpStatusCode.OK)
            {
                //get all the cookies from the current request and add them to the response object cookies
                setExpect100Continue();
                gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);

                if (gResponse.Cookies.Count > 0)
                {
                    //check if this is the first request/response, if this is the response of first request gCookies
                    //will be null
                    if (this.gCookies == null)
                    {
                        gCookies = gResponse.Cookies;
                    }
                    else
                    {
                        foreach (Cookie oRespCookie in gResponse.Cookies)
                        {
                            bool bMatch = false;
                            foreach (Cookie oReqCookie in this.gCookies)
                            {
                                if (oReqCookie.Name == oRespCookie.Name)
                                {
                                    oReqCookie.Value = oRespCookie.Value;
                                    bMatch = true;
                                    break; // 
                                }
                            }
                            if (!bMatch)
                                this.gCookies.Add(oRespCookie);
                        }
                    }
                }
                #endregion



                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string responseString = reader.ReadToEnd();
                reader.Close();
                //Console.Write("Response String:" + responseString);
                return responseString;
            }
            else
            {
                return "Error in posting data";
            }
        }

        public string getHtmlfromUrlForLicensing(Uri url)
        {
            string responseString = string.Empty;
            try
            {
                //setExpect100Continue();
                gRequest = (HttpWebRequest)WebRequest.Create(url);
                gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; rv:18.0) Gecko/20100101 Firefox/18.0";

                gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
                gRequest.Headers["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
                gRequest.Headers["Accept-Language"] = "en-us,en;q=0.5";

                gRequest.KeepAlive = true;


                gRequest.AllowAutoRedirect = true;

                gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                gRequest.CookieContainer = new CookieContainer(); //gCookiesContainer;

                gRequest.Method = "GET";

                gRequest.Headers.Add("Javascript-enabled", "true");

                #region CookieManagment

                if (this.gCookies != null && this.gCookies.Count > 0)
                {
                    setExpect100Continue();
                    gRequest.CookieContainer.Add(gCookies);

                }

                if (this.gCookies == null)
                {
                    this.gCookies = new CookieCollection();
                }



                //Get Response for this request url

                setExpect100Continue();
                gResponse = (HttpWebResponse)gRequest.GetResponse();

                //check if the status code is http 200 or http ok
                if (gResponse.StatusCode == HttpStatusCode.OK)
                {
                    //get all the cookies from the current request and add them to the response object cookies
                    setExpect100Continue();
                    gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);


                    //check if response object has any cookies or not
                    if (gResponse.Cookies.Count > 0)
                    {
                        //check if this is the first request/response, if this is the response of first request gCookies
                        //will be null
                        if (this.gCookies == null)
                        {
                            gCookies = gResponse.Cookies;
                        }
                        else
                        {
                            foreach (Cookie oRespCookie in gResponse.Cookies)
                            {
                                bool bMatch = false;
                                foreach (Cookie oReqCookie in this.gCookies)
                                {
                                    if (oReqCookie.Name == oRespCookie.Name)
                                    {
                                        oReqCookie.Value = oRespCookie.Value;
                                        bMatch = true;
                                        break; // 
                                    }
                                }
                                if (!bMatch)
                                    this.gCookies.Add(oRespCookie);
                            }
                        }
                    }
                #endregion

                    responseURI = gResponse.ResponseUri.AbsoluteUri;


                    StreamReader reader = new StreamReader(gResponse.GetResponseStream(), Encoding.ASCII);
                    responseString = reader.ReadToEnd();
                    reader.Close();
                    return responseString;
                }
                else
                {
                    return "Error";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            return responseString;
        }

        public static string GetBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start).Replace(":", "").Replace("\"", "").Replace("}", "");
            }
            else
            {
                return "";
            }
        }
        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }








        public static int GenerateRandom(int minValue, int maxValue)
        {
            int randomNo = 0;
            try
            {
                if (minValue <= maxValue)
                {
                    Random random = new Random();
                    randomNo = random.Next(minValue, maxValue);
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception ex)
            {
                //GlobusLogHelper.log.Error("Error : " + ex.StackTrace);
            }
            return randomNo;
        }





        public string getHtmlfromUrl(Uri url)
        {
            string responseString = string.Empty;
            try
            {
                //setExpect100Continue();
                gRequest = (HttpWebRequest)WebRequest.Create(url);
                gRequest.UserAgent = UserAgent;

                gRequest.Host = "www.facebook.com";
                gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
                gRequest.Headers["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
                gRequest.Headers["Accept-Language"] = "en-US,en;q=0.8";
                gRequest.KeepAlive = true;

                gRequest.AllowAutoRedirect = true;

                gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                gRequest.CookieContainer = new CookieContainer(); //gCookiesContainer;

                gRequest.Method = "GET";

                gRequest.Headers.Add("Javascript-enabled", "true");

                

                ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);



                #region CookieManagment

                if (this.gCookies != null && this.gCookies.Count > 0)
                {
                    setExpect100Continue();
                    gRequest.CookieContainer.Add(gCookies);

                }

                if (this.gCookies == null)
                {
                    this.gCookies = new CookieCollection();
                }

                //Get Response for this request url
                setExpect100Continue();

                try
                {
                    gResponse = (HttpWebResponse)gRequest.GetResponse();
                }
                catch { };

                //check if the status code is http 200 or http ok
                if (gResponse.StatusCode == HttpStatusCode.OK)
                {
                    //get all the cookies from the current request and add them to the response object cookies
                    setExpect100Continue();
                    gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);


                    //check if response object has any cookies or not
                    if (gResponse.Cookies.Count > 0)
                    {
                        //check if this is the first request/response, if this is the response of first request gCookies
                        //will be null
                        if (this.gCookies == null)
                        {
                            gCookies = gResponse.Cookies;
                        }
                        else
                        {
                            foreach (Cookie oRespCookie in gResponse.Cookies)
                            {
                                bool bMatch = false;
                                foreach (Cookie oReqCookie in this.gCookies)
                                {
                                    if (oReqCookie.Name == oRespCookie.Name)
                                    {
                                        oReqCookie.Value = oRespCookie.Value;
                                        bMatch = true;
                                        break; // 
                                    }
                                }
                                if (!bMatch)
                                    this.gCookies.Add(oRespCookie);
                            }
                        }
                    }
                #endregion

                    responseURI = gResponse.ResponseUri.AbsoluteUri;

                    StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                    responseString = reader.ReadToEnd();
                    reader.Close();

                    return responseString;
                }
                else
                {
                    return "Error";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            return responseString;
        }

    

        public string proxyAddress = string.Empty;
        public int port = 80;
        public string proxyUsername = string.Empty;
        public string proxyPassword = string.Empty;

        public string getHtmlfromUrlProxy(Uri url, string proxyAddress, int port, string proxyUsername, string proxyPassword)
        {
            string responseString = string.Empty;
            try
            {
                setExpect100Continue();
                gRequest = (HttpWebRequest)WebRequest.Create(url);
                //gRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2.24) Gecko/20111103 Firefox/3.6.24";

                gRequest.UserAgent = UserAgent;// "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36";
                gRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
                gRequest.Headers["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
                //gRequest.Headers["Cache-Control"] = "max-age=0";
                gRequest.Headers["Accept-Language"] = "en-us,en;q=0.5";
                //gRequest.Connection = "keep-alive";

                gRequest.KeepAlive = true;

                gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

        
                ChangeProxy(proxyAddress, port, proxyUsername, proxyPassword);
         
               

                gRequest.CookieContainer = new CookieContainer(); //gCookiesContainer;

                gRequest.Method = "GET";
                //gRequest.Accept = "image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*";
                gRequest.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                #region CookieManagment

                if (this.gCookies != null && this.gCookies.Count > 0)
                {
                    setExpect100Continue();
                    gRequest.CookieContainer.Add(gCookies);
                }
                //Get Response for this request url

                setExpect100Continue();
                gResponse = (HttpWebResponse)gRequest.GetResponse();

                //check if the status code is http 200 or http ok
                if (gResponse.StatusCode == HttpStatusCode.OK)
                {
                    //get all the cookies from the current request and add them to the response object cookies
                    setExpect100Continue();
                    gResponse.Cookies = gRequest.CookieContainer.GetCookies(gRequest.RequestUri);


                    //check if response object has any cookies or not
                    if (gResponse.Cookies.Count > 0)
                    {
                        //check if this is the first request/response, if this is the response of first request gCookies
                        //will be null
                        if (this.gCookies == null)
                        {
                            gCookies = gResponse.Cookies;
                        }
                        else
                        {
                            foreach (Cookie oRespCookie in gResponse.Cookies)
                            {
                                bool bMatch = false;
                                foreach (Cookie oReqCookie in this.gCookies)
                                {
                                    if (oReqCookie.Name == oRespCookie.Name)
                                    {
                                        oReqCookie.Value = oRespCookie.Value;
                                        bMatch = true;
                                        break; // 
                                    }
                                }
                                if (!bMatch)
                                    this.gCookies.Add(oRespCookie);
                            }
                        }
                    }
                #endregion

                    responseURI = gResponse.ResponseUri.AbsoluteUri;

                    StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                    responseString = reader.ReadToEnd();
                    reader.Close();
                    return responseString;
                }
                else
                {
                    return "Error";
                }
            }
            catch(Exception ex)
            {
            }
            return responseString;
        }


    }
}
