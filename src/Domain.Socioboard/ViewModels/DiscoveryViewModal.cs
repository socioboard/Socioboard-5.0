using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class DiscoveryViewModal
    {
        public long Id { get; set; }
        public string FromName { get; set; }
        public string FromId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime EntryDate { get; set; }
        public string Network { get; set; }
        public string ProfileImageUrl { get; set; }
        public string MessageId { get; set; }
        public string SearchKeyword { get; set; }
        public long UserId { get; set; }
    }
}
