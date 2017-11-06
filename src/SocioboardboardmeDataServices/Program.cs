using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;

namespace SocioboardDataServices
{
    public class Program
    {
        public static void Main(string[] args)
        {

           Program.StartService(args);
        }

        static void StartService(string[] args)
        {

            string check = string.Empty;
            try
            {
                check = args[0];
            }
            catch (Exception)
            {
                check = null;
            }
            if (string.IsNullOrEmpty(check))
            {

                Console.WriteLine("Enter 1 to run BoardMe DataServices");
                Console.WriteLine("Enter 2 to run Twitter Trending DataServices");
                Console.WriteLine("Enter 3 to run Facebook Trending DataServices");

                string dataService = Console.ReadLine();

                if (dataService == "1")
                {
                    BoardMe.BoardMedataServices objboard = new BoardMe.BoardMedataServices();
                    objboard.UpdateBoardMe();
                }
                else if (dataService == "2")
                {
                    BoardMe.BoardMedataServices objboard = new BoardMe.BoardMedataServices();
                    objboard.UpdateTwitttertrendsBoard();
                }
                else if (dataService == "3")
                {
                    BoardMe.BoardMedataServices objboard = new BoardMe.BoardMedataServices();
                    objboard.UpdateFacebooktrendsBoard();
                }
                else
                {
                    Console.WriteLine("Invalid Option");
                }
            }


        }
    }
}
