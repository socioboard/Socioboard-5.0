using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class AssestLibrary
    {
        
        public Int64 Id { get; set; }
        public Int64 UserId { get; set; }
        public DateTime? Imageuploadeddate { get; set; }
        public string ImageName { get; set; }
        public string ImagePath { get; set; }
        public Int64 ImageSize { get; set; }
    }
}
