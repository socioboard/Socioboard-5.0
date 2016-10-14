
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using Socioboard.LinkedIn.App.Core;
using Socioboard.LinkedIn.Authentication;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.LinkedIn
{
    public class LinkedPageFeed
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 150;
        public static LinkedinPageUpdate objLinkedinPageUpdate = new LinkedinPageUpdate();
        public static int UpdateLinkedInComanyPageFeed(Domain.Socioboard.Models.LinkedinCompanyPage linacc, oAuthLinkedIn _oauth)
        {
            apiHitsCount = 0;
            if (linacc.lastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (linacc.IsActive)
                {
                    
                    try
                    {
                        List<LinkedinPageUpdate.CompanyPagePosts> objcompanypagepost = objLinkedinPageUpdate.GetPagePosts(_oauth, linacc.LinkedinPageId);
                        while (apiHitsCount < MaxapiHitsCount && objcompanypagepost != null)
                        {
                            apiHitsCount++;

                            LinkedinCompanyPagePosts lipagepost = new LinkedinCompanyPagePosts();
                            if (objcompanypagepost != null)
                            {
                                foreach (var item in objcompanypagepost)
                                {
                                    lipagepost.Id = ObjectId.GenerateNewId();
                                    lipagepost.strId = ObjectId.GenerateNewId().ToString();
                                    lipagepost.Posts = item.Posts;
                                    lipagepost.PostDate = Convert.ToDateTime(item.PostDate).ToString("yyyy/MM/dd HH:mm:ss");
                                    lipagepost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                                    lipagepost.UserId = linacc.UserId;
                                    lipagepost.Type = item.Type;
                                    lipagepost.PostId = item.PostId;
                                    lipagepost.UpdateKey = item.UpdateKey;
                                    lipagepost.PageId = linacc.LinkedinPageId;
                                    lipagepost.PostImageUrl = item.PostImageUrl;
                                    lipagepost.Likes = item.Likes;
                                    lipagepost.Comments = item.Comments;
                                    MongoRepository _CompanyPagePostsRepository = new MongoRepository("LinkedinCompanyPagePosts");
                                    var ret = _CompanyPagePostsRepository.Find<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>(t => t.PostId == lipagepost.PostId);
                                    var task = Task.Run(async () =>
                                    {
                                        return await ret;
                                    });
                                    int count = task.Result.Count;
                                    if (count < 1)
                                    {
                                        _CompanyPagePostsRepository.Add(lipagepost);
                                    }
                                }
                            }
                            else
                            {
                                apiHitsCount = MaxapiHitsCount;
                            }
                        }
                    }
                    catch (Exception)
                    {
                    }
                    linacc.lastUpdate = DateTime.UtcNow;
                    DatabaseRepository dbr = new DatabaseRepository();
                    dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(linacc);
                }
            }
            else
            {
                apiHitsCount = 0;
            }
            return 0;
        }


        
    }
}
