using Google.Apis.Analytics.v3;
using Google.Apis.Analytics.v3.Data;
using System;

namespace Api.Socioboard.Helper
{
    public static class GoogleAnalyticsRealTimeHelper
    {
        /// <summary>
        /// There are several query Parameters that are optional this will allow you to send the ones you want.
        /// </summary>
        public class OptionalValues
        {
            private string dimensions { get; set; }
            private string filter { get; set; }
            private string sort { get; set; }
            private string segment { get; set; }
            private int maxResults { get; set; }
            private DataResource.GaResource.GetRequest.SamplingLevelEnum sampleingLevel = DataResource.GaResource.GetRequest.SamplingLevelEnum.DEFAULT__;


            /// <summary>
            /// A list of comma-separated dimensions for your Analytics data, such as ga:browser,ga:city. 
            /// Documentation: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#dimensions
            /// </summary>            
            public string Dimensions { get { return dimensions; } set { dimensions = value; } }

            /// <summary>
            /// Dimension or metric filters that restrict the data returned for your request. 
            /// Documentation: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#filters
            /// </summary>
            public string Filter { get { return filter; } set { filter = value; } }

            /// <summary>
            /// A list of comma-separated dimensions and metrics indicating the sorting order and sorting direction for the returned data. 
            /// Documentation:  https://developers.google.com/analytics/devguides/reporting/core/v3/reference#sort
            /// </summary>
            public string Sort { get { return sort; } set { sort = value; } }

            /// <summary>
            /// Constructor sets up the default values, for things that can't be null.
            /// </summary>
            public OptionalValues()
            {
                this.dimensions = null;
                this.filter = null;
                this.sort = null;
                this.segment = null;
            }
        }
        /// <summary>
        /// Returns real-time Google Analytics data for a view (profile).
        /// https://developers.google.com/analytics/devguides/reporting/realtime/v3/reference/data/realtime/get
        /// 
        /// 
        /// Beta:
        /// The Real Time Reporting API is currently available as a developer preview in limited beta. If you're interested in signing up, request access to the beta.
        /// https://docs.google.com/forms/d/1qfRFysCikpgCMGqgF3yXdUyQW4xAlLyjKuOoOEFN2Uw/viewform
        /// Apply for access wait 24 hours and then try you will not hear from Google when you have been approved. 
        /// 
        /// Documentation: Dimension and metric reference https://developers.google.com/analytics/devguides/reporting/realtime/dimsmets/
        /// </summary>
        /// <param name="service">Valid authenticated Google analytics service</param>
        /// <param name="profileId">Profile id to request data from </param>
        /// <param name="metrics">Valid Real time Metrics (Required)</param>
        /// <param name="optionalValues">Optional values can be null</param>
        /// <returns>https://developers.google.com/analytics/devguides/reporting/realtime/v3/reference/data/realtime#resource</returns>
        public static RealtimeData Get(AnalyticsService service, string profileId, string metrics, OptionalValues optionalValues)
        {
            try
            {

                DataResource.RealtimeResource.GetRequest request = service.Data.Realtime.Get(String.Format("ga:{0}", profileId), metrics);
                request.MaxResults = 10000;


                if (optionalValues != null)
                {
                    request.Dimensions = optionalValues.Dimensions;
                    request.Sort = optionalValues.Sort;
                    request.Filters = optionalValues.Filter;
                }


                RealtimeData feed = request.Execute();

                return feed;
            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.Message);
                return null;

            }


        }
    }
}
