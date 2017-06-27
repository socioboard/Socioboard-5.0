using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Pinterest.Board
{
    public class Board
    {
        public string BoardCreation(string Name, string Description, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string boardcreationurl = Global.BoardCreationUrl + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cimage%2Cdescription%2Cprivacy%2Creason";
                string postData = "name=" + Name + "&description =" + Description;
                output = Global.HttpWebPostRequest(new Uri(boardcreationurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string BoardDeletion(string BoardId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string boarddeletionurl = Global.BoardUrl + BoardId + "/?access_token=" + AccessToken;
                string postData = "board=" + BoardId;
                output = Global.HttpWebDeleteRequest(new Uri(boarddeletionurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string BoardEdition(string Name, string Description, string BoardId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string boardedtionurl = Global.BoardUrl + BoardId + "/?access_token=" + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cdescription%2Cimage%2Cprivacy%2Creason";
                string postData = "board=" + BoardId + "&name=" + Name + "&description =" + Description;
                output = Global.HttpWebPatchRequest(new Uri(boardedtionurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string BoardInfo(string BoardId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string boardinfourl = Global.BoardUrl + BoardId + "/?access_token=" + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cdescription%2Cimage%2Cprivacy%2Creason";
                output = Global.HttpWebGetRequest(boardinfourl);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string BoardPinInfor(string BoardId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string boardinfourl = Global.BoardUrl + BoardId + "/pins/?cursor=&access_token=" + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cboard%2Cattribution%2Cmedia%2Ccolor%2Cmetadata%2Ccounts%2Coriginal_link%2Ccreated_at%2Ccreator%2Cimage";
                output = Global.HttpWebGetRequest(boardinfourl);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
    }
}
