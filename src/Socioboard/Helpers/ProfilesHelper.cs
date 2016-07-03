using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Socioboard.Helpers
{
    public class ProfilesHelper
    {
        public static async Task<string> GetUserProfileCount(long userId, Helpers.AppSettings _appSettings, ILogger _logger)
        {
            string count = "0";
            HttpResponseMessage response = await WebApiReq.GetReq("/api/User/GetUserProfileCount?userId=" + userId, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    count = await response.Content.ReadAsStringAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                    count = "Error while getting profiles count";
                }
            }
            else
            {
                count = "Error while calling profile count api.";
            }
            return count;
        }
    }
}
