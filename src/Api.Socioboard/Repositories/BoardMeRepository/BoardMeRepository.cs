using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories.BoardMeRepository
{
    public class BoardMeRepository
    {
        public async Task<string> CreateBoard(string boardName, string twitterHashTag, string instagramHashTag, string gplusHashTag, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", settings);
            IList<MongoBoards> boards = new List<MongoBoards>();
            try
            {
                var result = boardrepo.Find<MongoBoards>(t => t.boardName.Equals(boardName.ToLower()));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                boards = task.Result;
            }
            catch (Exception e)
            {
            }
            if (boards == null || boards.Count() == 0)
            {
                MongoBoards board = new MongoBoards();
                //companyprofiles.UserId = UserId;
                board.id = ObjectId.GenerateNewId();
                board.isActive = true;
                board.objId = board.id.ToString();
                board.boardName = boardName.ToLower();
                board.createDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                board.userId = userId.ToString();
                if (!string.IsNullOrEmpty(twitterHashTag) && twitterHashTag!= "undefined")
                {
                    TwitterRepository tr = new TwitterRepository();
                    board.twitterHashTag = await tr.AddTwitterHashTag(twitterHashTag, board.objId, _redisCache, settings, _logger);
                }
                if (!string.IsNullOrEmpty(instagramHashTag) && instagramHashTag != "undefined")
                {
                    InstagramRepository instRepo = new InstagramRepository();
                    board.instagramHashTag = await instRepo.AddInstagramHashTag(instagramHashTag, board.objId, _redisCache, settings, _logger);
                }
                if (!string.IsNullOrEmpty(gplusHashTag) && gplusHashTag != "undefined")
                {
                    GplusRepository gplusRepo = new GplusRepository();
                    board.gplusHashTag = await gplusRepo.AddGplusHashTag(gplusHashTag, board.objId, _redisCache, settings, _logger);
                }

             await  boardrepo.Add<Domain.Socioboard.Models.Mongo.MongoBoards>(board);
                return "successfulyy added.";
            }
            else
            {
                return "board Exist";
            }
        }

        public static MongoBoards getBoard(string boardId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", _appSettings);
            try
            {
                MongoBoards inMemboard = _redisCache.Get<MongoBoards>(Domain.Socioboard.Consatants.SocioboardConsts.CacheBoard + boardId);
                if (inMemboard != null)
                {
                    return inMemboard;
                }
                else {
                    var result = boardrepo.Find<MongoBoards>(t => t.objId.Equals(boardId) && t.isActive == true);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    MongoBoards board = task.Result.First();
                    return board;
                }
               
            }
            catch (Exception ex)
            {
               _logger.LogError(ex.StackTrace);
                return null;
            }
        }



        public static MongoBoards getBoardByName(string boardName, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", _appSettings);
            try
            {
                MongoBoards inMemboard = _redisCache.Get<MongoBoards>(Domain.Socioboard.Consatants.SocioboardConsts.CacheBoard + boardName);
                if (inMemboard != null)
                {
                    return inMemboard;
                }
                else
                {
                    var result = boardrepo.Find<MongoBoards>(t => t.boardName.Equals(boardName) && t.isActive == true);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    MongoBoards board = task.Result.First();
                    return board;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }
    }
}
