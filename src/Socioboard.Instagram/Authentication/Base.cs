using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Collections.Specialized;
using Newtonsoft.Json;
using System.IO;

namespace Socioboard.Instagram.Authentication
{
    public class Base {
        protected static ICache _cache;
        protected static readonly object threadlock = new object();

        public static T DeserializeObject<T>(string json) {
            return JsonConvert.DeserializeObject<T>(json);
        }

        public static string SerializeObject(object value) {
            return JsonConvert.SerializeObject(value);
        }

        public string RequestPostToUrl(string url, NameValueCollection postData, WebProxy proxy) {
            if(string.IsNullOrEmpty(url))
                return null;

            if(url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try {
                using(var client = new WebClient()) {
                    //proxy
                    if(proxy != null)
                        client.Proxy = proxy;

                    //response
                    byte[] response = client.UploadValues(url, postData);
                    //out
                    var enc = new UTF8Encoding();
                    string outp = enc.GetString(response);
                    return outp;
                }
            }
            catch(WebException ex) {
                string err = ex.Message;
            }
            catch(Exception ex) {
                string err = ex.Message;
            }

            return null;
        }

        public string RequestDeleteToUrl(string url, WebProxy proxy) {
            if(string.IsNullOrEmpty(url))
                return null;

            if(url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try {
                WebRequest request = WebRequest.Create(url);

                //proxy
                if(proxy != null)
                    request.Proxy = proxy;

                //type
                request.Method = "DELETE";

                //response
                String str = "";
                WebResponse resp = request.GetResponse();
                Stream ReceiveStream = resp.GetResponseStream();
                Encoding encode = Encoding.GetEncoding("utf-8");
                var readStream = new StreamReader(ReceiveStream, encode);
                var read = new Char[256];
                int count = readStream.Read(read, 0, 256);
                while(count > 0) {
                    str = str + new String(read, 0, count);
                    count = readStream.Read(read, 0, 256);
                }
                readStream.Close();
                ReceiveStream.Close();
                //out
                return str;
            }
            catch(WebException ex) {
                string err = ex.Message;
            }
            catch(Exception ex) {
                string err = ex.Message;
            }

            return null;
        }

        public string RequestGetToUrl(string url, WebProxy proxy) {
            if(string.IsNullOrEmpty(url))
                return null;

            if(url.IndexOf("://") <= 0)
                url = "http://" + url.Replace(",", ".");

            try {
                using(var client = new WebClient()) {
                    //proxy
                 
              
                    if(proxy != null)
                        client.Proxy = proxy;
                    
                    //response
                    byte[] response = client.DownloadData(url);
                    //out
                    var enc = new UTF8Encoding();
                    string outp = enc.GetString(response);
                    return outp;
                }
            }
            catch(WebException ex) {
                string err = ex.Message;
            }
            catch(Exception ex) {
                string err = ex.Message;
            }

            return null;
        }
    }
}

