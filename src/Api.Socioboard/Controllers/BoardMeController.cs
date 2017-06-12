using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using Domain.Socioboard.Models.Mongo;
using Api.Socioboard.Model;
using MongoDB.Driver;
using MongoDB.Bson;
using Google.Apis.Analytics.v3;
using Api.Socioboard.Helper;
using Api.Socioboard.Repositories.BoardMeRepository;
using System.Xml;
using System.IO;
using System.Xml.Linq;

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class BoardMeController : Controller
    {
        public BoardMeController(ILogger<DiscoveryController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        /// <summary>
        /// Creates a board with porvided hash Tags
        /// </summary>
        /// <param name="boardName">Name of the board should be unique</param>
        /// <param name="fbHashTag"> hash tag on facebook</param>
        /// <param name="twitterHashTag">hash tag on twitter</param>
        /// <param name="instagramHashTag"> hash tag on instagram</param>
        /// <param name="gplusHashTag">hash tag on gplus</param>
        /// <param name="userId">id of the user to which board belongs to </param>
        /// <returns>success : if board created successfully, board Exist: if board name already exists  </returns>
        [HttpPost("createBoard")]
        public async Task<IActionResult> createBoard(string boardName, string fbHashTag, string twitterHashTag, string instagramHashTag, string gplusHashTag, long userId)
        {
            Repositories.BoardMeRepository.BoardMeRepository brRepository = new Repositories.BoardMeRepository.BoardMeRepository();
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            AddTOSiteMap(boardName);
            return Ok(await brRepository.CreateBoard(boardName, twitterHashTag, instagramHashTag, gplusHashTag, userId, _redisCache, _appSettings, _logger, dbr));
        }

        /// <summary>
        /// Deletes the board with specified board Id
        /// </summary>
        /// <param name="BoardId"> id of the board to delte</param>
        /// <param name="userId">id of the user to which board belongs to.</param>
        /// <returns></returns>
        [HttpPost("DeleteBoard")]
        public IActionResult DeleteBoard(long BoardId, long userId)
        {
            DatabaseRepository boardrepo = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
            try
            {
                boards = boardrepo.Find<Domain.Socioboard.Models.MongoBoards>(t => t.id.Equals(BoardId)).ToList();

            }
            catch (Exception e)
            {
            }
            if (boards.Count() > 0)
            {
                Domain.Socioboard.Models.MongoBoards board = boards.First();
                board.isActive = Domain.Socioboard.Enum.boardStatus.inactive;
                boardrepo.Update<Domain.Socioboard.Models.MongoBoards>(board);
                return Ok("Deleted");
            }

            return Ok("board not exist");

        }

        /// <summary>
        /// Revert back deletion opertion of board
        /// </summary>
        /// <param name="BoardId">id of the board which needs to revert delete</param>
        /// <param name="userId"> id of the user which board belongs to.</param>
        /// <returns></returns>
        [HttpPost("UndoDeleteBoard")]
        public IActionResult UndoDeleteBoard(string BoardId, long userId)
        {
            DatabaseRepository boardrepo = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
            try
            {
                boards = boardrepo.Find<Domain.Socioboard.Models.MongoBoards>(t => t.id.Equals(BoardId)).ToList();
            }
            catch (Exception e)
            {
            }
            if (boards.Count() > 0)
            {
                Domain.Socioboard.Models.MongoBoards board = boards.First();
                board.isActive = Domain.Socioboard.Enum.boardStatus.active;
                boardrepo.Update<Domain.Socioboard.Models.MongoBoards>(board);
                return Ok("success");
            }

            return Ok("failed to update");

        }

        /// <summary>
        /// To get all boards associated with user
        /// </summary>
        /// <param name="userId">coorsponding userId</param>
        /// <returns></returns>
        [HttpGet("getUserBoards")]
        public IActionResult getUserBoards(long userId)
        {
            DatabaseRepository boardrepo = new DatabaseRepository(_logger, _env);
            try
            {
                List<Domain.Socioboard.Models.MongoBoards> boardslist = boardrepo.Find<Domain.Socioboard.Models.MongoBoards>(t => t.userId == userId && t.isActive == Domain.Socioboard.Enum.boardStatus.active).ToList();
                boardslist= boardslist.Select(s => { s.boardName = s.boardName.Replace("/","SB"); return s; }).ToList();
                return Ok(boardslist);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return Ok(new List<Domain.Socioboard.Models.MongoBoards>());
            }
        }

        [HttpGet("getBoard")]
        public IActionResult getBoard(long boardId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            try
            {

                return Ok(BoardMeRepository.getBoard(boardId, _redisCache, _appSettings, _logger, dbr));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return BadRequest("Something Went Wrong");
            }
        }

        [HttpGet("getBoardByName")]
        public IActionResult getBoardByName(string boardName)
        {
            boardName = boardName.Replace("SB", "/");
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            try
            {

                return Ok(BoardMeRepository.getBoardByName(boardName, _redisCache, _appSettings, _logger, dbr));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return BadRequest("Something Went Wrong");
            }
        }

        [HttpGet("getAnalytics")]
        public IActionResult getAnalytics(string boardId)
        {
            Domain.Socioboard.ViewModels.GoogleAnalyticsViewModel ganalytics = new Domain.Socioboard.ViewModels.GoogleAnalyticsViewModel();
            AnalyticsService service;
            string filePath = System.IO.Path.Combine(_env.ContentRootPath, "SocioboardBoardMe-1b20a17f8879.p12");
            // string filePath = "/SocioboardBoardMe-1b20a17f8879.p12";
            service = Api.Socioboard.Helper.GoogleAnalyticsAuthenticationHelper.AuthenticateServiceAccount("244513724654-0th6146rg1cqvr0hmqhv1r5gjgm3rbg3@developer.gserviceaccount.com", filePath);
            GoogleAnaltyicsReportingHelper.OptionalValues options = new GoogleAnaltyicsReportingHelper.OptionalValues();
            options.Dimensions = "ga:year,ga:month,ga:day";
            options.Filter = "ga:pagePath==/board/" + boardId;
            //Make sure the profile id you send is valid.
            var x = GoogleAnaltyicsReportingHelper.Get(service, "101919148", "10daysAgo", "today", "ga:pageviews", options);
            List<Domain.Socioboard.ViewModels.AnalyticsGraphViewModel> analyticsGraphList = new List<Domain.Socioboard.ViewModels.AnalyticsGraphViewModel>();
            foreach (var item in x.Rows)
            {
                Domain.Socioboard.ViewModels.AnalyticsGraphViewModel anagraphviemodel = new Domain.Socioboard.ViewModels.AnalyticsGraphViewModel();
                anagraphviemodel.date = new DateTime(int.Parse(item[0]), int.Parse(item[1]), int.Parse(item[2])).ToString("dd-MM-yyyy");
                anagraphviemodel.viewsCount = item[3];
                analyticsGraphList.Add(anagraphviemodel);
            }
            ganalytics.PageViewsGraphData = analyticsGraphList;
            GoogleAnaltyicsReportingHelper.OptionalValues options1 = new GoogleAnaltyicsReportingHelper.OptionalValues();
            options1.Dimensions = "ga:pagePath";
            options1.Filter = "ga:pagePath==/board/" + boardId;
            // options1.Dimensions = "ga:date";
            //Make sure the profile id you send is valid.  
            var x1 = GoogleAnaltyicsReportingHelper.Get(service, "101919148", "2015-01-01", "today", "ga:sessions,ga:pageviews", options1);
            try
            {

                ganalytics.TotalPageViews = x1.Rows[0][2];
                ganalytics.TotalSessions = x1.Rows[0][1];
            }
            catch
            {
                ganalytics.TotalPageViews = "0";
            }


            GoogleAnalyticsRealTimeHelper.OptionalValues rtOptions = new GoogleAnalyticsRealTimeHelper.OptionalValues();
            rtOptions.Dimensions = "rt:userType, ga:pagePath";
            rtOptions.Filter = "ga:pagePath==/board/" + boardId;
            //Make sure the profile id you send is valid.  
            var realTimeData = GoogleAnalyticsRealTimeHelper.Get(service, "101919148", "rt:activeUsers", rtOptions);
            ganalytics.RealTimePageViews = realTimeData.TotalsForAllResults.First().Value;



            GoogleAnaltyicsReportingHelper.OptionalValues optionss = new GoogleAnaltyicsReportingHelper.OptionalValues();
            optionss.Dimensions = "ga:country,ga:city";
            optionss.Filter = "ga:pagePath==/board/" + boardId;
            //Make sure the profile id you send is valid.  
            var xs = GoogleAnaltyicsReportingHelper.Get(service, "101919148", "10daysAgo", "today", "ga:pageviews", optionss);
            List<Domain.Socioboard.ViewModels.GoogleAnalyticsCityPageViews> citypageviewlist = new List<Domain.Socioboard.ViewModels.GoogleAnalyticsCityPageViews>();
            try
            {
                foreach (var item in xs.Rows)
                {
                    Domain.Socioboard.ViewModels.GoogleAnalyticsCityPageViews cityview = new Domain.Socioboard.ViewModels.GoogleAnalyticsCityPageViews();
                    cityview.Count = item[2];
                    cityview.City = item[1];
                    cityview.Country = item[0];
                    citypageviewlist.Add(cityview);
                }
            }
            catch
            {

            }
            ganalytics.citypageviews = citypageviewlist;




            return Ok(ganalytics);

        }


        [HttpGet("getTwitterFeeds")]
        public IActionResult getTwitterFeeds(long boardId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.MongoBoards board = BoardMeRepository.getBoard(boardId, _redisCache, _appSettings, _logger, dbr);
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", _appSettings);
            try
            {
                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(board.twitterHashTag)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardTwtFeeds> objTwitterPagelist = task.Result;
                List<MongoBoardTwtFeeds> objBoardGplusPagefeeds = objTwitterPagelist.OrderByDescending(t => t.Publishedtime).Skip(Convert.ToInt32(skip)).Take(Convert.ToInt32(count)).ToList();
                return Ok(objBoardGplusPagefeeds);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return Ok("Something Went Wrong");
            }
        }


        [HttpGet("getInstagramFeeds")]
        public IActionResult getInstagramFeeds(long boardId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.MongoBoards board = BoardMeRepository.getBoard(boardId, _redisCache, _appSettings, _logger, dbr);

            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramFeeds", _appSettings);
            try
            {

                var result = boardrepo.Find<MongoBoardInstagramFeeds>(t => t.Instagramaccountid.Equals(board.instagramHashTag)).ConfigureAwait(false);

                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardInstagramFeeds> objTwitterPagelist = task.Result;
                List<MongoBoardInstagramFeeds> objBoardGplusPagefeeds = objTwitterPagelist.OrderByDescending(t => t.Publishedtime).Skip(Convert.ToInt32(skip)).Take(Convert.ToInt32(count)).ToList();
                return Ok(objBoardGplusPagefeeds);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return Ok("Something Went Wrong");
            }

        }


        [HttpGet("getGplusfeeds")]
        public IActionResult getGplusfeeds(long boardId, string skip, string count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.MongoBoards board = BoardMeRepository.getBoard(boardId, _redisCache, _appSettings, _logger, dbr);
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusFeeds", _appSettings);
            try
            {
                //List<MongoBoardGplusFeeds> objBoardGplusPagefeeds = boardrepo.getBoardGplusfeedsbyrange(Guid.Parse(BoardGplusprofileId), Convert.ToInt32(_noOfDataToSkip), Convert.ToInt32(_noOfResultsFromTop));
                var result = boardrepo.Find<MongoBoardGplusFeeds>(t => t.Gplusboardaccprofileid.Equals(board.gplusHashTag)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardGplusFeeds> objTwitterPagelist = task.Result;
                List<MongoBoardGplusFeeds> objBoardGplusPagefeeds = objTwitterPagelist.OrderByDescending(t => t.Publishedtime).Skip(Convert.ToInt32(skip)).Take(Convert.ToInt32(count)).ToList();
                return Ok(objBoardGplusPagefeeds);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return Ok("Something Went Wrong");
            }

        }


        [HttpGet("getfacebookFeeds")]
        public IActionResult getfacebookFeeds(long boardId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.MongoBoards board = BoardMeRepository.getBoard(boardId, _redisCache, _appSettings, _logger, dbr);
            MongoRepository boardrepo = new MongoRepository("MongoBoardFbTrendingFeeds", _appSettings);
            try
            {
                var result = boardrepo.Find<MongoBoardFbTrendingFeeds>(t => t.facebookprofileid.Equals(board.facebookHashTag));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardFbTrendingFeeds> objTwitterPagelist = task.Result;
                List<MongoBoardFbTrendingFeeds> objBoardGplusPagefeeds = objTwitterPagelist.OrderByDescending(t => t.publishedtime).Skip(Convert.ToInt32(skip)).Take(Convert.ToInt32(count)).ToList();
                return Ok(objBoardGplusPagefeeds);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return Ok("Something Went Wrong");
            }
        }


        [HttpGet("getTopTrending")]
        public IActionResult getTopTrending()
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                return Ok(BoardMeRepository.getTopTrending(_redisCache, _appSettings, _logger, dbr));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return BadRequest("Something Went Wrong");
            }
        }

        [HttpGet("AddTOSiteMap")]
        public IActionResult AddTOSiteMap(string boardName)
        {
            bool result = false;
            try
            {
                string appendNode = "<url><loc>https://boards.socioboard.com/" + boardName + "</loc><lastmod>" + DateTime.UtcNow.ToString("yyyy-MM-dd") + "</lastmod><changefreq>Hourly</changefreq><priority>0.6</priority></url>";
                //XmlTextWriter writer = new XmlTextWriter("site.xml", System.Text.Encoding.UTF8);
                //writer.WriteStartDocument();
                //writer.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");

                //writer.WriteStartElement("url");

                //writer.WriteElementString("loc", boardName);
                //writer.WriteElementString("priority", "0.5");
                //writer.WriteEndElement();

                ////Now we loop for creating the XML node for all products

                //int i = 0;
                ////Creating the  element
                //writer.WriteStartElement("url");
                //writer.WriteElementString("loc", "teste");
                //writer.WriteElementString("priority", "0.5");
                //writer.WriteEndElement();
                //writer.WriteEndDocument();
                //writer.Close();
                XmlDocument doc = new XmlDocument();
                doc.Load(_appSettings.sitemapPath);
                var abc = doc.DocumentElement.GetElementsByTagName("url");
                if (abc.Count >=500)
                {
                    DirectoryInfo d = new DirectoryInfo(_appSettings.sitefilePath);//Assuming Test is your Folder
                    FileInfo[] Files = d.GetFiles("*.xml");

                    if (Files.Count()>0)
                    {
                        XmlTextWriter writer = new XmlTextWriter(_appSettings.sitemapPath.Replace("sitemap", "sitemap" + Files.Count().ToString()), System.Text.Encoding.UTF8);
                        //writer.WriteStartDocument();
                        //writer.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");
                        //int i = 0;
                        //writer.WriteStartElement("url");
                        //writer.WriteElementString("loc", "https://boards.socioboard.com/" + boardName);
                        //writer.WriteElementString("priority", "0.6");
                        //writer.WriteElementString("changefreq", "Hourly");
                        //writer.WriteElementString("lastmod", DateTime.UtcNow.ToString("yyyy-MM-dd"));
                        //writer.WriteEndElement();
                        //writer.WriteEndDocument();
                        writer.Close();
                        XmlTextWriter writer1 = new XmlTextWriter(_appSettings.sitemapPath, System.Text.Encoding.UTF8);
                        writer1.WriteStartDocument();
                        writer1.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");
                        writer1.WriteStartElement("url");
                        writer1.WriteElementString("loc", "https://boards.socioboard.com/" + boardName);
                        writer1.WriteElementString("priority", "0.6");
                        writer1.WriteElementString("changefreq", "Hourly");
                        writer1.WriteElementString("lastmod", DateTime.UtcNow.ToString("yyyy-MM-dd"));
                        writer1.WriteEndElement();
                        writer1.WriteEndDocument();
                        writer1.Close();
                        doc.Save(_appSettings.sitemapPath.Replace("sitemap", "sitemap" + Files.Count().ToString()));
                    }
                    else
                    {
                        XmlTextWriter writer = new XmlTextWriter(_appSettings.sitemapPath, System.Text.Encoding.UTF8);
                        writer.WriteStartDocument();
                        writer.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");
                        int i = 0;
                        writer.WriteStartElement("url");
                        writer.WriteElementString("loc", "https://boards.socioboard.com/" + boardName);
                        writer.WriteElementString("priority", "0.6");
                        writer.WriteElementString("changefreq", "Hourly");
                        writer.WriteElementString("lastmod", DateTime.UtcNow.ToString("yyyy-MM-dd"));
                        writer.WriteEndElement();
                        writer.WriteEndDocument();
                        writer.Close();
                    }
                  
                    result = true;
                }
                else
                {
                    XmlDocument doc1 = new XmlDocument();
                    doc1.LoadXml(appendNode);
                    XmlNode newNode = doc1.DocumentElement;
                    var attributename = newNode.Attributes;
                    doc.DocumentElement.AppendChild(doc.ImportNode(newNode, true));
                    doc.Save(_appSettings.sitemapPath);
                    XDocument doss = XDocument.Load(_appSettings.sitemapPath);
                    foreach (var node in doss.Root.Descendants())
                    {
                        // If we have an empty namespace...
                        if (node.Name.NamespaceName == "")
                        {
                            node.Attributes("xmlns").Remove();
                            // Inherit the parent namespace instead
                            node.Name = node.Parent.Name.Namespace + node.Name.LocalName;
                        }
                    }
                    doss.Save(_appSettings.sitemapPath);

                    result = true;
                }
                
            }
            catch (Exception ex)
            {
                _logger.LogError("issue while creating sitemap" + ex.Message);
                result = false;
            }
            return Ok(result);
        }

    }
}
