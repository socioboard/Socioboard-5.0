using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using System.Xml;
using System.Text.RegularExpressions;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using Domain.Socioboard.Models;
using MongoDB.Bson;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class NotificationsController : Controller
    {
        public NotificationsController(ILogger<NotificationsController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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


        [HttpGet("FindNotifications")]
        public IActionResult FindNotifications(long userId)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<ScheduledMessage> lstschedulemsg = new List<ScheduledMessage>();
                List<Notifications> lstnotifications = dbr.Find<Notifications>(t => t.UserId == userId && t.ReadOrUnread == "Unread").ToList();
                if (lstnotifications != null)
                {
                    foreach (Notifications notify in lstnotifications)
                    {
                        ScheduledMessage schedulemsg = dbr.Single<ScheduledMessage>(t => t.id == notify.MsgId && t.userId==userId);
                        if (schedulemsg != null)
                        {
                            lstschedulemsg.Add(schedulemsg);
                        }
                    }
                    if (lstschedulemsg != null)
                    {
                        return Ok(lstschedulemsg);
                    }
                    else
                    {
                        return NotFound();
                    }
                }
                else
                {
                    return NotFound();
                }

            }
            catch (Exception ex)
            {
                return NotFound();
            }
           

        }

        [HttpGet("FindAllNotifications")]
        public IActionResult FindAllNotifications(long userId, int skip, int count)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<ScheduledMessage> lstschedulemsg = new List<ScheduledMessage>();
                List<Notifications> lstnotifications = dbr.FindWithRangeDesct<Notifications>(t => t.UserId == userId, skip, count, t=>t.Id).ToList();
                foreach (Notifications notify in lstnotifications)
                {
                    ScheduledMessage schedulemsg = dbr.Single<ScheduledMessage>(t => t.id == notify.MsgId && t.userId==userId);
                    if(schedulemsg !=null)
                    {
                        lstschedulemsg.Add(schedulemsg);
                    }
                   
                }
                if (lstschedulemsg != null)
                {
                    return Ok(lstschedulemsg);
                }
                else
                {
                    return NotFound();
                }
            }
            catch(Exception ex)
            {
                return NotFound();
            }
         

        }

        [HttpGet("UpdateNotifications")]
        public IActionResult UpdateNotifications(long userId)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Notifications> lstnotifications = dbr.Find<Notifications>(t => t.UserId == userId && t.ReadOrUnread == "Unread").ToList();
                foreach (Notifications notify in lstnotifications)
                {
                    notify.ReadOrUnread = "Read";
                    int status = dbr.Update<Notifications>(notify);
                }
                //int status = dbr.UpdateAll<Notifications>(lstnotifications);
                if (lstnotifications != null)
                {
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch(Exception ex)
            {
                return NotFound();
            }
            

        }


        [HttpGet("ChangePasswordDetail")]
        public IActionResult ChangePasswordDetail(long userId)
        {
            try
            {              
                MongoRepository mongorepo = new MongoRepository("FacebookPasswordChangeUserDetail", _appSettings);
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Domain.Socioboard.Models.Facebookaccounts> datalst = dbr.Find<Facebookaccounts>(t => t.UserId == userId).ToList();
              //  Domain.Socioboard.Models.User userDet = dbr.FindSingle<User>(t => t.Id == userId);
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(t => t.userId == userId && t.status==false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                int count = task.Result.Count;
                IList<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail> lstfbpasschange = task.Result;
                List<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail> lstfab = new List<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>();
                foreach(var lstfb in lstfbpasschange)
                {
                    if (lstfb.message.Contains("password"))
                    {
                        string str = lstfb.message;
                        try
                        {
                            lstfab.Add(lstfb);
                        }
                        catch (Exception ex)
                        {

                        }
                        
                    }
                    
                }
                if (count>0)
                {
                    return Ok(lstfab);
                }
                else
                {
                    return Ok("No Data");
                }
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }

        [HttpGet("ChangeStatus")]
        public IActionResult ChangeStatus(string profileId)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("FacebookPasswordChangeUserDetail", _appSettings);
                //  DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                // List<Domain.Socioboard.Models.Facebookaccounts> datalst = dbr.Find<Facebookaccounts>(t => t.UserId == userId).ToList();
                //  Domain.Socioboard.Models.User userDet = dbr.FindSingle<User>(t => t.Id == userId);
               // Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail lstchanges = new Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail();
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(t => t.profileId == profileId && t.status == false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                int count = task.Result.Count;
                if (count > 0)
                {
                   
                    var builders = Builders<BsonDocument>.Filter;
                    FilterDefinition<BsonDocument> filter = builders.Eq("profileId", profileId);
                    var update = Builders<BsonDocument>.Update.Set("status", true);
                    mongorepo.Update<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(update, filter);
                }
            }
            catch (Exception ex)
            {

            }
            return Ok("success");
        }

        [HttpGet("getfbchangeprofile")]
        public IActionResult getfbchangeprofile(long userId)
        {
            MongoRepository mongorepo = new MongoRepository("FacebookPasswordChangeUserDetail", _appSettings);
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Facebookaccounts> datalst = dbr.Find<Facebookaccounts>(t => t.UserId == userId).ToList();
            Domain.Socioboard.Models.User userDet = dbr.FindSingle<User>(t => t.Id == userId);
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(t => t.userId == userId && t.status==false);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            int count = task.Result.Count;
            IList<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail> lstfbpasschange = task.Result;
            if (count>0)
            {
                return Ok(lstfbpasschange);
            }
            else
            {
                return NotFound();
            }
        }
    }
}
