using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    public class InstagramUserDetails
    {
        public string Profile_Id { get; set; }
        public string Insta_Name { get; set; }
        public string Full_Name { get; set; }
        public string Media_Count { get; set; }
        public double Created_Time { get; set; }
        public string Follower { get; set; }
        public string Following { get; set; }
    }
}
