using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class Ewallet
    {
        
        public Int64 Id { get; set; }
        public Int64 UserId { get; set; }
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }
        public string Frommailid { get; set; }
        public Int64 Fromid { get; set; }
        public Int64 Amount { get; set; }
        public DateTime? Transactiondate { get; set; }
        public string TransactionId { get; set; }
        public string TransactionType { get; set; }
        public string TransactionStatus { get; set; }
        
    }
}
