using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Services;
using Google.Apis.Upload;
using Google.Apis.Util.Store;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    internal class UploadVideo
    {
        [STAThread]

        private async Task Run()
        {
            //UserCredential credential;
            //string user="rajsekharpatnaik@globussoft.in";
            var Y_oAuthToken = new TokenResponse { RefreshToken = AccRef_Token };
            var Y_oAuthCredentials = new UserCredential(new GoogleAuthorizationCodeFlow(
                new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = YtClientId,
                        ClientSecret = YtSecrt
                    },
                }), "user", Y_oAuthToken);


            var youtubeService = new YouTubeService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = Y_oAuthCredentials,
                ApplicationName = Assembly.GetExecutingAssembly().GetName().Name
            });

            var video = new Video();
            video.Snippet = new VideoSnippet();
            video.Snippet.Title = upload_data[0];
            //video.Snippet.Title = rajsekharpatnaik@globussoft.in
            video.Snippet.Description = upload_data[1];
            //video.Snippet.Tags = new string[] { "world", "earth" };
            video.Snippet.CategoryId = upload_data[2]; // See https://developers.google.com/youtube/v3/docs/videoCategories/list
            video.Status = new VideoStatus();
            video.Status.PrivacyStatus = upload_data[3];
            var filePath = vdopath;



            using (var fileStream = new FileStream(filePath, FileMode.Open))
            {
                var videosInsertRequest = youtubeService.Videos.Insert(video, "snippet,status", fileStream, "video/*");
                videosInsertRequest.ProgressChanged += videosInsertRequest_ProgressChanged;
                videosInsertRequest.ResponseReceived += videosInsertRequest_ResponseReceived;
                await videosInsertRequest.UploadAsync();
            }
        }

        void videosInsertRequest_ProgressChanged(Google.Apis.Upload.IUploadProgress progress)
        {
            switch (progress.Status)
            {
                case UploadStatus.Uploading:
                    Console.WriteLine("{0} bytes sent.", progress.BytesSent);
                    break;

                case UploadStatus.Failed:
                    Console.WriteLine("An error prevented the upload from completing.\n{0}", progress.Exception);
                    break;
            }
        }

        void videosInsertRequest_ResponseReceived(Video video)
        {
            if(video.Id != null) {
                upldStatus = 0;
            }
        }



        public static IFormFile ExactVideo;
        public static string ytUser_Email;
        public static string[] upload_data = new string[4];
        string channelId;
        public static string AccRef_Token;
        public static string vdopath;
        public static string YtClientId;
        public static string YtSecrt;
        public static int upldStatus;
        public static int videosss(string ChaelId, string Ref_Token, IFormFile media, string videopath, string user_email, string[] arrdata, Helper.AppSettings _settings)
        {
            upldStatus = 1;
            ExactVideo = media;
            ytUser_Email = user_email;
            upload_data[0] = arrdata[0];//title
            upload_data[1] = arrdata[1];//Description
            upload_data[2] = arrdata[2];//CategoryId
            upload_data[3] = arrdata[3];//PrivacyStatus
            UploadVideo obj = new Repositories.UploadVideo();
            vdopath = videopath;
            obj.channelId = ChaelId;
            AccRef_Token = Ref_Token;
            YtClientId = _settings.GoogleConsumerKey;
            YtSecrt = _settings.GoogleConsumerSecret;
            try
            {
                obj.Run().Wait();
                return upldStatus;
            }
            catch (AggregateException ex)
            {
                foreach (var e in ex.InnerExceptions)
                {
                    Console.WriteLine("Error: " + e.Message);
                }
                return 1;
            }


        }

    }
}
