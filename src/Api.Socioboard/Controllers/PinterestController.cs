using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Microsoft.AspNetCore.Http;
using System.IO;
using MongoDB.Driver;
using Domain.Socioboard.Models.Mongo;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class PinterestController : Controller
    {
        public PinterestController(ILogger<PinterestController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        /// <summary>
        /// Add new Linkedin Account
        /// </summary>
        /// <param name="Code"> Code obtained after successfull authentication from pinterest. </param>
        /// <param name="groupId"> Id of the group to which account is to be added. </param>
        /// <param name="userId"> Id of the user. </param>
        /// <remarks>Add new Linkedin account.</remarks>
        /// <response code="400">Invalid Access Token.</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost("AddPinterestAccount")]
        public IActionResult AddPinterestAccount(string Code, long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.PinterestRepository.AddPinterestAccount(_appSettings.pinterestConsumerKey, _appSettings.pinterestConsumerScreatKey, _appSettings.pinterestRedirectionUrl, Code, userId, groupId, dbr, _logger, _redisCache, _appSettings);
            return Ok(ret);
        }

        [HttpPost("CreateBoard")]
        public IActionResult CreateBoard(string name, string description, string profileid, long userid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.PinterestRepository.CreateBoard(name, description, profileid, userid, _appSettings, _logger, _redisCache, dbr);
            return Ok(ret);
        }
        [HttpPost("EditBoard")]
        public IActionResult EditBoard(string name, string description, string boardId, string profileId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.PinterestRepository.EditBoard(name, description, boardId, profileId, userId, _appSettings, _logger, _redisCache, dbr);
            return Ok(ret);
        }
        [HttpPost("DeleteBoard")]
        public IActionResult DeleteBoard(string boardId, string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(profileId, _redisCache, dbr);
            string ret = Repositories.PinterestRepository.DeleteBoard(boardId, _PinterestAccount.accesstoken, _appSettings, _logger, _redisCache, dbr);
            return Ok(ret);
        }
        [HttpPost("CreateUserPins")]
        public IActionResult CreateUserPins(string pinterestUserId, long userId, string note, string boardId,string filepath ,IFormFile files)
        {
            var filename = "";
            var uploads = string.Empty;

            if (files != null)
            {

                if (files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    var tempName = Domain.Socioboard.Helpers.SBHelper.RandomString(10) + '.' + fileName.Split('.')[1];
                    filename = _env.WebRootPath + "\\upload" + $@"\{tempName}";
                    uploads = _appSettings.ApiDomain + "/api/Media/get?id=" + $@"{tempName}";
                    try
                    {
                        using (FileStream fs = System.IO.File.Create(filename))
                        {
                            files.CopyTo(fs);
                            fs.Flush();
                        }
                        filename = uploads;
                    }
                    catch (System.Exception ex)
                    {
                    }
                }
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                string ret = Repositories.PinterestRepository.CreateUserPins(pinterestUserId, userId, note, filename, boardId, _appSettings, _redisCache, _logger, dbr);
                return Ok(ret);
            }
            else
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                string ret = Repositories.PinterestRepository.CreateUserPins(pinterestUserId, userId, note, filepath, boardId, _appSettings, _redisCache, _logger, dbr);
                return Ok(ret);
            }
            return Ok("please upload image before pin");
        }

        [HttpPost("EditUserPins")]
        public IActionResult EditUserPins(string pinterestUserId, long userId, string pinId, string note, string boardId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.PinterestRepository.EditUserPins(pinterestUserId, userId, pinId, note, boardId, _appSettings, _redisCache, _logger, dbr);
            return Ok(ret);
        }
        [HttpPost("DeletUserPin")]
        public IActionResult DeletUserPin(string pinterestUserId, long userId, string pinId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.PinterestRepository.DeletUserPin(pinterestUserId, pinId, _appSettings, _redisCache, _logger, dbr);
            return Ok(ret);
        }

        [HttpGet("GetPinterestAccountProfiles")]
        public IActionResult GetPinterestAccountProfiles(long groupId)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = dbr.Find<Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Pinterest).ToList();
                string[] arrProfileId = lstGrpProfiles.Select(a => a.profileId).ToArray();
                List<Domain.Socioboard.Models.PinterestAccount> lstPinAcc = new List<Domain.Socioboard.Models.PinterestAccount>();
                lstPinAcc = dbr.Find<PinterestAccount>(t => arrProfileId.Contains(t.username) && t.isactive).ToList();
                return Ok(lstPinAcc);
            }
            catch (Exception)
            {
                return Ok(new List<Domain.Socioboard.Models.PinterestAccount>());
            }
        }

        [HttpGet("GetTopBoards")]
        public IActionResult GetTopBoards(string profileId, long userId, int skip, int take)
        {
            try
            {
                DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _env);
                BoardfeedData _BoardfeedData = new BoardfeedData();
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(profileId) && t.userid == userId).FirstOrDefault();
                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>.Sort;
                var sort = builder.Descending(t => t.createddate);
                var ret = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.pinterestUserId == _PinterestAccount.profileid, sort, skip, take);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestBoard> lstboards = task.Result;
                _BoardfeedData._PinterestAccount = _PinterestAccount;
                _BoardfeedData.lstMongoPinterestBoard = lstboards.ToList();
                return Ok(_BoardfeedData);
            }
            catch (Exception)
            {
                return Ok(new List<Domain.Socioboard.Models.Mongo.BoardfeedData>());
            }
        }

        [HttpGet("GetTopLikes")]
        public IActionResult GetTopLikes(string profileId, long userId, int skip, int take)
        {
            try
            {
                DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _env);
                UserlikesData _BoardfeedData = new UserlikesData();
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(profileId) && t.userid == userId).FirstOrDefault();
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserLikes", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>.Sort;
                var sort = builder.Descending(t => t.created_at);
                var ret = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>(t => t.pinterestUserId == _PinterestAccount.profileid, sort, skip, take);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes> lstboards = task.Result;
                _BoardfeedData._PinterestAccount = _PinterestAccount;
                _BoardfeedData.lstMongoPinterestUserLikes = lstboards.ToList();
                return Ok(_BoardfeedData);
            }
            catch (Exception)
            {
                return Ok(new List<Domain.Socioboard.Models.Mongo.UserlikesData>());
            }
        }

        [HttpGet("GetTopUserPins")]
        public IActionResult GetTopUserPins(string profileId, long userId, int skip, int take)
        {
            try
            {
                DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _env);
                UserPinData _BoardfeedData = new UserPinData();
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(profileId) && t.userid == userId).FirstOrDefault();

                MongoRepository mongorepobd = new MongoRepository("MongoPinterestBoard", _appSettings);
                var ret1 = mongorepobd.Find<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.pinterestUserId == _PinterestAccount.profileid);
                var task1 = Task.Run(async () =>
                {
                    return await ret1;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestBoard> lstboards = task1.Result;
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>.Sort;
                var sort = builder.Descending(t => t.created_at);
                var ret = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(t => t.pinterestUserId == _PinterestAccount.profileid, sort, skip, take);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins> lstpins = task.Result;
                _BoardfeedData._PinterestAccount = _PinterestAccount;
                _BoardfeedData.lstMongoPinterestUserPins = lstpins.ToList();
                _BoardfeedData.lstMongoPinterestUserBoards = lstboards.ToList();
                return Ok(_BoardfeedData);
            }
            catch (Exception)
            {
                return Ok(new List<Domain.Socioboard.Models.Mongo.BoardfeedData>());
            }
        }

        [HttpGet("GetTopBoardPins")]
        public IActionResult GetTopBoardPins(string boardId, long userId, int skip, int take)
        {
            try
            {
                MongoRepository mongorepoboard = new MongoRepository("MongoPinterestBoard", _appSettings);
                var boardret = mongorepoboard.Find<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid == boardId);
                var taskboard = Task.Run(async () =>
                {
                    return await boardret;
                });
                Domain.Socioboard.Models.Mongo.MongoPinterestBoard _MongoPinterestBoard = taskboard.Result.First();
                BoardPinData _BoardfeedData = new BoardPinData();
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>.Sort;
                var sort = builder.Descending(t => t.created_at);
                var ret = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(t => t.boardid == _MongoPinterestBoard.boardid, sort, skip, take);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins> lstpins = task.Result;
                MongoRepository mongorepobd = new MongoRepository("MongoPinterestBoard", _appSettings);
                var ret1 = mongorepobd.Find<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.pinterestUserId == lstpins.First().pinterestUserId);
                var task1 = Task.Run(async () =>
                {
                    return await ret1;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoPinterestBoard> lstboards = task1.Result;
                _BoardfeedData._MongoPinterestBoard = _MongoPinterestBoard;
                _BoardfeedData.lstMongoPinterestUserPins = lstpins.ToList();
                _BoardfeedData.lstMongoPinterestUserBoards = lstboards.ToList();
                return Ok(_BoardfeedData);
            }
            catch (Exception)
            {
                return Ok(new List<Domain.Socioboard.Models.Mongo.BoardfeedData>());
            }
        }



    }
}
