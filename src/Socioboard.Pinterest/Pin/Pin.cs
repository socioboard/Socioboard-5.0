using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Pinterest.Pin
{
    public class Pin
    {
        public string PinCreation(string BoardId,string Note,string AccessToken, string ImageUrl)
        {
            try
            {
                string output = string.Empty;
                string pincreationurl = Global.PinCreationUrl + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cmedia%2Cmetadata%2Ccolor%2Cboard%2Ccounts%2Coriginal_link%2Ccreated_at%2Ccreator%2Cimage";
                string postData = "note="+Note+"&board="+BoardId+"&image="+ImageUrl+"&image_url="+ImageUrl;
                output = Global.HttpWebPostRequest(new Uri(pincreationurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string PinDeletion(string PinId,string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string pindeletionurl = Global.PinUrl + PinId + "/?access_token=" + AccessToken;
                string postData = "pin=" + PinId;
                output = Global.HttpWebDeleteRequest(new Uri(pindeletionurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string PinEdition(string PinId, string Note, string BoardId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string pinedtionurl = Global.PinUrl + BoardId + "/?access_token=" + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cmedia%2Cmetadata%2Cboard%2Ccolor%2Ccounts%2Coriginal_link%2Ccreated_at%2Ccreator%2Cimage";
                string postData = "pin=" + PinId + "&board=" + BoardId + "&note =" + Note;
                output = Global.HttpWebPatchRequest(new Uri(pinedtionurl), postData);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
        public string PinInfo(string PinId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string pininfourl = Global.PinUrl + PinId + "/?access_token=" + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cmedia%2Cmetadata%2Cboard%2Ccolor%2Ccounts%2Ccreated_at%2Coriginal_link%2Ccreator%2Cimage";
                output = Global.HttpWebGetRequest(pininfourl);
                return output;
            }
            catch (Exception)
            {
                return "Something Went Wrong";
            }
        }
    }
}
