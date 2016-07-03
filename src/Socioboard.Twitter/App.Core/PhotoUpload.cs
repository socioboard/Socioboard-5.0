using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.IO;
using Socioboard.Twitter.Authentication;


namespace Socioboard.Twitter.App.Core
{

    public class PhotoUpload
    {
       // ILog logger = LogManager.GetLogger(typeof(PhotoUpload));
        OAuth.OAuthRequest oauth = new OAuth.OAuthRequest();


        string twitterUrl1 = Globals.StatusUpdateUrl;
        string twitterUrl2 = Globals.PostStatusUpdateWithMediaUrl;
        SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();


        public string GetTwitterUpdateUrl(string imageFile, string message)
        {

            return (imageFile == null) ?
               twitterUrl1 : twitterUrl2;
        }

        public static string GetMimeType(String filename)
        {

            var extension = System.IO.Path.GetExtension(filename).ToLower();
            var regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(extension);

            string result =
                ((regKey != null) && (regKey.GetValue("Content Type") != null))
                ? regKey.GetValue("Content Type").ToString()
                : "image/unknown";
            return result;
        }

        public bool Tweet(string imageFile, string message, oAuthTwitter oAuth)
        {
            bool bupdated = false;
            try
            {
                //HttpContext.Current.Response.Write("<script>alert(\""+imageFile+"\")</script>");
                oauth.ConsumerKey = oAuth.ConsumerKey;
                oauth.ConsumerSecret = oAuth.ConsumerKeySecret;
                oauth.TokenSecret = oAuth.AccessTokenSecret;
                oauth.Token = oAuth.AccessToken;
                // oauth["consumer_key"] = oAuth.ConsumerKey;

                //oauth["consumer_secret"] = oAuth.ConsumerKeySecret;
                //oauth["token"] = oAuth.AccessToken;
                //oauth["token_secret"] = oAuth.AccessTokenSecret;

                var url = GetTwitterUpdateUrl(imageFile, message);
                if (url == twitterUrl1)
                {
                    strdic.Add("status", message);
                }
                oauth.RequestUrl = url;
                oauth.Method = "POST";
                var authzHeader = oauth.GetAuthorizationHeader();
                var request = (HttpWebRequest)WebRequest.Create(url);

                request.Method = "POST";
                request.PreAuthenticate = true;
                request.AllowWriteStreamBuffering = true;
                request.Headers.Add("Authorization", authzHeader);

                request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                if (imageFile != null)
                {
                    string boundary = "======" +
                                  Guid.NewGuid().ToString().Substring(18).Replace("-", "") +
                                  "======";

                    var separator = "--" + boundary;
                    var footer = "\r\n" + separator + "--\r\n";

                    string shortFileName = Path.GetFileName(imageFile);
                    string fileContentType = GetMimeType(shortFileName);
                    string fileHeader = string.Format("Content-Disposition: file; " +
                                                      "name=\"media\"; filename=\"{0}\"",
                                                      shortFileName);
                    var encoding = System.Text.Encoding.GetEncoding("iso-8859-1");

                    var contents = new System.Text.StringBuilder();
                    contents.AppendLine(separator);
                    contents.AppendLine("Content-Disposition: form-data; name=\"status\"");
                    contents.AppendLine();
                    contents.AppendLine(message);
                    contents.AppendLine(separator);
                    contents.AppendLine(fileHeader);
                    contents.AppendLine(string.Format("Content-Type: {0}", fileContentType));
                    contents.AppendLine();

                    request.ServicePoint.Expect100Continue = false;
                    request.ContentType = "multipart/form-data; boundary=" + boundary;
                    // actually send the request
                    using (var s = request.GetRequestStream())
                    {
                        byte[] bytes = encoding.GetBytes(contents.ToString());
                        s.Write(bytes, 0, bytes.Length);
                        bytes = File.ReadAllBytes(imageFile);
                        s.Write(bytes, 0, bytes.Length);
                        bytes = encoding.GetBytes(footer);
                        s.Write(bytes, 0, bytes.Length);
                    }
                }


                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    //   HttpContext.Current.Response.Write("<script>alert(\"" + response.StatusCode + "\")</script>");

                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        bupdated = true;
                    }
                }



            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
               // logger.Error(ex.Message);
                //using (StreamWriter _testData = new StreamWriter(HttpContext.Current.Server.MapPath("~/log.txt"), true))
                //{
                //    _testData.WriteLine("Error on PhotoUpload : " + ex.Message); // Write the file.    

                //}

            }


            return bupdated;
        }



        public bool NewTweet(string imageFile, string message, oAuthTwitter oAuth, ref string myfunctioncalled)
        {
            bool bupdated = false;

            try
            {
                //HttpContext.Current.Response.Write("<script>alert(\""+imageFile+"\")</script>");

                #region For Loacl Testing
                //oauth["consumer_key"] = "udiFfPxtCcwXWl05wTgx6w";//oAuth.ConsumerKey;

                //oauth["consumer_secret"] = "jutnq6N32Rb7cgbDSgfsrUVgRQKMbUB34yuvAfCqTI";//oAuth.ConsumerKeySecret;
                //oauth["token"] = "1904022338-Ao9chvPouIU8ejE1HMG4yJsP3hOgEoXJoNRYUF7";//oAuth.AccessToken;
                //oauth["token_secret"] = "Wj93a8csVFfaFS1MnHjbmbPD3V6DJbhEIf4lgSAefORZ5";//oAuth.AccessTokenSecret; 
                #endregion

                #region For Post data Reference
                /* Url Link : https://dev.twitter.com/docs/api/1.1/post/statuses/update_with_media

                // Post data:
                 * 
                    POST /1.1/statuses/update_with_media.json HTTP/1.1

                    Host: api.twitter.com

                    User-Agent: Go http package

                    Content-Length: 15532

                    Authorization: OAuth oauth_consumer_key="...", oauth_nonce="...", oauth_signature="...", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1347058301", oauth_token="...", oauth_version="1.0"

                    Content-Type: multipart/form-data;boundary=cce6735153bf14e47e999e68bb183e70a1fa7fc89722fc1efdf03a917340

                    Accept-Encoding: gzip

     

                    --cce6735153bf14e47e999e68bb183e70a1fa7fc89722fc1efdf03a917340

                    Content-Disposition: form-data; name="status"

     

                    Hello 2012-09-07 15:51:41.375247 -0700 PDT!

                    --cce6735153bf14e47e999e68bb183e70a1fa7fc89722fc1efdf03a917340

                    Content-Type: application/octet-stream

                    Content-Disposition: form-data; name="media[]"; filename="media.png"

     

                    ...

                    --cce6735153bf14e47e999e68bb183e70a1fa7fc89722fc1efdf03a917340--

                */
                #endregion

                #region For Online
                oauth.ConsumerKey = oAuth.ConsumerKey;
                oauth.ConsumerSecret = oAuth.ConsumerKeySecret;
                oauth.TokenSecret = oAuth.AccessTokenSecret;
                oauth.Token = oAuth.AccessToken;
                //oauth["consumer_key"] = oAuth.ConsumerKey;

                //oauth["consumer_secret"] = oAuth.ConsumerKeySecret;
                //oauth["token"] = oAuth.AccessToken;
                //oauth["token_secret"] = oAuth.AccessTokenSecret;
                #endregion

                var url = GetTwitterUpdateUrl(imageFile, message);
                if (url == twitterUrl1)
                {
                    strdic.Add("status", message);
                }
                //url = "https://upload.twitter.com/1/statuses/update_with_media.json";
                oauth.RequestUrl = url;
                oauth.Method = "POST";
                var authzHeader = oauth.GetAuthorizationHeader();
                var request = (HttpWebRequest)WebRequest.Create(url);

                request.Method = "POST";
                request.PreAuthenticate = true;
                request.AllowWriteStreamBuffering = true;

                request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0";

                request.Headers.Add("Authorization", authzHeader);

                request.AutomaticDecompression = DecompressionMethods.GZip;

                if (imageFile != null)
                {
                    string boundary =
                                  Guid.NewGuid().ToString().Replace("-", "");

                    var separator = "--" + boundary;
                    var footer = "\r\n" + separator + "--\r\n";

                    request.ServicePoint.Expect100Continue = false;
                    request.ContentType = "multipart/form-data; boundary=" + boundary;

                    string shortFileName = Path.GetFileName(imageFile);

                    string fileHeader = string.Format("Content-Disposition: file; " +
                                                     "name=\"media[]\"; filename=\"{0}\"",
                                                     shortFileName);
                    var encoding = System.Text.Encoding.GetEncoding("iso-8859-1");

                    using (Stream rs = request.GetRequestStream())
                    {
                        string formdataTemplate = "Content-Disposition: form-data; name=\"{0}\"\r\n\r\n{1}";

                        string formitem = string.Empty;

                        byte[] firstboundarybytes = System.Text.Encoding.ASCII.GetBytes("--" + boundary + "\r\n");
                        byte[] boundarybytes = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "\r\n");

                        rs.Write(firstboundarybytes, 0, firstboundarybytes.Length);//rs.Write(boundarybytes, 0, boundarybytes.Length);
                        formitem = string.Format(formdataTemplate, "status", message);
                        byte[] formitembytes1 = System.Text.Encoding.UTF8.GetBytes(formitem);
                        rs.Write(formitembytes1, 0, formitembytes1.Length);

                        rs.Write(boundarybytes, 0, boundarybytes.Length);

                        string headerTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\n\r\n";
                        string header = string.Format(headerTemplate, "media[]", shortFileName, "application/octet-stream");
                        byte[] headerbytes = System.Text.Encoding.UTF8.GetBytes(header);
                        rs.Write(headerbytes, 0, headerbytes.Length);


                        using (WebClient wc = new WebClient())
                        {
                            byte[] buffer = wc.DownloadData(imageFile);
                            int bytesRead = 0;
                            Stream stream = new MemoryStream(buffer);
                            while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) != 0)
                            {
                                rs.Write(buffer, 0, bytesRead);
                            }
                        }

                        //using (FileStream fileStream = new FileStream(imageFile, FileMode.Open))
                        //{
                        //    //FileStream fileStream = new FileStream(localImagePath, FileMode.Open, FileAccess.Read);
                        //    byte[] buffer = new byte[4096];
                        //    int bytesRead = 0;
                        //    while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0)
                        //    {
                        //        rs.Write(buffer, 0, bytesRead);
                        //    }
                        //    //fileStream.Close(); 
                        //}

                        



                        byte[] trailer = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "--");//System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "--\r\n");
                        rs.Write(trailer, 0, trailer.Length);
                    }



                }


                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    //   HttpContext.Current.Response.Write("<script>alert(\"" + response.StatusCode + "\")</script>");

                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        bupdated = true;
                    }

                    myfunctioncalled = myfunctioncalled + "myfunctioncalled: " + response.ToString();
                }



            }
            catch (Exception ex)
            {
                myfunctioncalled = myfunctioncalled + "myfunctioncalled: " + ex.Message + ">>> " + ex.StackTrace;
                Console.WriteLine(ex.Message);
               // logger.Error(ex.Message);
               

            }


            return bupdated;
        }



    }
}
