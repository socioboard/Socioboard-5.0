using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using System.Text.RegularExpressions;
using Domain.Socioboard.Helpers;
using Microsoft.AspNetCore.Hosting;

namespace Api.Socioboard.Repositories.BoardMeRepository
{
    
    public class FacebookRepository
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger _logger;

      
        public async Task<string> AddFacebookrendingHashTagFeeds(string[] jsonObj, Helper.AppSettings settings)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            IList<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
            string Id =Convert.ToString(Guid.NewGuid());
            MongoRepository mongorepo = new MongoRepository("MongoBoardFbTrendingFeeds", settings);
            List<MongoBoardFbTrendingFeeds> twtFeedsList = new List<MongoBoardFbTrendingFeeds>();
            string boardName = string.Empty;
            foreach (var item in jsonObj)
            {
                 MongoBoardFbTrendingFeeds _MongoBoardFbTrendingFeeds = new MongoBoardFbTrendingFeeds();
                 string FromName = getBetween(item, "FromName", "FromPicUrl");
                 string FromPicUrl = getBetween(item, "FromPicUrl", "PostImageurl");
                 string PostImageurl = getBetween(item, "PostImageurl", "Text");
                 string Text = getBetween(item, "Text", "Title");
                 string Title = getBetween(item, "Title", "facebookprofileid");
                 string publishedtime = getBetween(item, "publishedtime", "posturl");
                 string posturl = getBetween(item, "posturl", "BoardName");
                

                _MongoBoardFbTrendingFeeds.Id = ObjectId.GenerateNewId();
                _MongoBoardFbTrendingFeeds.FromName = FromPicUrl.Replace("\":\"", "").Replace("\",\"", "");
                _MongoBoardFbTrendingFeeds.FromPicUrl = FromName.Replace("\":\"", "").Replace("\",\"", "");
                _MongoBoardFbTrendingFeeds.PostImageurl = PostImageurl.Replace("\":\"", "").Replace("\",\"", "");
                _MongoBoardFbTrendingFeeds.Text = Text.Replace("\":\"", "").Replace("</p>\",\"", "").Replace("\",\"", "").Replace("&amp;", "&");
                _MongoBoardFbTrendingFeeds.Title = Title.Replace("\":\"", "").Replace("\",\"", "");
                //_MongoBoardFbTrendingFeeds.facebookprofileid = data[5].Replace("[\"", "").Replace("\"", "");
                _MongoBoardFbTrendingFeeds.facebookprofileid = Id;
                if(string.IsNullOrEmpty(boardName))
                {
                    boardName = getBetween(item, "BoardName", "\"}");
                    boardName = boardName.Replace("\":\"", "").Replace("\"", "").Replace("\",\"", "");
                    boards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(boardName.ToLower()));
                    if (boards.First().facebookHashTag != null)
                    {
                        return "Board already has FB feeds";
                    }
                }
               
                    try
                {
                    _MongoBoardFbTrendingFeeds.publishedtime = Convert.ToDouble(publishedtime.Replace("\":\"", "").Replace("\",\"", ""));
                }
                catch (Exception)
                {
                    _MongoBoardFbTrendingFeeds.publishedtime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                }
               
                _MongoBoardFbTrendingFeeds.posturl = posturl.Replace("\":\"", "").Replace("\",\"", "");
                _MongoBoardFbTrendingFeeds.Isvisible =true;

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
           
            try
            {
                boards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(boardName.ToLower()));
                if(boards.First().facebookHashTag ==null)
                {
                    if (boards != null || boards.Count() != 0)
                    {
                        Domain.Socioboard.Models.MongoBoards board = dbr.Single<Domain.Socioboard.Models.MongoBoards>(t => t.boardName == boards.First().boardName);
                        board.facebookHashTag = Id;
                        dbr.Update<Domain.Socioboard.Models.MongoBoards>(board);
                        return "successfulyy Updated Board.";
                    }
                    else
                    {
                        return "Board Not Found";
                    }
                }
               
            }
            catch (Exception e)
            {
            }
           
            return "";
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
