using Google.Apis.Analytics.v3;
using Google.Apis.Analytics.v3.Data;
using log4net;
using System;
using System.Collections.Generic;

namespace Api.Socioboard.Helper
{
    public static class GoogleAnaltyicsReportingHelper
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
            /// Segments the data returned for your request. 
            /// Documentation: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#segment
            /// </summary>
            public string Segment { get { return segment; } set { segment = value; } }

            /// <summary>
            /// The maximum number of rows to include in the response. max is 10000
            /// </summary>
            public int MaxResults { get { return maxResults; } set { maxResults = value; } }


            /// <summary>
            /// The desired sampling level. 
            /// Allowed Values: 
            /// •DEFAULT — Returns response with a sample size that balances speed and accuracy.
            /// •FASTER — Returns a fast response with a smaller sample size.
            /// •HIGHER_PRECISION — Returns a more accurate response using a large sample size, but this may result in the response being slower.
            /// Documentation: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#samplingLevel
            /// </summary>
            public DataResource.GaResource.GetRequest.SamplingLevelEnum Sampling { get { return sampleingLevel; } set { sampleingLevel = value; } }

            /// <summary>
            /// Constructor sets up the default values, for things that can't be null.
            /// </summary>
            public OptionalValues()
            {
                this.dimensions = null;
                this.filter = null;
                this.sort = null;
                this.segment = null;
                this.sampleingLevel = DataResource.GaResource.GetRequest.SamplingLevelEnum.DEFAULT__;
                this.maxResults = 1000;
            }
        }


        /// <summary>
        /// You query the Core Reporting API for Google Analytics report data. 
        /// Documentation: https://developers.google.com/analytics/devguides/reporting/core/v3/reference
        /// 
        /// Dimension and metric reference : https://developers.google.com/analytics/devguides/reporting/core/dimsmets
        /// </summary>
        /// <param name="service">Valid Authenticated AnalyticsServicve </param>
        /// <param name="ProfileId">The unique table ID of the form XXXX, where XXXX is the Analytics view (profile) ID for which the query will retrieve the data. </param>
        /// <param name="StartDate">Start date for fetching Analytics data. Requests can specify a start date formatted as YYYY-MM-DD, or as a relative date (e.g., today, yesterday, or NdaysAgo where N is a positive integer). </param>
        /// <param name="EndDate">End date for fetching Analytics data. Request can specify an end date formatted as YYYY-MM-DD, or as a relative date (e.g., today, yesterday, or NdaysAgo where N is a positive integer). </param>
        /// <param name="Metrics">A list of comma-separated metrics, such as ga:sessions,ga:bounces. </param>
        /// <param name="optionalValues">Optional values can be null </param>
        /// <returns></returns>
        public static GaData Get(AnalyticsService service, string profileId, string startDate, string endDate, string metrics, OptionalValues optionalValues)
        {

           // ILog logger = LogManager.GetLogger(typeof(OptionalValues));
            try
            {
                DataResource.GaResource.GetRequest request = service.Data.Ga.Get(String.Format("ga:{0}", profileId), startDate, endDate, metrics);
                if (optionalValues == null)
                {
                    request.MaxResults = 1000;
                }
                else
                {
                    request.MaxResults = optionalValues.MaxResults;
                    request.Dimensions = optionalValues.Dimensions;
                    request.SamplingLevel = optionalValues.Sampling;
                    request.Segment = optionalValues.Segment;
                    request.Sort = optionalValues.Sort;
                    request.Filters = optionalValues.Filter;

                }
                return ProcessResults(request);
            }
            catch (Exception e)
            {
              //  logger.Error(e.StackTrace);
                //logger.Error(e.Message);
            }
            return null;

        }


        // Just loops though getting all the rows.  
        private static GaData ProcessResults(DataResource.GaResource.GetRequest request)
        {
            try
            {
                GaData result = request.Execute();
                List<IList<string>> allRows = new List<IList<string>>();

                //// Loop through until we arrive at an empty page
                while (result.Rows != null)
                {
                    //Add the rows to the final list
                    allRows.AddRange(result.Rows);

                    // We will know we are on the last page when the next page token is
                    // null.
                    // If this is the case, break.
                    if (result.NextLink == null)
                    {
                        break;
                    }

                    // Prepare the next page of results             
                    request.StartIndex = request.StartIndex + request.MaxResults;
                    // Execute and process the next page request
                    result = request.Execute();

                }
                GaData allData = result;
                allData.Rows = (List<IList<string>>)allRows;
                return allData;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }




        }

    }
}
