using System;
using System.IO;
using System.Net;
using System.Text;

namespace Socioboard.Instagram.Custom
{
    public class TagSearch
    {
        public static string InstagramTagSearch(string tagName, string accessToken)
        {
            tagName = Uri.EscapeUriString(tagName);
            tagName = tagName.Replace("%E2%80%AA%E2%80%8E", string.Empty);
            string instagrmHastagSearchURL = "https://api.instagram.com/v1/tags/" + tagName.TrimStart() + "/media/recent?access_token=" + accessToken;
            var Instagramsearchreq = (HttpWebRequest)WebRequest.Create(instagrmHastagSearchURL);
            Instagramsearchreq.Method = "GET";
            Instagramsearchreq.Credentials = CredentialCache.DefaultCredentials;
            Instagramsearchreq.AllowWriteStreamBuffering = true;
            Instagramsearchreq.ServicePoint.Expect100Continue = false;
            Instagramsearchreq.PreAuthenticate = false;
            string outputface = string.Empty;
            try
            {
                using (var response = Instagramsearchreq.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        outputface = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e) { }
            return outputface;
        }
    }
}
