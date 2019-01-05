using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using SocioBoardMailSenderServices.Helper;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Net;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using MongoDB.Bson;
using SocioboardDataServices.Model;

namespace SocioBoardMailSenderServices.EmailServices
{
    public class EmailService
    {
        public static List<User> GetAllExpiredUser()
        {
            DateTime dateTime = DateTime.UtcNow.Date;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> lstEmail = dbr.Find<Domain.Socioboard.Models.User>(t => t.ExpiryDate <= dateTime).ToList();
            return (lstEmail);
        }

        public static List<User> GetAllbeforeExpiredUser()
        {
            DateTime dateTime = DateTime.UtcNow.Date.AddDays(7);
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> lstEmail = dbr.Find<Domain.Socioboard.Models.User>(t => t.ExpiryDate.Date == dateTime.Date).ToList();
            return (lstEmail);
        }
        public static List<User> GetAllUsers()
        {
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> Users = dbr.Find<Domain.Socioboard.Models.User>(t => t.ActivationStatus == 0).ToList();
            return (Users);
        }

        public static List<NewsLetter> GetAllnewsletter()
        {
            DateTime dateTime = DateTime.UtcNow.Date;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.NewsLetter> _news = dbr.Find<Domain.Socioboard.Models.NewsLetter>(t => t.ExpiryDate.Date >= dateTime).ToList();
            return (_news);
        }
        public static List<User> Inactiveuser()
        {
            DateTime dateTime = DateTime.UtcNow.Date.AddDays(-7);
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> lstLogintime = dbr.Find<Domain.Socioboard.Models.User>(t => t.LastLoginTime <= dateTime).ToList();
            return (lstLogintime);
        }

        public static List<User> subscriptionstatus()
        {
           // DateTime dateTime = DateTime.UtcNow.Date.AddDays(-7);
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> lstLogintime = dbr.Find<Domain.Socioboard.Models.User>(t => t.dailyGrpReportsSummery == true).ToList();
            return (lstLogintime);
        }
        public List<Groups> GetAllGroups()
        {
            DateTime dateTime = DateTime.UtcNow;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Groups> getallgroups = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.createdDate.Date <= dateTime.Date && t.id>=1 && t.id<=100).ToList();
            return (getallgroups);
        }
        public List<Groups> GetAllGroupsSkip(int skip)
        {
            DateTime dateTime = DateTime.UtcNow;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Groups> getallgroups = dbr.FindWithRange<Domain.Socioboard.Models.Groups>(t => t.createdDate.Date <= dateTime.Date,skip,5000).ToList();
            return (getallgroups);
        }
        public List<Groupprofiles> GetGroupProfiles(long groupId)
        {
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> getGroupProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            return getGroupProfiles;
        }

        public List<TwitterAccount> GetTwitterAccountDetailsById(Int64 adminid)
        {
            DateTime dateTime = DateTime.UtcNow.Date;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.TwitterAccount> getalltwtprofiles = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.userId == adminid).ToList();
            return (getalltwtprofiles);
        }
        public List<TwitterAccount> GetTwitterFollowers(long adminId, long userId, string days)
        {

            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.TwitterAccount> TwitterFollowerCount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.userId == adminId).ToList();
            return TwitterFollowerCount;
        }

        public List<Facebookaccounts> getFacebookAccountDetailsById(Int64 adminid)
        {

            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Facebookaccounts> getallfbprofiles = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == adminid && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookProfile).ToList();
            return (getallfbprofiles);
        }
        public List<Facebookaccounts> getFacebookpageAccountDetailsById(Int64 adminid)
        {

            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Facebookaccounts> getallfbprofiles = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == adminid && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).ToList();
            return (getallfbprofiles);
        }

        public List<Instagramaccounts> UserInformation(Int64 adminid)
        {

            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Instagramaccounts> getallinstaprofiles = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.UserId == adminid).ToList();
            return (getallinstaprofiles);
        }
        public List<Groupmembers> Getgroupmembersbyid(Int64 id)
        {
            DateTime dateTime = DateTime.UtcNow;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.Groupmembers> getallgroups = dbr.Find<Domain.Socioboard.Models.Groupmembers>(t => t.groupid == id).ToList();
            return (getallgroups);
        }

        public List<User> getUsersById(long UserId, string access_token)
        {
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            List<Domain.Socioboard.Models.User> getallgroups = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == UserId).ToList();
            return getallgroups;
        }

        public List<string> GetBouncedListOfMailFromElasticMail(int count)
        {
            string[] API_KEY = { "3eb5a724-e696-40fc-8d4f-7b33f488f3a3", "7fc66317-898e-4a09-9516-de53d527953d", "c88a8062-c240-4eb6-8648-ce833e2af165", "b1cb6821-e6ca-49fd-af08-e00f371a141c", "25274610-3dcb-49ee-aaf2-778efe4d7250", "862ec8a0-2094-4e60-a1ec-3121361f7d4c", "1a4224e4-f24d-4317-b032-56c7f4391f9c" };
            string apikey = API_KEY[count];
            List<string> lstuser = new List<string>();
            string output = string.Empty;
            string Elasticurl = "https://api.elasticemail.com/mailer/list/bounced?api_key="+apikey+"&detailed=true";
            var Elasticpagerequest = (HttpWebRequest)WebRequest.Create(Elasticurl);
            Elasticpagerequest.Method = "GET";
            Elasticpagerequest.Credentials = CredentialCache.DefaultCredentials;
            Elasticpagerequest.AllowWriteStreamBuffering = true;
            Elasticpagerequest.ServicePoint.Expect100Continue = false;
            Elasticpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = Elasticpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                        string[] Data = Regex.Split(output, "<recipient date=");
                        foreach (string item in Data)
                        {
                           // string[] Data1 = Regex.Split(item, "error=\"Mailbox unavailable");
                            try
                            {
                                if ((item.Contains("@")) && (item.Contains("Mailbox unavailable")))
                                {
                                    string MailId = getBetween(item, "\">", "<");
                                    lstuser.Add(MailId);
                                }

                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {

            }
            return lstuser;
        }
        public List<string> addreportfromelastic(int count)
        {
            
            int mailcount=0;
            List<BsonDocument> lstbson = new List<BsonDocument>();
            Domain.Socioboard.Models.Mongo.ElasticmailReport insertdata = new Domain.Socioboard.Models.Mongo.ElasticmailReport();
            SocioBoardMailSenderServices.Model.MongoRepository  mongorepo = new SocioBoardMailSenderServices.Model.MongoRepository("ElasticmailDailyReport");
           // Guid Id = Guid.NewGuid();
            string[] USERNAME = { "support@socioboard.com","socioboardmailer@eyotmail.com", "socioboardmailer@conymail.com", "socioboardmailer@maileld.com", "socioboardmailer@eldmail.com", "MattGrant98@hotmail.com", "ConnorPaterson95@hotmail.com" };
            string[] API_KEY = { "3eb5a724-e696-40fc-8d4f-7b33f488f3a3", "7fc66317-898e-4a09-9516-de53d527953d", "c88a8062-c240-4eb6-8648-ce833e2af165", "b1cb6821-e6ca-49fd-af08-e00f371a141c", "25274610-3dcb-49ee-aaf2-778efe4d7250", "862ec8a0-2094-4e60-a1ec-3121361f7d4c", "1a4224e4-f24d-4317-b032-56c7f4391f9c" };
            string apikey = API_KEY[count];
            string username = USERNAME[count];
            List<string> lstuser = new List<string>();
            string output = string.Empty;
            DateTime date = DateTime.UtcNow;
            DateTime startdate = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(-1);
            DateTime endtdate = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc).AddDays(-1);
            //double startdate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(i)).Year, DateTime.UtcNow.AddDays(-(i)).Month, DateTime.UtcNow.AddDays(-(i)).Day, 0, 0, 0, DateTimeKind.Utc));
            //double endtdate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(i)).Year, DateTime.UtcNow.AddDays(-(i)).Month, DateTime.UtcNow.AddDays(-(i)).Day, 0, 0, 0, DateTimeKind.Utc));

            string Elasticurl = "https://api.elasticemail.com/mailer/status/log?format=csv&username="+username+"&api_key="+apikey+"&status=0&from="+startdate+"&to="+endtdate+"";
            var Elasticpagerequest = (HttpWebRequest)WebRequest.Create(Elasticurl);
            Elasticpagerequest.Method = "GET";
            Elasticpagerequest.Credentials = CredentialCache.DefaultCredentials;
            Elasticpagerequest.AllowWriteStreamBuffering = true;
            Elasticpagerequest.ServicePoint.Expect100Continue = false;
            Elasticpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = Elasticpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd().Replace("\n","").Replace("\r","");
                        string[] Data = Regex.Split(output, "\"\"");
                        foreach (string item in Data)
                        {
                            if(item.Contains("channel"))
                            {
                                string val = getBetween(item + "$", "\"", "$");
                                string[] details = Regex.Split(val, ",");
                                string MailId = details[0].Replace('"',' ');
                                string status = details[1].Replace('"',' ');
                                DateTime time = Convert.ToDateTime(details[3].Replace('"', ' '));
                                double unixtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(time);
                                insertdata.Id = ObjectId.GenerateNewId();
                                insertdata.mailid = MailId;
                                insertdata.status = status;
                                insertdata.time = unixtime;

                                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.Id == insertdata.Id);
                                var task = Task.Run(async () => {
                                    return await ret;
                                });
                                if (task.Result != null)
                                {
                                    int count1 = task.Result.Count;
                                    if (count1 < 1)
                                    {
                                        mongorepo.Add<Domain.Socioboard.Models.Mongo.ElasticmailReport>(insertdata);
                                        Console.WriteLine(insertdata.mailid + " added successfully");
                                        mailcount++;
                                        Console.WriteLine("Mail added Count  " + mailcount + "  On date  " + DateTime.UtcNow);

                                    }
                                }

                                //mongorepo.Add<Domain.Socioboard.Models.Mongo.ElasticmailReport>(insertdata);
                               
                       

                            }
                            else
                            {
                                string[] detail = Regex.Split(item, ",");
                                string MailId = detail[0].Replace('"', ' ');
                                string status = detail[1].Replace('"', ' ');
                                DateTime time = Convert.ToDateTime(detail[3].Replace('"', ' '));
                                double unixtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(time);
                                insertdata.Id = ObjectId.GenerateNewId();
                                insertdata.mailid = MailId;
                                insertdata.status = status;
                                insertdata.time = unixtime;
                                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.Id == insertdata.Id);
                                var task = Task.Run(async () => {
                                    return await ret;
                                });
                                if (task.Result != null)
                                {
                                    int count1 = task.Result.Count;
                                    if (count1 < 1)
                                    {
                                        mongorepo.Add<Domain.Socioboard.Models.Mongo.ElasticmailReport>(insertdata);
                                        Console.WriteLine(insertdata.mailid+" added successfully");
                                        mailcount++;
                                        Console.WriteLine("Mail added Count  "+mailcount+"  On date  "+DateTime.UtcNow);
                                    }
                                }

                            }

                      }
                        //mongorepo.AddList(lstbson);
                    }
                }
            }
            catch (Exception e)
            {

            }
            return lstuser;
        }
      
        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }
    }
}
