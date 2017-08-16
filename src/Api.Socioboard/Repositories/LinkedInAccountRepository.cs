using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Socioboard.LinkedIn.App.Core;
using Socioboard.LinkedIn.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class LinkedInAccountRepository
    {
        public static Domain.Socioboard.Models.LinkedInAccount getLinkedInAccount(string LIUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.LinkedInAccount inMemLiAcc = _redisCache.Get<Domain.Socioboard.Models.LinkedInAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInAccount + LIUserId);
                if (inMemLiAcc != null)
                {
                    return inMemLiAcc;
                }
            }
            catch { }

            try
            {
                List<Domain.Socioboard.Models.LinkedInAccount> lstLiAcc = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId.Equals(LIUserId) && t.IsActive).ToList();
                if (lstLiAcc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInAccount + LIUserId, lstLiAcc.First());
                    return lstLiAcc.First();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return null;
            }



        }

        public static Domain.Socioboard.Models.LinkedinCompanyPage getLinkedinCompanyPage(string LICompanyPageUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.LinkedinCompanyPage inMemLiAcc = _redisCache.Get<Domain.Socioboard.Models.LinkedinCompanyPage>(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInCompanyPage + LICompanyPageUserId);
                if (inMemLiAcc != null)
                {
                    return inMemLiAcc;
                }
            }
            catch { }

            try
            {
                List<Domain.Socioboard.Models.LinkedinCompanyPage> lstLiAcc = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId.Equals(LICompanyPageUserId) && t.IsActive).ToList();
                if (lstLiAcc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInCompanyPage + LICompanyPageUserId, lstLiAcc.First());
                    return lstLiAcc.First();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return null;
            }



        }

        public static int AddLinkedInAccount(oAuthLinkedIn _oauth, dynamic profile, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, string accessToken, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedInAccount(profile.id.ToString(), _redisCache, dbr);
            if (_LinkedInAccount != null && _LinkedInAccount.IsActive == false)
            {
                _LinkedInAccount.IsActive = true;
                _LinkedInAccount.UserId = userId;
                _LinkedInAccount.EmailId = profile.email.ToString();
                _LinkedInAccount.OAuthToken = accessToken;
                _LinkedInAccount.Connections = Convert.ToInt32(profile.connections.ToString());
                _LinkedInAccount.LastUpdate = DateTime.UtcNow;
                isSaved = dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(_LinkedInAccount);
            }
            else
            {
                _LinkedInAccount = new Domain.Socioboard.Models.LinkedInAccount();
                _LinkedInAccount.LinkedinUserId = profile.id.ToString();
                _LinkedInAccount.IsActive = true;
                _LinkedInAccount.UserId = userId;
                _LinkedInAccount.Connections = Convert.ToInt32(profile.connections.ToString());
                _LinkedInAccount.LastUpdate = DateTime.UtcNow;
                try
                {
                    _LinkedInAccount.EmailId = profile.email.ToString();
                }
                catch (Exception ex)
                {
                }
                _LinkedInAccount.LinkedinUserName = profile.first_name.ToString() + profile.last_name.ToString();
                _LinkedInAccount.OAuthToken = _oauth.Token;
                _LinkedInAccount.OAuthSecret = _oauth.TokenSecret;
                _LinkedInAccount.OAuthVerifier = _oauth.Verifier;
                try
                {
                    _LinkedInAccount.ProfileImageUrl = profile.picture_url.ToString();
                }
                catch (Exception ex)
                {
                    _LinkedInAccount.ProfileImageUrl = "https://www.takeaway.com/images/icons/_blankprofile.png";

                }
                try
                {
                    _LinkedInAccount.ProfileUrl = profile.profile_url.ToString();
                }
                catch (Exception ex)
                {

                }
                isSaved = dbr.Add<Domain.Socioboard.Models.LinkedInAccount>(_LinkedInAccount);
                if (isSaved == 1)
                {
                    List<Domain.Socioboard.Models.LinkedInAccount> lstliAcc = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId.Equals(_LinkedInAccount.LinkedinUserId)).ToList();
                    if (lstliAcc != null && lstliAcc.Count() > 0)
                    {
                        isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstliAcc.First().LinkedinUserId, lstliAcc.First().LinkedinUserName, userId, lstliAcc.First().ProfileImageUrl, Domain.Socioboard.Enum.SocialProfileType.LinkedIn, dbr);
                        if (isSaved == 1)
                        {
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        }
                    }

                }

            }
            return isSaved;
        }

        public static int AddLinkedInCompantPage(oAuthLinkedIn _oauth, dynamic profile, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, string accesstoken, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.LinkedinCompanyPage _LinkedInAccount = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(profile.Pageid.ToString(), _redisCache, dbr);
            if (_LinkedInAccount != null && _LinkedInAccount.IsActive == false)
            {
                _LinkedInAccount.IsActive = true;
                _LinkedInAccount.UserId = userId;
                _LinkedInAccount.EmailDomains = profile.EmailDomains.ToString();
                _LinkedInAccount.OAuthToken = accesstoken;
                _LinkedInAccount.LinkedinPageName = profile.name.ToString();
                _LinkedInAccount.lastUpdate = DateTime.UtcNow;
                try
                {
                    string NuberOfFollower = profile.num_followers.ToString();
                    _LinkedInAccount.NumFollowers = Convert.ToInt16(NuberOfFollower);
                }
                catch { }
                try
                {
                    _LinkedInAccount.CompanyType = profile.company_type.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.LogoUrl = profile.logo_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.SquareLogoUrl = profile.square_logo_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.BlogRssUrl = profile.blog_rss_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.UniversalName = profile.universal_name.ToString();
                }
                catch { }
                isSaved = dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(_LinkedInAccount);
            }
            else
            {
                _LinkedInAccount = new Domain.Socioboard.Models.LinkedinCompanyPage();
                _LinkedInAccount.LinkedinPageId = profile.Pageid.ToString();
                _LinkedInAccount.IsActive = true;
                _LinkedInAccount.UserId = userId;
                _LinkedInAccount.lastUpdate = DateTime.UtcNow;
                try
                {
                    _LinkedInAccount.EmailDomains = profile.EmailDomains.ToString();
                }
                catch (Exception ex)
                {
                }
                _LinkedInAccount.LinkedinPageName = profile.name.ToString();
                _LinkedInAccount.OAuthToken = _oauth.Token;
                _LinkedInAccount.OAuthSecret = _oauth.TokenSecret;
                _LinkedInAccount.OAuthVerifier = _oauth.Verifier;
                try
                {
                    _LinkedInAccount.Description = profile.description.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.FoundedYear = profile.founded_year.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.EndYear = profile.end_year.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.Locations = profile.locations.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.Specialties = profile.Specialties.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.WebsiteUrl = profile.website_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.Status = profile.status.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.EmployeeCountRange = profile.employee_count_range.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.Industries = profile.industries.ToString();
                }
                catch { }
                try
                {
                    string NuberOfFollower = profile.num_followers.ToString();
                    _LinkedInAccount.NumFollowers = Convert.ToInt16(NuberOfFollower);
                }
                catch { }
                try
                {
                    _LinkedInAccount.CompanyType = profile.company_type.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.LogoUrl = profile.logo_url.ToString();
                }
                catch(Exception ex)
                {
                    _LinkedInAccount.LogoUrl = "https://www.takeaway.com/images/icons/_blankprofile.png";
                }
                try
                {
                    _LinkedInAccount.SquareLogoUrl = profile.square_logo_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.BlogRssUrl = profile.blog_rss_url.ToString();
                }
                catch { }
                try
                {
                    _LinkedInAccount.UniversalName = profile.universal_name.ToString();
                }
                catch { }
                isSaved = dbr.Add<Domain.Socioboard.Models.LinkedinCompanyPage>(_LinkedInAccount);
                if (isSaved == 1)
                {
                    List<Domain.Socioboard.Models.LinkedinCompanyPage> lstliAcc = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId.Equals(_LinkedInAccount.LinkedinPageId)).ToList();
                    if (lstliAcc != null && lstliAcc.Count() > 0)
                    {
                        isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstliAcc.First().LinkedinPageId, lstliAcc.First().LinkedinPageName, userId, lstliAcc.First().LogoUrl, Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage, dbr);
                        if (isSaved == 1)
                        {
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                            new Thread(delegate ()
                            {
                                LinkedInAccountRepository.SaveLinkedInCompanyPageFeed(_oauth, lstliAcc.First().LinkedinPageId, lstliAcc.First().UserId, _appSettings);

                            }).Start();
                        }
                    }

                }

            }
            return isSaved;
        }

        public static void SaveLinkedInCompanyPageFeed(oAuthLinkedIn _oauth, string PageId, long UserId, Helper.AppSettings _appSettings)
        {
            List<LinkedinPageUpdate.CompanyPagePosts> objcompanypagepost = Helper.LinkedInHelper.GetLinkedinCompanyPageFeeds(_oauth, PageId);
            LinkedinCompanyPagePosts lipagepost = new LinkedinCompanyPagePosts();
            foreach (var item in objcompanypagepost)
            {
                lipagepost.Id = ObjectId.GenerateNewId();
                lipagepost.strId = ObjectId.GenerateNewId().ToString();
                lipagepost.Posts = item.Posts;
                lipagepost.PostDate = Convert.ToDateTime(item.PostDate).ToString("yyyy/MM/dd HH:mm:ss");
                lipagepost.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                lipagepost.UserId = UserId;
                lipagepost.Type = item.Type;
                lipagepost.PostId = item.PostId;
                lipagepost.UpdateKey = item.UpdateKey;
                lipagepost.PageId = PageId;
                lipagepost.PostImageUrl = item.PostImageUrl;
                lipagepost.Likes = item.Likes;
                lipagepost.Comments = item.Comments;
                MongoRepository _CompanyPagePostsRepository = new MongoRepository("LinkedinCompanyPagePosts", _appSettings);
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

        public static Domain.Socioboard.Models.LinkedInData GetTopCompanyPagePosts(string PageId, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr, int skip, int count)
        {
            List<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts> inMemCompanyPagePosts = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInCompanyPageFeed + PageId);
            if (inMemCompanyPagePosts != null)
            {
                Domain.Socioboard.Models.LinkedInData _LinkedInData = new Domain.Socioboard.Models.LinkedInData();
                _LinkedInData._LinkedinCompanyPage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(PageId, _redisCache, dbr);
                _LinkedInData._LinkedinCompanyPagePosts = inMemCompanyPagePosts;
                return _LinkedInData;
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts> lstLinkedinCompanyPagePosts = new List<LinkedinCompanyPagePosts>();
                MongoRepository _linkedincompanypagereppo = new MongoRepository("LinkedinCompanyPagePosts", _appSettings);
                var builder = Builders<LinkedinCompanyPagePosts>.Sort;
                var sort = builder.Descending(t => t.PostDate);
                var ret = _linkedincompanypagereppo.FindWithRange<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>(t => t.PageId.Equals(PageId), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                lstLinkedinCompanyPagePosts = task.Result.ToList();
                if (lstLinkedinCompanyPagePosts.Count > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInCompanyPageFeed + PageId, lstLinkedinCompanyPagePosts);
                }
                Domain.Socioboard.Models.LinkedInData _LinkedInData = new Domain.Socioboard.Models.LinkedInData();
                _LinkedInData._LinkedinCompanyPage = Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(PageId, _redisCache, dbr);
                _LinkedInData._LinkedinCompanyPagePosts = lstLinkedinCompanyPagePosts;
                return _LinkedInData;
            }
        }

        public static string PostCommentOnLinkedinCompanyPage(string LinkedinPageId, string Updatekey, string comment, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            string postdata = Helper.LinkedInHelper.PostCommentOnLinkedinCompanyPage(userId, comment, Updatekey, LinkedinPageId, _redisCache, dbr, _appSettings);
            if (postdata != "Failed")
            {
                MongoRepository _linkedincompanypagereppo = new MongoRepository("LinkedinCompanyPagePosts", _appSettings);
                var ret = _linkedincompanypagereppo.Find<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>(t => t.PageId == LinkedinPageId && t.UpdateKey.Equals(Updatekey));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                int count = task.Result.Count;
                Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts _LinkedinCompanyPagePosts = task.Result.First();
                if (count > 0)
                {

                    var builders = Builders<BsonDocument>.Filter;
                    FilterDefinition<BsonDocument> filter = builders.Eq("UpdateKey", Updatekey);
                    var update = Builders<BsonDocument>.Update.Set("Comments", _LinkedinCompanyPagePosts.Comments + 1);
                    _linkedincompanypagereppo.Update<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts>(update, filter);

                }
            }
            return postdata;
        }

        public static List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment> GetLinkdeinPagePostComment(oAuthLinkedIn _oauth, string LinkedinPageId, string Updatekey)
        {
            List<Domain.Socioboard.Models.Mongo.LinkdeinPageComment> lstLinkdeinPageComment = Helper.LinkedInHelper.GetLinkdeinPagePostComment(_oauth, LinkedinPageId, Updatekey);
            return lstLinkdeinPageComment;
        }

        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.LinkedInAccount fbAcc = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId.Equals(profileId) && t.UserId == userId && t.IsActive).FirstOrDefault();
            if (fbAcc != null)
            {
                //fbAcc.IsActive = false;
                //dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(fbAcc);
                dbr.Delete<Domain.Socioboard.Models.LinkedInAccount>(fbAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInAccount + profileId);
                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }

        public static string DeleteCompanyPageProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.LinkedinCompanyPage fbAcc = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId.Equals(profileId) && t.UserId == userId && t.IsActive).FirstOrDefault();
            if (fbAcc != null)
            {
                //fbAcc.IsActive = false;
                //dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(fbAcc);
                dbr.Delete<Domain.Socioboard.Models.LinkedinCompanyPage>(fbAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheLinkedInCompanyPage + profileId);
                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }
    }
}
