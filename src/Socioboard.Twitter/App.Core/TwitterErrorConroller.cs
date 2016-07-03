using System;
using System.Collections.Generic;
using System.Text;

namespace Socioboard.Twitter.App.Core
{
    public class TwitterErrorConroller
    {
        public string ErrorCode(string ErrorMessage)
        {
            if (ErrorMessage.Contains("200"))
            {
                return "200";
            }
            else if (ErrorMessage.Contains("304"))
            {
                return "304";
            }
            else if (ErrorMessage.Contains("400"))
            {
                return "400";
            }
            else if (ErrorMessage.Contains("401"))
            {
                return "401";
            }
            else if (ErrorMessage.Contains("403"))
            {
                return "403";
            }
            else if (ErrorMessage.Contains("404"))
            {
                return "404";
            }
            else if (ErrorMessage.Contains("406"))
            {
                return "406";
            }
            else if (ErrorMessage.Contains("500"))
            {
                return "500";
            }
            else if (ErrorMessage.Contains("502"))
            {
                return "502";
            }
            else if (ErrorMessage.Contains("503"))
            {
                return "503";
            }

            return string.Empty;
        }
    }
}
