using MongoDB.Bson;
using MongoDB.Driver;
using SocioboardboardmeDataServices.Repositories;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.BoardMe
{
    public class BoardMeUpdation
    {
        public string UpdateBoard(Domain.Socioboard.Models.MongoBoards boards)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
                if (!string.IsNullOrEmpty(boards.twitterHashTag))
                {
                    TwitterRepository twtrepo = new TwitterRepository();
                    boards.twitterHashTag = twtrepo.AddTwitterHashTag(boards.twitterHashTag, boards.id.ToString());
                }
                if (!string.IsNullOrEmpty(boards.instagramHashTag))
                {
                    InstagramRepository instRepo = new InstagramRepository();
                    boards.instagramHashTag = instRepo.AddInstagramHashTag(boards.instagramHashTag, boards.id.ToString());
                }
                if (!string.IsNullOrEmpty(boards.gplusHashTag))
                {
                    GplusRepository gplusRepo = new GplusRepository();
                    boards.gplusHashTag = gplusRepo.AddGplusHashTag(boards.gplusHashTag, boards.id.ToString());
                }

                dbr.Update<Domain.Socioboard.Models.MongoBoards>(boards);
                return "update";
            }
            catch (Exception)
            {
                return "Issue in board updation";
            }

        }
    }
}
