using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AdvancedContentSearch.SearchLibrary;

namespace AdvancedContentSearch
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Program.StartServices(args);
        }
        static void StartServices(string[] args)
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

                Console.WriteLine("Enter 1 to run Twitter Advance Search");
                Console.WriteLine("Enter 2 to run DailyMotion Search");
                Console.WriteLine("Enter 3 to run Youtube Search");
                Console.WriteLine("Enter 4 to run Trending Search");
                Console.WriteLine("Enter 5 to run Instagram Search");
                Console.WriteLine("Enter 6 to run Flickr Search");
                Console.WriteLine("Enter 7 to run NewsAdvance Search");
                Console.WriteLine("Enter 8 to run Giphy Search");
                Console.WriteLine("Enter 9 to run Imgur Search");
                Console.WriteLine("Enter 10 to run Pixabay Search");
                Console.WriteLine("Enter 11 to run GPlus Advance Search");
                string[] str = { Console.ReadLine() };

                string searchType = str[0];
                string type = string.Empty;
                switch (searchType)
                {
                    case "1":
                        type = "Twitter Advance Search";
                        break;
                    case "2":
                        type = "DailyMotion Search";
                        break;
                    case "3":
                        type = "Youtube Search";
                        break;
                    case "4":
                        type = "Trending Search";
                        break;
                    case "5":
                        type = "Instagram Search";
                        break;
                    case "6":
                        type = "Flickr Search";
                        break;
                    case "7":
                        type = "NewsAdvance Search";
                        break;
                    case "8":
                        type = "Giphy Search";
                        break;
                    case "9":
                        type = "Imgur Search";
                        break;
                    case "10":
                        type = "Pixabay Search"; 
                        break;
                    case "11":
                        type = "GPlus Advance Search"; 
                        break;
                    default:
                        break;
                }
                if (type == "Pixabay Search")
                {
                    while (true)
                    {
                        PixabayAdvanceSearch.PixaBaySearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Imgur Search")
                {
                    while (true)
                    {
                        ImgurAdvanceSearch.ImgurSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Giphy Search")
                {
                    while (true)
                    {
                        GiphyAdvanceSearch.GiphySearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "NewsAdvance Search")
                {
                    while (true)
                    {
                        NewsAdvanceSearch.NewsSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Flickr Search")
                {
                    while (true)
                    {
                        FlickrAdvanceSearch.flickrSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Instagram Search")
                {
                    while (true)
                    {
                        InstgramAdvanceSearch.instgramSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Twitter Advance Search")
                {
                    while (true)
                    {
                        TwitterAdvanceSearch.TwitterSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "DailyMotion Search")
                {
                    while (true)
                    {
                        DailyMotionAdvanceSearch.DailyMotionSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Youtube Search")
                {
                    while (true)
                    {
                        YoutubeAdvanceSearch.YoutubeSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "Trending Search")
                {
                    while (true)
                    {
                        TrendingAdvanceSearch.GetLatestTrendsFromTwiter();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
                if (type == "GPlus Advance Search")
                {
                    while (true)
                    {
                        GplusAdvanceSearch.GooglePlusSearch();
                        Thread.Sleep(1000 * 60 * 60 * 5);
                    }
                }
            }
        }
    }
}
