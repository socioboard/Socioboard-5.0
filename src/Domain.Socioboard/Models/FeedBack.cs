using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class FeedBack
    {
        
        public Int64 Id { get; set; }
        public Int64 UserId { get; set; }
        public DateTime? createddate { get; set; }
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }
        public SBUserActivationStatus UserActivationStatus { get; set; }

        public SBAccountType AccountType { get; set; }
        public string RegisterAccountType { get; set; }
        public string FeedBackMsg { get; set; }

    }
}
