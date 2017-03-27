using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using HtmlAgilityPack;
using System.Text;
using System.Compat.Web;

namespace Socioboard.Helper
{
    public  class PluginHelper
    {

        //public static Domain.Socioboard.Domain.PluginInfo CreateThumbnail(string Url)
        //{

        //    #region UrlIformation
        //    string description = "";
        //    string imgurl = "";
        //    Domain.Socioboard.Domain.PluginInfo _plugininfo = new Domain.Socioboard.Domain.PluginInfo();

        //        if (!Url.Contains("socioboard"))
        //        {
        //            string pagesource = GetHtml(Url);
        //            if (pagesource.Contains("<img") && !string.IsNullOrEmpty(pagesource))
        //            {

        //                string[] atrr = Regex.Split(pagesource, "<img");
        //                foreach (var item in atrr)
        //                {
        //                    if (item.Contains("src") && !item.Contains("<!DOCTYPE html>"))
        //                    {
        //                        string url = "";
        //                        try
        //                        {
        //                            url = getBetween(item, "src=\"", "alt=").Replace("\"", string.Empty);
        //                        }
        //                        catch (Exception ex)
        //                        {

        //                            url = getBetween(item, "src=\"", "\"").Replace("\"", string.Empty);
        //                        }
        //                        imgurl = url + ":" + imgurl;
        //                    }
        //                }
        //            }
        //            if (pagesource.Contains("<meta"))
        //            {
        //                string[] metatag = Regex.Split(pagesource, "<meta");
        //                foreach (var item in metatag)
        //                {
        //                    if (item.Contains("description"))
        //                    {
        //                        description = getBetween(item, "content=", ">").Replace("\"", "").Replace("/", "");

        //                    }
        //                }
        //            }
        //        }
        //        else
        //        {

        //            string pagesource = GetHtml(Url);
        //            if (pagesource.Contains("<img") && !string.IsNullOrEmpty(pagesource))
        //            {

        //                string[] atrr = Regex.Split(pagesource, "<img");
        //                foreach (var item in atrr)
        //                {
        //                    if (item.Contains("src") && !item.Contains("<!DOCTYPE"))
        //                    {
        //                        string url = "";
        //                        if (item.Contains("/Themes"))
        //                        {
        //                            url = getBetween(item, "src=", "alt=").Replace("\"", string.Empty);
        //                            url = "https://www.socioboard.com" + url;

        //                        }
        //                        else
        //                        {
        //                            url = getBetween(item, "src=", "class=").Replace("\"", string.Empty);
        //                        }

        //                        imgurl = url + ":" + imgurl;
        //                    }
        //                }
        //            }
        //            if (pagesource.Contains("<meta"))
        //            {
        //                string[] metatag = Regex.Split(pagesource, "<meta");
        //                foreach (var item in metatag)
        //                {
        //                    if (item.Contains("description"))
        //                    {
        //                        description = getBetween(item, "content=", ">").Replace("\"", "").Replace("/", "");

        //                    }
        //                }
        //            }

        //        }

        //        _plugininfo.imageurl = imgurl;
        //        _plugininfo.url = Url;
        //        _plugininfo.description = description;

        //        return _plugininfo;

        //    #endregion

        //}

        //public static Chilkat.Http http = new Chilkat.Http();
        //public static string GetHtml(string URL)
        //{
        //    string response = string.Empty;

        //    //ChangeProxy();

        //    if (!http.UnlockComponent("THEBACHttp_b3C9o9QvZQ06"))
        //    {
        //    }

        //    ///Save Cookies...
        //    http.CookieDir = "memory";
        //    //http.CookieDir = Application.StartupPath + "\\cookies";
        //    http.SendCookies = true;
        //    http.SaveCookies = true;

        //    http.SetRequestHeader("Accept-Encoding", "gzip,deflate");
        //    http.SetRequestHeader("Accept-Charset", "ISO-8859-1,utf-8;q=0.7,*;q=0.7");
        //    http.SetRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.107 Safari/537.36");
        //    http.SetRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");

        //    //http.SetRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        //    //http.SetRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        //    http.SetRequestHeader("Connection", "keep-alive");

        //    http.AllowGzip = true;

        //    response = http.QuickGetStr(URL);
        //    if (string.IsNullOrEmpty(response))
        //    {
        //        response = http.QuickGetStr(URL);

        //    }
        //    if (string.IsNullOrEmpty(response))
        //    {
        //        response = http.QuickGetStr(URL);

        //    }

        //    return response;

        //}

        //public static string getBetween(string strSource, string strStart, string strEnd)
        //{
        //    int Start, End;
        //    if (strSource.Contains(strStart) && strSource.Contains(strEnd))
        //    {
        //        Start = strSource.IndexOf(strStart, 0) + strStart.Length;
        //        End = strSource.IndexOf(strEnd, Start);
        //        return strSource.Substring(Start, End - Start);
        //    }
        //    else
        //    {
        //        return "";
        //    }
        //}

        public static Domain.Socioboard.Helpers.ThumbnailDetails CreateThumbnail(string url)
        {
            string title = string.Empty;
            string description = string.Empty;
            string image = string.Empty;
            string _url = string.Empty;

            HtmlAttribute haDescription;
            HtmlAttribute haTitle;
            HtmlAttribute haImage;
            HtmlAttribute haUrl;
            string location = HttpUtility.UrlDecode(url);
            Domain.Socioboard.Helpers.ThumbnailDetails _ThumbnailDetails = new Domain.Socioboard.Helpers.ThumbnailDetails();
            string html = string.Empty;
            string _html = string.Empty;
            while (!string.IsNullOrWhiteSpace(location))
            {
                _url = location;
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(_url);
                request.AllowAutoRedirect = false;
                request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36";

                try
                {
                    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                    {
                        location = response.GetResponseHeader("Location");
                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            Stream receiveStream = response.GetResponseStream();
                            StreamReader readStream = null;

                            if (response.CharacterSet == null)
                            {
                                readStream = new StreamReader(receiveStream);
                            }
                            else
                            {
                                readStream = new StreamReader(receiveStream, Encoding.GetEncoding(response.CharacterSet));
                            }

                            html = readStream.ReadToEnd();

                            readStream.Close();
                        }
                        else if (response.StatusCode == HttpStatusCode.Found)
                        {
                            var uri = new Uri(_url);
                            location = uri.GetLeftPart(System.UriPartial.Authority);
                        }
                    }
                }
                catch (Exception ex)
                {
                    html = "";
                }
            }
            HtmlDocument hdoc = new HtmlDocument();
            if (!string.IsNullOrEmpty(html))
            {
                hdoc.LoadHtml(html);

                HtmlNode nodeDescrption = hdoc.DocumentNode.SelectSingleNode("//meta[@name='description']");
                if (nodeDescrption == null)
                {
                    nodeDescrption = hdoc.DocumentNode.SelectSingleNode("//meta[@property='og:description']");
                    if (nodeDescrption == null)
                    {
                        nodeDescrption = hdoc.DocumentNode.SelectSingleNode("//p");
                        if (nodeDescrption != null)
                        {
                            try
                            {
                                description = nodeDescrption.InnerText;
                                nodeDescrption = null;
                            }
                            catch (Exception ex)
                            {
                                nodeDescrption = null;
                            }
                        }
                    }

                }
                if (nodeDescrption != null)
                {
                    haDescription = nodeDescrption.Attributes["content"];
                    description = haDescription.Value;
                }
                else { 
                
                }

                HtmlNode nodeTitle = hdoc.DocumentNode.SelectSingleNode("//meta[@name='title']");
                if (nodeTitle == null)
                {
                    nodeTitle = hdoc.DocumentNode.SelectSingleNode("//meta[@property='og:title']");
                    if (nodeTitle == null)
                    {
                        nodeTitle = hdoc.DocumentNode.SelectSingleNode("//title");
                    }
                }
                if (nodeTitle != null)
                {
                    try
                    {
                        haTitle = nodeTitle.Attributes["content"];
                        title = haTitle.Value;
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            title = nodeTitle.InnerText;
                        }
                        catch (Exception exx)
                        {
                            title = "";
                        }
                    }
                }

                HtmlNode nodeImage = hdoc.DocumentNode.SelectSingleNode("//meta[@name='image']");
                if (nodeImage == null)
                {
                    nodeImage = hdoc.DocumentNode.SelectSingleNode("//meta[@property='og:image']");
                    if (nodeImage == null)
                    {
                        try
                        {
                            nodeImage = hdoc.DocumentNode.SelectSingleNode("//img");
                            if (nodeImage != null)
                            {
                                haImage = nodeImage.Attributes["src"];
                                image = haImage.Value;
                                nodeImage = null;
                            }
                        }
                        catch {
                            nodeImage = null;
                        }
                    }
                }
                if (nodeImage != null)
                {
                    haImage = nodeImage.Attributes["content"];
                    image = haImage.Value;
                }

                HtmlNode nodeUrl = hdoc.DocumentNode.SelectSingleNode("//meta[@name='url']");
                if (nodeUrl == null)
                {
                    nodeUrl = hdoc.DocumentNode.SelectSingleNode("//meta[@property='og:url']");
                }
                if (nodeUrl != null)
                {
                    haUrl = nodeUrl.Attributes["content"];
                    _url = haUrl.Value;
                }
                _ThumbnailDetails.description = description;
                _ThumbnailDetails.image = image;
                _ThumbnailDetails.title = title;
                _ThumbnailDetails.url = _url;
            }
            else
            {
                _ThumbnailDetails.description = "";
                _ThumbnailDetails.image = "";
                _ThumbnailDetails.title = "";
                _ThumbnailDetails.url = _url;
            }

            return _ThumbnailDetails;
        }


        public static string GetShortenUrl(string Url)
        {
            try
            {
                string url = "https://api-ssl.bitly.com/v3/shorten?access_token=71ec4ddc8eeb062bc8bf8583cae1fe7af81af4c7" + "&longUrl=" + Url + "&domain=bit.ly&format=json";
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

        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

    }
}