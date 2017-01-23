using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class NewsLetter
    {
        [Required]
        public Int64 Id { get; set; }
        public string NewsLetterBody { get; set; }
        public string Subject { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
