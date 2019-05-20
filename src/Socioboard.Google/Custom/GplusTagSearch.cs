using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Socioboard.Google.Custom
{
    public class GplusTagSearch
    {
        public static string GooglePlusgetUserRecentActivitiesByHashtag(string Hashtag, string GoogleApiKey = null)
        {
            string ret = string.Empty;
            string response = string.Empty;
            Hashtag = Uri.EscapeUriString(Hashtag);
            Hashtag = Hashtag.Replace("%E2%80%AA%E2%80%8E", string.Empty);
            try
            { 
                string RequestUrl = " https://www.googleapis.com/plus/v1/activities?orderBy=recent&query=%23" + Hashtag + "&alt=json&key=" + GoogleApiKey;

                var gpluspagerequest = (HttpWebRequest)WebRequest.Create(RequestUrl);
                gpluspagerequest.Method = "GET";
                try
                {
                    using (var gplusresponse = gpluspagerequest.GetResponse())
                    {
                        using (var stream = new StreamReader(gplusresponse.GetResponseStream(), Encoding.GetEncoding(1252)))
                        {
                            response = stream.ReadToEnd();
                        }
                    }
                }
                catch (Exception e) { }

            }
            catch (Exception ex)
            {
            }
            return response;


            //return ret;
        }
    }
}
