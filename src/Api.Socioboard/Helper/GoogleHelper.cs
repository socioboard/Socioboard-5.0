using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.Accounts;
using Socioboard.GoogleLib.Youtube.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public static class GoogleHelper
    {
        public static List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> GetGanalyticsAccount(string code, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles _GoogleAnalyticsProfiles;
            List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> lstGoogleAnalyticsProfiles = new List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles>();
            string access_token = string.Empty;
            string refresh_token = string.Empty;
            Accounts _Accounts = new Accounts(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

            try
            {
                var objToken = new oAuthTokenGa(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);


                var accessToken = objToken.GetRefreshToken(code);
                var jData = JObject.Parse(accessToken);

                try
                {
                    refresh_token = jData["refresh_token"].ToString();
                }
                catch (Exception ex)
                {
                    access_token = jData["access_token"].ToString();
                    objToken.RevokeToken(access_token);
                    return null;
                }

                access_token = jData["access_token"].ToString();

                var accountsSummary = _Accounts.getGaAccountsSummary(access_token);

                JObject jAccountdata = JObject.Parse(accountsSummary);
                var emailId = jAccountdata["username"].ToString();

                foreach (var item in jAccountdata["items"])
                {
                    try
                    {
                        var googleAccountId = item["id"].ToString();
                        var googleAccountName = item["name"].ToString();

                        foreach (var webProfiles in item["webProperties"])
                        {

                            var accountName = webProfiles["name"].ToString();
                            var accountId = webProfiles["id"].ToString();
                            var profileId = webProfiles["profiles"].First["id"].ToString();

                            var website = webProfiles["websiteUrl"].ToString(); ;
                            var internalWebPropertyId = webProfiles["internalWebPropertyId"].ToString();

                            _GoogleAnalyticsProfiles = new Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles
                            {
                                AccessToken = access_token,
                                RefreshToken = refresh_token,
                                AccountId = googleAccountId,
                                AccountName = googleAccountName,
                                EmailId = emailId,
                                ProfileId = accountId,
                                ProfileName = accountName,
                                WebPropertyId = profileId,
                                WebsiteUrl = website,
                                internalWebPropertyId = internalWebPropertyId
                            };
                            lstGoogleAnalyticsProfiles.Add(_GoogleAnalyticsProfiles);
                        }
                    }
                    catch (Exception e)
                    {
                    }
                }
            }
            catch
            {

            }
            return lstGoogleAnalyticsProfiles;
        }

        public static List<Domain.Socioboard.ViewModels.YoutubeProfiles> GetYoutubeAccount(string code, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.ViewModels.YoutubeProfiles _YoutubeChannels;
            List<Domain.Socioboard.ViewModels.YoutubeProfiles> lstYoutubeProfiles = new List<Domain.Socioboard.ViewModels.YoutubeProfiles>();
            string access_token = string.Empty;
            string refresh_token = string.Empty;
            Channels _Channels = new Channels(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

            try
            {
                oAuthTokenYoutube objToken = new oAuthTokenYoutube(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);


                string accessToken = objToken.GetRefreshToken(code);
                JObject JData = JObject.Parse(accessToken);


                try
                {
                    refresh_token = JData["refresh_token"].ToString();
                }
                catch (Exception ex)
                {
                    access_token = JData["access_token"].ToString();
                    objToken.RevokeToken(access_token);
                    return null;
                }

                access_token = JData["access_token"].ToString();

                string channelsdata = _Channels.Get_Channel_List(access_token, "snippet,contentDetails,statistics", 50, true);
                JObject JChanneldata = JObject.Parse(channelsdata);


                foreach (var item in JChanneldata["items"])
                {
                    try
                    {
                        string channelid = item["id"].ToString();
                        string channelname = item["snippet"]["title"].ToString();
                        string channelimage = item["snippet"]["thumbnails"]["default"]["url"].ToString();
                        channelimage = channelimage.Replace(".jpg", "");
                        string publishdate = item["snippet"]["publishedAt"].ToString();
                        string viewscount = item["statistics"]["viewCount"].ToString();
                        string commentscount = item["statistics"]["commentCount"].ToString();
                        string subscriberscount = item["statistics"]["subscriberCount"].ToString();
                        string videoscount = item["statistics"]["videoCount"].ToString();
                        string channeldescrip = item["snippet"]["description"].ToString();

                        #region Update Access and refresh token after authentication for every time
                        //try
                        //{
                        //    List<Domain.Socioboard.Models.YoutubeChannel> lstYTChannel = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.YtubeChannelId.Equals(channelid)).ToList();
                        //    if (lstYTChannel != null && lstYTChannel.Count() > 0)
                        //    {
                        //        lstYTChannel.First().AccessToken = access_token;
                        //        lstYTChannel.First().RefreshToken = refresh_token;
                        //        dbr.Update<Domain.Socioboard.Models.YoutubeChannel>(lstYTChannel.First());
                        //    }
                        //}
                        //catch(Exception ex)
                        //{

                        //}
                        #endregion


                        try
                        {
                            _YoutubeChannels = new Domain.Socioboard.ViewModels.YoutubeProfiles();
                            _YoutubeChannels.Accesstoken = access_token;
                            _YoutubeChannels.Refreshtoken = refresh_token;
                            _YoutubeChannels.YtChannelId = channelid;
                            _YoutubeChannels.YtChannelName = channelname;
                            _YoutubeChannels.YtChannelImage = channelimage;
                            _YoutubeChannels.PublishDate = publishdate;
                            _YoutubeChannels.viewscount = viewscount;
                            _YoutubeChannels.commentscount = commentscount;
                            _YoutubeChannels.subscriberscount = subscriberscount;
                            _YoutubeChannels.videoscount = videoscount;
                            _YoutubeChannels.YtChannelDescrip = channeldescrip;
                            lstYoutubeProfiles.Add(_YoutubeChannels);
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                    catch (Exception e)
                    {
                    }
                }
            }
            catch
            {

            }
            return lstYoutubeProfiles;
        }

        public static List<Domain.Socioboard.Models.Mongo.YoutubeSearch> YoutubeSearch(string q, Helper.AppSettings _appSettings)
        {
            List<Domain.Socioboard.Models.Mongo.YoutubeSearch> lstYoutubeVideos = new List<Domain.Socioboard.Models.Mongo.YoutubeSearch>();
            string access_token = string.Empty;
            string refresh_token = string.Empty;
            Video _Search = new Video(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

            string pageCodeinit = "";
            try
            {
                string videosData = _Search.Get_Search_List(_appSettings.GoogleApiKey, q);
                JObject JvideosData = JObject.Parse(videosData);
                try
                {
                    pageCodeinit = JvideosData["nextPageToken"].ToString();
                }
                catch
                { }

                foreach (var item in JvideosData["items"])
                {
                    Domain.Socioboard.Models.Mongo.YoutubeSearch _objVideosDataes = new Domain.Socioboard.Models.Mongo.YoutubeSearch();

                    try
                    {
                        _objVideosDataes.YtVideoId = item["id"]["videoId"].ToString();
                        _objVideosDataes.searchType = "video";
                    }
                    catch
                    {
                        try
                        {
                            _objVideosDataes.YtVideoId = item["id"]["playlistId"].ToString();
                            _objVideosDataes.searchType = "playlist";
                        }
                        catch
                        {
                            _objVideosDataes.YtVideoId = item["id"]["channelId"].ToString();
                            _objVideosDataes.searchType = "channel";
                        }
                    }
                    _objVideosDataes.YtChannelId = item["snippet"]["channelId"].ToString();
                    _objVideosDataes.VdoUrl = "https://www.youtube.com/watch?v=" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.VdoTitle = item["snippet"]["title"].ToString();
                    _objVideosDataes.VdoPublishDate = (Convert.ToDateTime(item["snippet"]["publishedAt"].ToString())).ToString("MMM dd, yyyy");
                    try
                    {
                        _objVideosDataes.VdoImage = item["snippet"]["thumbnails"]["medium"]["url"].ToString();
                    }
                    catch
                    {
                        _objVideosDataes.VdoImage = item["snippet"]["thumbnails"]["default"]["url"].ToString();
                    }
                    _objVideosDataes.VdoEmbed = "https://www.youtube.com/embed/" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.VdoDescription = item["snippet"]["description"].ToString();
                    _objVideosDataes.channelTitle = item["snippet"]["channelTitle"].ToString();
                    _objVideosDataes.Date = Convert.ToDateTime(item["snippet"]["publishedAt"].ToString());
                    _objVideosDataes.dateTimeUnix = DateExtension.ToUnixTimestamp(_objVideosDataes.Date);
                    _objVideosDataes.channelUrl = "https://www.youtube.com/channel/" + _objVideosDataes.YtChannelId;
                    _objVideosDataes.playlistUrl = "https://www.youtube.com/playlist?list=" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.pageCode = pageCodeinit;
                    lstYoutubeVideos.Add(_objVideosDataes);

                }
            }
            catch
            {

            }
            return lstYoutubeVideos;
        }


        public static List<Domain.Socioboard.Models.Mongo.YoutubeSearch> YoutubeSearchPageCode(string q, string pagecode, Helper.AppSettings _appSettings)
        {
            List<Domain.Socioboard.Models.Mongo.YoutubeSearch> lstYoutubeVideos = new List<Domain.Socioboard.Models.Mongo.YoutubeSearch>();
            string access_token = string.Empty;
            string refresh_token = string.Empty;
            Video _Search = new Video(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

            string pageCodeinit = "";
            try
            {
                string videosData = _Search.Get_Search_List_Page(_appSettings.GoogleApiKey, q, pagecode);
                JObject JvideosData = JObject.Parse(videosData);
                try
                {
                    pageCodeinit = JvideosData["nextPageToken"].ToString();
                }
                catch
                { }

                foreach (var item in JvideosData["items"])
                {
                    Domain.Socioboard.Models.Mongo.YoutubeSearch _objVideosDataes = new Domain.Socioboard.Models.Mongo.YoutubeSearch();

                    try
                    {
                        _objVideosDataes.YtVideoId = item["id"]["videoId"].ToString();
                        _objVideosDataes.searchType = "video";
                    }
                    catch
                    {
                        try
                        {
                            _objVideosDataes.YtVideoId = item["id"]["playlistId"].ToString();
                            _objVideosDataes.searchType = "playlist";
                        }
                        catch
                        {
                            _objVideosDataes.YtVideoId = item["id"]["channelId"].ToString();
                            _objVideosDataes.searchType = "channel";
                        }
                    }
                    _objVideosDataes.YtChannelId = item["snippet"]["channelId"].ToString();
                    _objVideosDataes.VdoUrl = "https://www.youtube.com/watch?v=" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.VdoTitle = item["snippet"]["title"].ToString();
                    _objVideosDataes.VdoPublishDate = (Convert.ToDateTime(item["snippet"]["publishedAt"].ToString())).ToString("MMM dd, yyyy");
                    try
                    {
                        _objVideosDataes.VdoImage = item["snippet"]["thumbnails"]["medium"]["url"].ToString();
                    }
                    catch
                    {
                        _objVideosDataes.VdoImage = item["snippet"]["thumbnails"]["default"]["url"].ToString();
                    }
                    _objVideosDataes.VdoEmbed = "https://www.youtube.com/embed/" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.VdoDescription = item["snippet"]["description"].ToString();
                    _objVideosDataes.channelTitle = item["snippet"]["channelTitle"].ToString();
                    _objVideosDataes.Date = Convert.ToDateTime(item["snippet"]["publishedAt"].ToString());
                    _objVideosDataes.dateTimeUnix = DateExtension.ToUnixTimestamp(_objVideosDataes.Date);
                    _objVideosDataes.channelUrl = "https://www.youtube.com/channel/" + _objVideosDataes.YtChannelId;
                    _objVideosDataes.playlistUrl = "https://www.youtube.com/playlist?list=" + _objVideosDataes.YtVideoId;
                    _objVideosDataes.pageCode = pageCodeinit;
                    lstYoutubeVideos.Add(_objVideosDataes);

                }
            }
            catch
            {

            }
            return lstYoutubeVideos;
        }

    }
}
