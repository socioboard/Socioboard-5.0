using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class FacebookPublicReportViewModal
    {
        public Domain.Socioboard.Models.Facebookaccounts FacebookAccount { get; set; }
        public List<Domain.Socioboard.Models.Mongo.Fbpublicpagedailyreports> Fbpublicpagedailyreports { get; set; }
    }
}
