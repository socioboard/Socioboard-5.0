using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Socioboard.Pinterest;
using Socioboard.Pinterest.Auth;
using Socioboard.Pinterest.User;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading;
using Socioboard.Pinterest.Board;
using Socioboard.Pinterest.Pin;

namespace Api.Socioboard.Repositories
{
    public class PinterestRepository
    {
        public static Domain.Socioboard.Models.PinterestAccount getPinterestAccount(string pinterestUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.PinterestAccount inMemTwitterAcc = _redisCache.Get<Domain.Socioboard.Models.PinterestAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CachePinterestAccount + pinterestUserId);
                if (inMemTwitterAcc != null)
                {
                    return inMemTwitterAcc;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.PinterestAccount> lstpinterestaccounts = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.profileid.Equals(pinterestUserId)).ToList();
            if (lstpinterestaccounts != null && lstpinterestaccounts.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CachePinterestAccount + pinterestUserId, lstpinterestaccounts.First());
                return lstpinterestaccounts.First();
            }
            else
            {
                return null;
            }
        }
        public static Domain.Socioboard.Models.PinterestAccount getPinterestAccountDetail(string pinterestUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.PinterestAccount inMemTwitterAcc = _redisCache.Get<Domain.Socioboard.Models.PinterestAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CachePinterestAccount + pinterestUserId);
                if (inMemTwitterAcc != null)
                {
                    return inMemTwitterAcc;
                }
            }
            catch { }
            List<Domain.Socioboard.Models.PinterestAccount> lstpinterestaccounts = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(pinterestUserId)).ToList();
            if (lstpinterestaccounts != null && lstpinterestaccounts.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CachePinterestAccount + pinterestUserId, lstpinterestaccounts.First());
                return lstpinterestaccounts.First();
            }
            else
            {
                return null;
            }
        }
        public static string AddPinterestAccount(string client_id, string client_secret, string redirect_uri, string code, long userId, long groupId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            try
            {
                int isSaved = 0;
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = new Domain.Socioboard.Models.PinterestAccount();
                User pinUser = new User();
                string accessToken = Authentication.getAccessToken(client_id, redirect_uri, client_secret, code);
                if(string.IsNullOrEmpty(accessToken))
                {
                    return "Something went wrong while fetching accessToken Please try again";
                }
                JObject arr_access = JObject.Parse(accessToken);
                string userInfor = pinUser.UserInfo(arr_access["access_token"].ToString());
                JObject profile = JObject.Parse(userInfor);
                _PinterestAccount = Api.Socioboard.Repositories.PinterestRepository.getPinterestAccount(profile["data"]["id"].ToString(), _redisCache, dbr);
                if (_PinterestAccount != null && _PinterestAccount.isactive == true)
                {
                    if (_PinterestAccount.userid == userId)
                    {
                        return ("Pinterest account already added by you.");
                    }
                    return "This Account is added by other user.";
                }
                else if (_PinterestAccount != null && _PinterestAccount.isactive == false)
                {
                    try
                    {
                        _PinterestAccount.accesstoken = arr_access["access_token"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.accounttype = profile["data"]["account_type"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.bio = profile["data"]["bio"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.boardscount = Convert.ToInt32(profile["data"]["counts"]["boards"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.firstname = profile["data"]["first_name"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.followerscount = Convert.ToInt32(profile["data"]["counts"]["followers"].ToString());
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.followingcount = Convert.ToInt32(profile["data"]["counts"]["following"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    _PinterestAccount.isactive = true;
                    try
                    {
                        _PinterestAccount.lastname = profile["data"]["last_name"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    _PinterestAccount.lastupdate = DateTime.UtcNow;
                    try
                    {
                        _PinterestAccount.likescount = Convert.ToInt32(profile["data"]["counts"]["likes"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.pinscount = Convert.ToInt32(profile["data"]["counts"]["pins"].ToString());
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.profileid = profile["data"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.profileimgaeurl = profile["data"]["image"]["60x60"]["url"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.url = profile["data"]["url"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    _PinterestAccount.userid = userId;
                    try
                    {
                        _PinterestAccount.username = profile["data"]["username"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    isSaved = dbr.Update<Domain.Socioboard.Models.PinterestAccount>(_PinterestAccount);

                }
                else
                {
                    _PinterestAccount = new Domain.Socioboard.Models.PinterestAccount();
                    try
                    {
                        _PinterestAccount.accesstoken = arr_access["access_token"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.accounttype = profile["data"]["account_type"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.bio = profile["data"]["bio"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.boardscount = Convert.ToInt32(profile["data"]["counts"]["boards"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.firstname = profile["data"]["first_name"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.followerscount = Convert.ToInt32(profile["data"]["counts"]["followers"].ToString());
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.followingcount = Convert.ToInt32(profile["data"]["counts"]["following"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    _PinterestAccount.isactive = true;
                    try
                    {
                        _PinterestAccount.lastname = profile["data"]["last_name"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    _PinterestAccount.lastupdate = DateTime.UtcNow;
                    try
                    {
                        _PinterestAccount.likescount = Convert.ToInt32(profile["data"]["counts"]["likes"].ToString());
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        _PinterestAccount.pinscount = Convert.ToInt32(profile["data"]["counts"]["pins"].ToString());
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.profileid = profile["data"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.profileimgaeurl = profile["data"]["image"]["60x60"]["url"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    try
                    {
                        _PinterestAccount.url = profile["data"]["url"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    _PinterestAccount.userid = userId;
                    try
                    {
                        _PinterestAccount.username = profile["data"]["username"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    isSaved = dbr.Add<Domain.Socioboard.Models.PinterestAccount>(_PinterestAccount);
                }

                if (isSaved == 1)
                {
                    List<Domain.Socioboard.Models.PinterestAccount> lstPinAcc = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.profileid.Equals(_PinterestAccount.profileid)).ToList();
                    if (lstPinAcc != null && lstPinAcc.Count() > 0)
                    {
                        isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstPinAcc.First().username, lstPinAcc.First().firstname + " " + lstPinAcc.First().lastname, userId, lstPinAcc.First().profileimgaeurl, Domain.Socioboard.Enum.SocialProfileType.Pinterest, dbr);
                        if (isSaved == 1)
                        {
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                            new Thread(delegate ()
                            {
                                GetUserBoards(lstPinAcc.First().profileid, userId, lstPinAcc.First().accesstoken, _appSettings, _logger, _redisCache, dbr);
                                GetUserfolloweings(lstPinAcc.First().profileid, userId, lstPinAcc.First().accesstoken, _appSettings, _logger);
                                GetUserfollowers(lstPinAcc.First().profileid, userId, lstPinAcc.First().accesstoken, _appSettings, _logger);
                                GetUserLikes(lstPinAcc.First().profileid, userId, lstPinAcc.First().accesstoken, _appSettings, _logger);
                                GetUserPins(lstPinAcc.First().profileid, userId, lstPinAcc.First().accesstoken, _appSettings, _logger);
                            }).Start();
                        }
                    }

                }
                return "Added_Successfully";
            }
            catch (Exception ex)
            {
                return "something went wrong";
            }
        }
        public static void GetUserBoards(string pinterestUserId, long userId, string AccessToken, Helper.AppSettings settings, ILogger _logger, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard", settings);

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
                        _MongoPinterestBoard.createddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                    GetBoardPins(pinterestUserId, userId, _MongoPinterestBoard.boardid, settings, _redisCache, _logger, dbr);
                }
            }
            catch (Exception ex)
            {

            }

        }
        public static void GetUserfollowers(string pinterestUserId, long userId, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserFollowers", settings);

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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
        public static void GetUserfolloweings(string pinterestUserId, long userId, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserFollowings", settings);

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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
        public static void GetUserLikes(string pinterestUserId, long userId, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserLikes", settings);

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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
        public static void GetUserPins(string pinterestUserId, long userId, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", settings);

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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                        _MongoPinterestBoard.metadataarticlepublisheddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
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
        public static string CreateBoard(string name, string description, string profileId, long userId, Helper.AppSettings settings, ILogger _logger, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {

                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard", settings);
                Board _Board = new Board();
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(profileId, _redisCache, dbr);
                string boarddata = _Board.BoardCreation(name, description, _PinterestAccount.accesstoken);
                JObject boardsData = JObject.Parse(boarddata);
                dynamic item = boardsData["data"];
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
                    _MongoPinterestBoard.createddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                _MongoPinterestBoard.pinterestUserId = profileId;
                _MongoPinterestBoard.userId = userId;

                int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid.Equals(_MongoPinterestBoard.boardid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                if (lstPinterestBoard < 1)
                {
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(_MongoPinterestBoard);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("CreateBoard>>>>>>>" + ex.StackTrace);
                _logger.LogError("CreateBoard>>>>>>>" + ex.Message);
                return "SomeThing went wrong while creating board";
            }
            return "Board Created SuccessFully";
        }
        public static string EditBoard(string name, string description, string boardId, string profileId, long userId, Helper.AppSettings settings, ILogger _logger, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {

                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard", settings);
                Board _Board = new Board();
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(profileId, _redisCache, dbr);
                string boarddata = _Board.BoardEdition(name, description, boardId, _PinterestAccount.accesstoken);
                JObject boardsData = JObject.Parse(boarddata);
                dynamic item = boardsData["data"];
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
                    _MongoPinterestBoard.createddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                _MongoPinterestBoard.pinterestUserId = profileId;
                _MongoPinterestBoard.userId = userId;

                int lstPinterestBoard = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid.Equals(_MongoPinterestBoard.boardid) && t.pinterestUserId.Equals(_MongoPinterestBoard.pinterestUserId));
                if (lstPinterestBoard < 1)
                {
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(_MongoPinterestBoard);
                }
                else
                {
                    var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>.Update.Set(t => t.pinscount, _MongoPinterestBoard.pinscount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.collaboratorscount, _MongoPinterestBoard.collaboratorscount)
                           .Set(t => t.followerscount, _MongoPinterestBoard.followerscount)
                           .Set(t => t.boardname, _MongoPinterestBoard.boardname)
                           .Set(t => t.description, _MongoPinterestBoard.description);
                    mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(update, t => t.boardid == _MongoPinterestBoard.boardid);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("EditBoard>>>>>>>" + ex.StackTrace);
                _logger.LogError("EditBoard>>>>>>>" + ex.Message);
            }
            return "Board Edited SuccessFully";
        }
        public static string DeleteBoard(string boardId, string accessToken, Helper.AppSettings settings, ILogger _logger, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestBoard", settings);
                Board _board = new Board();
                string deleteboard = _board.BoardDeletion(boardId, accessToken);
                mongorepo.Delete<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid == boardId);
            }
            catch (Exception ex)
            {
                _logger.LogError("DeleteBoard>>>>>>>" + ex.StackTrace);
                _logger.LogError("DeleteBoard>>>>>>>" + ex.Message);
            }
            return "deleted successfully";
        }
        public static void GetBoardPins(string pinterestUserId, long userId, string boardId, Helper.AppSettings settings, Helper.Cache _redisCache, ILogger _logger, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", settings);
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(pinterestUserId, _redisCache, dbr);
                Board pinUser = new Board();
                string pins = pinUser.BoardPinInfor(boardId, _PinterestAccount.accesstoken);
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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                        _MongoPinterestBoard.metadataarticlepublisheddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
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
        public static string CreateUserPins(string pinterestUserId, long userId, string note, string imageurl, string boardId, Helper.AppSettings settings, Helper.Cache _redisCache, ILogger _logger, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", settings);
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(pinterestUserId, _redisCache, dbr);
                Pin pinUser = new Pin();
                string pins = pinUser.PinCreation(boardId, note, _PinterestAccount.accesstoken, imageurl);
                JObject pinsData = JObject.Parse(pins);
                dynamic item = pinsData["data"];
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
                    _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                    _MongoPinterestBoard.metadataarticlepublisheddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
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
                    MongoRepository mongorepobd = new MongoRepository("MongoPinterestBoard", settings);
                    var ret1 = mongorepobd.Find<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(t => t.boardid == boardId);
                    var task1 = Task.Run(async () =>
                    {
                        return await ret1;
                    });
                    IList<Domain.Socioboard.Models.Mongo.MongoPinterestBoard> lstboards = task1.Result;
                    var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>.Update.Set(t => t.pinscount, lstboards.First().pinscount + 1);
                    mongorepobd.Update<Domain.Socioboard.Models.Mongo.MongoPinterestBoard>(update, t => t.boardid == boardId);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(_MongoPinterestBoard);
                }
                else
                {
                    var update = Builders<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>.Update.Set(t => t.likesount, _MongoPinterestBoard.likesount).Set(t => t.imageurl, _MongoPinterestBoard.imageurl).Set(t => t.repinscount, _MongoPinterestBoard.repinscount)
                       .Set(t => t.commentscount, _MongoPinterestBoard.commentscount);
                    mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(update, t => t.pinid == _MongoPinterestBoard.pinid);
                }
            }
            catch (Exception ex)
            {
                return "something went wrong while creating pin";
            }
            return "pin created successfully";
        }
        public static string DeletUserPin(string pinterestUserId, string pinId, Helper.AppSettings settings, Helper.Cache _redisCache, ILogger _logger, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", settings);
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(pinterestUserId, _redisCache, dbr);
                Pin _pin = new Pin();
                string deletepin = _pin.PinDeletion(pinId, _PinterestAccount.accesstoken);
                mongorepo.Delete<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(t => t.pinid == pinId);
            }
            catch (Exception ex)
            {
                _logger.LogError("DeletUserPin>>>>>>>" + ex.StackTrace);
                _logger.LogError("DeletUserPin>>>>>>>" + ex.Message);
            }
            return "deleted successfully";
        }
        public static string EditUserPins(string pinterestUserId, long userId, string pinId, string note, string boardId, Helper.AppSettings settings, Helper.Cache _redisCache, ILogger _logger, Model.DatabaseRepository dbr)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoPinterestUserPins", settings);
                Domain.Socioboard.Models.PinterestAccount _PinterestAccount = Repositories.PinterestRepository.getPinterestAccount(pinterestUserId, _redisCache, dbr);
                Pin pinUser = new Pin();
                string pins = pinUser.PinEdition(pinId, note, boardId, _PinterestAccount.accesstoken);
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
                        _MongoPinterestBoard.created_at = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_at"]));
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
                        _MongoPinterestBoard.metadataarticlepublisheddate = Helper.DateExtension.ConvertToUnixTimestamp(Convert.ToDateTime(item["metadata"]["article"]["published_at"]));
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
                           .Set(t => t.commentscount, _MongoPinterestBoard.commentscount)
                            .Set(t => t.note, _MongoPinterestBoard.note);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoPinterestUserPins>(update, t => t.pinid == _MongoPinterestBoard.pinid);
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return "pin edited successfully";
        }
        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.PinterestAccount pinAcc = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.username.Equals(profileId) && t.userid == userId && t.isactive).FirstOrDefault();
            if (pinAcc != null)
            {
                //pinAcc.isactive = false;
                //dbr.Update<Domain.Socioboard.Models.PinterestAccount>(pinAcc);
                dbr.Delete<Domain.Socioboard.Models.PinterestAccount>(pinAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CachePinterestAccount + profileId);
                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }
    }
}
