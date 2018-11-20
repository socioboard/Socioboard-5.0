using System.Collections.Concurrent;

namespace SocioboardDataServices.Helper
{
    public class DataServicesBase
    {
        public static ConcurrentDictionary<ServiceDetails, bool> ActivityRunningStatus { get; set; } =
            new ConcurrentDictionary<ServiceDetails, bool>();
    }
}