using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Youtube
{
    public class YoutubeGroupsUpdatesData
    {
        static int count = 0;
        public void YoutubeGrpUpdat()
        {
            while (true)
            {
                Thread ThreadSQL = new Thread(() => FetchSQLYtGrp());
                ThreadSQL.Start();
                Thread ThreadMongoParentComments = new Thread(() => FetchMongoDbYtGroupsParentComments());
                ThreadMongoParentComments.Start();
                Thread ThreadMongoChildComments = new Thread(() => FetchMongoDbYtGroupsChildComments());
                ThreadMongoChildComments.Start();

                ThreadSQL.Join();
                ThreadMongoParentComments.Join();
                ThreadMongoChildComments.Join();
                count = 0;
                Thread.Sleep(10000);
            }
        }

        public static void FetchSQLYtGrp()
        {
            Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.YoutubeGroupInvite> lstYtChannels = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.Active).ToList();

            Parallel.ForEach(
            lstYtChannels,
            new ParallelOptions { MaxDegreeOfParallelism = 21 },
            items => { UpdateSQLYtGrp(items); }
            );
        }
        public static void UpdateSQLYtGrp(Domain.Socioboard.Models.YoutubeGroupInvite item) 
        {
            Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
            if (item.Owner)
            {
                Domain.Socioboard.Models.User _SBUser = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == item.UserId);
                if (_SBUser != null)
                {
                    item.OwnerName = _SBUser.FirstName + " " + _SBUser.LastName;
                    item.OwnerEmailid = _SBUser.EmailId;
                    item.SBUserName = _SBUser.FirstName + " " + _SBUser.LastName;
                    item.SBEmailId = _SBUser.EmailId;
                    if (_SBUser.ProfilePicUrl == "" || _SBUser.ProfilePicUrl == null)
                    {
                        item.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                    }
                    else
                    {
                        item.SBProfilePic = _SBUser.ProfilePicUrl;
                    }

                    dbr.Update(item);
                }
            }
            else
            {
                Domain.Socioboard.Models.User _SBUserOwner = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == item.AccessSBUserId);
                Domain.Socioboard.Models.User _SBUserMmbr = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == item.UserId);
                if (_SBUserOwner != null)
                {
                    item.OwnerName = _SBUserOwner.FirstName + " " + _SBUserOwner.LastName;
                    item.OwnerEmailid = _SBUserOwner.EmailId;

                    if (_SBUserMmbr != null)
                    {
                        item.SBUserName = _SBUserMmbr.FirstName + " " + _SBUserMmbr.LastName;
                        item.SBEmailId = _SBUserMmbr.EmailId;
                        if (_SBUserMmbr.ProfilePicUrl == "" || _SBUserMmbr.ProfilePicUrl == null)
                        {
                            item.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                        }
                        else
                        {
                            item.SBProfilePic = _SBUserMmbr.ProfilePicUrl;
                        }
                    }

                    dbr.Update(item);
                }
                
            }
            Console.WriteLine(count++);
        }

        public static void FetchMongoDbYtGroupsParentComments()
        {
            List<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>();
            MongoRepository mongorepo = new MongoRepository("YoutubeVideosComments");
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.active);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstFbFeeds = task.Result;

            Parallel.ForEach(
            lstFbFeeds,
            new ParallelOptions { MaxDegreeOfParallelism = 21 },
            items => { updateMongoDbYtGroupsParentComments(items); }
            );
        }
        public static void updateMongoDbYtGroupsParentComments(Domain.Socioboard.Models.Mongo.MongoYoutubeComments item)
        {
            try
            {
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.User _SBGrpMember = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == Convert.ToInt64(item.sbGrpMemberUserid));
                Domain.Socioboard.Models.User _CmntReviewedById = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == Convert.ToInt64(item.reviewedBysbUserId));

                if (_SBGrpMember != null)
                {
                    item.sbGrpMemberName = _SBGrpMember.FirstName + " " + _SBGrpMember.LastName;
                    item.sbGrpMemberEmail = _SBGrpMember.EmailId;
                }
                if (_CmntReviewedById != null)
                {
                    item.reviewedBy = _CmntReviewedById.FirstName + " " + _CmntReviewedById.LastName;
                }

                MongoRepository mongorepo = new MongoRepository("YoutubeVideosComments");
                try
                {
                    FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", item.commentId);
                    var update = Builders<BsonDocument>.Update.Set("sbGrpMemberName", item.sbGrpMemberName).Set("sbGrpMemberEmail", item.sbGrpMemberEmail).Set("reviewedBy", item.reviewedBy);
                    mongorepo.Update<MongoYoutubeComments>(update, filter);
                }
                catch
                {

                }
            }
            catch
            {

            }
            Console.WriteLine(count++);
        }

        public static void FetchMongoDbYtGroupsChildComments()
        {
            List<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>();
            MongoRepository mongorepo = new MongoRepository("YoutubeVideosCommentsReply");
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.active);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstFbFeeds = task.Result;

            Parallel.ForEach(
            lstFbFeeds,
            new ParallelOptions { MaxDegreeOfParallelism = 21 },
            items => { updateMongoDbYtGroupsChildComments(items); }
            );
        }
        public static void updateMongoDbYtGroupsChildComments(Domain.Socioboard.Models.Mongo.MongoYoutubeComments item)
        {
            try
            {
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.User _SBGrpMember = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == Convert.ToInt64(item.sbGrpMemberUserid));
                Domain.Socioboard.Models.User _CmntReviewedById = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == Convert.ToInt64(item.reviewedBysbUserId));

                if (_SBGrpMember != null)
                {
                    item.sbGrpMemberName = _SBGrpMember.FirstName + " " + _SBGrpMember.LastName;
                    item.sbGrpMemberEmail = _SBGrpMember.EmailId;
                }
                if (_CmntReviewedById != null)
                {
                    item.reviewedBy = _CmntReviewedById.FirstName + " " + _CmntReviewedById.LastName;
                }

                MongoRepository mongorepo = new MongoRepository("YoutubeVideosCommentsReply");
                try
                {
                    FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", item.commentId);
                    var update = Builders<BsonDocument>.Update.Set("sbGrpMemberName", item.sbGrpMemberName).Set("sbGrpMemberEmail", item.sbGrpMemberEmail).Set("reviewedBy", item.reviewedBy);
                    mongorepo.Update<MongoYoutubeComments>(update, filter);
                }
                catch
                {

                }
            }
            catch
            {

            }
            Console.WriteLine(count++);
        }
    }
}
