using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.GeographiesMethods;

namespace Socioboard.Instagram.App.Core
{
    class GeographiesController
    {
        public InstagramMedia[] GeographyMedia(string geographyid, string accessToken)
        {
            Geographies objGeo = new Geographies();
            return objGeo.GeographyMedia(geographyid, accessToken);
        }
    }
}
