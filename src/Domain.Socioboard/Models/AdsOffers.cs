using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class AdsOffers
    {
        
        public Int64 Id { get; set; }
        public Int64 UserId { get; set; }
        public DateTime? adcreateddate { get; set; }
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }
        public AdsStatus Verified { get; set; }
        public string WebsiteUrl { get; set; }
        public AdsOfferAccountStatus adsaccountstatus { get; set; }
        public DateTime? Verifieddate { get; set; }
    }
}
