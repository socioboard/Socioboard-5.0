using Api.Socioboard.Model;
using Domain.Socioboard.Models;
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
        public async Task<string> CreateBoard(string boardName, string twitterHashTag, string instagramHashTag, string gplusHashTag, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger, DatabaseRepository dbr)
        {

            IList<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
            try
            {
                boards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(boardName.ToLower()));
            }
            catch (Exception e)
            {
            }
            if (boards == null || boards.Count() == 0)
            {
                Domain.Socioboard.Models.MongoBoards board = new Domain.Socioboard.Models.MongoBoards();
                //companyprofiles.UserId = UserId;
                board.isActive =  Domain.Socioboard.Enum.boardStatus.active;
                board.boardName = boardName.ToLower();
                board.createDate = DateTime.UtcNow;
                board.userId = userId;
                board.trendingtype = Domain.Socioboard.Enum.TrendingType.user;
                board.boardId = Guid.NewGuid().ToString();
                if (board.boardName.ToLower().Contains(" "))
                {
                    board.TempboardName = board.boardName.Replace(" ", "_");
                }
                else
                {
                    board.TempboardName= boardName.ToLower();
                }
                if (!string.IsNullOrEmpty(twitterHashTag) && twitterHashTag != "undefined")
                {
                    TwitterRepository tr = new TwitterRepository();
                    board.twitterHashTag = await tr.AddTwitterHashTag(twitterHashTag, board.boardId, _redisCache, settings, _logger);
                }
                if (!string.IsNullOrEmpty(instagramHashTag) && instagramHashTag != "undefined")
                {
                    InstagramRepository instRepo = new InstagramRepository();
                    board.instagramHashTag = await instRepo.AddInstagramHashTag(instagramHashTag, board.boardId, _redisCache, settings, _logger);
                }
                if (!string.IsNullOrEmpty(gplusHashTag) && gplusHashTag != "undefined")
                {
                    GplusRepository gplusRepo = new GplusRepository();
                    board.gplusHashTag = await gplusRepo.AddGplusHashTag(gplusHashTag, board.boardId, _redisCache, settings, _logger);
                }

                dbr.Add<Domain.Socioboard.Models.MongoBoards>(board);
                return "successfulyy added.";
            }
            else
            {
                return "board Exist";
            }
        }

        public static Domain.Socioboard.Models.MongoBoards getBoard(long boardId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger, DatabaseRepository dbr)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", _appSettings);
            try
            {
                Domain.Socioboard.Models.MongoBoards inMemboard = _redisCache.Get<Domain.Socioboard.Models.MongoBoards>(Domain.Socioboard.Consatants.SocioboardConsts.CacheBoard + boardId);
                if (inMemboard != null)
                {
                    return inMemboard;
                }
                else
                {
                    Domain.Socioboard.Models.MongoBoards board = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.id.Equals(boardId)).First();
                    return board;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }



        public static Domain.Socioboard.Models.MongoBoards getBoardByName(string boardName, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger,DatabaseRepository dbr)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", _appSettings);
            try
            {
                Domain.Socioboard.Models.MongoBoards inMemboard = _redisCache.Get<Domain.Socioboard.Models.MongoBoards>(Domain.Socioboard.Consatants.SocioboardConsts.CacheBoard + boardName);
                if (inMemboard != null)
                {
                    return inMemboard;
                }
                else
                {
                    Domain.Socioboard.Models.MongoBoards board =  dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(boardName)).First();
                    return board;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }
        public static Domain.Socioboard.Models.MongoBoards getBoardFeedsByName(string boardName, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger, DatabaseRepository dbr)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoards", _appSettings);
            try
            {
                Domain.Socioboard.Models.MongoBoards inMemboard = _redisCache.Get<Domain.Socioboard.Models.MongoBoards>(Domain.Socioboard.Consatants.SocioboardConsts.CacheBoard + boardName);
                if (inMemboard != null)
                {
                    return inMemboard;
                }
                else
                {
                    Domain.Socioboard.Models.MongoBoards board = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardId.Equals(boardName)).First();
                    return board;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.MongoBoards> getTopTrending(Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger,DatabaseRepository dbr)
        {
            try
            {
                DateTime fromTime = DateTime.UtcNow.AddMinutes(-DateTime.UtcNow.Minute);
                DateTime toTime = DateTime.UtcNow.AddMinutes(-DateTime.UtcNow.Minute).AddHours(-24);
                List<MongoBoards> lstmongo = dbr.Find<MongoBoards>(t => (t.trendingtype == Domain.Socioboard.Enum.TrendingType.facebook || t.trendingtype == Domain.Socioboard.Enum.TrendingType.twitter) && t.isActive == Domain.Socioboard.Enum.boardStatus.active && t.createDate.Date >= toTime.Date && t.createDate.Date <= fromTime.Date && t.userId==0).ToList();
                lstmongo = lstmongo.OrderByDescending(t => t.createDate).ToList();
                return lstmongo;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }
        public static List<Domain.Socioboard.Models.MongoBoards> getweeklyTrending(Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger, DatabaseRepository dbr)
        {
            try
            {
                DateTime fromTime = DateTime.UtcNow.AddDays(-1);
                DateTime toTime = DateTime.UtcNow.AddDays(-7);
                List<MongoBoards> lstmongo = dbr.Find<MongoBoards>(t => (t.trendingtype == Domain.Socioboard.Enum.TrendingType.facebook || t.trendingtype == Domain.Socioboard.Enum.TrendingType.twitter) && t.isActive == Domain.Socioboard.Enum.boardStatus.active && t.createDate.Date >= toTime.Date && t.createDate.Date <= fromTime.Date && t.userId == 0).ToList();
                lstmongo = lstmongo.OrderByDescending(t => t.createDate).ToList();
                return lstmongo;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.MongoBoards> getMonthlyTrending(Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger, DatabaseRepository dbr)
        {
            try
            {
                DateTime fromTime = DateTime.UtcNow.AddDays(-1);
                DateTime toTime = DateTime.UtcNow.AddDays(-30);
                List<MongoBoards> lstmongo = dbr.Find<MongoBoards>(t => (t.trendingtype == Domain.Socioboard.Enum.TrendingType.facebook || t.trendingtype == Domain.Socioboard.Enum.TrendingType.twitter) && t.isActive == Domain.Socioboard.Enum.boardStatus.active && t.createDate.Date >= toTime.Date && t.createDate.Date <= fromTime.Date && t.userId == 0).ToList();
                lstmongo = lstmongo.OrderByDescending(t => t.createDate).ToList();
                return lstmongo;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.MongoBoards> getyearlyTrending(Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger, DatabaseRepository dbr)
        {
            try
            {
                DateTime fromTime = DateTime.UtcNow.AddDays(-1);
                DateTime toTime = DateTime.UtcNow.AddDays(-365);
                List<MongoBoards> lstmongo = dbr.Find<MongoBoards>(t => (t.trendingtype == Domain.Socioboard.Enum.TrendingType.facebook || t.trendingtype == Domain.Socioboard.Enum.TrendingType.twitter) && t.isActive == Domain.Socioboard.Enum.boardStatus.active && t.createDate.Date >= toTime.Date && t.createDate.Date <= fromTime.Date && t.userId == 0).ToList();
                lstmongo = lstmongo.OrderByDescending(t => t.createDate).ToList();
                return lstmongo;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }
        }

    }
}
