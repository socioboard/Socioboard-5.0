using Domain.Socioboard.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class YoutubeGroupRepository
    {
        public static void InviteGroupMember(Int64 userId, string emailId, Helper.AppSettings settings, ILogger _logger, Model.DatabaseRepository dbr)
        {
            YoutubeGroupInvite _objGrp = new YoutubeGroupInvite();

            IList<Domain.Socioboard.Models.User> lstUser = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == userId || t.EmailId == emailId);
            Domain.Socioboard.Models.User _SBUser = lstUser.FirstOrDefault(t => t.Id == userId);
            Domain.Socioboard.Models.User _SBUserInvite = lstUser.FirstOrDefault(t => t.EmailId == emailId);

            IList<Domain.Socioboard.Models.YoutubeGroupInvite> lstGrpUser = dbr.Find<Domain.Socioboard.Models.YoutubeGroupInvite>(t => t.AccessSBUserId == userId);
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
                dbr.Add(_objGrp);
            }
            else if (_SBUserInvite == null)
            {
                _objGrp.UserId = 0;
                _objGrp.Owner = false;
                _objGrp.OwnerName = _SBUser.FirstName + " " + _SBUser.LastName;
                _objGrp.OwnerEmailid = _SBUser.EmailId;
                _objGrp.Active = false;
                _objGrp.SBUserName = "New User";
                _objGrp.SBEmailId = emailId;
                _objGrp.SBProfilePic = "https://i.imgur.com/zqN47Qp.png";
                _objGrp.AccessSBUserId = userId;
                dbr.Add(_objGrp);
            }
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



    }
}
