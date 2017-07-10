using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using Domain.Socioboard.ViewModels;
using Microsoft.Extensions.Logging;
//using Google.Apis.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class TaskRepository
    {

        public static Tasks AddTask(TasksViewModel _TasksViewModel, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            try
            {
                Tasks _Tasks = new Tasks();
                _Tasks.Id = ObjectId.GenerateNewId();
                _Tasks.strId = ObjectId.GenerateNewId().ToString();
                _Tasks.recipientUserId = _TasksViewModel.recipientUserId;
                _Tasks.senderUserId = _TasksViewModel.senderUserId;
                _Tasks.groupId = _TasksViewModel.groupId;
                _Tasks.readStaus = Domain.Socioboard.Enum.ReadStaus.Unread;
                _Tasks.taskMessage = _TasksViewModel.taskMessage;
                _Tasks.taskMessageImageUrl = _TasksViewModel.taskMessageImageUrl;
                _Tasks.taskStatus = Domain.Socioboard.Enum.TaskStatus.Pending;
                _Tasks.cratedOn = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                _Tasks.completeddOn = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                _Tasks.feedTableType = _TasksViewModel.feedTableType;
                _Tasks.feedTableId = _TasksViewModel.feedId;
                MongoRepository mongorepo = new MongoRepository("Tasks", _appSettings);
                mongorepo.Add<Tasks>(_Tasks);
                return _Tasks;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public static List<TaskCommentsViewModel> GetAllTasksOfUserAndGroup(Int64 recipientUserId, Int64 groupId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository _dbr)
        {
            try
            {
                List<TaskCommentsViewModel> lstTaskCommentsViewModel = new List<TaskCommentsViewModel>();
                MongoRepository taskmongorepo = new MongoRepository("Tasks", _appSettings);
                MongoRepository taskcommentmongorepo = new MongoRepository("TaskComments", _appSettings);
                var ret = taskmongorepo.Find<Tasks>(t => t.groupId == groupId && t.recipientUserId == recipientUserId && t.senderUserId == recipientUserId);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Tasks> lstTask = task.Result.ToList();
                foreach (Tasks item in lstTask)
                {
                    TaskCommentsViewModel taskCommentsViewModel = new TaskCommentsViewModel();
                    var ret1 = taskcommentmongorepo.Find<TaskComments>(t => t.taskId == item.strId);
                    var task1 = Task.Run(async () =>
                    {
                        return await ret1;
                    });
                    taskCommentsViewModel.tasks = item;
                    taskCommentsViewModel.user = _dbr.FindSingle<User>(t => t.Id == item.senderUserId);
                    IList<TaskComments> lstTaskComment = task1.Result.ToList();
                    List<TaskCommentViewModel> lstCommentViewModel = new List<TaskCommentViewModel>();
                    foreach (TaskComments item1 in lstTaskComment)
                    {
                        TaskCommentViewModel commentViewModel = new TaskCommentViewModel();
                        commentViewModel.taskComments = item1;
                        commentViewModel.user = _dbr.FindSingle<User>(t => t.Id == item1.userId);
                        lstCommentViewModel.Add(commentViewModel);
                    }

                    taskCommentsViewModel.lstTaskComments = lstCommentViewModel;
                    lstTaskCommentsViewModel.Add(taskCommentsViewModel);
                }
                return lstTaskCommentsViewModel;
            }
            catch (Exception ex)
            {
                _logger.LogError("GetAllTasksOfUserAndGroup => " + ex.Message);
                return new List<TaskCommentsViewModel>();
            }
        }
        public static List<TaskCommentsViewModel> GetAllCompletedTasksOfUserAndGroup(Int64 recipientUserId, Int64 groupId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository _dbr)
        {
            try
            {
                List<TaskCommentsViewModel> lstTaskCommentsViewModel = new List<TaskCommentsViewModel>();
                MongoRepository taskmongorepo = new MongoRepository("Tasks", _appSettings);
                MongoRepository taskcommentmongorepo = new MongoRepository("TaskComments", _appSettings);
                var ret = taskmongorepo.Find<Tasks>(t => t.groupId == groupId && t.recipientUserId == recipientUserId && t.taskStatus == Domain.Socioboard.Enum.TaskStatus.Completed);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Tasks> lstTask = task.Result.ToList();
                foreach (Tasks item in lstTask)
                {
                    TaskCommentsViewModel taskCommentsViewModel = new TaskCommentsViewModel();
                    var ret1 = taskcommentmongorepo.Find<TaskComments>(t => t.taskId == item.strId);
                    var task1 = Task.Run(async () =>
                    {
                        return await ret1;
                    });
                    taskCommentsViewModel.tasks = item;
                    taskCommentsViewModel.user = _dbr.FindSingle<User>(t => t.Id == item.senderUserId);
                    IList<TaskComments> lstTaskComment = task1.Result.ToList();
                    List<TaskCommentViewModel> lstCommentViewModel = new List<TaskCommentViewModel>();
                    foreach (TaskComments item1 in lstTaskComment)
                    {
                        TaskCommentViewModel commentViewModel = new TaskCommentViewModel();
                        commentViewModel.taskComments = item1;
                        commentViewModel.user = _dbr.FindSingle<User>(t => t.Id == item1.userId);
                        lstCommentViewModel.Add(commentViewModel);
                    }

                    taskCommentsViewModel.lstTaskComments = lstCommentViewModel;
                    lstTaskCommentsViewModel.Add(taskCommentsViewModel);
                }
                return lstTaskCommentsViewModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return new List<TaskCommentsViewModel>();
            }
        }
        public static List<TaskCommentsViewModel> GetAllPendingTasksOfUserAndGroup(Int64 recipientUserId, Int64 groupId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository _dbr)
        {
            try
            {
                List<TaskCommentsViewModel> lstTaskCommentsViewModel = new List<TaskCommentsViewModel>();
                MongoRepository taskmongorepo = new MongoRepository("Tasks", _appSettings);
                MongoRepository taskcommentmongorepo = new MongoRepository("TaskComments", _appSettings);
                var ret = taskmongorepo.Find<Tasks>(t => t.groupId == groupId && t.recipientUserId == recipientUserId && t.taskStatus == Domain.Socioboard.Enum.TaskStatus.Pending);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Tasks> lstTask = task.Result.ToList();
                foreach (Tasks item in lstTask)
                {
                    TaskCommentsViewModel taskCommentsViewModel = new TaskCommentsViewModel();
                    var ret1 = taskcommentmongorepo.Find<TaskComments>(t => t.taskId == item.strId);
                    var task1 = Task.Run(async () =>
                    {
                        return await ret1;
                    });
                    taskCommentsViewModel.tasks = item;
                    taskCommentsViewModel.user = _dbr.FindSingle<User>(t => t.Id == item.senderUserId);
                    IList<TaskComments> lstTaskComment = task1.Result.ToList();
                    List<TaskCommentViewModel> lstCommentViewModel = new List<TaskCommentViewModel>();
                    foreach (TaskComments item1 in lstTaskComment)
                    {
                        TaskCommentViewModel commentViewModel = new TaskCommentViewModel();
                        commentViewModel.taskComments = item1;
                        commentViewModel.user = _dbr.FindSingle<User>(t => t.Id == item1.userId);
                        lstCommentViewModel.Add(commentViewModel);
                    }

                    taskCommentsViewModel.lstTaskComments = lstCommentViewModel;
                    lstTaskCommentsViewModel.Add(taskCommentsViewModel);
                }
                return lstTaskCommentsViewModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return new List<TaskCommentsViewModel>();
            }
        }

        public static TaskComments AddTaskComment(Int64 userId, string taskId, string commentText, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            try
            {
                TaskComments _TaskComments = new TaskComments();
                _TaskComments.Id = ObjectId.GenerateNewId();
                _TaskComments.strId = ObjectId.GenerateNewId().ToString();
                _TaskComments.userId = userId;
                _TaskComments.taskId = taskId;
                _TaskComments.commentText = commentText;
                _TaskComments.createdOn = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                MongoRepository mongorepo = new MongoRepository("TaskComments", _appSettings);
                mongorepo.Add<TaskComments>(_TaskComments);
                return _TaskComments;
            }
            catch (Exception)
            {
                throw;
            }
        }


        public static void MarkTaskCompleted(string taskId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository taskmongorepo = new MongoRepository("Tasks", _appSettings);
                var ret =  taskmongorepo.Find<Tasks>(t => t.strId == taskId);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                Tasks selectedTask = task.Result.ToList().FirstOrDefault();
                selectedTask.completeddOn = (long)Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                selectedTask.taskStatus = Domain.Socioboard.Enum.TaskStatus.Completed;
                //taskmongorepo.UpdateReplace(selectedTask, t=>t.strId == taskId );

                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", selectedTask.strId);
                var update = Builders<BsonDocument>.Update.Set("completeddOn", selectedTask.completeddOn).Set("taskStatus", selectedTask.taskStatus);
                taskmongorepo.Update<Tasks>(update, filter);


            }
            catch (Exception)
            {
                throw;
            }
        }

        public static void DeleteTask(string taskId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository taskmongorepo = new MongoRepository("Tasks", _appSettings);
                MongoRepository taskcommentmongorepo = new MongoRepository("TaskComments", _appSettings);
                taskmongorepo.Delete<Tasks>(t => t.strId == taskId);
                taskcommentmongorepo.DeleteMany<TaskComments>(t => t.taskId == taskId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static void DeleteTaskComment(string taskCommnetId, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {

            try
            {
                MongoRepository taskcommentmongorepo = new MongoRepository("TaskComments", _appSettings);
                taskcommentmongorepo.DeleteMany<TaskComments>(t => t.strId == taskCommnetId);
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
