using Domain.Socioboard.Enum;
using Domain.Socioboard.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Socioboard.Models
{
    public class Notifications
    {
        
        public Int64 Id { get; set; }
        public Int64 UserId { get; set; }
        public string notificationtime { get; set; }
        public Int64 MsgId { get; set; }
        public string MsgStatus { get; set; }
        public string ReadOrUnread { get; set; }
        public string NotificationType { get; set; }
    }
}
