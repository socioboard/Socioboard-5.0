using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class LinkedInData
    {
        public Domain.Socioboard.Models.LinkedinCompanyPage _LinkedinCompanyPage { get;set;}
        public List<Domain.Socioboard.Models.Mongo.LinkedinCompanyPagePosts> _LinkedinCompanyPagePosts { get; set; }
    }
}
