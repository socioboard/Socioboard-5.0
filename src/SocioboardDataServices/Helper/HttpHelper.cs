using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace SocioboardDataServices.Helper
{
    public static class HttpHelper
    {
        public static async Task<string> GetRequest(string BaseAddress, string url, SortedDictionary<string, string> parameters)
        {
            using (HttpClient httpclient = new HttpClient())
            {
                httpclient.BaseAddress = new Uri(BaseAddress);
                HttpResponseMessage HrMessage = await httpclient.GetAsync(url + "?" + parameters.ToWebString());
                return await HrMessage.Content.ReadAsStringAsync();
            }
        }
    }
}