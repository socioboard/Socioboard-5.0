using Domain.Socioboard.Enum;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public static class SBHelper
    {
        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public static string Md5Hash(string text)
        {
            var md5 = MD5.Create();

            //compute hash from the bytes of text
            var result = md5.ComputeHash(Encoding.Unicode.GetBytes(text));

            //get hash result after compute it
            //  byte[] result = md5.ComputeHash;
            var strBuilder = new StringBuilder();
            for (var i = 0; i < result.Length; i++)
            {
                //change it into 2 hexadecimal digits
                //for each byte
                strBuilder.Append(result[i].ToString("x2"));
            }
            return strBuilder.ToString();
        }


        public static int GetMaxProfileCount(SBAccountType accountType)
        {
            int maxProfileCount;

            switch (accountType)
            {
                case SBAccountType.Free:
                    maxProfileCount = 5;
                    break;
                case SBAccountType.Standard:
                    maxProfileCount = 10;
                    break;
                case SBAccountType.Premium:
                    maxProfileCount = 20;
                    break;
                case SBAccountType.Deluxe:
                    maxProfileCount = 50;
                    break;
                case SBAccountType.Topaz:
                    maxProfileCount = 100;
                    break;
                case SBAccountType.Ruby:
                    maxProfileCount = 200;
                    break;
                case SBAccountType.Gold:
                    maxProfileCount = 500;
                    break;
                case SBAccountType.Platinum:
                    maxProfileCount = 1000;
                    break;
                default:
                    maxProfileCount = 5;
                    break;
            }
            return maxProfileCount;
        }

        public static int GetMaxGroupCount(SBAccountType accountType)
        {
            int ret = 5;
            switch (accountType)
            {
                case SBAccountType.Free:
                    ret = 1;
                    break;
                case SBAccountType.Standard:
                    ret = 1;
                    break;

                case SBAccountType.Premium:
                    ret = 1;
                    break;
                case SBAccountType.Deluxe:
                    ret = 5;
                    break;
                case SBAccountType.Topaz:
                    ret = 10;
                    break;
                case SBAccountType.Ruby:
                    ret = 15;
                    break;
                case SBAccountType.Gold:
                    ret = 20;
                    break;
                case SBAccountType.Platinum:
                    ret = 25;
                    break;
                default:
                    ret = 1;
                    break;



            }
            return ret;
        }

        public static DateTime ConvertFromUnixTimestamp(double timestamp)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            return origin.AddSeconds(timestamp);
        }

        public static DateTime ConvertUnixTimeStamp(string unixTimeStamp)
        {
            return new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(Convert.ToDouble(unixTimeStamp));
        }

        public static double ConvertToUnixTimestamp(DateTime date)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            TimeSpan diff = date.ToUniversalTime() - origin;
            return Math.Floor(diff.TotalSeconds);
        }

        public static void ForEach<T>(this IEnumerable<T> items, Action<T> action)
        {
            foreach (var item in items)
            {
                try
                {
                    action(item);
                }
                catch (IOException io)
                {
                    Console.WriteLine(io.Message);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                }
            }
        }

    }
}
