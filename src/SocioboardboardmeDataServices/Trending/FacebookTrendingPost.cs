using BaseLib;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using FaceDominator;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Google.Custom;
using Socioboard.Instagram.Custom;
using Socioboard.Twitter.App.Core;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Trending
{
    public class FacebookTrendingPost
    {


        public void LoginUsingGlobusHttp()
        {
            List<string> lstfbaccounts = new List<string>();
            //lstfbaccounts.Add("soumyapanda@globussoft.in:SOpa_3983");
            //lstfbaccounts.Add("sharanappahosamani@globussoft.in:sharan123");
            //lstfbaccounts.Add("thomasbarry301@gmail.com:889709asH@");
            // lstfbaccounts.Add("avinash.verma@globussoft.in:donkopkrna");
            //lstfbaccounts.Add("viveknigam@globussoft.in:intelcorei5");
            lstfbaccounts.Add("sachinglobus@rediffmail.com:KIra@(292");
            //lstfbaccounts.Add("abinashjenaglobussoft@gmail.com:Boards@12345");
            //lstfbaccounts.Add("nicholasblake018@gmail.com:revej2fefruP:52.62.94.35:8083:Pazk*&^%:WEcd@3454");
            foreach (var item in lstfbaccounts)
            {
                try
                {
                    //new Thread(delegate ()
                    //        {
                    facebookloginDetails(item);
                    //        }).Start();
                    //Thread.Sleep(TimeSpan.FromMinutes(1));
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    Console.WriteLine(ex.Message);
                }
            }
        }

        private void facebookloginDetails(string item)
        {
            try
            {

                var fbuser = Regex.Split(item, ":");
                FacebookUser facebookUser = new FaceDominator.FacebookUser();
                try
                {
                    facebookUser.username = fbuser[0];
                }
                catch (Exception)
                {

                }
                try
                {
                    facebookUser.password = fbuser[1];
                }
                catch (Exception)
                {
                }
                try
                {
                    facebookUser.proxyip = fbuser[2];
                }
                catch (Exception)
                {
                }
                try
                {
                    facebookUser.proxypassword = fbuser[5];
                }
                catch (Exception)
                {
                }
                try
                {
                    facebookUser.proxyport = fbuser[3];
                }
                catch (Exception)
                {
                }
                try
                {
                    facebookUser.proxyusername = fbuser[4];
                }
                catch (Exception)
                {
                }

                facebooktrending(ref facebookUser);
            }
            catch (Exception ex)
            {
                Console.WriteLine("issue in account" + ex.StackTrace);
                Console.WriteLine("issue in account" + ex.Message);
            }
        }

        private void facebooktrending(ref FacebookUser facebookUser)
        {
            try
            {


                GlobusHttpHelper HttpHelper = new GlobusHttpHelper();

                #region Post variable

                string fbpage_id = string.Empty;
                string fb_dtsg = string.Empty;
                string __user = string.Empty;
                string xhpc_composerid = string.Empty;
                string xhpc_targetid = string.Empty;
                string xhpc_composerid12 = string.Empty;
                string ResponseLogin = string.Empty;

                #endregion

                int intProxyPort = 80;

                if (!string.IsNullOrEmpty(facebookUser.proxyport) && Utils.IdCheck.IsMatch(facebookUser.proxyport))
                {
                    intProxyPort = int.Parse(facebookUser.proxyport);
                }


                string pageSource = string.Empty;
                try
                {
                    pageSource = HttpHelper.getHtmlfromUrlProxy(new Uri("https://www.facebook.com/"), facebookUser.proxyip.Trim(), intProxyPort, facebookUser.proxyusername.Trim(), facebookUser.proxypassword.Trim());
                }
                catch (Exception ex)
                {

                }

                if (pageSource == null || string.IsNullOrEmpty(pageSource))
                {
                    pageSource = HttpHelper.getHtmlfromUrlProxy(new Uri(FBGlobals.Instance.fbLoginPhpUrl), facebookUser.proxyip, intProxyPort, facebookUser.proxyusername, facebookUser.proxypassword);
                }
                if (pageSource == null)
                {
                    return;
                }
                string loginStatus = "";
                string status = string.Empty;
                ResponseLogin = pageSource;
                if (!CheckLogin(ResponseLogin, facebookUser.username, facebookUser.password, facebookUser.proxyip, facebookUser.proxyport, facebookUser.proxyusername, facebookUser.proxypassword, ref loginStatus))
                {

                    string valueLSD = GlobusHttpHelper.GetParamValue(pageSource, "lsd");
                    valueLSD = Utils.getBetween(pageSource, "\"LSD\",[],{\"token\":\"", "\"");
                    string lgnRndval = Utils.getBetween(pageSource, "\"lgnrnd\" value=\"", "\"");
                    string Revision = string.Empty;
                    string dest_Token = string.Empty;
                    string impId = string.Empty;
                    string RegCookieval = string.Empty;
                    Revision = Utils.getBetween(pageSource, "revision\":", ",");
                    dest_Token = Utils.getBetween(pageSource, "index.php\",\"", "\"");
                    impId = Utils.getBetween(pageSource, "imp_id\":\"", "\"");
                    RegCookieval = Utils.getBetween(pageSource, "reg_instance\" value=\"", "\"");

                    string AjaxPostData = "__a=1&__dyn=7xe3uUcp8fo8UhyWzEjye-K1swgE98nwRzo6C7UW2O3Gaxe&__req=1&__rev=" + Revision + "&__user=0&lsd=" + valueLSD + "&ph=V3&q=%5B%7B%22user%22%3A%220%22%2C%22page_id%22%3A%22nb0pw0%22%2C%22posts%22%3A%5B%5B%22script_path_change%22%2C%7B%22source_path%22%3Anull%2C%22source_token%22%3Anull%2C%22dest_path%22%3A%22%2Findex.php%22%2C%22dest_token%22%3A%22" + dest_Token + "%22%2C%22impression_id%22%3A%22" + impId + "%22%2C%22cause%22%3A%22load%22%2C%22referrer%22%3A%22%22%7D%2C" + Utils.GenerateTimeStamp() + "%2C0%5D%2C%5B%22scuba_sample%22%2C%7B%22int%22%3A%7B%22clientWidth%22%3A1349%2C%22clientHeight%22%3A667%7D%2C%22normal%22%3A%7B%22view%22%3A%22normal%22%7D%2C%22_ds%22%3A%22www_tinyview_port%22%2C%22_options%22%3A%7B%22addBrowserFields%22%3Atrue%7D%7D%2C" + Utils.GenerateTimeStamp() + "%2C0%5D%2C%5B%22time_spent_bit_array%22%2C%7B%22tos_id%22%3A%22nb0pw0%22%2C%22start_time%22%3A1436246266%2C%22tos_array%22%3A%5B1%2C0%5D%2C%22tos_len%22%3A9%2C%22tos_seq%22%3A0%2C%22tos_cum%22%3A1%7D%2C" + Utils.GenerateTimeStamp() + "%2C0%5D%2C%5B%22ods%3Ams.time_spent.qa.www%22%2C%7B%22time_spent.bits.js_initialized%22%3A%5B1%5D%7D%2C" + Utils.GenerateTimeStamp() + "%2C0%5D%5D%2C%22trigger%22%3A%22ods%3Ams.time_spent.qa.www%22%7D%5D&ts=" + Utils.GenerateTimeStamp();
                    string ajaxResp = HttpHelper.postFormDataSetCookie(new Uri("https://www.facebook.com/ajax/bz"), AjaxPostData, RegCookieval);


                    try
                    {
                        ResponseLogin = HttpHelper.postFormData(new Uri(FBGlobals.Instance.AccountVerificationLoginPhpAttempt), "charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=" + valueLSD + "&locale=en_US&email=" + facebookUser.username.Split('@')[0].Replace("+", "%2B") + "%40" + facebookUser.username.Split('@')[1] + "&pass=" + Uri.EscapeDataString(facebookUser.password) + "&persistent=1&default_persistent=1&charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84&lsd=" + valueLSD + "");           //"https://www.facebook.com/login.php?login_attempt=1"
                    }
                    catch (Exception ex)
                    {

                    }
                }
                else
                {
                }

                if (CheckLogin(ResponseLogin, facebookUser.username, facebookUser.password, facebookUser.proxyip, facebookUser.proxyport, facebookUser.proxyusername, facebookUser.proxypassword, ref loginStatus))
                {
                    Console.WriteLine("account login successfully");
                    status = "Success";
                    List<string> lsttrend = ScrapTrendingNews(ref HttpHelper, ref facebookUser);
                    Console.WriteLine("process started" + lsttrend.Count);
                    foreach (var item in lsttrend)
                    {
                        string[] trds = Regex.Split(item, "<:>");
                        try
                        {
                            string tempboard = string.Empty;
                            if (trds[0].ToLower().Contains(" "))
                            {
                                tempboard = trds[0].ToLower().Replace(" ", "_");
                            }
                            else if (trds[0].ToLower().Contains("'\'"))
                            {
                                tempboard = trds[0].ToLower().Replace("'\'", "_");
                            }
                            else if (trds[0].ToLower().Contains("/"))
                            {
                                tempboard = trds[0].ToLower().Replace("/", "_");
                            }
                            else
                            {
                                tempboard = trds[0].ToLower();
                            }
                            //Trendingkeyword _Trendingkeyword = new Trendingkeyword();
                            //_Trendingkeyword.Id = ObjectId.GenerateNewId();
                            //_Trendingkeyword.strId = ObjectId.GenerateNewId().ToString();
                            //_Trendingkeyword.keyword = trds[0];
                            //_Trendingkeyword.trendingurl = trds[1];
                            //_Trendingkeyword.TrendingType = Domain.Socioboard.Enum.TrendingType.facebook;
                            //_Trendingkeyword.trendingdate = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                            //MongoRepository mongorepo = new MongoRepository("Trendingkeyword");
                            //var ret = mongorepo.Find<Trendingkeyword>(t => t.keyword == trds[0] && t.TrendingType == Domain.Socioboard.Enum.TrendingType.facebook);
                            //var task = Task.Run(async () =>
                            //{
                            //    return await ret;
                            //});
                            //int count = task.Result.Count;
                            //if (count < 1)
                            //{
                            //    mongorepo.Add<Trendingkeyword>(_Trendingkeyword);
                            //    AddFacebookrendingHashTagFeeds(_Trendingkeyword.trendingurl, _Trendingkeyword.strId, ref HttpHelper, ref facebookUser);
                            //}
                            //else
                            //{
                            //    AddFacebookrendingHashTagFeeds(_Trendingkeyword.trendingurl, _Trendingkeyword.strId, ref HttpHelper, ref facebookUser);
                            //}

                            DatabaseRepository dbr = new DatabaseRepository();
                            List<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
                            try
                            {
                                boards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(trds[0].ToLower()) && t.isActive == Domain.Socioboard.Enum.boardStatus.active).ToList();
                                string Bid=string.Empty;
                                if (boards == null || boards.Count() == 0)
                                {
                                    //Bid = boards.First().boardId;
                                    Domain.Socioboard.Models.MongoBoards board = new Domain.Socioboard.Models.MongoBoards();
                                    board.TempboardName = tempboard.ToLower();
                                    board.isActive = Domain.Socioboard.Enum.boardStatus.active;
                                    board.boardName = trds[0].ToLower();
                                    board.trendingtype = Domain.Socioboard.Enum.TrendingType.facebook;
                                    board.createDate = DateTime.UtcNow;
                                    board.boardId = Guid.NewGuid().ToString();
                                    board.facebookHashTag = AddFacebookHashTag(trds[0], trds[1], board.boardId, ref HttpHelper, ref facebookUser);
                                    board.twitterHashTag = AddTwitterHashTag(trds[0], board.boardId);
                                    board.instagramHashTag = AddInstagramHashTag(trds[0], board.boardId);
                                    board.gplusHashTag = AddGplusHashTag(trds[0], board.boardId);
                                    dbr.Add<Domain.Socioboard.Models.MongoBoards>(board);
                                    string boardcreation = getHtmlfromUrl("https://api.socioboard.com/api/BoardMe/AddTOSiteMap?boardName=" + board.boardName);
                                    if (boardcreation.Contains("true"))
                                    {
                                        Console.WriteLine("created new sitemap for twitter trending keyword" + boardcreation);
                                    }

                                }
                                else
                                {
                                    Bid = boards.First().boardId;
                                    Domain.Socioboard.Models.MongoBoards board = dbr.Single<Domain.Socioboard.Models.MongoBoards>(t => t.boardId == Bid);
                                    //board.TempboardName = tempboard;
                                    board.isActive = Domain.Socioboard.Enum.boardStatus.active;
                                    board.createDate = DateTime.UtcNow;
                                    //board.boardId = board.boardId;
                                    //board.facebookHashTag = AddFacebookHashTag(trds[0], trds[1], board.boardId, ref HttpHelper, ref facebookUser);
                                    //board.twitterHashTag = AddTwitterHashTag(trds[0], board.boardId);
                                    //board.instagramHashTag = AddInstagramHashTag(trds[0], board.boardId);
                                    //board.gplusHashTag = AddGplusHashTag(trds[0], board.boardId);
                                    dbr.Update<Domain.Socioboard.Models.MongoBoards>(board);
                                    string boardcreation = getHtmlfromUrl("https://api.socioboard.com/api/BoardMe/AddTOSiteMap?boardName=" + board.boardName);
                                    if (boardcreation.Contains("true"))
                                    {
                                        Console.WriteLine("created new sitemap for Facebook trending keyword" + boardcreation);
                                    }
                                }
                            }
                            catch (Exception e)
                            {
                            }
                         


                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    Console.WriteLine("process compleated");
                    //facebookUser.isloggedin = true;

                }
                else
                {
                    facebookUser.isloggedin = false;
                    status = "Failed";

                    if (loginStatus == "account has been disabled")
                    {

                    }

                    if (loginStatus == "Please complete a security check")
                    {
                        //GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_SecurityCheckAccounts);
                    }


                    if (loginStatus == "Your account is temporarily locked")
                    {
                        //GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_TemporarilyLockedAccount);

                    }
                    if (loginStatus == "have been blocked")
                    {
                        //GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_havebeenblocked);

                    }
                    if (loginStatus == "For security reasons your account is temporarily locked")
                    {
                        // GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_SecurityCheckAccountsforsecurityreason);
                    }

                    if (loginStatus == "Account Not Confirmed")
                    {
                        //GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_AccountNotConfirmed);
                    }
                    if (loginStatus == "Temporarily Blocked for 30 Days")
                    {
                        // GlobusFileHelper.AppendStringToTextfileNewLine(Username + ":" + Password + ":" + proxyAddress + ":" + proxyPort + ":" + proxyUsername + ":" + proxyPassword, Globals.path_30daysBlockedAccount);
                    }
                }
            }
            catch (Exception ex)
            {
                string status = "Failed";


            }
        }

        public bool CheckLogin(string response, string username, string password, string proxyAddress, string proxyPort, string proxyUsername, string proxyPassword, ref string loginStatus)
        {

            try
            {
                if (!string.IsNullOrEmpty(response))
                {
                    if (response.ToLower().Contains("unusual login activity"))
                    {
                        loginStatus = "unusual login activity";
                        Console.WriteLine("Unusual Login Activity: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("incorrect username"))
                    {
                        loginStatus = "incorrect username";
                        Console.WriteLine("Incorrect username: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("Choose a verification method".ToLower()))
                    {
                        loginStatus = "Choose a verification method";
                        Console.WriteLine("Choose a verification method: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("not logged in".ToLower()) && response.ToLower().Contains("It looks like you're not logged in"))
                    {
                        loginStatus = "not logged in";
                        Console.WriteLine("not logged in: " + username);
                        return false;
                    }
                    if (response.Contains("Please log in to continue".ToLower()))
                    {
                        loginStatus = "Please log in to continue";
                        Console.WriteLine("Please log in to continue: " + username);
                        return false;
                    }
                    if (response.Contains("re-enter your password"))
                    {
                        loginStatus = "re-enter your password";
                        Console.WriteLine("Wrong password for: " + username);
                        return false;
                    }
                    if (response.Contains("Incorrect Email"))
                    {
                        loginStatus = "Incorrect Email";
                        Console.WriteLine("Incorrect email: " + username);

                        try
                        {
                            ///Write Incorrect Emails in text file
                            //GlobusFileHelper.AppendStringToTextfileNewLine(username + ":" + password, incorrectEmailFilePath);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                        return false;
                    }
                    if (response.Contains("have been blocked"))
                    {
                        loginStatus = "have been blocked";
                        Console.WriteLine("you have been blocked: " + username);
                        return false;
                    }
                    if (response.Contains("account has been disabled"))
                    {
                        loginStatus = "account has been disabled";
                        Console.WriteLine("your account has been disabled: " + username);
                        return false;
                    }
                    if (response.Contains("Please complete a security check"))
                    {
                        loginStatus = "Please complete a security check";
                        Console.WriteLine("Please complete a security check: " + username);
                        return false;
                    }
                    if (response.Contains("Please complete a security check"))
                    {
                        loginStatus = "Please complete a security check";
                        Console.WriteLine("You must log in to see this page: " + username);
                        return false;
                    }
                    if (response.Contains("<input value=\"Sign Up\" onclick=\"RegistrationBootloader.bootloadAndValidate();"))
                    {
                        loginStatus = "RegistrationBootloader.bootloadAndValidate()";
                        Console.WriteLine("Not logged in with: " + username);
                        return false;
                    }
                    if (response.Contains("Account Not Confirmed"))
                    {
                        loginStatus = "Account Not Confirmed";
                        Console.WriteLine("Account Not Confirmed " + username);
                        return false;
                    }
                    if (response.Contains("Your account is temporarily locked"))
                    {
                        loginStatus = "Your account is temporarily locked";
                        Console.WriteLine("Your account is temporarily locked: " + username);
                        return false;
                    }
                    if (response.Contains("Your account has been temporarily suspended"))
                    {
                        loginStatus = "Your account has been temporarily suspended";
                        Console.WriteLine("Your account has been temporarily suspended: " + username);
                        return false;
                    }
                    if (response.Contains("You must log in to see this page"))
                    {
                        Console.WriteLine("You must log in to see this page: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("you must log in to see this page"))
                    {
                        Console.WriteLine("You must log in to see this page: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("you entered an old password"))
                    {
                        loginStatus = "you entered an old password";
                        Console.WriteLine("You Entered An Old Password: " + username);
                        return false;
                    }
                    if (response.Contains("For security reasons your account is temporarily locked"))
                    {
                        loginStatus = "For security reasons your account is temporarily locked";
                        Console.WriteLine("For security reasons your account is temporarily locked: " + username);
                        return false;
                    }
                    if (response.Contains("Please Verify Your Identity") || response.Contains("please Verify Your Identity"))
                    {
                        loginStatus = "Please Verify Your Identity";
                        Console.WriteLine("Please Verify Your Identity: " + username);
                        return false;
                    }
                    if (response.Contains("Temporarily Blocked for 30 Days"))
                    {
                        loginStatus = "Temporarily Blocked for 30 Days";
                        Console.WriteLine("You're Temporarily Blocked for 30 Days: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("log in") && !response.Contains("id=\"logoutMenu\""))  //Log In
                    {
                        loginStatus = "Could Not LogIn";
                        Console.WriteLine("Unusual Login Activity: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("id=\"loginbutton\""))  //Log In
                    {
                        loginStatus = "Could Not LogIn";
                        Console.WriteLine("Unusual Login Activity: " + username);
                        return false;
                    }
                    if (response.ToLower().Contains("_2s5p"))
                    {
                        loginStatus = "Could Not LogIn";
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {

            }


            return true;
        }
        public List<string> ScrapTrendingNews(ref GlobusHttpHelper objGlobusHttpHelper, ref FacebookUser facebookuser)
        {
            List<string> lst_TrendingNews = new List<string>();

            try
            {

                #region Global Variable

                string PageResponse = string.Empty;

                string user_ID = string.Empty;

                string fb_dtsg = string.Empty;

                string[] arr_SplitTrendingNews = new string[] { };

                #endregion

                PageResponse = objGlobusHttpHelper.getHtmlfromUrl(new Uri(FBGlobals.Instance.fbhomeurl));

                user_ID = Utils.getBetween(PageResponse, "USER_ID\":\"", "\"");
                if (string.IsNullOrEmpty(user_ID))
                {
                    user_ID = Utils.getBetween(PageResponse, "ACCOUNT_ID\":\"", "\"");
                }

                fb_dtsg = Utils.getBetween(PageResponse, "fb_dtsg\" value=\"", "\"");

                if (PageResponse.Contains(">Trending"))
                {
                    int counter = 0;
                    string allIDsSeen = string.Empty;

                    do
                    {
                        arr_SplitTrendingNews = Regex.Split(PageResponse, "li data-topicid=").Skip(1).ToArray();

                        foreach (string trendingNews in arr_SplitTrendingNews)
                        {
                            allIDsSeen += "topic_ids_seen[" + counter + "]=" + Utils.getBetween(trendingNews, "\"", "\"").Replace("\\", "") + "&";
                            counter++;

                            string NewsArticleURL = Utils.getBetween(trendingNews, "href=\"", "\"");
                            if (string.IsNullOrEmpty(NewsArticleURL))
                            {
                                NewsArticleURL = Utils.getBetween(trendingNews.Replace("\\", ""), "href=\"", "\"");
                            }

                            string NewsArticleName = Utils.getBetween(trendingNews, "_5v0s _5my8\">", "<");
                            if (string.IsNullOrEmpty(NewsArticleName))
                            {
                                NewsArticleName = Utils.getBetween(trendingNews, "_5v0s _5my8\\\">", "\\u003C");
                            }

                            lst_TrendingNews.Add(NewsArticleName + "<:>https://www.facebook.com" + NewsArticleURL);
                        }

                        #region "See More" section request making and Scraping
                        try
                        {
                            string seeMoreURL = "https://www.facebook.com/pubcontent/trending/categories/see_more/?" + allIDsSeen + "num_topics_to_add=15&num_removed_topics=0&category=0&dpr=1";
                            string seeMorePostData = "__user=" + user_ID + "&__a=1&__dyn=7AmajEzUGByA5Q9UoHaEWC5ER6yUmyVbGAEG8zCC_8267UDAyoeAq2i5U4e2CEaUZ1ebkwy6UnGiex3BKuEjKexKcxaFQ3uaVVojxCVEiHWCDxi5-czUO5u5o5aayrhVo9ohxGbwYUmC_UjDQ6EvDxx4yplyWxm8xqawzKnh45EgAwzCwYypUhKHxhau4UCVaxyfw&__af=iw&__req=h&__be=-1&__pc=PHASED%3ADEFAULT&__rev=2962993&fb_dtsg=" + Uri.EscapeDataString(fb_dtsg) + "&logging=26581707410198106108111978570586581711187054114122959969100";
                            PageResponse = objGlobusHttpHelper.postFormData(new Uri(seeMoreURL), seeMorePostData.Trim());

                            arr_SplitTrendingNews = Regex.Split(PageResponse, "li data-topicid=").Skip(1).ToArray();

                            Thread.Sleep(2 * 1000);
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    while (arr_SplitTrendingNews.Length != 0);
                    #endregion
                }
            }
            catch (Exception ex)
            {

            }

            return lst_TrendingNews;
        }
        public string AddFacebookHashTag(string hashTag, string hashtagurl, string boardId, ref GlobusHttpHelper objGlobusHttpHelper, ref FacebookUser facebookuser)
        {
            GlobusHttpHelper httphelper = objGlobusHttpHelper;
            FacebookUser _faceuser = facebookuser;
            MongoBoardFacebookHashTag twitteracc = new MongoBoardFacebookHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Boardid = boardId, Entrydate = DateTime.UtcNow.ToString(), Screenname = hashTag.ToLower(), Facebookprofileid = "tag", Photosvideos = string.Empty, Url = hashtagurl, text = string.Empty, Profileimageurl = "tag" };
            MongoRepository mongorepo = new MongoRepository("MongoBoardFacebookHashTag");

            try
            {
                MongoBoardFacebookHashTag objTwitterPage = new MongoBoardFacebookHashTag();
                var ret = mongorepo.Find<MongoBoardFacebookHashTag>(t => t.Screenname.Equals(hashTag.ToLower()));
                var task = Task.Run(async () =>
                {
                    return await ret;

                });
                IList<MongoBoardFacebookHashTag> objTwitterPagelist = task.Result.ToList();
                if (objTwitterPagelist.Count() > 0)
                {
                    return objTwitterPagelist.First().strId.ToString();
                }

                mongorepo.Add<MongoBoardFacebookHashTag>(twitteracc);
                new Thread(delegate ()
                {
                    AddFacebookrendingHashTagFeeds(hashTag, hashtagurl, twitteracc.strId.ToString(), ref httphelper, ref _faceuser);
                }).Start();
                return twitteracc.strId.ToString();
            }
            catch (Exception)
            {
                mongorepo.Add<MongoBoardFacebookHashTag>(twitteracc);
                new Thread(delegate ()
                {
                    AddFacebookrendingHashTagFeeds(hashTag, hashtagurl, twitteracc.strId.ToString(), ref httphelper, ref _faceuser);
                }).Start();
                return twitteracc.strId.ToString();
            }
        }
        public bool AddFacebookrendingHashTagFeeds(string HashTag, string hashtagurl, string trendingTagid, ref GlobusHttpHelper objGlobusHttpHelper, ref FacebookUser facebookuser)
        {
            MongoRepository mongorepo = new MongoRepository("MongoBoardFbTrendingFeeds");
            bool output = false;
            List<MongoBoardFbTrendingFeeds> twtFeedsList = new List<MongoBoardFbTrendingFeeds>();
            List<string> lsttrend_post = ScrapTopPostsRelatedToTrendingPost(HashTag, hashtagurl, ref objGlobusHttpHelper);
            foreach (var item in lsttrend_post)
            {
                var post = Regex.Split(item, "<:>");
                MongoBoardFbTrendingFeeds _MongoBoardFbTrendingFeeds = new MongoBoardFbTrendingFeeds();
                _MongoBoardFbTrendingFeeds.Id = ObjectId.GenerateNewId();
                _MongoBoardFbTrendingFeeds.FromName = post[1];
                _MongoBoardFbTrendingFeeds.FromPicUrl = post[0];
                _MongoBoardFbTrendingFeeds.Isvisible = true;
                _MongoBoardFbTrendingFeeds.PostImageurl = post[6];
                _MongoBoardFbTrendingFeeds.Text = post[3];
                _MongoBoardFbTrendingFeeds.Title = post[4];
                _MongoBoardFbTrendingFeeds.facebookprofileid = trendingTagid;
                try
                {
                    _MongoBoardFbTrendingFeeds.publishedtime = Convert.ToDouble(post[7]);
                }
                catch (Exception)
                {
                    _MongoBoardFbTrendingFeeds.publishedtime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                }
                _MongoBoardFbTrendingFeeds.posturl = post[8];
                try
                {
                    var ret = mongorepo.Find<MongoBoardFbTrendingFeeds>(t => t.FromName == _MongoBoardFbTrendingFeeds.FromName && t.Text == _MongoBoardFbTrendingFeeds.Text);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int cont = task.Result.Count;
                    if (cont < 1)
                    {
                        mongorepo.Add<MongoBoardFbTrendingFeeds>(_MongoBoardFbTrendingFeeds);
                    }
                }
                catch (Exception ex)
                {
                }
            }
            return output;
        }
        private List<string> ScrapTopPostsRelatedToTrendingPost(string hashtag, string topNewsURL, ref GlobusHttpHelper objGlobusHttpHelper)
        {
            List<string> lst_NewsDetails = new List<string>();
            try
            {

                string userID = string.Empty;
                string fanPageSrc = string.Empty;
                string newsURL = string.Empty;
                string newsHeadLine = string.Empty;
                string ShortNewsDescription = string.Empty;
                string shortMessageDescription = string.Empty;
                string newsImageURL = string.Empty;
                string postPersonLogo = string.Empty;
                string postPersonURL = string.Empty;
                string PostedPersonName = string.Empty;
                string publishedtime = string.Empty;

                string homeapgesrc = objGlobusHttpHelper.getHtmlfromUrl(new Uri(FBGlobals.Instance.fbhomeurl));

                userID = GlobusHttpHelper.GetParamValue(homeapgesrc, "user");

                //if (!string.IsNullOrEmpty(fanPageSrc))
                {
                    try
                    {
                        fanPageSrc = objGlobusHttpHelper.getHtmlfromUrl(new Uri(topNewsURL));


                        if (fanPageSrc.Contains("_4l5g"))
                        {
                            newsHeadLine = Utils.getBetween(fanPageSrc, "_4l5g\">", "<");
                        }
                        if (fanPageSrc.Contains("_4l5h"))
                        {
                            ShortNewsDescription = Utils.getBetween(fanPageSrc, "_4l5h\">", "<");
                        }
                        if (fanPageSrc.Contains("scaledImageFitWidth"))
                        {
                            newsImageURL = Utils.getBetween(fanPageSrc, "scaledImageFitWidth img\" src=\"", "\"").Replace("&amp;", "&");
                        }

                        // lst_NewsDetails.Add(postPersonLogo + "<:>" + PostedPersonName + "<:>" + postPersonURL + "<:>" + shortMessageDescription + "<:>" + newsHeadLine + "<:>" + ShortNewsDescription + "<:>" + newsImageURL);

                    }
                    catch (Exception ex)
                    {

                    }



                    try
                    {
                        int Pagecounter = 2;
                        string fanPagination = string.Empty;

                        string keywords_topic_trending = Utils.getBetween(fanPageSrc, "keywords_topic_trending(", ")");
                        string dataFromPage = Uri.EscapeDataString(Utils.getBetween(fanPageSrc, "{view:\"list\",encoded_query:\"", "encoded_title")).Replace("%5B%5D", "[]");
                        string cursor = Utils.getBetween(fanPageSrc, "cursor\":\"", "\"");
                        string encoded_title = Utils.getBetween(fanPageSrc, "encoded_title:", ",ref:");
                        string _ref = Utils.getBetween(fanPageSrc, encoded_title + ",ref:", ",");
                        string filter_ID = Utils.getBetween(fanPageSrc, "filter_ids:", ",experience_type");
                        string ref_path = Utils.getBetween(fanPageSrc, "ref_path:\"", "\"");

                        do
                        {

                            string[] pagaDataByHref = Regex.Split(fanPageSrc, "_s0 _5xib _5sq7 _44ma _rw img").Skip(1).ToArray();
                            if (pagaDataByHref.Length == 0)
                            {
                                try
                                {
                                    pagaDataByHref = Regex.Split(fanPageSrc, "\"_5pcq").Skip(1).ToArray();
                                    if (pagaDataByHref.Length == 0)
                                    {
                                        fanPageSrc = "";
                                        break;
                                    }
                                }
                                catch { }
                            }

                            foreach (string singleSplitItem in pagaDataByHref)
                            {
                                try
                                {
                                    //newsURL = string.Empty;
                                    postPersonLogo = string.Empty;
                                    postPersonURL = string.Empty;
                                    PostedPersonName = string.Empty;

                                    string item = singleSplitItem;
                                    item = Regex.Unescape(Regex.Replace(item, "\\\\([^u])", "\\\\$1"));
                                    newsURL = Utils.getBetween(item, "class=\"_5pcq\" href=\"", "\"");
                                    if (!string.IsNullOrEmpty(newsURL))
                                    {
                                        newsURL = "https://www.facebook.com" + newsURL;
                                    }
                                    else
                                    {
                                        newsURL = Utils.getBetween(item, "<a class=\\\"_5pcq\\\"", "\\\">");
                                        newsURL = Utils.getBetween(newsURL, "href=\\\"\\", "\\\"").Replace("\\", "").Replace("&amp;", "&");
                                        newsURL = "https://www.facebook.com" + newsURL;
                                    }
                                    publishedtime = Utils.getBetween(item, "data-utime=\"", "\"");
                                    if (string.IsNullOrEmpty(publishedtime))
                                    {
                                        publishedtime = Utils.getBetween(item, "data-utime=\\\"", "\\\"");
                                    }
                                    postPersonLogo = Utils.getBetween(item, "src=\"", "\"").Replace("&amp;", "&");
                                    if (string.IsNullOrEmpty(postPersonLogo))
                                    {
                                        postPersonLogo = Utils.getBetween(item, "src=\\\"", "\"").Replace("&amp;", "&").Replace("\\", "");
                                    }

                                    PostedPersonName = Utils.getBetween(item, "aria-label=\"", "\"");
                                    if (string.IsNullOrEmpty(PostedPersonName))
                                    {
                                        PostedPersonName = Utils.getBetween(item, "aria-label=\\\"", "\"").Replace("\\", "");
                                    }

                                    postPersonURL = Utils.getBetween(Utils.getBetween(item, "span class=\"fwb fcg\"", "data-hovercard"), "<a href=\"", "\"");
                                    if (string.IsNullOrEmpty(postPersonURL))
                                    {
                                        postPersonURL = Utils.getBetween(Utils.getBetween(item, "span class=\\\"fwb fcg\\\"", "data-hovercard"), "href=\\\"", "\"").Replace("\\", "");
                                    }
                                    if (string.IsNullOrEmpty(postPersonURL))
                                    {
                                        postPersonURL = Utils.getBetween(item, "class=\\\"profileLink\\\" href=\\\"", "\"").Replace("\\", "").Replace("&amp;", "&");
                                    }


                                    shortMessageDescription = Utils.getBetween(Utils.getBetween(item, "_5pbx userContent", "iv>"), "<p>", "</d");
                                    if (string.IsNullOrEmpty(shortMessageDescription))
                                    {
                                        shortMessageDescription = Utils.getBetween(Utils.getBetween(item, "_5pbx userContent", "iv>"), "\\u003Cp>", "\\u003").Replace("&#039;", "'");
                                    }
                                    shortMessageDescription = Regex.Replace(shortMessageDescription, "<.*?>", String.Empty);

                                    newsImageURL = Utils.getBetween(item, "scaledImageFitWidth img\" src=\"", "\"").Replace("&amp;", "&");
                                    if (string.IsNullOrEmpty(newsImageURL))
                                    {
                                        newsImageURL = Utils.getBetween(item, "scaledImageFitWidth img\\\" src=\\\"", "\"").Replace("&amp;", "&").Replace("\\u0025", "%").Replace("\\", "");
                                    }

                                    //lst_NewsDetails.Add(newsURL+"<:>"+postPersonLogo + "<:>" + PostedPersonName + "<:>" + postPersonURL + "<:>" + ShortNewsDescription + "<:>" + newsImageURL);
                                    Console.WriteLine(postPersonLogo + "<:>" + PostedPersonName + "<:>" + postPersonURL + "<:>" + shortMessageDescription + "<:>" + newsHeadLine + "<:>" + ShortNewsDescription + "<:>" + newsImageURL + "<:>" + publishedtime + "<:>" + newsURL);
                                    lst_NewsDetails.Add(postPersonLogo + "<:>" + PostedPersonName + "<:>" + postPersonURL + "<:>" + shortMessageDescription + "<:>" + newsHeadLine + "<:>" + ShortNewsDescription + "<:>" + newsImageURL + "<:>" + publishedtime + "<:>" + newsURL);
                                }
                                catch (Exception Ex)
                                { }
                            }


                            //Pagination Code
                            #region Pagination Code


                            cursor = Utils.getBetween(fanPageSrc, "cursor\":\"", "\"");
                            if (string.IsNullOrEmpty(cursor))
                            {
                                cursor = Utils.getBetween(fanPageSrc, "cursor:\"", "\"");
                            }

                            string data = Uri.EscapeDataString("{\"view\":\"list\",\"encoded_query\":\"") + dataFromPage.Replace("%28" + keywords_topic_trending + "%29", "(" + keywords_topic_trending + ")") + Uri.EscapeDataString("\"encoded_title\":" + encoded_title + ",\"ref\":" + _ref + ",\"logger_source\":\"www_main\",\"typeahead_sid\":\"\",\"tl_log\":false,\"impression_id\":\"c1ba53ca\",\"filter_ids\":" + filter_ID + ",\"experience_type\":\"grammar\",\"exclude_ids\":null,\"browse_location\":\"\",\"trending_source\":\"whfrt\",\"reaction_surface\":null,\"reaction_session_id\":null,\"ref_path\":\"" + ref_path + "\",\"is_trending\":true,\"topic_id\":" + keywords_topic_trending + ",\"place_id\":null,\"story_id\":null,\"callsite\":\"trending:topic\",\"has_top_pagelet\":true,\"display_params\":{\"mrss\":true},\"cursor\":\"" + cursor + "\",\"page_number\":" + Pagecounter + ",\"em\":false,\"mr\":false,\"tr\":null}");

                            string paginationURL = "https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?dpr=1&data=" + data + "&__user=" + userID + "&__a=1&__dyn=5V5yAW8-aFoFxp2u6aOGeFxqeCwKAKGgS8zCC_8267UKezob4q2i5U4e2DgaUgxebkwy6UnGieKcDKuEjKexKcxaFQ3uaVVojxCVFEKLGqu58nUsz8gAUlwkEG9J7BwBx66EK3Pxqr_xevgqx-F8oh8CloW5oy5EG2unh45EgAwzCwYypUhKHxiVUhUCVaxyfw&__af=iw&__req=k&__be=-1&__pc=PHASED:DEFAULT&__rev=2964485";


                            fanPageSrc = objGlobusHttpHelper.getHtmlfromUrl(new Uri(paginationURL));
                            Pagecounter++;

                            if (Pagecounter == 20)
                            {
                                fanPageSrc = "";
                            }
                            Thread.Sleep(2 * 1000);

                        } while (!string.IsNullOrEmpty(fanPageSrc) && !fanPageSrc.Contains("errorSummary"));
                        #endregion

                    }
                    catch { };
                }
            }
            catch (Exception ex)
            {

            }
            return lst_NewsDetails;
        }
        public string AddGplusHashTag(string hashTag, string boardId)
        {
            MongoBoardGplusHashTag bgpacc = new MongoBoardGplusHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Aboutme = string.Empty, Boardid = boardId, Circledbycount = string.Empty, Coverphotourl = string.Empty, Displayname = hashTag.ToLower(), Entrydate = DateTime.UtcNow.ToString(), Nickname = hashTag, Pageid = "tag", Pageurl = string.Empty, Plusonecount = string.Empty, Profileimageurl = string.Empty, Tagline = string.Empty };
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusHashTag");
            try
            {
                var ret = boardrepo.Find<MongoBoardGplusHashTag>(t => t.Displayname.Equals(hashTag.ToLower()) && t.Pageid.Equals("tag"));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<MongoBoardGplusHashTag> objgplusPagelist = task.Result.ToList();
                if (objgplusPagelist.Count() > 0)
                {
                    return objgplusPagelist.First().strId.ToString();
                }
                boardrepo.Add<MongoBoardGplusHashTag>(bgpacc);
                new Thread(delegate ()
                {
                    AddBoardGplusTagFeeds(hashTag, bgpacc.strId.ToString());
                }).Start();
                return bgpacc.strId.ToString();
            }
            catch (Exception)
            {
                boardrepo.Add<MongoBoardGplusHashTag>(bgpacc);
                new Thread(delegate ()
                {
                    AddBoardGplusTagFeeds(hashTag, bgpacc.strId.ToString());
                }).Start();
                return bgpacc.strId.ToString();
            }
        }
        public bool AddBoardGplusTagFeeds(string GplusTagId, string BoardId)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusFeeds");
            bool output = false;
            try
            {
                JObject RecentActivities = JObject.Parse(GplusTagSearch.GooglePlusgetUserRecentActivitiesByHashtag(GplusTagId));
                foreach (JObject obj in RecentActivities["items"])
                {
                    MongoBoardGplusFeeds bgpfeed = new MongoBoardGplusFeeds();
                    bgpfeed.Id = ObjectId.GenerateNewId();
                    bgpfeed.Gplusboardaccprofileid = BoardId;
                    try
                    {
                        bgpfeed.Feedlink = obj["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        foreach (JObject att in JArray.Parse(obj["object"]["attachments"].ToString()))
                        {
                            if (att["objectType"].ToString().Equals("photo"))
                            {

                                bgpfeed.Imageurl = att["fullImage"]["url"].ToString() + ",";
                            }
                        }
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.Parse(obj["published"].ToString()));
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Title = obj["title"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Feedid = obj["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromId = obj["actor"]["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromName = obj["actor"]["displayName"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromPicUrl = obj["actor"]["image"]["url"].ToString();
                    }
                    catch { }

                    try
                    {
                        boardrepo.Add<MongoBoardGplusFeeds>(bgpfeed);
                    }
                    catch { }

                }
            }
            catch { }



            return output;
        }
        public string AddTwitterHashTag(string hashTag, string boardId)
        {
            MongoBoardTwitterHashTag twitteracc = new MongoBoardTwitterHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Boardid = boardId, Statuscount = string.Empty, Entrydate = DateTime.UtcNow.ToString(), Screenname = hashTag.ToLower(), Twitterprofileid = "tag", Friendscount = string.Empty, Followingscount = string.Empty, Followerscount = string.Empty, Favouritescount = string.Empty, Photosvideos = string.Empty, Url = string.Empty, Tweet = string.Empty, Profileimageurl = "tag" };
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwitterHashTag");

            try
            {
                MongoBoardTwitterHashTag objTwitterPage = new MongoBoardTwitterHashTag();
                var ret = mongorepo.Find<MongoBoardTwitterHashTag>(t => t.Screenname.Equals(hashTag.ToLower()));
                var task = Task.Run(async () =>
                {
                    return await ret;

                });
                IList<MongoBoardTwitterHashTag> objTwitterPagelist = task.Result.ToList();
                if (objTwitterPagelist.Count() > 0)
                {
                    return objTwitterPagelist.First().strId.ToString();
                }

                mongorepo.Add<MongoBoardTwitterHashTag>(twitteracc);
                new Thread(delegate ()
                {
                    AddTwittertrendingHashTagFeeds(hashTag, twitteracc.strId.ToString(), null);
                }).Start();
                return twitteracc.strId.ToString();
            }
            catch (Exception)
            {
                mongorepo.Add<MongoBoardTwitterHashTag>(twitteracc);
                new Thread(delegate ()
                {
                    AddTwittertrendingHashTagFeeds(hashTag, twitteracc.strId.ToString(), null);
                }).Start();
                return twitteracc.strId.ToString();
            }
        }
        public string AddInstagramHashTag(string hashTag, string boardId)
        {
            MongoBoardInstagramHashTag binstacc = new MongoBoardInstagramHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Bio = "tag", Boardid = boardId, Entrydate = DateTime.UtcNow.ToString(), Followedbycount = string.Empty, Followscount = string.Empty, Media = string.Empty, Profileid = hashTag, Profilepicurl = string.Empty, Username = hashTag.ToLower() };
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramHashTag");
            try
            {
                var ret = boardrepo.Find<MongoBoardInstagramHashTag>(t => t.Username.Equals(hashTag.ToLower()) && t.Bio.Equals("tag"));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<MongoBoardInstagramHashTag> objInstagramPagelist = task.Result.ToList();
                if (objInstagramPagelist.Count() > 0)
                {
                    return objInstagramPagelist.First().strId.ToString();
                }
                boardrepo.Add<MongoBoardInstagramHashTag>(binstacc);
                new Thread(delegate ()
                {
                    AddBoardInstagramTagFeeds(hashTag, binstacc.strId.ToString());
                }).Start();
                return binstacc.strId.ToString();
            }
            catch (Exception)
            {
                boardrepo.Add<MongoBoardInstagramHashTag>(binstacc);
                new Thread(delegate ()
                {
                    AddBoardInstagramTagFeeds(hashTag, binstacc.strId.ToString());
                }).Start();
                return binstacc.strId.ToString();
            }
        }
        public bool AddBoardInstagramTagFeeds(string hashTag, string boardInstagramTagId)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramFeeds");
            bool output = false;
            try
            {
                JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(hashTag, "1974224400.2310fd1.699477d40ff64cd6babfb0b3a6cf60fa"));
                foreach (JObject obj in JArray.Parse(recentactivities["data"].ToString()))
                {
                    MongoBoardInstagramFeeds binstfeed = new MongoBoardInstagramFeeds();
                    binstfeed.Id = ObjectId.GenerateNewId();
                    binstfeed.Instagramaccountid = boardInstagramTagId;
                    binstfeed.Isvisible = true;
                    try
                    {
                        binstfeed.Imageurl = obj["images"]["standard_resolution"]["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.Link = obj["link"].ToString();
                    }
                    catch { }
                    try
                    {
                        foreach (JValue tag in JArray.Parse(obj["tags"].ToString()))
                        {
                            try
                            {
                                binstfeed.Tags = tag.ToString() + ",";
                            }
                            catch { }
                        }
                    }
                    catch { }
                    try
                    {
                        binstfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(new DateTime(1970, 1, 1).AddSeconds(Convert.ToInt64(obj["created_time"].ToString())));
                    }
                    catch
                    {
                        //binstfeed.Createdtime = DateTime.UtcNow;
                    }
                    try
                    {
                        binstfeed.Feedid = obj["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromId = obj["user"]["username"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromName = obj["user"]["full_name"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromPicUrl = obj["user"]["profile_picture"].ToString();
                    }
                    catch { }

                    try
                    {
                        boardrepo.Add<MongoBoardInstagramFeeds>(binstfeed);

                    }
                    catch (Exception e) { }


                }
            }
            catch { }

            return output;
        }
        public bool AddTwittertrendingHashTagFeeds(string HashTag, string trendingTagid, string LastTweetId)
        {
            //MongoRepository mongorepo = new MongoRepository("MongoBoardTwtTrendingFeeds ");
            //bool output = false;
            //List<MongoBoardTwtTrendingFeeds> twtFeedsList = new List<MongoBoardTwtTrendingFeeds>();
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwtFeeds");
            bool output = false;
            List<MongoBoardTwtFeeds> twtFeedsList = new List<MongoBoardTwtFeeds>();
            string timeline = TwitterHashTag.TwitterBoardHashTagSearch(HashTag, LastTweetId);
            int i = 0;
            if (!string.IsNullOrEmpty(timeline) && !timeline.Equals("[]"))
            {
                foreach (JObject obj in JArray.Parse(timeline))
                {
                    MongoBoardTwtFeeds twitterfeed = new MongoBoardTwtFeeds();
                    twitterfeed.Id = ObjectId.GenerateNewId();

                    i++;
                    try
                    {
                        twitterfeed.Feedurl = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["url"].ToString();
                    }
                    catch
                    {
                        try
                        {
                            twitterfeed.Feedurl = JArray.Parse(obj["entities"]["urls"].ToString())[0]["expanded_url"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.Imageurl = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["media_url"].ToString();
                    }
                    catch
                    {
                        try
                        {
                            twitterfeed.Imageurl = JArray.Parse(obj["entities"]["media"].ToString())[0]["media_url"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        foreach (JObject tag in JArray.Parse(obj["entities"]["hashtags"].ToString()))
                        {
                            try
                            {
                                twitterfeed.Hashtags = tag["text"].ToString() + ",";

                            }
                            catch (Exception e)
                            {

                            }
                        }
                    }
                    catch { }
                    try
                    {
                        twitterfeed.Text = obj["text"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Retweetcount = Convert.ToInt32(obj["retweet_count"].ToString());
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Favoritedcount = Convert.ToInt32(obj["favorite_count"].ToString());
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        string Const_TwitterDateTemplate = "ddd MMM dd HH:mm:ss +ffff yyyy";
                        twitterfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact((string)obj["created_at"], Const_TwitterDateTemplate, new System.Globalization.CultureInfo("en-US")));
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Feedid = obj["id_str"].ToString();
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            twitterfeed.Feedid = obj["id"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.FromId = obj["user"]["id_str"].ToString();
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            twitterfeed.FromId = obj["user"]["id"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.FromName = obj["user"]["screen_name"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.FromPicUrl = obj["user"]["profile_image_url"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    twitterfeed.Isvisible = true;
                    twitterfeed.Twitterprofileid = trendingTagid;
                    var ret = mongorepo.Find<MongoBoardTwtFeeds>(t => t.Feedid == twitterfeed.Feedid);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        try
                        {
                            mongorepo.Add<MongoBoardTwtFeeds>(twitterfeed);

                        }
                        catch (Exception e) { }
                    }
                    else
                    {
                        FilterDefinition<BsonDocument> filter = new BsonDocument("Feedid", twitterfeed.Feedid);
                        var update = Builders<BsonDocument>.Update
.Set("Favoritedcount", twitterfeed.Favoritedcount)
.Set("FromPicUrl", twitterfeed.FromPicUrl)
.Set("Retweetcount", twitterfeed.Retweetcount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoBoardTwtFeeds>(update, filter);
                    }
                    output = true;
                }
            }
            return output;
        }
        public static string getHtmlfromUrl(string url)
        {
            string output = string.Empty;
            string facebookSearchUrl = url;
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }


    }
}
