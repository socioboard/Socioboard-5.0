using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class TwitterMutualFans
    {
        public string screen_name { get; set; }
        public string name { get; set; }

        public string followers { get; set; }
        public string following { get; set; }
        public string location { get; set; }

        public string profile_image_url { get; set; }
        public string description { get; set; }
       

    }
}
