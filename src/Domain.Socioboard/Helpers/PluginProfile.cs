using Domain.Socioboard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public class PluginProfile
    {
        public string type { get; set; }
        public Facebookaccounts  facebookprofile { get; set; }
        public TwitterAccount twitterprofile { get; set; }
    }
}
