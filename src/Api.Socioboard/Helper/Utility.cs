using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace Api.Socioboard.Helper
{
    static public class Utility
    {
       static public string MD5Hash(string text)
        {
            MD5 md5 = new MD5CryptoServiceProvider();

            //compute hash from the bytes of text
            md5.ComputeHash(ASCIIEncoding.ASCII.GetBytes(text));

            //get hash result after compute it
            byte[] result = md5.Hash;

            StringBuilder strBuilder = new StringBuilder();
            for (int i = 0; i < result.Length; i++)
            {
                //change it into 2 hexadecimal digits
                //for each byte
                strBuilder.Append(result[i].ToString("x2"));
            }

            return strBuilder.ToString();
        }

       public static DateTime ParseTwitterTime(string date)
       {
           const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
           return DateTime.ParseExact(date, format, CultureInfo.InvariantCulture);
       }

       public static string GenerateRandomUniqueString()
       {
           Guid g = Guid.NewGuid();
           string GuidString = Convert.ToBase64String(g.ToByteArray());
           GuidString = GuidString.Replace("=", "");
           GuidString = GuidString.Replace("+", "");
           return GuidString;
       }


        public static string CompareDateWithclient(string clientdate, string scheduletime)
        {
            try
            {
                var dt = DateTime.Parse(scheduletime);
                var clientdt = DateTime.Parse(clientdate);
                //  DateTime client = Convert.ToDateTime(clientdate);
                DateTime client = Convert.ToDateTime(TimeZoneInfo.ConvertTimeToUtc(clientdt, TimeZoneInfo.Local));
                DateTime server = DateTime.UtcNow;
                DateTime schedule = Convert.ToDateTime(TimeZoneInfo.ConvertTimeToUtc(dt, TimeZoneInfo.Local));
                {
                    var kind = schedule.Kind; // will equal DateTimeKind.Unspecified
                    if (DateTime.Compare(client, server) > 0)
                    {
                        double minutes = (server - client).TotalMinutes;
                        schedule = schedule.AddMinutes(minutes);
                    }
                    else if (DateTime.Compare(client, server) == 0)
                    {
                    }
                    else if (DateTime.Compare(client, server) < 0)
                    {
                        double minutes = (server - client).TotalMinutes;
                        schedule = schedule.AddMinutes(minutes);
                    }
                }
                return TimeZoneInfo.ConvertTimeFromUtc(schedule, TimeZoneInfo.Local).ToString();
                // return schedule.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
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

        public static string GetConvertedUrls(ref string message, Domain.Socioboard.Enum.UrlShortener shortnerType)
        {
            List<string> listLinks = new List<string>();
            Regex urlRx = new Regex(@"((https?|ftp|file)\://|www.)[A-Za-z0-9\.\-]+(/[A-Za-z0-9\?\&\=;\+!'\(\)\*\-\._~%]*)*", RegexOptions.IgnoreCase);
            MatchCollection matches = urlRx.Matches(message);
            foreach (Match match in matches)
            {
                listLinks.Add(match.Value);
            }
            foreach (string tempLink in listLinks)
            {
                string shorturl = GetShortenUrlBit(tempLink, shortnerType);
                message = message.Replace(tempLink, shorturl);
            }
            return message;
        }

        public static string GetShortenUrlBit(string Url, Domain.Socioboard.Enum.UrlShortener shortnerType)
        {
            string url = "";
            if (!Url.Contains("http"))
            {
                Url = "https://" + Url;
            }
            try
            {
                if (shortnerType == Domain.Socioboard.Enum.UrlShortener.bitlyUri)
                {
                    url = "https://api-ssl.bitly.com/v3/shorten?access_token=71ec4ddc8eeb062bc8bf8583cae1fe7af81af4c7" + "&longUrl=" + Url + "&domain=bit.ly&format=json";
                }
                else
                {
                    url = "https://api-ssl.bitly.com/v3/shorten?access_token=71ec4ddc8eeb062bc8bf8583cae1fe7af81af4c7" + "&longUrl=" + Url + "&domain=j.mp&format=json";
                }
                HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/x-www-form-urlencoded";
                HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                StreamReader responseStreamReader = new StreamReader(responseStream, System.Text.Encoding.Default);
                string pageContent = responseStreamReader.ReadToEnd();
                responseStreamReader.Close();
                responseStream.Close();
                httResponse.Close();
                JObject JData = JObject.Parse(pageContent);
                if (JData["status_txt"].ToString() == "OK")
                    return JData["data"]["url"].ToString();
                else
                    return Url;
            }
            catch (Exception ex)
            {
                return Url;
            }
        }

    }


    public static class DateExtension
    {
        public static long ToUnixTimestamp(this DateTime target)
        {
            var date = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);
            var unixTimestamp = System.Convert.ToInt64((target - date).TotalSeconds);

            return unixTimestamp;
        }
        public static double ConvertToUnixTimestamp(DateTime date)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            TimeSpan diff = date.ToUniversalTime() - origin;
            return Math.Floor(diff.TotalSeconds);
        }
        public static DateTime ToDateTime(this DateTime target, long timestamp)
        {
            var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);

            return dateTime.AddSeconds(timestamp);
        }
    }
}