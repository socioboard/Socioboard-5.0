using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Socioboard.ExtensionClasses
{
    public static class MyExtension
    {

        public static string ToWebString(this SortedDictionary<string, string> source)
        {
            var body = new StringBuilder();
            try
            {
                if (source.Count != 0)
                {

                    foreach (var requestParameter in source)
                    {
                        body.Append(requestParameter.Key);
                        body.Append("=");
                        body.Append(Uri.EscapeDataString(requestParameter.Value));
                        body.Append("&");
                    }
                    //remove trailing '&'
                    body.Remove(body.Length - 1, 1);

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error : " + ex.StackTrace);
            }
            return body.ToString();
        }

    }
}