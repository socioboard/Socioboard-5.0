using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using FluentScheduler;
using SocioboardDataServices.Helper;

namespace SocioboardDataServices.Twitter
{
    public class TwitterServiceHelper
    {
        /// <summary>
        /// To get all twitter account 
        /// </summary>
        /// <returns>twitter accounts</returns>
        public static IEnumerable<TwitterAccount> GetTwitterAccounts()
        {
            try
            {
                var databaseRepository = new DatabaseRepository();
                var twitterAccounts = databaseRepository.Find<TwitterAccount>(t => t.isActive).ToList();
                return twitterAccounts;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new List<TwitterAccount>();
            }
        }


        #region Option 2 - Update Twitters accounts details and its feed  

        public void UpdateTwitterAccounts()
        {
            try
            {
                JobManager.AddJob(() =>
                {
                    var status =
                        DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.TwitterUpdateFeeds,
                            objStatus => false);

                    if (!status)
                        StartUpdateAccountDetails();
                }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(10).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void StartUpdateAccountDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.TwitterUpdateFeeds, true, (enumType, runningStatus) => true);
                var twtAccounts = GetTwitterAccounts();
                Parallel.ForEach(twtAccounts, new ParallelOptions { MaxDegreeOfParallelism = 100 }, account =>
                {
                    UpdateFbFeedDetails(account);
                });
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.TwitterUpdateFeeds, true, (enumType, runningStatus) => false);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Twitter API Issue" + ex.StackTrace);
            }
        }

        public int UpdateFbFeedDetails(TwitterAccount twitterAccount)
        {
           
            var databaseRepository = new DatabaseRepository();

            if (twitterAccount.lastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (!twitterAccount.isAccessTokenActive)
                    return 0;

                ParseAndUpdateAccountDetails(twitterAccount, databaseRepository);              
            }
            
            return 0;
        }

        public void ParseAndUpdateAccountDetails(TwitterAccount twitterAccount, DatabaseRepository databaseRepository)
        {
            try
            {
               
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }



        #endregion

    }
}