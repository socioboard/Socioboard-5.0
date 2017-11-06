using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Collections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Net;
using System.IO;

namespace BaseLib
{
    public class Utils
    {
        public static Regex IdCheck = new Regex("^[0-9]*$");

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }

        public static string GenerateTimeStamp()
        {
            string strGenerateTimeStamp = string.Empty;
            try
            {
                // Default implementation of UNIX time of the current UTC time
                TimeSpan ts = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0);
                strGenerateTimeStamp = Convert.ToInt64(ts.TotalMilliseconds).ToString();
            }
            catch (Exception ex)
            {
                
            }
            return strGenerateTimeStamp;
        }

    }

 
}
