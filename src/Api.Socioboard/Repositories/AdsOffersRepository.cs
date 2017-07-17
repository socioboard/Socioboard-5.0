using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using Domain.Socioboard.Models.Mongo;
using Socioboard.Twitter.App.Core;
using Socioboard.Google.Custom;
using Api.Socioboard.Helper;
using System.Net;

namespace Api.Socioboard.Repositories
{
    public class AdsOffersRepository
    {

        //public static string GetHomePage(string url)
        //{
        //    Uri uri = new Uri(url);
        //    string urls = uri.Host.ToString();
        //    return urls;
        //    //string url = "http://google.com";
        //    HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
        //    request.AllowAutoRedirect = false;

        //    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
        //    {
        //        string redirect = response.Headers["Location"];
        //        if (redirect != null)
        //            Console.WriteLine("Redirected to " + redirect);
        //      return redirect;
        //    }

           
        //}
        public static string findUrlForAds(string url)
        {
            try
            {
                //Match match = Regex.Match(url, @"^(?:\w+://)?([^/?]*)");
                ////string domain = match.Groups[1].Value;
                //string homepageurl = match.Value;

                //find host
                //Uri uri = new Uri(url);
                //string homepageurl = uri.Host.ToString();

                string keywords = "https://www.socioboard.com";
                Domain.Socioboard.Helpers.UrlRSSfeedsNews obj_reqest = new Domain.Socioboard.Helpers.UrlRSSfeedsNews();
                //Globalrequest obj_reqest = new Globalrequest();
                string sourceurl = url;
                string responce_sourceurl = obj_reqest.getHtmlfromUrl(new Uri(sourceurl));

                if (keywords != null && responce_sourceurl.Contains(keywords))
                {
                    return "Ads found on website";
                }
                else
                {
                    return "Ads not found on website";
                }
            }
            catch(Exception ex)
            {
                return "Something went wrong please try after sometime";
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
        
    }
}
