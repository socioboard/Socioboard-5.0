using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Services
{
    public class CustomViewLocationRazorViewEngine : IViewLocationExpander
    {
        public void PopulateValues(ViewLocationExpanderContext context)

        {
            //var value = new Random().Next(0, 1);
            //var theme = value == 0 ? "Theme1" : "Theme2";
            //context.Values["theme"] = theme;
        }
        public virtual IEnumerable<string> ExpandViewLocations(ViewLocationExpanderContext context, IEnumerable<string> viewLocations)

        {
            return viewLocations.Select(f => f.Replace("/Views/", "/Themes/Socioboard/Views/"));
        }

    }
}
