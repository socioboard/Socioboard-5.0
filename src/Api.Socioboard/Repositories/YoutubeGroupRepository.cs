<<<<<<< HEAD
﻿using Api.Socioboard.Model;
using Domain.Socioboard.Helpers;
=======
﻿using Domain.Socioboard.Helpers;
>>>>>>> cf50914d88f0f1198bb66514f669b54901da952e
using Domain.Socioboard.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class YoutubeGroupRepository
    {
        public static Domain.Socioboard.Models.YoutubeGroupInvite InviteGroupMember(Int64 userId, string emailId, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            YoutubeGroupInvite _objGrp = new YoutubeGroupInvite();
            IList<Domain.Socioboard.Models.User> lstUser = new List<User>();
            IList<Domain.Socioboard.Models.YoutubeGroupInvite> lstGrpUser = new List<YoutubeGroupInvite>();
            Thread getSbUser = new Thread(() =>
            {
                lstUser = lstUserSB(userId, emailId, dbr);
            }); getSbUser.Start();
            Thread getYtGrpUser = new Thread(() =>
            {
                lstGrpUser = lstGrpUserYt(userId, dbr);
            }); getYtGrpUser.Start();

            getSbUser.Join();
            getYtGrpUser.Join();

            Domain.Socioboard.Models.User _SBUser = lstUser.FirstOrDefault(t => t.Id == userId);
            Domain.Socioboard.Models.User _SBUserInvite = lstUser.FirstOrDefault(t => t.EmailId == emailId);

            Domain.Socioboard.Models.YoutubeGroupInvite _grpOwner = lstGrpUser.FirstOrDefault(t => t.UserId == userId);
            Domain.Socioboard.Models.YoutubeGroupInvite _grpInvMem = lstGrpUser.FirstOrDefault(t => t.SBEmailId == emailId);

            if (_grpOwner == null)
            {
                _objGrp.UserId = _SBUser.Id;
                _objGrp.Owner = true;
                _objGrp.OwnerName = _SBUser.FirstName + " " + _SBUser.LastName;
                _objGrp.Active = true;
                _objGrp.SBUserName = _SBUser.FirstName + " " + _SBUser.LastName;
                _objGrp.SBEmailId = _SBUser.EmailId;
                _objGrp.OwnerEmailid = _SBUser.EmailId;
                if (_SBUser.ProfilePicUrl == null || _SBUser.ProfilePicUrl == "")
                {
                    _objGrp.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                }
                else
                {
                    _objGrp.SBProfilePic = _SBUser.ProfilePicUrl;
                }
                _objGrp.AccessSBUserId = userId;
                dbr.Add(_objGrp);
            }

            if (_SBUserInvite != null && _grpInvMem == null)
            {
                _objGrp.UserId = _SBUserInvite.Id;
                _objGrp.Owner = false;
                _objGrp.OwnerName = _SBUser.FirstName + " " + _SBUser.LastName;
                _objGrp.OwnerEmailid = _SBUser.EmailId;
                _objGrp.Active = false;
                _objGrp.SBUserName = _SBUserInvite.FirstName + " " + _SBUserInvite.LastName;
                _objGrp.SBEmailId = _SBUserInvite.EmailId;
                if (_SBUserInvite.ProfilePicUrl == null || _SBUserInvite.ProfilePicUrl == "")
                {
                    _objGrp.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                }
                else
                {
                    _objGrp.SBProfilePic = _SBUserInvite.ProfilePicUrl;
                }
                _objGrp.AccessSBUserId = userId;
                _objGrp.EmailValidationToken = SBHelper.RandomString(35);
                dbr.Add(_objGrp);
                return _objGrp;

            }
            else if (_SBUserInvite == null && _grpInvMem==null)
            {
                _objGrp.UserId = 0;
                _objGrp.Owner = false;
                _objGrp.OwnerName = _SBUser.FirstName + " " + _SBUser.LastName;
                _objGrp.OwnerEmailid = _SBUser.EmailId;
                _objGrp.Active = false;
                _objGrp.SBUserName = "New User";
                _objGrp.SBEmailId = emailId;
                _objGrp.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                _objGrp.EmailValidationToken = SBHelper.RandomString(35);
                _objGrp.AccessSBUserId = userId;
                dbr.Add(_objGrp);
                return _objGrp;

            }

            else if (_grpInvMem.Active == false)
            {
                return _grpInvMem;
<<<<<<< HEAD
=======
            }
            else
            {
                return null;
>>>>>>> cf50914d88f0f1198bb66514f669b54901da952e
            }
            else
            {
                return null;
            }
        }

        public static List<Domain.Socioboard.Models.User> lstUserSB(Int64 userId, string emailId, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.User> lstUser = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == userId || t.EmailId == emailId).ToList();
            return lstUser;
        }

        public static List<Domain.Socioboard.Models.YoutubeGroupInvite> lstGrpUserYt(Int64 userId, Model.DatabaseRepository dbr)
        {
            List<Domain.Socioboard.Models.YoutubeGroupInvite> lstGrpUser = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.AccessSBUserId == userId).ToList();
            return lstGrpUser;
        }


        public static IList<Domain.Socioboard.Models.YoutubeGroupInvite> GetGroupMembers(Int64 userId, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            IList<Domain.Socioboard.Models.YoutubeGroupInvite> _lstMembers = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.AccessSBUserId == userId);
            return _lstMembers;
        }
        public static IList<Domain.Socioboard.Models.Groupprofiles> GetYtGroupChannel(Int64 userId, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            IList<Domain.Socioboard.Models.YoutubeGroupInvite> _lstMembers = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.UserId == userId && t.AccessSBUserId != userId && t.Active == true);
            List<Int64> userOwnerIdss = _lstMembers.Select(t => t.AccessSBUserId).ToList();
            IList<Domain.Socioboard.Models.Groupprofiles> _lstchannelsss = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => userOwnerIdss.Contains(t.profileOwnerId) && t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube);
            return _lstchannelsss;
        }
        public static IList<Domain.Socioboard.Models.YoutubeGroupInvite> GetYtYourGroups(Int64 userId, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            IList<Domain.Socioboard.Models.YoutubeGroupInvite> _lstMembers = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.UserId == userId && t.AccessSBUserId != userId);
            return _lstMembers;
        }


        public static string ValidateEmail(string Token, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.YoutubeGroupInvite _lstMembers = dbr.Single<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.EmailValidationToken == Token);

            if (_lstMembers.SBUserName == "New User")
            {
                Domain.Socioboard.Models.User tempUser = dbr.Single<Domain.Socioboard.Models.User>(t => t.EmailId == _lstMembers.SBEmailId);
                if (tempUser != null)
                {
                    _lstMembers.SBEmailId = tempUser.EmailId;
                    if (tempUser.ProfilePicUrl == "" || tempUser.ProfilePicUrl == null)
                    {
                    }
                    else
                    {
                        _lstMembers.SBProfilePic = tempUser.ProfilePicUrl;
                    }
                    _lstMembers.SBUserName = tempUser.FirstName + " " + tempUser.LastName;
                    _lstMembers.UserId = tempUser.Id;
                    _lstMembers.SBEmailId = tempUser.EmailId;
                    _lstMembers.Active = true;
                    dbr.Update(_lstMembers);
                }
            }
            else
            {
                _lstMembers.Active = true;
                dbr.Update(_lstMembers);
            }
<<<<<<< HEAD

            return "200";
        }


        public static void AssignTskComment(string memberEmail, string memberName, long memberId, long ownerId, string commentId, string commentType, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository mongorepo;
            if (commentType == "main")
            {
                mongorepo = new MongoRepository("YoutubeVideosComments", settings);
            }
            else
            {
                mongorepo = new MongoRepository("YoutubeVideosCommentsReply", settings);
            }
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", commentId);
                var update = Builders<BsonDocument>.Update.Set("sbGrpMemberEmail", memberEmail).Set("sbGrpMemberName", memberName).Set("sbGrpMemberUserid", memberId).Set("sbGrpAccessOwnerUserid", ownerId).Set("sbGrpTaskAssign", true).Set("review", false);
                mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(update, filter);
            }
            catch { }
        }


        public static void RemoveTskComment(string commentId, string commentType, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository mongorepo;
            if (commentType == "main")
            {
                mongorepo = new MongoRepository("YoutubeVideosComments", settings);
            }
            else
            {
                mongorepo = new MongoRepository("YoutubeVideosCommentsReply", settings);
            }
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", commentId);
                var update = Builders<BsonDocument>.Update.Set("sbGrpTaskAssign", false).Set("review", false);
                mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(update, filter);
            }
            catch { }
        }

        //Delete youtube group member
        public static void DeleteMember(Int64 id, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.YoutubeGroupInvite memberObj = dbr.Single<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.Id == id);
            new Thread(delegate ()
            {
                deleteTnRParentComment(memberObj.AccessSBUserId, memberObj.UserId, settings);
            }).Start();
            new Thread(delegate ()
            {
                deleteTnRChildComment(memberObj.AccessSBUserId, memberObj.UserId, settings);
            }).Start();
            dbr.Delete(memberObj);
        }

        public static void deleteTnRParentComment(Int64 ownerIdSB, Int64 memberIdSB, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("YoutubeVideosComments", settings);
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.sbGrpAccessOwnerUserid == ownerIdSB && t.sbGrpMemberUserid == memberIdSB);
            var task = Task.Run(async () =>
            {
                return await result;
            });

            IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstyoutubeParentComment = task.Result;
            foreach (var items in lstyoutubeParentComment)
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", items.commentId);
                var update = Builders<BsonDocument>.Update.Set("sbGrpTaskAssign", false).Set("review", false);
                mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(update, filter);
            }
        }
        public static void deleteTnRChildComment(Int64 ownerIdSB, Int64 memberIdSB, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("YoutubeVideosCommentsReply", settings);
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.sbGrpAccessOwnerUserid == ownerIdSB && t.sbGrpMemberUserid == memberIdSB);
            var task = Task.Run(async () =>
            {
                return await result;
            });

            IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstyoutubeParentComment = task.Result;
            foreach (var items in lstyoutubeParentComment)
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", items.commentId);
                var update = Builders<BsonDocument>.Update.Set("sbGrpTaskAssign", false).Set("review", false);
                mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(update, filter);
            }
=======

            return "200";
>>>>>>> cf50914d88f0f1198bb66514f669b54901da952e
        }
    }
}
