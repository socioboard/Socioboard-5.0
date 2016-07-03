using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Gplus.Core.PeopleMethod;

namespace Socioboard.GoogleLib.App.Core
{
    public class PeopleController
    {
        public PeopleController(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        JArray objArr;
        public PeopleController()
        {
            objArr = new JArray();
        }

        /// <summary>
        ///  Get a person's profile.
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray GetPeopleProfile(string UserId, string access)
        {
            People objPeople = new People(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objPeople.Get_People_Profile(UserId, access);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }

        /// <summary>
        /// Search all public profiles
        /// </summary>
        /// <param name="query"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray GetPeopleSearch(string query, string access)
        {
            People objPeople = new People(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objPeople.Get_People_Search(query, access);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }

        /// <summary>
        /// List all of the people in the specified collection for a particular activity.
        /// </summary>
        /// <param name="activityId"></param>
        /// <param name="access"></param>
        /// <param name="collection">"plusoners": List all people who have +1'd this activity OR "resharers": List all people who have reshared this activity.</param>
        /// <returns></returns>
        public JArray GetPeopleListByActivity(string activityId, string access, string collection)
        {
            People objPeople = new People(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objPeople.Get_People_ListByActivity(activityId, access, collection);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }

        /// <summary>
        /// List all of the people who this user has added to one or more circles.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="access"></param>
        /// <param name="collection">Accept Value-"visible": The list of people who this user has added to one or more circles, limited to the circles visible to the requesting application. </param>
        /// <returns></returns>
        public JArray GetPeopleList(string userId, string access, string collection)
        {
            People objPeople = new People(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objPeople.Get_People_ListByActivity(userId, access, collection);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }
    }
}
