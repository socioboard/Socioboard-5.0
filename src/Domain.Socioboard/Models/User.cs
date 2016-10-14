using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
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

        public bool dailyGrpReportsSummery { get; set; }
        public bool weeklyGrpReportsSummery { get;  set; }
        public bool days15GrpReportsSummery { get;  set; }
        public bool monthlyGrpReportsSummery { get; set; }
        public bool days60GrpReportsSummery { get; set; }
        public bool days90GrpReportsSummery { get; set; }
        public bool otherNewsLetters { get; set; }
        public string Ewallet { get; set; }
    }
}
