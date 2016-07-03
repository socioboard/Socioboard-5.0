using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace Api.Socioboard.Helper
{
    static public class Utility
    {
       static public string MD5Hash(string text)
        {
            MD5 md5 = new MD5CryptoServiceProvider();

            //compute hash from the bytes of text
            md5.ComputeHash(ASCIIEncoding.ASCII.GetBytes(text));

            //get hash result after compute it
            byte[] result = md5.Hash;

            StringBuilder strBuilder = new StringBuilder();
            for (int i = 0; i < result.Length; i++)
            {
                //change it into 2 hexadecimal digits
                //for each byte
                strBuilder.Append(result[i].ToString("x2"));
            }

            return strBuilder.ToString();
        }

       public static DateTime ParseTwitterTime(string date)
       {
           const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
           return DateTime.ParseExact(date, format, CultureInfo.InvariantCulture);
       }

       public static string GenerateRandomUniqueString()
       {
           Guid g = Guid.NewGuid();
           string GuidString = Convert.ToBase64String(g.ToByteArray());
           GuidString = GuidString.Replace("=", "");
           GuidString = GuidString.Replace("+", "");
           return GuidString;
       }

    }
}