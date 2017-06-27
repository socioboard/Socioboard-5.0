using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class User : IUser
    {
        [Required]
        
        public Int64 Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public DateTime? dateOfBirth { get; set; }
        public string aboutMe { get; set; }
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }
        [Required]
        [MinLength(6)]
        public string Password { get; set; }
        public string TimeZone { get; set; }
        public string ProfilePicUrl { get; set; }
        public string PhoneNumber { get; set; }
        public string EmailValidateToken { get; set; }
        public DateTime ValidateTokenExpireDate { get; set; }
        public DateTime LastLoginTime { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public SBAccountType AccountType { get; set; }
        public SBPaymentStatus PaymentStatus { get; set; }
        public SBUserActivationStatus ActivationStatus { get; set; }
        public string forgotPasswordKeyToken { get; set; }
        public DateTime forgotPasswordExpireDate { get; set; }

        public SBRegistrationType RegistrationType { get; set; }
        public PayPalAccountStatus PayPalAccountStatus { get; set; }
        public bool dailyGrpReportsSummery { get; set; }
        public bool weeklyGrpReportsSummery { get; set; }
        public bool days15GrpReportsSummery { get; set; }
        public bool monthlyGrpReportsSummery { get; set; }
        public bool days60GrpReportsSummery { get; set; }
        public bool days90GrpReportsSummery { get; set; }
        public bool otherNewsLetters { get; set; }
        public string Ewallet { get; set; }
        public PaymentType PaymentType { get; set; }
        public UserTrailStatus TrailStatus { get; set; }
        public string UserType { get; set; }
        public DateTime MailstatusforAccountExpiry { get; set; }
        public DateTime MailstatusbeforeAccountExpire { get; set; }
        public DateTime lastloginreminder { get; set; }
        public DateTime Dailymailstatusreport { get; set; }
        public DateTime mailstatusforweeklyreport { get; set; }
        public DateTime mailstatusfor15daysreport { get; set; }
        public DateTime mailstatusfor30daysreport { get; set; }
        public DateTime mailstatusfor60daysreport { get; set; }
        public DateTime mailstatusfor90daysreport { get; set; }
        public bool scheduleSuccessUpdates { get; set; }
        public bool scheduleFailureUpdates { get; set; }
        public bool TwostepEnable { get; set; }
        public AdsStatus Adsstatus { get; set; }
    }

    public class PiadUser
    {
        public string month { get; set; }
        public int paiduser { get; set; }
    }
    public class UnPiadUser
    {
        public string month { get; set; }
        public int Unpaiduser { get; set; }
    }
   public class UserDetails
    {
        public List<User> _user { get; set; }
        public int count { get; set; }
    }
}
