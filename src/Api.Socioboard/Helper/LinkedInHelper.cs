using Domain.Socioboard.Models;
using Imgur.API.Authentication.Impl;
using Imgur.API.Endpoints.Impl;
using Imgur.API.Models;
using Newtonsoft.Json.Linq;
using Socioboard.LinkedIn.App.Core;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.CompanyMethods;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static Socioboard.LinkedIn.App.Core.LinkedinCompanyPage;

namespace Api.Socioboard.Helper
{
    public static class LinkedInHelper
    {
        public static string PostLinkedInMessage(string ImageUrl, long userid, string comment, string ProfileId, string imagepath, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            try
            {

                if (!ImageUrl.Contains("https://") && !ImageUrl.Contains("http://") && !string.IsNullOrEmpty(ImageUrl))
                {
                    var client = new ImgurClient("api key", "api secret");
                    var endpoint = new ImageEndpoint(client);
                    IImage image;
                    using (var fs = new FileStream(imagepath, FileMode.Open))
                    {
                        image = endpoint.UploadImageStreamAsync(fs).GetAwaiter().GetResult();
                    }

                    var img = image.Link;
                    string json = "";
                    Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedInAccount(ProfileId, _redisCache, dbr);
                    oAuthLinkedIn _oauth = new oAuthLinkedIn();
                    _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                    _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                    _oauth.Token = _LinkedInAccount.OAuthToken;
                    string PostUrl = "https://api.linkedin.com/v1/people/~/shares?format=json";
                    if (string.IsNullOrEmpty(ImageUrl))
                    {
                        json = _oauth.LinkedProfilePostWebRequest("POST", PostUrl, comment);
                    }
                    else
                    {
                        json = _oauth.LinkedProfilePostWebRequestWithImage("POST", PostUrl, comment, img);
                    }

                    if (!string.IsNullOrEmpty(json))
                    {

                        ScheduledMessage scheduledMessage = new ScheduledMessage();
                        scheduledMessage.createTime = DateTime.UtcNow;
                        scheduledMessage.picUrl = _LinkedInAccount.ProfileImageUrl;
                        scheduledMessage.profileId = ProfileId;
                        scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedIn;
                        scheduledMessage.scheduleTime = DateTime.UtcNow;
                        scheduledMessage.shareMessage = comment;
                        scheduledMessage.userId = userid;
                        scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                        scheduledMessage.url = ImageUrl;
                        dbr.Add<ScheduledMessage>(scheduledMessage);

                        return "posted";
                    }
                    else
                    {
                        json = "Message not posted";
                        return json;
                    }
                }
                else
                {
                    string json = "";
                    Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedInAccount(ProfileId, _redisCache, dbr);
                    oAuthLinkedIn _oauth = new oAuthLinkedIn();
                    _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                    _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                    _oauth.Token = _LinkedInAccount.OAuthToken;
                    string PostUrl = "https://api.linkedin.com/v1/people/~/shares?format=json";
                    if (string.IsNullOrEmpty(ImageUrl))
                    {
                        json = _oauth.LinkedProfilePostWebRequest("POST", PostUrl, comment);
                    }
                    else
                    {
                        var client = new ImgurClient("5f1ad42ec5988b7", "f3294c8632ef8de6bfcbc46b37a23d18479159c5");
                        var endpoint = new ImageEndpoint(client);
                        IImage image;
                        using (var fs = new FileStream(imagepath, FileMode.Open))
                        {
                            image = endpoint.UploadImageStreamAsync(fs).GetAwaiter().GetResult();
                        }

                        var img = image.Link;
                        json = _oauth.LinkedProfilePostWebRequestWithImage("POST", PostUrl, comment, img);
                    }

                    if (!string.IsNullOrEmpty(json))
                    {

                        ScheduledMessage scheduledMessage = new ScheduledMessage();
                        scheduledMessage.createTime = DateTime.UtcNow;
                        scheduledMessage.picUrl = _LinkedInAccount.ProfileImageUrl;
                        scheduledMessage.profileId = ProfileId;
                        scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedIn;
                        scheduledMessage.scheduleTime = DateTime.UtcNow;
                        scheduledMessage.shareMessage = comment;
                        scheduledMessage.userId = userid;
                        scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                        scheduledMessage.url = ImageUrl;
                        dbr.Add<ScheduledMessage>(scheduledMessage);

                        return "posted";
                    }
                    else
                    {
                        json = "Message not posted";
                        return json;
                    }
                }

            }


            catch (Exception ex)
            {

                return "Message not posted";
            }


        }

        public static string PostLinkedInCompanyPagePost(string upload,string ImageUrl, long userid, string comment, string LinkedinPageId, Helper.Cache _redisCache,Model.DatabaseRepository dbr,Helper.AppSettings _appSettings)
        {
           try
            {
                if (!ImageUrl.Contains("https://") && !ImageUrl.Contains("http://") && !string.IsNullOrEmpty(ImageUrl))
                {
                    var client = new ImgurClient("api key", "api secret");
                    var endpoint = new ImageEndpoint(client);
                    IImage image;
                    using (var fs = new FileStream(ImageUrl, FileMode.Open))
                    {
                        image = endpoint.UploadImageStreamAsync(fs).GetAwaiter().GetResult();
                    }
                    var img = image.Link;
                    string json = "";
                    Domain.Socioboard.Models.LinkedinCompanyPage objlicompanypage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(LinkedinPageId, _redisCache, dbr);
                    oAuthLinkedIn Linkedin_oauth = new oAuthLinkedIn();
                    Linkedin_oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                    Linkedin_oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                    Linkedin_oauth.Verifier = objlicompanypage.OAuthVerifier;
                    Linkedin_oauth.TokenSecret = objlicompanypage.OAuthSecret;
                    Linkedin_oauth.Token = objlicompanypage.OAuthToken;
                    Linkedin_oauth.Id = objlicompanypage.LinkedinPageId;
                    Linkedin_oauth.FirstName = objlicompanypage.LinkedinPageName;
                    Company company = new Company();
                    if (string.IsNullOrEmpty(ImageUrl))
                    {
                        json = company.SetPostOnPage(Linkedin_oauth, objlicompanypage.LinkedinPageId, comment);
                    }
                    else
                    {
                        json = company.SetPostOnPageWithImage(Linkedin_oauth, objlicompanypage.LinkedinPageId, img, comment);
                    }
                    if (!string.IsNullOrEmpty(json))
                    {

                        ScheduledMessage scheduledMessage = new ScheduledMessage();
                        scheduledMessage.createTime = DateTime.UtcNow;
                        scheduledMessage.picUrl = objlicompanypage.LogoUrl;
                        scheduledMessage.profileId = objlicompanypage.LinkedinPageId;
                        scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage;
                        scheduledMessage.scheduleTime = DateTime.UtcNow;
                        scheduledMessage.shareMessage = comment;
                        scheduledMessage.userId = userid;
                        scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                        scheduledMessage.url = upload;
                        dbr.Add<ScheduledMessage>(scheduledMessage);

                        return "posted";
                    }
                    else
                    {
                        json = "Message not posted";
                        return json;
                    }
                }
                else
                {
                    string json = "";
                    Domain.Socioboard.Models.LinkedinCompanyPage objlicompanypage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(LinkedinPageId, _redisCache, dbr);
                    oAuthLinkedIn Linkedin_oauth = new oAuthLinkedIn();
                    Linkedin_oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                    Linkedin_oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                    Linkedin_oauth.Verifier = objlicompanypage.OAuthVerifier;
                    Linkedin_oauth.TokenSecret = objlicompanypage.OAuthSecret;
                    Linkedin_oauth.Token = objlicompanypage.OAuthToken;
                    Linkedin_oauth.Id = objlicompanypage.LinkedinPageId;
                    Linkedin_oauth.FirstName = objlicompanypage.LinkedinPageName;
                    Company company = new Company();
                    if (string.IsNullOrEmpty(ImageUrl))
                    {
                        json = company.SetPostOnPage(Linkedin_oauth, objlicompanypage.LinkedinPageId, comment);
                    }
                    else
                    {
                        var client = new ImgurClient("api key", "api secret");
                        var endpoint = new ImageEndpoint(client);
                        IImage image;
                        using (var fs = new FileStream(ImageUrl, FileMode.Open))
                        {
                            image = endpoint.UploadImageStreamAsync(fs).GetAwaiter().GetResult();
                        }
                        var img = image.Link;
                        json = company.SetPostOnPageWithImage(Linkedin_oauth, objlicompanypage.LinkedinPageId, img, comment);
                    }
                    if (!string.IsNullOrEmpty(json))
                    {

                        ScheduledMessage scheduledMessage = new ScheduledMessage();
                        scheduledMessage.createTime = DateTime.UtcNow;
                        scheduledMessage.picUrl = objlicompanypage.LogoUrl;
                        scheduledMessage.profileId = objlicompanypage.LinkedinPageId;
                        scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage;
                        scheduledMessage.scheduleTime = DateTime.UtcNow;
                        scheduledMessage.shareMessage = comment;
                        scheduledMessage.userId = userid;
                        scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                        scheduledMessage.url = upload;
                        dbr.Add<ScheduledMessage>(scheduledMessage);

                        return "posted";
                    }
                    else
                    {
                        json = "Message not posted";
                        return json;
                    }
                }


                //}
                //catch(Exception ex)
                //{
                //    return "Message not posted";
                //}

            }
            catch (Exception ex)
            {
                return "Message not posted";
            }
               
        }

        public static string GetAccessToken(string Code, Helper.AppSettings _appSettings)
        {
            try
            {
                oAuthLinkedIn _oauth = new oAuthLinkedIn();
                _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
                _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
                string access_token_Url = "https://www.linkedin.com/uas/oauth2/accessToken";
                string access_token_postData = "grant_type=authorization_code&code=" + Code + "&redirect_uri=" + _appSettings.LinkedinCallBackURL + "&client_id=" + _appSettings.LinkedinApiKey + "&client_secret=" + _appSettings.LinkedinSecretKey;
                string token = _oauth.APIWebRequestAccessToken("POST", access_token_Url, access_token_postData);
                var oathtoken = JObject.Parse(token);
                _oauth.Token = oathtoken["access_token"].ToString().TrimStart('"').TrimEnd('"');
                return _oauth.Token.ToString();
            }
            catch
            {
                return null;
            }
        }

        public static CompanyProfile GetCompanyPageData(oAuthLinkedIn _oauth,string ProfileId)
        {
            CompanyProfile objCompanyProfile = new CompanyProfile();
            objCompanyProfile = GetCompanyPageProfile(_oauth,ProfileId);
            return objCompanyProfile;
        }


        public static LinkedInProfile.UserProfile getLinkedInProfile(oAuthLinkedIn _oauth)
        {
            LinkedInProfile objProfile = new LinkedInProfile();
            LinkedInProfile.UserProfile objUserProfile = new LinkedInProfile.UserProfile();
            objUserProfile = objProfile.GetUserProfile(_oauth);
            return objUserProfile;
        }
        public static List<Domain.Socioboard.Models.AddlinkedinCompanyPage> GetLinkedinCompanyPage(string Code, Helper.AppSettings _appSettings)
        {
            List<Domain.Socioboard.Models.AddlinkedinCompanyPage> lstAddLinkedinPage = new List<AddlinkedinCompanyPage>();
            oAuthLinkedIn _oauth = new oAuthLinkedIn();
            _oauth.ConsumerKey = _appSettings.LinkedinApiKey;
            _oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
            string access_token_Url = "https://www.linkedin.com/uas/oauth2/accessToken";
            string access_token_postData = "grant_type=authorization_code&code=" + Code + "&redirect_uri=" + _appSettings.LinkedinCallBackURL + "&client_id=" + _appSettings.LinkedinApiKey + "&client_secret=" + _appSettings.LinkedinSecretKey;
            string token = _oauth.APIWebRequestAccessToken("POST", access_token_Url, access_token_postData);
            var oathtoken = JObject.Parse(token);
            _oauth.Token = oathtoken["access_token"].ToString().TrimStart('"').TrimEnd('"');
            string response = _oauth.APIWebRequest("GET",Global.GetLinkedInCompanyPageUrl, null);
            try
            {
                var companypage = JObject.Parse(response);
                foreach (var item in companypage["values"])
                {

                   AddlinkedinCompanyPage objAddLinkedinPage = new AddlinkedinCompanyPage();
                    objAddLinkedinPage.PageId = item["id"].ToString();
                    objAddLinkedinPage.PageName = item["name"].ToString();
                    objAddLinkedinPage._consumerKey=_oauth.ConsumerKey;
                    objAddLinkedinPage._consumerSecret = _oauth.ConsumerSecret;
                    objAddLinkedinPage._token = _oauth.Token;
                    lstAddLinkedinPage.Add(objAddLinkedinPage);
                }


                return lstAddLinkedinPage;
            }
            catch (Exception)
            {
                return null;
            }
        }


        public static List<LinkedinPageUpdate.CompanyPagePosts> GetLinkedinCompanyPageFeeds(oAuthLinkedIn _oauth,string PageId)
        {
            LinkedinPageUpdate objlinkedinpageupdate = new LinkedinPageUpdate();
            List<LinkedinPageUpdate.CompanyPagePosts> objcompanypagepost = new List<LinkedinPageUpdate.CompanyPagePosts>();
            objcompanypagepost = objlinkedinpageupdate.GetPagePosts(_oauth, PageId);
            return objcompanypagepost;
        }


        public static List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment> GetLinkdeinPagePostComment(oAuthLinkedIn _oauth, string PageId, string updatekey)
        {
            List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment> objLiPageComment = new List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment>();

            try
            {
               LinkedinPageComment objLiPagePostCmnt = new LinkedinPageComment();

                List<LinkedinPageComment.CompanyPageComment> objLiPostcmnt = new List<LinkedinPageComment.CompanyPageComment>();

                objLiPostcmnt = objLiPagePostCmnt.GetPagePostscomment(_oauth, updatekey, PageId);

                foreach (var item in objLiPostcmnt)
                {
                    Domain.Socioboard.Models.Mongo.LinkdeinPageComment lipagepostcmnt = new Domain.Socioboard.Models.Mongo.LinkdeinPageComment();
                    lipagepostcmnt.Comment = item.Comment;
                    lipagepostcmnt.FirstName = item.FirstName;
                    lipagepostcmnt.LastName = item.LastName;
                    lipagepostcmnt.CommentTime = Convert.ToDateTime(item.CommentTime);
                    if (item.PictureUrl != null)
                    {
                        lipagepostcmnt.PictureUrl = item.PictureUrl;
                    }
                    else
                    {
                        lipagepostcmnt.PictureUrl = "";
                    }
                    objLiPageComment.Add(lipagepostcmnt);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            return objLiPageComment;
        }

        public static string PostCommentOnLinkedinCompanyPage(long userid, string comment, string Updatekey, string LinkedinPageId, Helper.Cache _redisCache, Model.DatabaseRepository dbr, Helper.AppSettings _appSettings)
        {
            oAuthLinkedIn Linkedin_oauth = new oAuthLinkedIn();
            Domain.Socioboard.Models.LinkedinCompanyPage objlicompanypage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(LinkedinPageId, _redisCache, dbr);
            Linkedin_oauth.ConsumerKey = _appSettings.LinkedinApiKey;
            Linkedin_oauth.ConsumerSecret = _appSettings.LinkedinSecretKey;
            Linkedin_oauth.Verifier = objlicompanypage.OAuthVerifier;
            Linkedin_oauth.TokenSecret = objlicompanypage.OAuthSecret;
            Linkedin_oauth.Token = objlicompanypage.OAuthToken;
            Linkedin_oauth.Id = objlicompanypage.LinkedinPageId;
            Linkedin_oauth.FirstName = objlicompanypage.LinkedinPageName;
            Company company = new Company();
            string res = company.SetCommentOnPagePost(Linkedin_oauth, objlicompanypage.LinkedinPageId,Updatekey,comment);
            return res;
        }
    }
}
