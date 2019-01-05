using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Api.Socioboard.Repositories;
using Domain.Socioboard.ViewModels;
using Microsoft.AspNetCore.Cors;
using System.Text.RegularExpressions;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class TaskController : Controller
    {

        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;
        public TaskController(ILogger<TaskController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _env = env;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="tasksViewModel"></param>
        /// <returns></returns>
        [HttpPost("AddTask")]
        public IActionResult AddTask(TasksViewModel tasksViewModel)
        {

                try
                {
                Domain.Socioboard.Models.Mongo.Tasks _task=    TaskRepository.AddTask(tasksViewModel, _logger, _redisCache, _appSettings);
                string postmessage = "";
                string[] updatedmessgae = Regex.Split(tasksViewModel.taskComment, "<br>");

                foreach (var item in updatedmessgae)
                {
                    if (!string.IsNullOrEmpty(item))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + item.Replace("hhh", "#");
                        }
                        if (item.Contains("nnn"))
                        {
                            postmessage = postmessage.Replace("nnn", "&");
                        }
                        if (item.Contains("ppp"))
                        {
                            postmessage = postmessage.Replace("ppp", "+");
                        }
                        if (item.Contains("jjj"))
                        {
                            postmessage = postmessage.Replace("jjj", "-+");
                        }
                        else
                        {
                            postmessage = postmessage + "\n\r" + item;
                        }
                    }
                }
                tasksViewModel.taskComment = postmessage;
                TaskRepository.AddTaskComment(_task.senderUserId, _task.strId, tasksViewModel.taskComment, _logger, _redisCache, _appSettings);
                return Ok("task added");
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
        }

        

        [HttpPost("MarkTaskCompleted")]
        public IActionResult MarkTaskCompleted(string taskId)
        {
            try
            {
                TaskRepository.MarkTaskCompleted(taskId, _logger, _redisCache, _appSettings);
                return Ok("Marked");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="commentViewModel"></param>
        /// <returns></returns>
        [HttpPost("AddComment")]
        public IActionResult AddComment(CommentViewModel commentViewModel)
        {
            string postmessage = "";
            string[] updatedmessgae = Regex.Split(commentViewModel.commentText, "<br>");

            foreach (var item in updatedmessgae)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.Contains("hhh"))
                    {
                        postmessage = postmessage + item.Replace("hhh", "#");
                    }
                    if (item.Contains("nnn"))
                    {
                        postmessage = postmessage.Replace("nnn", "&");
                    }
                    if (item.Contains("ppp"))
                    {
                        postmessage = postmessage.Replace("ppp", "+");
                    }
                    if (item.Contains("jjj"))
                    {
                        postmessage = postmessage.Replace("jjj", "-+");
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r";
                        if(postmessage== "\n\r")
                        {
                            postmessage = "\n\r" + item;
                        }
                    }



                }
            }
            commentViewModel.commentText = postmessage;


            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            User user = dbr.FindSingle<User>(t => t.Id == commentViewModel.userId);
            if (user != null)
            {
                try
                {
                    return Ok(TaskRepository.AddTaskComment(commentViewModel.userId, commentViewModel.taskId, commentViewModel.commentText, _logger, _redisCache, _appSettings));
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            else {
                return NotFound();
            }
        }

        [HttpPost("DeleteTask")]
        public IActionResult DeleteTask(string taskId)
        {
            try
            {
                TaskRepository.DeleteTask(taskId, _logger, _redisCache, _appSettings);
                return Ok("deleted");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("DeleteComment")]
        public IActionResult DeleteComment(string commentId)
        {
            try
            {
                TaskRepository.DeleteTaskComment(commentId, _logger, _redisCache, _appSettings);
                return Ok("deleted");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetAllTasksOfUserAndGroup")]
        public IActionResult GetAllTasksOfUserAndGroup(Int64 userId, Int64 groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            return Ok(TaskRepository.GetAllTasksOfUserAndGroup(userId, groupId,_logger,_redisCache,_appSettings, dbr));
        }
        [HttpGet("GetAllCompletedTasksOfUserAndGroup")]
        public IActionResult GetAllCompletedTasksOfUserAndGroup(Int64 userId, Int64 groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            return Ok(TaskRepository.GetAllCompletedTasksOfUserAndGroup(userId, groupId, _logger, _redisCache, _appSettings, dbr));
        }
        [HttpGet("GetAllPendingTasksOfUserAndGroup")]
        public IActionResult GetAllPendingTasksOfUserAndGroup(Int64 userId, Int64 groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            return Ok(TaskRepository.GetAllPendingTasksOfUserAndGroup(userId, groupId, _logger, _redisCache, _appSettings, dbr));
        }

    }
}
