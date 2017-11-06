using Domain.Socioboard.Models.Mongo;
using SocioboardDataServices.BoardMe;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.BoardMe
{
    public class BoardMedataServices
    {
        public void UpdateBoardMe()
        {
            while (true)
            {
                try
                {
                    BoardMeUpdation objBoardMeUpdation = new BoardMe.BoardMeUpdation();
                   DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.MongoBoards> lstMongoBoards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.isActive == Domain.Socioboard.Enum.boardStatus.active).ToList();
                    
                    foreach (Domain.Socioboard.Models.MongoBoards item in lstMongoBoards)
                    {
                        Console.WriteLine(item.boardName + "Updating Started");
                        string returdaTA = objBoardMeUpdation.UpdateBoard(item);
                        Console.WriteLine(item.boardName + returdaTA);
                    }
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }

        public void UpdateTwitttertrendsBoard()
        {
            while (true)
            {
                new Thread(delegate ()
                {
                    Trending.TwitterTrendingTweet obj_twt = new Trending.TwitterTrendingTweet();
                    obj_twt.GetLatestTrendsFromTwiter();
                   // obj_twt.UpdateTrendsKeywordfeed();
                }).Start();
                Thread.Sleep(1000 * 60 * 60 * 4);
            }
        }
        public void UpdateFacebooktrendsBoard()
        {
            while (true)
            {
                new Thread(delegate ()
                {
                    Trending.FacebookTrendingPost _facebookTrending = new Trending.FacebookTrendingPost();
                    _facebookTrending.LoginUsingGlobusHttp();
                }).Start();
                Thread.Sleep(1000 * 60 * 60 * 4);
            }
        }
    }
}
