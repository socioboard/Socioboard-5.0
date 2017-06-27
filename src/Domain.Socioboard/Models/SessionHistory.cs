using Domain.Socioboard.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class SessionHistory
    {
        public long id { get; set; }
        public long userId { get; set; }
        public string ipAddress { get; set; }
        public string browseros { get; set; }
        public string systemId { get; set; }
        public DateTime lastAccessedTime { get; set; }
        public DateTime firstloginTime { get; set; }
        public SessionHistoryStatus sessionStatus { get; set; }
    }
}
