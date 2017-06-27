using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Pinterest.Board;
using Socioboard.Pinterest.User;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace SocioboardDataServices.Pinterest
{
    public class Pinterestfeeds
    {
        public static void UpdatePinterestFeeds(Domain.Socioboard.Models.PinterestAccount _pinterestAcc)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> _grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(_pinterestAcc.username)).ToList();
            User pinUser = new User();
            string userInfor = pinUser.UserInfo(_pinterestAcc.accesstoken);
            JObject profile = JObject.Parse(userInfor);
            try
            {
                _pinterestAcc.accesstoken = _pinterestAcc.accesstoken;
            }
            catch (Exception ex)
            {

            }
            try
            {
                _pinterestAcc.accounttype = profile["data"]["account_type"].ToString();
            }
            catch (Exception ex)
            {
            }
            try
            {
                _pinterestAcc.bio = profile["data"]["bio"].ToString();
            }
            catch (Exception ex)
            {

            }
            try
            {
                _pinterestAcc.boardscount = Convert.ToInt32(profile["data"]["counts"]["boards"].ToString());
            }
            catch (Exception ex)
            {

            }
            try
            {
                _pinterestAcc.firstname = profile["data"]["first_name"].ToString();
            }
            catch (Exception ex)
            {

            }
            try
            {
                _pinterestAcc.followerscount = Convert.ToInt32(profile["data"]["counts"]["followers"].ToString());
            }
            catch (Exception ex)
            {
            }
            try
            {
                _pinterestAcc.followingcount = Convert.ToInt32(profile["data"]["counts"]["following"].ToString());
            }
            catch (Exception ex)
            {

            }
            _pinterestAcc.isactive = true;
            try
            {
                _pinterestAcc.lastname = profile["data"]["last_name"].ToString();
            }
            catch (Exception ex)
            {

            }
            _pinterestAcc.lastupdate = DateTime.UtcNow;
            try
            {
                _pinterestAcc.likescount = Convert.ToInt32(profile["data"]["counts"]["likes"].ToString());
            }
            catch (Exception ex)
            {

            }
            try
            {
                _pinterestAcc.pinscount = Convert.ToInt32(profile["data"]["counts"]["pins"].ToString());
            }
            catch (Exception ex)
            {
            }
            try
            {
                _pinterestAcc.profileid = profile["data"]["id"].ToString();
            }
            catch (Exception ex)
            {
            }
            try
            {
                _pinterestAcc.profileimgaeurl = profile["data"]["image"]["60x60"]["url"].ToString();
                _grpProfile.Select(s => { s.profilePic = profile["data"]["image"]["60x60"]["url"].ToString(); return s; }).ToList();
            }
            catch (Exception ex)
            {
            }
            try
            {
                _pinterestAcc.url = profile["data"]["url"].ToString();
            }
            catch (Exception ex)
            {
            }
            _pinterestAcc.userid = _pinterestAcc.userid;
            try
            {
                _pinterestAcc.username = profile["data"]["username"].ToString();
                _grpProfile.Select(s => { s.profileId = profile["data"]["username"].ToString(); return s; }).ToList();
            }
            catch (Exception ex)
            {
            }
            foreach (var item_grpProfile in _grpProfile)
            {
                dbr.Update<Domain.Socioboard.Models.Groupprofiles>(item_grpProfile);
            }
            dbr.Update<Domain.Socioboard.Models.PinterestAccount>(_pinterestAcc);
            //new Thread(delegate ()
            //{
                GetUserBoards(_pinterestAcc.profileid, _pinterestAcc.userid, _pinterestAcc.accesstoken);
                GetUserfolloweings(_pinterestAcc.profileid, _pinterestAcc.userid, _pinterestAcc.accesstoken);
                GetUserfollowers(_pinterestAcc.profileid, _pinterestAcc.userid, _pinterestAcc.accesstoken);
                GetUserLikes(_pinterestAcc.profileid, _pinterestAcc.userid, _pinterestAcc.accesstoken);
                GetUserPins(_pinterestAcc.profileid, _pinterestAcc.userid, _pinterestAcc.accesstoken);
            //}).Start();
        }
        public static void GetUserBoards(string pinterestUserId, long userId, string AccessToken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard");

                User pinUser = new User();
                string boards = pinUser.UserBoardInfo(AccessToken);
                JObject boardsData = JObject.Parse(boards);
                dynamic board_data = boardsData["data"];
                foreach (var item in board_data)
                {
                    MongoPinterestBoard _MongoPinterestBoard = new MongoPinterestBoard();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.boardid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.boardname = item["name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.boardurl = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.collaboratorscount = item["counts"]["collaborators"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.createddate = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.description = item["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.followerscount = item["counts"]["followers"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.imageurl = item["image"]["60x60"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.pinscount = item["counts"]["pins"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid.Equals(_MongoPinterestBoard.boardid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (lstPinterestBoard < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>.Update.Set(t => t.pinscount, _MongoPinterestBoard.pinscount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.collaboratorscount, _MongoPinterestBoard.collaboratorscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(update, t => t.boardid == _MongoPinterestBoard.boardid);
                    }
                    GetBoardPins(pinterestUserId, userId, _MongoPinterestBoard.boardid,AccessToken);
                }
            }
            catch (Exception ex)
            {

            }

        }
        public static void GetUserfollowers(string pinterestUserId, long userId, string AccessToken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserFollowers");

                User pinUser = new User();
                string boards = pinUser.UserBoardFollowerInfo(AccessToken);
                JObject boardsData = JObject.Parse(boards);
                dynamic board_data = boardsData["data"];
                foreach (var item in board_data)
                {
                    MongoPinterestUserFollowers _MongoPinterestBoard = new MongoPinterestUserFollowers();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.followerid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.username = item["username"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.bio = item["bio"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.first_name = item["first_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.last_name = item["last_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.url = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.created_at = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.account_type = item["account_type"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.followerscount = item["counts"]["followers"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.followingcount = item["counts"]["following"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardscount = item["counts"]["boards"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likescount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.profileimageurl = item["image"]["60x60"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.pinscount = item["counts"]["pins"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowers>(t => t.followerid.Equals(_MongoPinterestBoard.followerid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (lstPinterestBoard < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowers>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowers>.Update.Set(t => t.pinscount, _MongoPinterestBoard.pinscount).Set(t => t.profileimageurl, _MongoPinterestBoard.profileimageurl).Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.followingcount, _MongoPinterestBoard.followingcount)
                           .Set(t => t.bio, _MongoPinterestBoard.bio)
                           .Set(t => t.likescount, _MongoPinterestBoard.likescount)
                           .Set(t => t.boardscount, _MongoPinterestBoard.boardscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowers>(update, t => t.followerid == _MongoPinterestBoard.followerid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        public static void GetUserfolloweings(string pinterestUserId, long userId, string AccessToken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserFollowings");

                User pinUser = new User();
                string boards = pinUser.UserBoardFollowingInfo(AccessToken);
                JObject boardsData = JObject.Parse(boards);
                dynamic board_data = boardsData["data"];
                foreach (var item in board_data)
                {
                    MongoPinterestUserFollowings _MongoPinterestBoard = new MongoPinterestUserFollowings();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.followingid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.username = item["username"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.bio = item["bio"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.first_name = item["first_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.last_name = item["last_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.url = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.created_at = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.account_type = item["account_type"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.followerscount = item["counts"]["followers"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.followingcount = item["counts"]["following"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardscount = item["counts"]["boards"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likescount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.profileimageurl = item["image"]["60x60"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.pinscount = item["counts"]["pins"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowings>(t => t.followingid.Equals(_MongoPinterestBoard.followingid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (lstPinterestBoard < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowings>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowings>.Update.Set(t => t.pinscount, _MongoPinterestBoard.pinscount).Set(t => t.profileimageurl, _MongoPinterestBoard.profileimageurl).Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.followingcount, _MongoPinterestBoard.followingcount)
                           .Set(t => t.bio, _MongoPinterestBoard.bio)
                           .Set(t => t.likescount, _MongoPinterestBoard.likescount)
                           .Set(t => t.boardscount, _MongoPinterestBoard.boardscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserFollowings>(update, t => t.followingid == _MongoPinterestBoard.followingid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        public static void GetUserLikes(string pinterestUserId, long userId, string AccessToken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserLikes");

                User pinUser = new User();
                string boards = pinUser.UserlikesInfo(AccessToken);
                JObject boardsData = JObject.Parse(boards);
                dynamic board_data = boardsData["data"];
                foreach (var item in board_data)
                {
                    MongoPinterestUserLikes _MongoPinterestBoard = new MongoPinterestUserLikes();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.likesid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorurl = item["creator"]["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorname = item["creator"]["first_name"] + " " + item["creator"]["last_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorid = item["creator"]["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.url = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.mediatype = item["media"]["type"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.created_at = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.note = item["note"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.link = item["link"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardurl = item["board"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardid = item["board"]["id"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardname = item["board"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.imageurl = item["image"]["original"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likesount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.commentscount = item["counts"]["comments"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.repinscount = item["counts"]["repins"];
                    }
                    catch (Exception ex)
                    { }

                    try
                    {
                        _MongoPinterestBoard.metatitle = item["metadata"]["link"]["title"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metasite_name = item["metadata"]["link"]["site_name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadescription = item["metadata"]["link"]["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metafavicon = item["metadata"]["link"]["favicon"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>(t => t.likesid.Equals(_MongoPinterestBoard.likesid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (lstPinterestBoard < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>.Update.Set(t => t.likesount, _MongoPinterestBoard.likesount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.repinscount, _MongoPinterestBoard.repinscount)
                           .Set(t => t.commentscount, _MongoPinterestBoard.commentscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes>(update, t => t.likesid == _MongoPinterestBoard.likesid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        public static void GetUserPins(string pinterestUserId, long userId, string AccessToken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins");

                User pinUser = new User();
                string boards = pinUser.UserpinsInfo(AccessToken);
                JObject boardsData = JObject.Parse(boards);
                dynamic board_data = boardsData["data"];
                foreach (var item in board_data)
                {
                    MongoPinterestUserPins _MongoPinterestBoard = new MongoPinterestUserPins();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.pinid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorurl = item["creator"]["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorname = item["creator"]["first_name"] + " " + item["creator"]["last_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorid = item["creator"]["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.url = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.mediatype = item["media"]["type"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.created_at = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.note = item["note"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.link = item["link"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardurl = item["board"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardid = item["board"]["id"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardname = item["board"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.imageurl = item["image"]["original"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likesount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.commentscount = item["counts"]["comments"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.repinscount = item["counts"]["repins"];
                    }
                    catch (Exception ex)
                    { }

                    try
                    {
                        _MongoPinterestBoard.metatitle = item["metadata"]["link"]["title"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metasite_name = item["metadata"]["link"]["site_name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadescription = item["metadata"]["link"]["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metafavicon = item["metadata"]["link"]["favicon"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticlepublisheddate = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticledescription = item["metadata"]["article"]["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticlename = item["metadata"]["article"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticleauthorname = item["metadata"]["article"]["authors"]["0"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(t => t.pinid.Equals(_MongoPinterestBoard.pinid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (lstPinterestBoard < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>.Update.Set(t => t.likesount, _MongoPinterestBoard.likesount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.repinscount, _MongoPinterestBoard.repinscount)
                           .Set(t => t.commentscount, _MongoPinterestBoard.commentscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(update, t => t.pinid == _MongoPinterestBoard.pinid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        public static void GetBoardPins(string pinterestUserId, long userId, string boardId,string accesstoken)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins");
                Board pinUser = new Board();
                string pins = pinUser.BoardPinInfor(boardId, accesstoken);
                JObject pinsData = JObject.Parse(pins);
                dynamic pin_data = pinsData["data"];
                foreach (var item in pin_data)
                {
                    MongoPinterestUserPins _MongoPinterestBoard = new MongoPinterestUserPins();
                    _MongoPinterestBoard.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _MongoPinterestBoard.pinid = item["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorurl = item["creator"]["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorname = item["creator"]["first_name"] + " " + item["creator"]["last_name"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.creatorid = item["creator"]["id"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.url = item["url"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.mediatype = item["media"]["type"];
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.created_at = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["created_at"]));
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _MongoPinterestBoard.note = item["note"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.link = item["link"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardurl = item["board"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardid = item["board"]["id"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.boardname = item["board"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.imageurl = item["image"]["original"]["url"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likesount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.likesount = item["counts"]["likes"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.repinscount = item["counts"]["repins"];
                    }
                    catch (Exception ex)
                    { }

                    try
                    {
                        _MongoPinterestBoard.metatitle = item["metadata"]["link"]["title"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metasite_name = item["metadata"]["link"]["site_name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadescription = item["metadata"]["link"]["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metafavicon = item["metadata"]["link"]["favicon"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticlepublisheddate = SBHelper.ConvertFromUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticledescription = item["metadata"]["article"]["description"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticlename = item["metadata"]["article"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    try
                    {
                        _MongoPinterestBoard.metadataarticleauthorname = item["metadata"]["article"]["authors"]["0"]["name"];
                    }
                    catch (Exception ex)
                    { }
                    _MongoPinterestBoard.pinterestUserId = pinterestUserId;
                    _MongoPinterestBoard.userId = userId;

                    int Count = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(t => t.pinid.Equals(_MongoPinterestBoard.pinid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                    if (Count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(_MongoPinterestBoard);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>.Update.Set(t => t.likesount, _MongoPinterestBoard.likesount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.repinscount, _MongoPinterestBoard.repinscount)
                           .Set(t => t.commentscount, _MongoPinterestBoard.commentscount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(update, t => t.pinid == _MongoPinterestBoard.pinid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}
