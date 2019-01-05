using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.EmailServices
{
    public static class DateExtension
    {
        public static long ToUnixTimestamp(this DateTime target)
        {
            var date = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);
            var unixTimestamp = System.Convert.ToInt64((target - date).TotalSeconds);

            return unixTimestamp;
        }
    }
}
