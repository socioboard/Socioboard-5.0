
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using Socioboard.LinkedIn.App.Core;
using Socioboard.LinkedIn.Authentication;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Socioboard.LinkedIn.App.Core.LinkedinCompanyPage;

namespace SocioboardDataServices.LinkedIn
{
    public class LinkedPageFeed
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 150;
        public static LinkedinPageUpdate objLinkedinPageUpdate = new LinkedinPageUpdate();
        public static int UpdateLinkedInComanyPageFeed(Domain.Socioboard.Models.LinkedinCompanyPage linacc, oAuthLinkedIn _oauth)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.Groupprofiles _grpProfile = dbr.Single<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(linacc.LinkedinPageId));
            apiHitsCount = 0;
            if (linacc.lastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (linacc.IsActive)
                {

                    dynamic profile = GetCompanyPageData(_oauth, linacc.LinkedinPageId);
                    try
                    {
                        string NuberOfFollower = profile.num_followers.ToString();
                        linacc.NumFollowers = Convert.ToInt16(NuberOfFollower);
                    }
                    catch {
                        linacc.NumFollowers = linacc.NumFollowers;
                    }
                    try
                    {
                        linacc.CompanyType = profile.company_type.ToString();
                    }
                    catch {
                        linacc.CompanyType = linacc.CompanyType;
                    }
                    try
                    {
                        linacc.LogoUrl = profile.logo_url.ToString();
                        _grpProfile.profilePic= profile.logo_url.ToString();
                    }
                    catch {
                        linacc.LogoUrl = linacc.LogoUrl;
                        _grpProfile.profilePic = linacc.LogoUrl;
                    }
                    try
                    {
                        linacc.SquareLogoUrl = profile.square_logo_url.ToString();
                    }
                    catch {
                        linacc.SquareLogoUrl = linacc.SquareLogoUrl;
                    }
                    try
                    {
                        linacc.BlogRssUrl = profile.blog_rss_url.ToString();
                    }
                    catch {
                        linacc.BlogRssUrl = linacc.BlogRssUrl;
                    }
                    try
                    {
                        linacc.UniversalName = profile.universal_name.ToString();
                    }
                    catch {
                        linacc.UniversalName = linacc.UniversalName;
                    }
                    dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(linacc);
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
                   
                    dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(linacc);
                }
            }
            else
            {
                apiHitsCount = 0;
            }
            return 0;
        }

        public static void UpdateLinkedIn(Domain.Socioboard.Models.LinkedInAccount linacc, oAuthLinkedIn _oauth)
        {
            apiHitsCount = 0;
            if (linacc.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                Domain.Socioboard.Models.Groupprofiles _grpProfile = dbr.Single<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(linacc.LinkedinUserId));
                if (linacc.IsActive)
                {
                    try
                    {
                        dynamic profile = getLinkedInProfile(_oauth);
                        try
                        {
                            linacc.Connections = Convert.ToInt32(profile.connections.ToString());
                        }
                        catch (Exception)
                        {

                            linacc.Connections = linacc.Connections;
                        }
                        try
                        {
                            linacc.EmailId = profile.email.ToString();
                        }
                        catch (Exception ex)
                        {
                            linacc.EmailId = linacc.EmailId;
                        }
                        try
                        {
                            linacc.ProfileImageUrl = profile.picture_url.ToString();
                            _grpProfile.profilePic= profile.picture_url.ToString(); 
                        }
                        catch (Exception ex)
                        {
                            linacc.ProfileImageUrl = linacc.ProfileImageUrl;
                            _grpProfile.profilePic= linacc.ProfileImageUrl;
                        }
                        try
                        {
                            linacc.ProfileUrl = profile.profile_url.ToString();
                        }
                        catch (Exception ex)
                        {
                            linacc.ProfileUrl = linacc.ProfileUrl;
                        }


                       
                        linacc.LastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(linacc);
                        dbr.Update<Domain.Socioboard.Models.Groupprofiles>(_grpProfile);
                    }
                    catch (Exception)
                    {
                        
                    }
                }
            }
        }



        public static LinkedInProfile.UserProfile getLinkedInProfile(oAuthLinkedIn _oauth)
        {
            LinkedInProfile objProfile = new LinkedInProfile();
            LinkedInProfile.UserProfile objUserProfile = new LinkedInProfile.UserProfile();
            objUserProfile = objProfile.GetUserProfile(_oauth);
            return objUserProfile;
        }


        public static LinkedinCompanyPage.CompanyProfile GetCompanyPageData(oAuthLinkedIn _oauth, string ProfileId)
        {
            LinkedinCompanyPage.CompanyProfile objCompanyProfile = new CompanyProfile();
            objCompanyProfile = GetCompanyPageProfile(_oauth, ProfileId);
            return objCompanyProfile;
        }
    }
}
