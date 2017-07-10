using Microsoft.CodeAnalysis.Differencing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Lib
{
    public static class Helpers
    {
        public static long EpochTime()
        {
            double millis = DateTime.UtcNow
                .Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc))
                .TotalMilliseconds;
            return Convert.ToInt64(millis);
        }

        public static string GetHtmlTitle(string html)
        {
            Match m = Regex.Match(html, @".*?(?i)<title>(.*?)<\/title>.*");
            if (m.Success)
            {
                return m.Groups[1].Value;
            }
            else
            {
                return "";
            }
        }
    }
}
