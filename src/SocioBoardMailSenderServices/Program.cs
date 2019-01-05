using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//using System.Windows.Forms;
using System.IO;
using System.Threading;
using System.Web;
using System.Web.Script.Serialization;
//using System.Web.Script.Services;
//using System.Web.Services;
using SocioBoardMailSenderServices.Helper;
//using SocioBoardMailSenderServices.Domain;
using Domain.Socioboard.Models;
using Domain.Socioboard.Helpers;

using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using SocioboardDataServices.Reports;
using System.Net;
using System.Text.RegularExpressions;

namespace SocioBoardMailSenderServices
{
    public class Program
    {
        static void Main(string[] args)
        {
            AccountEpryMailSender objAccountEpryMailSender = new AccountEpryMailSender();
            objAccountEpryMailSender.MailSending();
        }
    }

    public class AccountEpryMailSender
    {

        public async void MailSending()
        {

            Console.WriteLine("1. Account-Expiry-Mailer");
            Console.WriteLine("2. Login-Reminder");
            Console.WriteLine("3. Daily-Social-Media-Stat");
            //Console.WriteLine("3.Delete Elastic Mail report from mongo Server");
            Console.WriteLine("4. Social-Media-Stat-7");
            Console.WriteLine("5. Social-Media-Stat-15");
            Console.WriteLine("6. Social-Media-Stat-30");
            Console.WriteLine("7. Social-Media-Stat-60");
            Console.WriteLine("8. Social-Media-Stat-90");
            Console.WriteLine("9.Send Other News Letters");
            Console.WriteLine("10.Send Mail Before User Account Expire");
            //Console.WriteLine("=====================================Daily Media state for 20 diffrent servers==========================");
            //Console.WriteLine("12.server1 Daily-Social-Media-Stat");
            //Console.WriteLine("13.server2 Daily-Social-Media-Stat");
            //Console.WriteLine("14.server3 Daily-Social-Media-Stat");
            //Console.WriteLine("15.server4 Daily-Social-Media-Stat");
            //Console.WriteLine("16.server5 Daily-Social-Media-Stat");
            //Console.WriteLine("17.server6 Daily-Social-Media-Stat");
            //Console.WriteLine("18.server7 Daily-Social-Media-Stat");
            //Console.WriteLine("19.server8 Daily-Social-Media-Stat");
            //Console.WriteLine("20.server9 Daily-Social-Media-Stat");
            //Console.WriteLine("21.server10 Daily-Social-Media-Stat");
            //Console.WriteLine("22.server11 Daily-Social-Media-Stat");
            //Console.WriteLine("23.server12 Daily-Social-Media-Stat");
            //Console.WriteLine("24.server13 Daily-Social-Media-Stat");
            //Console.WriteLine("25.server14 Daily-Social-Media-Stat");
            //Console.WriteLine("26.server15 Daily-Social-Media-Stat");
            //Console.WriteLine("27.server16 Daily-Social-Media-Stat");
            //Console.WriteLine("28.server17 Daily-Social-Media-Stat");
            //Console.WriteLine("29.server18 Daily-Social-Media-Stat");
            //Console.WriteLine("30.server19 Daily-Social-Media-Stat");
            //Console.WriteLine("31.server20 Daily-Social-Media-Stat");
            //Console.WriteLine("=====================================Bounced mail list from 21 diffrent servers==========================");
            //Console.WriteLine("32.mainserver GetBouncedMailFromElasticMail");
            //Console.WriteLine("33.server1 GetBouncedMailFromElasticMail");
            //Console.WriteLine("34.server2 GetBouncedMailFromElasticMail");
            //Console.WriteLine("35.server3 GetBouncedMailFromElasticMail");
            //Console.WriteLine("36.server4 GetBouncedMailFromElasticMail");
            //Console.WriteLine("37.server5 GetBouncedMailFromElasticMail");
            //Console.WriteLine("38.server6 GetBouncedMailFromElasticMail");
            //Console.WriteLine("39.server7 GetBouncedMailFromElasticMail");
            //Console.WriteLine("40.server8 GetBouncedMailFromElasticMail");
            //Console.WriteLine("41.server9 GetBouncedMailFromElasticMail");
            //Console.WriteLine("42.server10 GetBouncedMailFromElasticMail");
            //Console.WriteLine("43.server11 GetBouncedMailFromElasticMail");
            //Console.WriteLine("44.server12 GetBouncedMailFromElasticMail");
            //Console.WriteLine("45.server13 GetBouncedMailFromElasticMail");
            //Console.WriteLine("46.server14 GetBouncedMailFromElasticMail");
            //Console.WriteLine("47.server15 GetBouncedMailFromElasticMail");
            //Console.WriteLine("48.server16 GetBouncedMailFromElasticMail");
            //Console.WriteLine("49.server17 GetBouncedMailFromElasticMail");
            //Console.WriteLine("50.server18 GetBouncedMailFromElasticMail");
            //Console.WriteLine("51.server19 GetBouncedMailFromElasticMail");
            //Console.WriteLine("52.server20 GetBouncedMailFromElasticMail");
            //Console.WriteLine("=====================================Mail Status report from Elastic mail for 21 diffrent servers==========================");
            //Console.WriteLine("53.Main server GetReport From Elastic Mail Server");
            //Console.WriteLine("54.Server 1 GetReport From Elastic Mail Server");
            //Console.WriteLine("55.Server 2 GetReport From Elastic Mail Server");
            //Console.WriteLine("56.Server 3 GetReport From Elastic Mail Server");
            //Console.WriteLine("57.Server 4 GetReport From Elastic Mail Server");
            //Console.WriteLine("58.Server 5 GetReport From Elastic Mail Server");
            //Console.WriteLine("59.Server 6 GetReport From Elastic Mail Server");
            //Console.WriteLine("60.Server 7 GetReport From Elastic Mail Server");
            //Console.WriteLine("61.Server 8 GetReport From Elastic Mail Server");
            //Console.WriteLine("62.Server 9 GetReport From Elastic Mail Server");
            //Console.WriteLine("63.Server 10 GetReport From Elastic Mail Server");
            //Console.WriteLine("64.Server 11 GetReport From Elastic Mail Server");
            //Console.WriteLine("65.Server 12 GetReport From Elastic Mail Server");
            //Console.WriteLine("66.Server 13 GetReport From Elastic Mail Server");
            //Console.WriteLine("67.Server 14 GetReport From Elastic Mail Server");
            //Console.WriteLine("68.Server 15 GetReport From Elastic Mail Server");
            //Console.WriteLine("69.Server 16 GetReport From Elastic Mail Server");
            //Console.WriteLine("70.Server 17 GetReport From Elastic Mail Server");
            //Console.WriteLine("71.Server 18 GetReport From Elastic Mail Server");
            //Console.WriteLine("72.Server 19 GetReport From Elastic Mail Server");
            //Console.WriteLine("73.Server 20 GetReport From Elastic Mail Server");
            //Server 1 GetReport From Elastic Mail Server
            //server1 DailySocialMediaStat
            //server1 GetBouncedMailFromElasticMail
            string str = Console.ReadLine();
            string ActionType = string.Empty;

            switch (str)
            {
                case "1":
                    ActionType = "AccountEpiryMailer";
                    break;
               
                case "2":
                    ActionType = "LoginReminder";
                    break;
                case "3":
                    ActionType = "DailySocialMediaStat";
                    break;
                //case "3":
                //    ActionType = "Delete Elastic Mail report from mongo Server";
                //    break;
                case "4":
                    ActionType = "SocialMediaStat_7";
                    break;
                case "5":
                    ActionType = "SocialMediaStat_15";
                    break;
                case "6":
                    ActionType = "SocialMediaStat_30";
                    break;
                case "7":
                    ActionType = "SocialMediaStat_60";
                    break;
                case "8":
                    ActionType = "SocialMediaStat_90";
                    break;
                case "9":
                    ActionType = "Sendothernewsletter";
                    break;
                case "10":
                    ActionType = "MailerBeforeAccountEpiry";
                    break;
                //case "11":
                //    ActionType = "GetBouncedMailFromElasticMail";
                //    break;
                case "12":
                    ActionType = "server1 DailySocialMediaStat";
                    break;
                case "13":
                    ActionType = "server2 DailySocialMediaStat";
                    break;
                case "14":
                    ActionType = "server3 DailySocialMediaStat";
                    break;
                case "15":
                    ActionType = "server4 DailySocialMediaStat";
                    break;
                case "16":
                    ActionType = "server5 DailySocialMediaStat";
                    break;
                case "17":
                    ActionType = "server6 DailySocialMediaStat";
                    break;
                case "18":
                    ActionType = "server7 DailySocialMediaStat";
                    break;
                case "19":
                    ActionType = "server8 DailySocialMediaStat";
                    break;
                case "20":
                    ActionType = "server9 DailySocialMediaStat";
                    break;
                case "21":
                    ActionType = "server10 DailySocialMediaStat";
                    break;
                case "22":
                    ActionType = "server11 DailySocialMediaStat";
                    break;
                case "23":
                    ActionType = "server12 DailySocialMediaStat";
                    break;
                case "24":
                    ActionType = "server13 DailySocialMediaStat";
                    break;
                case "25":
                    ActionType = "server14 DailySocialMediaStat";
                    break;
                case "26":
                    ActionType = "server15 DailySocialMediaStat";
                    break;
                case "27":
                    ActionType = "server16 DailySocialMediaStat";
                    break;
                case "28":
                    ActionType = "server17 DailySocialMediaStat";
                    break;
                case "29":
                    ActionType = "server18 DailySocialMediaStat";
                    break;
                case "30":
                    ActionType = "server19 DailySocialMediaStat";
                    break;
                case "31":
                    ActionType = "server20 DailySocialMediaStat";
                    break;
                case "32":
                    ActionType = "mainserver GetBouncedMailFromElasticMail";
                    break;
                case "33":
                    ActionType = "server1 GetBouncedMailFromElasticMail";
                    break;
                case "34":
                    ActionType = "server2 GetBouncedMailFromElasticMail";
                    break;
                case "35":
                    ActionType = "server3 GetBouncedMailFromElasticMail";
                    break;
                case "36":
                    ActionType = "server4 GetBouncedMailFromElasticMail";
                    break;
                case "37":
                    ActionType = "server5 GetBouncedMailFromElasticMail";
                    break;
                case "38":
                    ActionType = "server6 GetBouncedMailFromElasticMail";
                    break;
                case "39":
                    ActionType = "server7 GetBouncedMailFromElasticMail";
                    break;
                case "40":
                    ActionType = "server8 GetBouncedMailFromElasticMail";
                    break;
                case "41":
                    ActionType = "server9 GetBouncedMailFromElasticMail";
                    break;
                case "42":
                    ActionType = "server10 GetBouncedMailFromElasticMail";
                    break;
                case "43":
                    ActionType = "server11 GetBouncedMailFromElasticMail";
                    break;
                case "44":
                    ActionType = "server12 GetBouncedMailFromElasticMail";
                    break;
                case "45":
                    ActionType = "server13 GetBouncedMailFromElasticMail";
                    break;
                case "46":
                    ActionType = "server14 GetBouncedMailFromElasticMail";
                    break;
                case "47":
                    ActionType = "server15 GetBouncedMailFromElasticMail";
                    break;
                case "48":
                    ActionType = "server16 GetBouncedMailFromElasticMail";
                    break;
                case "49":
                    ActionType = "server17 GetBouncedMailFromElasticMail";
                    break;
                case "50":
                    ActionType = "server18 GetBouncedMailFromElasticMail";
                    break;
                case "51":
                    ActionType = "server19 GetBouncedMailFromElasticMail";
                    break;
                case "52":
                    ActionType = "server20 GetBouncedMailFromElasticMail";
                    break;
                case "53":
                    ActionType = "Main server GetReport From Elastic Mail Server";
                    break;
                case "54":
                    ActionType = "Server 1 GetReport From Elastic Mail Server";
                    break;
                case "55":
                    ActionType = "Server 2 GetReport From Elastic Mail Server";
                    break;
                case "56":
                    ActionType = "Server 3 GetReport From Elastic Mail Server";
                    break;
                case "57":
                    ActionType = "Server 4 GetReport From Elastic Mail Server";
                    break;
                case "58":
                    ActionType = "Server 5 GetReport From Elastic Mail Server";
                    break;
                case "59":
                    ActionType = "Server 6 GetReport From Elastic Mail Server";
                    break;
                case "60":
                    ActionType = "Server 7 GetReport From Elastic Mail Server";
                    break;
                case "61":
                    ActionType = "Server 8 GetReport From Elastic Mail Server";
                    break;
                case "62":
                    ActionType = "Server 9 GetReport From Elastic Mail Server";
                    break;
                case "63":
                    ActionType = "Server 10 GetReport From Elastic Mail Server";
                    break;
                case "64":
                    ActionType = "Server 11 GetReport From Elastic Mail Server";
                    break;
                case "65":
                    ActionType = "Server 12 GetReport From Elastic Mail Server";
                    break;
                case "66":
                    ActionType = "Server 13 GetReport From Elastic Mail Server";
                    break;
                case "67":
                    ActionType = "Server 14 GetReport From Elastic Mail Server";
                    break;
                case "68":
                    ActionType = "Server 15 GetReport From Elastic Mail Server";
                    break;
                case "69":
                    ActionType = "Server 16 GetReport From Elastic Mail Server";
                    break;
                case "70":
                    ActionType = "Server 17 GetReport From Elastic Mail Server";
                    break;
                case "71":
                    ActionType = "Server 18 GetReport From Elastic Mail Server";
                    break;
                case "72":
                    ActionType = "Server 19 GetReport From Elastic Mail Server";
                    break;
                case "73":
                    ActionType = "Server 20 GetReport From Elastic Mail Server";
                    break;

                //53.GetReport From Elastic Mail Server
                default:
                    break;
            }
            if (!string.IsNullOrEmpty(ActionType) && ActionType.Equals("AccountEpiryMailer"))
            {
                StartMailSender(ActionType);
            }
            else if (!string.IsNullOrEmpty(ActionType) && ActionType.Equals("MailerBeforeAccountEpiry"))
            {
                StartMailSendingbeforeexpiry(ActionType);
            }
            else if (ActionType.Equals("Sendothernewsletter"))
            {
                Sendothernewsletter();
            }
            else if (ActionType.Equals("LoginReminder"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            LoginReminder();
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            //else if (ActionType.Equals("Delete Elastic Mail report from mongo Server"))
            //{
            //    DateTime _today = DateTime.UtcNow.Date;
            //    while (true)
            //    {
            //        try
            //        {
            //            if (_today == DateTime.UtcNow.Date)
            //            {
            //                _today = DateTime.UtcNow.AddDays(1).Date;
            //                DeleteoldReportfromMongoforElasticMail();
            //            }
            //            else
            //            {
            //                Thread.Sleep(600 * 5000);
            //            }
            //        }
            //        catch (Exception ex)
            //        {
            //            Console.WriteLine("Error Case Debug : " + ex.StackTrace);
            //        }
            //    }
            //}
            //Delete From Elastic Mail Server

            else if (ActionType.Equals("DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStat();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server1 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(0);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server2 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(1);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server3 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(2);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server4 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(3);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server5 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(4);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server6 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(5);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server7 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(6);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server8 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(7);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server9 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(8);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server10 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(9);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server11 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(10);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server12 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(11);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server13 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(12);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server14 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(13);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server15 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(14);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server16 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(15);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server17 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(16);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server18 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(17);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server19 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(18);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server20 DailySocialMediaStat"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            DailySocialMediaStatWithSrevre(19);
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Daily-Social-Media-Stat = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("SocialMediaStat_7"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            SocialMediaStat_7();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Social-Media-Stat-7 = >" + ex.Message);
                        Thread.Sleep(600 * 1000);
                    }
                }
            }

            else if (ActionType.Equals("SocialMediaStat_15"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            SocialMediaStat_15();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Social-Media-Stat-15 = >" + ex.Message);
                    }
                }
            }

            else if (ActionType.Equals("SocialMediaStat_30"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            SocialMediaStat_30();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Social-Media-Stat-30 = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("SocialMediaStat_60"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            SocialMediaStat_60();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Social-Media-Stat-60 = >" + ex.Message);
                    }
                }
            }

            else if (ActionType.Equals("SocialMediaStat_90"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            SocialMediaStat_90();
                        }
                        else
                        {
                            Thread.Sleep(600 * 1000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Social-Media-Stat-90 = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("mainserver GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(0);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server1 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(1);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server2 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(2);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server3 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(3);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server4 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(4);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server5 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(5);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server6 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(6);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server7 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(7);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server8 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(8);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server9 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(9);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server10 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(10);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server11 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(11);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server12 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(12);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server13 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(13);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server14 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(14);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server15 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(15);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server16 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(16);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server17 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(17);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server18 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(18);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }
            }
            else if (ActionType.Equals("server19 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(19);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }

            }
            else if (ActionType.Equals("server20 GetBouncedMailFromElasticMail"))
            {
                DateTime _today = DateTime.UtcNow.Date;

                while (true)
                {
                    try
                    {

                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetBouncedMailFromElasticMail(20);
                        }
                        else
                        {
                            Thread.Sleep(600 * 10);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetBouncedMailFromElasticMail = >" + ex.Message);
                    }
                }

            }
            else if (ActionType.Equals("Main server GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(0);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 1 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(1);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 2 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(2);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 3 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(3);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 4 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(4);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 5 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(5);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 6 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(6);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 7 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(7);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 8 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(8);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 9 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(9);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 10 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(10);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 11 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(11);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 12 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(12);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 13 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(13);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 14 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(14);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 15 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(15);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 16 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(16);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 17 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(17);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 18 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(18);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 19 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(19);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }
            else if (ActionType.Equals("Server 20 GetReport From Elastic Mail Server"))
            {
                DateTime _today = DateTime.UtcNow.Date;
                while (true)
                {
                    try
                    {
                        if (_today == DateTime.UtcNow.Date)
                        {
                            _today = DateTime.UtcNow.AddDays(1).Date;
                            GetreportfromElasticmail(20);
                        }
                        else
                        {
                            Thread.Sleep(600 * 5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Case Debug : " + ex.StackTrace);
                    }
                }
            }

        }

        public void StartMailSendingbeforeexpiry(string actiontype)

        {
            try
            {

                DateTime today = DateTime.UtcNow.Date;
                while (true)
                {
                    if (actiontype == "MailerBeforeAccountEpiry")
                    {
                        if (today == DateTime.UtcNow.Date)
                        {
                            today = DateTime.UtcNow.Date.AddDays(1);
                            StartMailSendingbeforeexpireuser();
                        }
                        else
                        {
                            Thread.Sleep(60 * 5000);
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error Case Debug : " + ex.StackTrace);
            }
        }

       
        public void StartMailSender(string actiontype)

        {
            try
            {

                DateTime today = DateTime.UtcNow.Date;
                while (true)
                {
                    if (actiontype == "AccountEpiryMailer")
                    {
                        if (today == DateTime.UtcNow.Date)
                        {
                            today = DateTime.UtcNow.Date.AddDays(1);
                            StartMailSending();
                        }
                        else
                        {
                            Thread.Sleep(60 * 5000);
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error Case Debug : " + ex.StackTrace);
            }
        }


        public void StartMailSendingbeforeexpireuser()
        {
            Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();

            Console.WriteLine("<------------------------------------------------->");
            Console.WriteLine("<--------Start Account before Expiry Mail Sending-------->");
            Console.WriteLine("<--------------" + DateTime.Now.Date + "-------------->");
            Console.WriteLine("<------------------------------------------------->");
            try
            {
                // SocioBoardMailSenderServices.Helper.MailHelper mh1 = new SocioBoardMailSenderServices.Helper.MailHelper();
                SocioBoardMailSenderServices.Helper.AppSettings _appSettings = new AppSettings();
                List<User> lstEmail = (List<User>)SocioBoardMailSenderServices.EmailServices.EmailService.GetAllbeforeExpiredUser().ToList();
                foreach (User _user in lstEmail)
                {
                    if (_user.MailstatusbeforeAccountExpire.Date <= DateTime.UtcNow.Date || _user.MailstatusbeforeAccountExpire.Date == null)
                    {
                        string rtn = MailSender.SendbeforeAccountExpiryMail(_appSettings.frommail, _user.FirstName, _user.EmailId,_user.ExpiryDate.Date, _appSettings.SendgridUserName, _appSettings.SendGridPassword, "");
                        if (rtn != null)
                        {
                            _user.MailstatusbeforeAccountExpire = DateTime.UtcNow.AddDays(30);
                            int res = dbr.Update<User>(_user);
                            try
                            {
                                Console.WriteLine("<----------------------------------------------------------------->");
                                Console.WriteLine("<---------------Mail Send to:" + _user.EmailId + "---------------->");
                                Console.WriteLine("<----------------------------------------------------------------->");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("<------------------------------------------------->");
                                Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                                Console.WriteLine("<------------------------------------------------->");
                            }
                        }
                        else
                        {
                            Console.WriteLine("<------------------------------------------------->");
                            Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                            Console.WriteLine("<------------------------------------------------->");
                        }
                    }
                    else
                    {
                        Console.WriteLine("<------------------------------------------------->");
                        Console.WriteLine("<----Mail already sent to:" + _user.EmailId + "------->");
                        Console.WriteLine("<------------------------------------------------->");
                    }


                }
            }
            catch (Exception ex)
            {
            }
        }
        public void StartMailSending()
        {
            Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();

            Console.WriteLine("<------------------------------------------------->");
            Console.WriteLine("<--------Start Account Expiry Mail Sending-------->");
            Console.WriteLine("<--------------" + DateTime.Now.Date + "-------------->");
            Console.WriteLine("<------------------------------------------------->");
            try
            {
                // SocioBoardMailSenderServices.Helper.MailHelper mh1 = new SocioBoardMailSenderServices.Helper.MailHelper();
                SocioBoardMailSenderServices.Helper.AppSettings _appSettings = new AppSettings();
                List<User> lstEmail = (List<User>)SocioBoardMailSenderServices.EmailServices.EmailService.GetAllExpiredUser().ToList();
                foreach (User _user in lstEmail)
                {
                    if (_user.MailstatusforAccountExpiry.Date <= DateTime.UtcNow.Date || _user.MailstatusforAccountExpiry.Date==null)
                    {
                        string rtn = MailSender.SendAccountExpiryMail(_appSettings.frommail, _user.FirstName, _user.EmailId, _appSettings.SendgridUserName, _appSettings.SendGridPassword, "");
                        if (rtn != null)
                        {
                            _user.MailstatusforAccountExpiry = DateTime.UtcNow.AddDays(30);
                            int res = dbr.Update<User>(_user);
                            try
                            {
                                Console.WriteLine("<----------------------------------------------------------------->");
                                Console.WriteLine("<---------------Mail Send to:" + _user.EmailId + "---------------->");
                                Console.WriteLine("<----------------------------------------------------------------->");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("<------------------------------------------------->");
                                Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                                Console.WriteLine("<------------------------------------------------->");
                            }
                        }
                        else
                        {
                            Console.WriteLine("<------------------------------------------------->");
                            Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                            Console.WriteLine("<------------------------------------------------->");
                        }
                    }
                    else
                    {
                        Console.WriteLine("<------------------------------------------------->");
                        Console.WriteLine("<----Mail already sent to:" + _user.EmailId + "------->");
                        Console.WriteLine("<------------------------------------------------->");
                    }


                }
            }
            catch (Exception ex)
            {
            }
        }
        public void LoginReminder()
        {
            Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
            SocioBoardMailSenderServices.Helper.AppSettings _appSettings = new AppSettings();

            List<User> _lstUser = (List<User>)SocioBoardMailSenderServices.EmailServices.EmailService.Inactiveuser().ToList();
            foreach (User _user in _lstUser)
            {
                if(_user.lastloginreminder.Date <= DateTime.UtcNow.Date || _user.lastloginreminder.Date == null)
                {
                    string str = MailSender.SendInActiveUsermail(_appSettings.frommail, _user.FirstName, _user.EmailId, _appSettings.SendgridUserName, _appSettings.SendGridPassword, "", _user.LastLoginTime);
                    if (str != null)
                    {
                        _user.lastloginreminder = DateTime.UtcNow.AddDays(15);
                        int res = dbr.Update<User>(_user);
                        try
                        {
                            Console.WriteLine("<----------------------------------------------------------------->");
                            Console.WriteLine("<---------------Mail Send to:" + _user.EmailId + "---------------->");
                            Console.WriteLine("<----------------------------------------------------------------->");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("<------------------------------------------------->");
                            Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                            Console.WriteLine("<------------------------------------------------->");
                        }
                    }
                    else
                    {
                        Console.WriteLine("<------------------------------------------------->");
                        Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                        Console.WriteLine("<------------------------------------------------->");
                    }
                }
                else
                {
                    Console.WriteLine("<------------------------------------------------->");
                    Console.WriteLine("<----Mail already sent to:" + _user.EmailId + "------->");
                    Console.WriteLine("<------------------------------------------------->");
                }
               
            }
         

        }

        public void Sendothernewsletter()
        {
            try
            {
                SocioBoardMailSenderServices.Helper.AppSettings _appSettings = new AppSettings();
                List<User> _lstUser = (List<User>)SocioBoardMailSenderServices.EmailServices.EmailService.GetAllUsers();
                foreach (User _user in _lstUser)
                {
                    if (_user.otherNewsLetters == true)
                    {
                        List<NewsLetter> _lstnews = (List<NewsLetter>)SocioBoardMailSenderServices.EmailServices.EmailService.GetAllnewsletter();
                        foreach (NewsLetter news in _lstnews)
                        {
                            string retMail = string.Empty;
                            //string rtn = MailSender.Sendnewsletter(_user.FirstName, _user.EmailId, "sumit@socioboardmail.com", "75SDF/@#$fds", "");
                            retMail = MailSender.Sendnewsletter(_user.FirstName, _user.EmailId, news.NewsLetterBody, news.Subject, "", "");
                            if (retMail != null)
                            {
                                try
                                {
                                    Console.WriteLine("<----------------------------------------------------------------->");
                                    Console.WriteLine("<---------------Mail Send to:" + _user.EmailId + "---------------->");
                                    Console.WriteLine("<----------------------------------------------------------------->");
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine("<------------------------------------------------->");
                                    Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                                    Console.WriteLine("<------------------------------------------------->");
                                }
                            }
                            else
                            {
                                Console.WriteLine("<------------------------------------------------->");
                                Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                                Console.WriteLine("<------------------------------------------------->");
                            }
                        }

                    }
                    else
                    {
                        Console.WriteLine("<------------------------------------------------->");
                        Console.WriteLine("<----Mail Failled to:" + _user.EmailId + "------->");
                        Console.WriteLine("<------------------------------------------------->");
                    }

                }
            }
            catch (Exception ex)
            {

            }
        }

        public async void DailySocialMediaStat()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();
                //int totaluser=lstGroups.Count();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        int TotalLikes = 0;
                        int TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();

                        string FollowerIds = string.Empty;
                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "1");
                                lsttwitterfollower = lstfollowers;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                string fbuserid = _FacebookAccount.First().FbUserId;
                                string accesstoken = _FacebookAccount.First().AccessToken;
                                lastFacebookPage = _FacebookAccount;
                                if (!string.IsNullOrEmpty(accesstoken))
                                {
                                    string totalLikes = "0";
                                    string talkingAbout = "0";
                                    int fblikers = 0;
                                    int fbunliker = 0;
                                    int fbimpression = 0;
                                    try
                                    {
                                        SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 1);
                                        PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 1);
                                        PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 1);
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine(ex.Message);
                                    }

                                }
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }

                        //DateTime date2 = DateTime.UtcNow.Date;
                        //DateTime end2 = DateTime.UtcNow.AddDays(1).AddMinutes(-1);
                        //string _GroupReports = SocioBoardMailSenderServices.EmailServices.TwitterStat.gettwittersexdivision(item_group.id, date2, end2);

                        ////GroupReports _GroupReports = (GroupReports)new JavaScriptSerializer().Deserialize(ApiGroupReports.retrievedata(item_Groups.Id.ToString()), typeof(GroupReports));
                        ////string sexratio = _GroupReports.sexratio;
                        //string male = "0";
                        //string female = "0";
                        //string _male = "0";
                        //string _female = "0";
                        //try
                        //{
                        //    male = _GroupReports.Split(',')[0];
                        //    female = _GroupReports.Split(',')[1];
                        //}
                        //catch (Exception ex)
                        //{
                        //    male = "0";
                        //    female = "0";
                        //}
                        //try
                        //{
                        //    double total = Double.Parse(male) + Double.Parse(female);
                        //    _male = Convert.ToInt32((Double.Parse(male) / total) * 100).ToString();
                        //}
                        //catch (Exception ex)
                        //{
                        //    _male = "0";
                        //}
                        //try
                        //{
                        //    if (female != "0")
                        //    {
                        //        _female = (100 - Double.Parse(_male)).ToString();
                        //    }
                        //    else
                        //    {
                        //        _female = "0";
                        //    }
                        //}
                        //catch (Exception ex)
                        //{
                        //    _female = "0";
                        //}

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;


                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;

                        try
                        {
                            DateTime date = DateTime.UtcNow;
                            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwitterMessages = SocioboardDataServices.Reports.TwitterReports.GetTwitterMessages(TwitterProfileId, date);
                            List<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwitterDirectMessages = SocioboardDataServices.Reports.TwitterReports.GetTwitterDirectMessages(TwitterProfileId, date);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }

                        try
                        {
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 1);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 1);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 1);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 1);
                            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 1);
                            double since = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(0)).Year, DateTime.UtcNow.AddDays(-(0)).Month, DateTime.UtcNow.AddDays(-(0)).Day, 0, 0, 0, DateTimeKind.Utc));
                            double until = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-1).Year, DateTime.UtcNow.AddDays(-1).Month, DateTime.UtcNow.AddDays(-1).Day, 23, 59, 59, DateTimeKind.Utc));
                            _InstagramDailyReport.followcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower));
                            _InstagramStat.NewFollowers = _InstagramDailyReport.followcount.ToString();
                            _InstagramDailyReport.followingcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing));
                            _InstagramStat.NewFollowings = _InstagramDailyReport.followingcount.ToString();
                            _InstagramDailyReport.videopost = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                            _InstagramStat.VideoCount = _InstagramDailyReport.videopost.ToString();
                            _InstagramDailyReport.imagepost = Convert.ToInt64(lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                            _InstagramStat.ImageCount = _InstagramDailyReport.imagepost.ToString();
                            _InstagramDailyReport.postlike = Convert.ToInt64(lstGetInstagramPostLikes.Count(t => t.Created_Date <= until && t.Created_Date >= since));
                            _InstagramStat.LikesCount = _InstagramDailyReport.postlike.ToString();
                            _InstagramDailyReport.postcomment = Convert.ToInt64(lstGetInstagramPostComments.Count(t => t.CommentDate <= until && t.CommentDate >= since));
                            _InstagramStat.CommentCount = _InstagramDailyReport.postcomment.ToString();
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;





                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {

                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().dailyGrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                if (usr.Dailymailstatusreport.Date <= DateTime.UtcNow.Date || usr.Dailymailstatusreport.Date == null)
                                                {
                                                    retMail = MailSender.SendGroupRepors(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, "", "");
                                                    Console.WriteLine("<----Mail sent to:" + _User.First().EmailId.ToString() + "------->");
                                                    //retMail = MailSender.SendGroupRepors(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, "sumit@socioboardmail.com", "75SDF/@#$fds");
                                                    if (retMail != null)
                                                    {
                                                        usr.Dailymailstatusreport = DateTime.UtcNow.AddDays(1);
                                                        int res = dbr.Update<User>(usr);
                                                    }
                                                }
                                                else
                                                {
                                                    Console.WriteLine("<------------------------------------------------->");
                                                    Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                    Console.WriteLine("<------------------------------------------------->");
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public async void DailySocialMediaStatWithSrevre(int skip)
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                int skip_data = 5000 * skip;
                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroupsSkip(skip_data);
                //int totaluser=lstGroups.Count();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        int TotalLikes = 0;
                        int TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();

                        string FollowerIds = string.Empty;
                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "1");
                                lsttwitterfollower = lstfollowers;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                string fbuserid = _FacebookAccount.First().FbUserId;
                                string accesstoken = _FacebookAccount.First().AccessToken;
                                lastFacebookPage = _FacebookAccount;
                                if (!string.IsNullOrEmpty(accesstoken))
                                {
                                    string totalLikes = "0";
                                    string talkingAbout = "0";
                                    int fblikers = 0;
                                    int fbunliker = 0;
                                    int fbimpression = 0;
                                    try
                                    {
                                        SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 1);
                                        PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 1);
                                        PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 1);
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine(ex.Message);
                                    }

                                }
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }

                        //DateTime date2 = DateTime.UtcNow.Date;
                        //DateTime end2 = DateTime.UtcNow.AddDays(1).AddMinutes(-1);
                        //string _GroupReports = SocioBoardMailSenderServices.EmailServices.TwitterStat.gettwittersexdivision(item_group.id, date2, end2);

                        ////GroupReports _GroupReports = (GroupReports)new JavaScriptSerializer().Deserialize(ApiGroupReports.retrievedata(item_Groups.Id.ToString()), typeof(GroupReports));
                        ////string sexratio = _GroupReports.sexratio;
                        //string male = "0";
                        //string female = "0";
                        //string _male = "0";
                        //string _female = "0";
                        //try
                        //{
                        //    male = _GroupReports.Split(',')[0];
                        //    female = _GroupReports.Split(',')[1];
                        //}
                        //catch (Exception ex)
                        //{
                        //    male = "0";
                        //    female = "0";
                        //}
                        //try
                        //{
                        //    double total = Double.Parse(male) + Double.Parse(female);
                        //    _male = Convert.ToInt32((Double.Parse(male) / total) * 100).ToString();
                        //}
                        //catch (Exception ex)
                        //{
                        //    _male = "0";
                        //}
                        //try
                        //{
                        //    if (female != "0")
                        //    {
                        //        _female = (100 - Double.Parse(_male)).ToString();
                        //    }
                        //    else
                        //    {
                        //        _female = "0";
                        //    }
                        //}
                        //catch (Exception ex)
                        //{
                        //    _female = "0";
                        //}

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;


                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;

                        try
                        {
                            DateTime date = DateTime.UtcNow;
                            var lstTwitterMessages = SocioboardDataServices.Reports.TwitterReports.GetTwitterMessages(TwitterProfileId, date);
                            var lstTwitterDirectMessages = SocioboardDataServices.Reports.TwitterReports.GetTwitterDirectMessages(TwitterProfileId, date);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }

                        try
                        {
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 1);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 1);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 1);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 1);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 1);
                            double since = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(0)).Year, DateTime.UtcNow.AddDays(-(0)).Month, DateTime.UtcNow.AddDays(-(0)).Day, 0, 0, 0, DateTimeKind.Utc));
                            double until = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-1).Year, DateTime.UtcNow.AddDays(-1).Month, DateTime.UtcNow.AddDays(-1).Day, 23, 59, 59, DateTimeKind.Utc));
                            _InstagramDailyReport.followcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower));
                            _InstagramStat.NewFollowers = _InstagramDailyReport.followcount.ToString();
                            _InstagramDailyReport.followingcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing));
                            _InstagramStat.NewFollowings = _InstagramDailyReport.followingcount.ToString();
                            _InstagramDailyReport.videopost = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                            _InstagramStat.VideoCount = _InstagramDailyReport.videopost.ToString();
                            _InstagramDailyReport.imagepost = Convert.ToInt64(lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                            _InstagramStat.ImageCount = _InstagramDailyReport.imagepost.ToString();
                            _InstagramDailyReport.postlike = Convert.ToInt64(lstGetInstagramPostLikes.Count(t => t.Created_Date <= until && t.Created_Date >= since));
                            _InstagramStat.LikesCount = _InstagramDailyReport.postlike.ToString();
                            _InstagramDailyReport.postcomment = Convert.ToInt64(lstGetInstagramPostComments.Count(t => t.CommentDate <= until && t.CommentDate >= since));
                            _InstagramStat.CommentCount = _InstagramDailyReport.postcomment.ToString();
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;





                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {

                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach(User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().dailyGrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                if (usr.Dailymailstatusreport.Date <= DateTime.UtcNow.Date || usr.Dailymailstatusreport.Date == null)
                                                {
                                                    retMail = MailSender.SendGroupReporsForElastic(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, "", "", skip);
                                                    Console.WriteLine("<----Mail sent to:" + _User.First().EmailId.ToString() + "------->");
                                                    //retMail = MailSender.SendGroupRepors(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, "sumit@socioboardmail.com", "75SDF/@#$fds");
                                                    if (retMail != null)
                                                    {
                                                        usr.Dailymailstatusreport = DateTime.UtcNow.AddDays(1);
                                                        int res = dbr.Update<User>(usr);
                                                    }
                                                }
                                                else
                                                {
                                                    Console.WriteLine("<------------------------------------------------->");
                                                    Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                    Console.WriteLine("<------------------------------------------------->");
                                                }
                                            }
                                        }
                                    }
                                }
                                
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }


        public async void SocialMediaStat_7()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        long TotalLikes = 0;
                        long TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();

                        string FollowerIds = string.Empty;
                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "7");
                                lsttwitterfollower = lstfollowers;

                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {
                                try
                                {
                                    List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                    string fbuserid = _FacebookAccount.First().FbUserId;
                                    string accesstoken = _FacebookAccount.First().AccessToken;
                                    lastFacebookPage = _FacebookAccount;
                                    if (!string.IsNullOrEmpty(accesstoken))
                                    {
                                        string totalLikes = "0";
                                        string talkingAbout = "0";
                                        int fblikers = 0;
                                        int fbunliker = 0;
                                        int fbimpression = 0;

                                        SocioBoardMailSenderServices.Repositories.FacebookRepository fblst = new SocioBoardMailSenderServices.Repositories.FacebookRepository();
                                        List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fblstdata = fblst.getFacaebookPageReports(fbuserid, 7);
                                        TotalLikes = fblstdata.Sum(t => Convert.ToInt64(t.totalLikes));
                                        PageImpression = fblstdata.Sum(t => t.impression);
                                        PageUnlike = fblstdata.Sum(t => t.unlikes);
                                        TalkingAbout = fblstdata.Sum(t => Convert.ToInt64(t.talkingAbout));
                                        PageLike = fblstdata.Sum(t => t.likes);
                                        //SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        //TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        //PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 7);
                                        //PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 7);
                                        //PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 7);
                                    }
                                }
                                catch(Exception ex)
                                {
                                    Console.WriteLine(ex.Message);
                                }
                              
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);
                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }


                        //Facebookpage data
                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        try
                        {
                            //twitter data
                            DateTime date = DateTime.UtcNow;
                            DateTime end = DateTime.UtcNow.AddDays(-7);
                            var lstTwitterMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterMessages(TwitterProfileId, date, end);
                            var lstTwitterDirectMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterDirectMessages(TwitterProfileId, date, end);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                        }
                       catch(Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                        try
                        {
                            //instagram data
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 7);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 7);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 7);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 7);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 7);
                            _InstagramStat.NewFollowers = Convert.ToString(_InstagramDailyReport.followcount);
                            _InstagramStat.NewFollowings = Convert.ToString(_InstagramDailyReport.followingcount);
                            _InstagramStat.LikesCount = Convert.ToString(lstGetInstagramPostLikes.Count);
                            _InstagramStat.CommentCount = Convert.ToString(lstGetInstagramPostComments.Count);
                            _InstagramStat.ImageCount = Convert.ToString(lstGetImagePosts.Count);
                            _InstagramStat.VideoCount = Convert.ToString(lstGetVideoPosts.Count);
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;
                    
                     


                       
                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {
                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().weeklyGrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {

                                    if (status == "Active")
                                    {
                                        if (mailstatus == 1)
                                        {
                                            if (usr.mailstatusforweeklyreport.Date <= DateTime.UtcNow.Date || usr.mailstatusforweeklyreport.Date == null)
                                            {
                                                retMail = MailSender.SendGroupReporsByDay(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, 7, "", "");
                                                Console.WriteLine("<----Mail sent to:" + usr.EmailId + "------->");
                                                if (retMail != null)
                                                {
                                                    usr.mailstatusforweeklyreport = DateTime.UtcNow.AddDays(7);
                                                    int res = dbr.Update<User>(usr);
                                                }
                                            }
                                            else
                                            {
                                                Console.WriteLine("<------------------------------------------------->");
                                                Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                Console.WriteLine("<------------------------------------------------->");
                                            }

                                        }
                                    }
                                        }
                                    }
                                }

                            }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {

                    }
                }

            }
            catch (Exception ex)
            {

            }
        }

        public async void SocialMediaStat_15()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();

                foreach (Groups item_group in lstGroups)
                {
                   
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        long TotalLikes = 0;
                        long TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();

                        string FollowerIds = string.Empty;
                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "15");
                                lsttwitterfollower = lstfollowers;

                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {

                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                string fbuserid = _FacebookAccount.First().FbUserId;
                                string accesstoken = _FacebookAccount.First().AccessToken;
                                lastFacebookPage = _FacebookAccount;
                                if (!string.IsNullOrEmpty(accesstoken))
                                {
                                    string totalLikes = "0";
                                    string talkingAbout = "0";
                                    int fblikers = 0;
                                    int fbunliker = 0;
                                    int fbimpression = 0;
                                    try
                                    {
                                        SocioBoardMailSenderServices.Repositories.FacebookRepository fblst = new SocioBoardMailSenderServices.Repositories.FacebookRepository();
                                        List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fblstdata = fblst.getFacaebookPageReports(fbuserid, 15);
                                        TotalLikes = fblstdata.Sum(t => Convert.ToInt64(t.totalLikes));
                                        PageImpression = fblstdata.Sum(t => t.impression);
                                        PageUnlike = fblstdata.Sum(t => t.unlikes);
                                        TalkingAbout = fblstdata.Sum(t => Convert.ToInt64(t.talkingAbout));
                                        PageLike = fblstdata.Sum(t => t.likes);
                                        //SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        //TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        //PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 15);
                                        //PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 15);
                                        //PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 15);
                                    }
                                    catch(Exception ex)
                                    {
                                        Console.WriteLine(ex.Message);
                                    }


                                }
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }


                        //Facebookpage data
                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;
                        try
                        {
                            //Twitter data
                            DateTime date = DateTime.UtcNow;
                            DateTime end = DateTime.UtcNow.AddDays(-15);
                            var lstTwitterMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterMessages(TwitterProfileId, date, end);
                            var lstTwitterDirectMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterDirectMessages(TwitterProfileId, date, end);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;
                        }
                       catch(Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                        try
                        {
                            //Instagram data
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 15);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 15);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 15);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 15);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 15);
                            _InstagramStat.NewFollowers = Convert.ToString(_InstagramDailyReport.followcount);
                            _InstagramStat.NewFollowings = Convert.ToString(_InstagramDailyReport.followingcount);
                            _InstagramStat.LikesCount = Convert.ToString(lstGetInstagramPostLikes.Count);
                            _InstagramStat.CommentCount = Convert.ToString(lstGetInstagramPostComments.Count);
                            _InstagramStat.ImageCount = Convert.ToString(lstGetImagePosts.Count);
                            _InstagramStat.VideoCount = Convert.ToString(lstGetVideoPosts.Count);

                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;
                       

                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {
                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().days15GrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                try
                                                {
                                                    if (usr.mailstatusfor15daysreport.Date <= DateTime.UtcNow.Date || usr.mailstatusfor15daysreport.Date == null)
                                                    {
                                                        retMail = MailSender.SendGroupReporsByDay(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, 15, "", "");
                                                        Console.WriteLine("<----Mail sent to:" + usr.EmailId + "------->");
                                                        if (retMail != null)
                                                        {
                                                            usr.mailstatusfor15daysreport = DateTime.UtcNow.AddDays(15);
                                                            int res = dbr.Update<User>(usr);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine("<------------------------------------------------->");
                                                        Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                        Console.WriteLine("<------------------------------------------------->");
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    Console.WriteLine(ex.Message);
                                                }

                                            }
                                        }
                                    }
                                    }
                                }

                            }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public async void SocialMediaStat_30()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        long TotalLikes = 0;
                        long TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();
                        string FollowerIds = string.Empty;

                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "30");
                                lsttwitterfollower = lstfollowers;

                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {

                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                string fbuserid = _FacebookAccount.First().FbUserId;
                                string accesstoken = _FacebookAccount.First().AccessToken;
                                lastFacebookPage = _FacebookAccount;
                                if (!string.IsNullOrEmpty(accesstoken))
                                {
                                    string totalLikes = "0";
                                    string talkingAbout = "0";
                                    int fblikers = 0;
                                    int fbunliker = 0;
                                    int fbimpression = 0;
                                    try
                                    {
                                        SocioBoardMailSenderServices.Repositories.FacebookRepository fblst = new SocioBoardMailSenderServices.Repositories.FacebookRepository();
                                        List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fblstdata = fblst.getFacaebookPageReports(fbuserid, 30);
                                        TotalLikes = fblstdata.Sum(t => Convert.ToInt64(t.totalLikes));
                                        PageImpression = fblstdata.Sum(t => t.impression);
                                        PageUnlike = fblstdata.Sum(t => t.unlikes);
                                        TalkingAbout = fblstdata.Sum(t => Convert.ToInt64(t.talkingAbout));
                                        PageLike = fblstdata.Sum(t => t.likes);
                                        //SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        //TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        //PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 30);
                                        //PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 30);
                                        //PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 30);
                                    }
                                    catch(Exception ex)
                                    {
                                        Console.WriteLine(ex.Message);
                                    }

                                }
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }


                        //facebookpagedata
                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;

                        try
                        {
                            //twitter data
                            DateTime date = DateTime.UtcNow;
                            DateTime end = DateTime.UtcNow.AddDays(-30);
                            var lstTwitterMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterMessages(TwitterProfileId, date, end);
                            var lstTwitterDirectMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterDirectMessages(TwitterProfileId, date, end);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;
                        }
                       catch(Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                        try
                        {
                            //intagram data
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 30);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 30);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 30);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 30);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 30);
                            _InstagramStat.NewFollowers = Convert.ToString(_InstagramDailyReport.followcount);
                            _InstagramStat.NewFollowings = Convert.ToString(_InstagramDailyReport.followingcount);
                            _InstagramStat.LikesCount = Convert.ToString(lstGetInstagramPostLikes.Count);
                            _InstagramStat.CommentCount = Convert.ToString(lstGetInstagramPostComments.Count);
                            _InstagramStat.ImageCount = Convert.ToString(lstGetImagePosts.Count);
                            _InstagramStat.VideoCount = Convert.ToString(lstGetVideoPosts.Count);
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;
                       
                     
                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {
                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().monthlyGrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                try
                                                {
                                                    if (usr.mailstatusfor30daysreport.Date <= DateTime.UtcNow.Date || usr.mailstatusfor30daysreport.Date == null)
                                                    {
                                                        retMail = MailSender.SendGroupReporsByDay(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, 30, "", "");
                                                        Console.WriteLine("<----Mail sent to:" + usr.EmailId + "------->");
                                                        if (retMail != null)
                                                        {
                                                            usr.mailstatusfor30daysreport = DateTime.UtcNow.AddDays(30);
                                                            int res = dbr.Update<User>(usr);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine("<------------------------------------------------->");
                                                        Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                        Console.WriteLine("<------------------------------------------------->");
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    Console.WriteLine(ex.Message);
                                                }


                                            }
                                        }
                                    }
                                    }
                                }
                                //  DateTime d1 = _User.First().MailstatusbeforeAccountExpire.Date;

                            }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        public async void SocialMediaStat_60()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        long TotalLikes = 0;
                        long TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();
                        string FollowerIds = string.Empty;

                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "60");
                                lsttwitterfollower = lstfollowers;

                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {

                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                string fbuserid = _FacebookAccount.First().FbUserId;
                                string accesstoken = _FacebookAccount.First().AccessToken;
                                lastFacebookPage = _FacebookAccount;
                                if (!string.IsNullOrEmpty(accesstoken))
                                {
                                    string totalLikes = "0";
                                    string talkingAbout = "0";
                                    int fblikers = 0;
                                    int fbunliker = 0;
                                    int fbimpression = 0;
                                    try
                                    {
                                        SocioBoardMailSenderServices.Repositories.FacebookRepository fblst = new SocioBoardMailSenderServices.Repositories.FacebookRepository();
                                        List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fblstdata = fblst.getFacaebookPageReports(fbuserid, 60);
                                        TotalLikes = fblstdata.Sum(t => Convert.ToInt64(t.totalLikes));
                                        PageImpression = fblstdata.Sum(t => t.impression);
                                        PageUnlike = fblstdata.Sum(t => t.unlikes);
                                        TalkingAbout = fblstdata.Sum(t => Convert.ToInt64(t.talkingAbout));
                                        PageLike = fblstdata.Sum(t => t.likes);
                                        //SocioBoardMailSenderServices.EmailServices.FacebookStat getfb = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                                        //TotalLikes = Convert.ToInt32(getfb.GetFacebookPageDetails(fbuserid, accesstoken));
                                        //PageLike = getfb.GetFacebookNewLiker(fbuserid, accesstoken, 60);
                                        //PageUnlike = getfb.GetFacebookUnliker(fbuserid, accesstoken, 60);
                                        //PageImpression = getfb.GetFacebookImpression(fbuserid, accesstoken, 60);
                                    }
                                    catch(Exception ex)
                                    {
                                        Console.WriteLine(ex.Message);
                                    }

                                }
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }



                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        //_SocialStat.male = _male;
                        //_SocialStat.female = _female;

                        try
                        {
                            //twitter data
                            DateTime date = DateTime.UtcNow;
                            DateTime end = DateTime.UtcNow.AddDays(-60);
                            var lstTwitterMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterMessages(TwitterProfileId, date, end);
                            var lstTwitterDirectMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterDirectMessages(TwitterProfileId, date, end);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;

                        }
                        catch(Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                        try
                        {
                            //Instagram data
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 60);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 60);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 60);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 60);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 60);
                            _InstagramStat.NewFollowers = Convert.ToString(_InstagramDailyReport.followcount);
                            _InstagramStat.NewFollowings = Convert.ToString(_InstagramDailyReport.followingcount);
                            _InstagramStat.LikesCount = Convert.ToString(lstGetInstagramPostLikes.Count);
                            _InstagramStat.CommentCount = Convert.ToString(lstGetInstagramPostComments.Count);
                            _InstagramStat.ImageCount = Convert.ToString(lstGetImagePosts.Count);
                            _InstagramStat.VideoCount = Convert.ToString(lstGetVideoPosts.Count);
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;

                     
                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {
                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().days60GrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                try
                                                {
                                                    if (usr.mailstatusfor60daysreport.Date <= DateTime.UtcNow.Date || usr.mailstatusfor60daysreport.Date == null)
                                                    {
                                                        retMail = MailSender.SendGroupReporsByDay(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, 60, "", "");
                                                        Console.WriteLine("<----Mail sent to:" + usr.EmailId + "------->");
                                                        if (retMail != null)
                                                        {
                                                            usr.mailstatusfor60daysreport = DateTime.UtcNow.AddDays(60);
                                                            int res = dbr.Update<User>(usr);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine("<------------------------------------------------->");
                                                        Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                        Console.WriteLine("<------------------------------------------------->");
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    Console.WriteLine(ex.Message);
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public async void SocialMediaStat_90()
        {
            try
            {
                SocioBoardMailSenderServices.EmailServices.FacebookStat _FacebookStat = new SocioBoardMailSenderServices.EmailServices.FacebookStat();
                SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
                Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                Domain.Socioboard.Models.TwitterAccount ApiTwitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                Domain.Socioboard.Models.Facebookaccounts ApiFacebookAccount = new Domain.Socioboard.Models.Facebookaccounts();
                Domain.Socioboard.Models.Groups ApiGroups = new Domain.Socioboard.Models.Groups();
                Domain.Socioboard.Models.Instagramaccounts ApiInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();
                SocioboardDataServices.Reports.GroupReports ApiGroupReports = new SocioboardDataServices.Reports.GroupReports();

                string email = string.Empty;
                List<Groups> lstGroups = (List<Groups>)ES.GetAllGroups();

                foreach (Groups item_group in lstGroups)
                {
                    try
                    {
                        string TwitterProfileId = string.Empty;
                        string FacebookProfileId = string.Empty;
                        string FacebookPageProfileId = string.Empty;
                        string InstagramProfileId = string.Empty;
                        long TotalLikes = 0;
                        long TalkingAbout = 0;
                        int PageLike = 0;
                        int PageUnlike = 0;
                        int PageImpression = 0;
                        int objFacebookAccount = 0;

                        SocioBoardMailSenderServices.EmailServices.SocialStat _SocialStat = new SocioBoardMailSenderServices.EmailServices.SocialStat();
                        List<Domain.Socioboard.Models.Groupprofiles> lstGroupProfiles = (List<Domain.Socioboard.Models.Groupprofiles>)ES.GetGroupProfiles(item_group.id);
                        List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower = new List<Domain.Socioboard.Models.TwitterAccount>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookProfiles = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Facebookaccounts> lastFacebookPage = new List<Domain.Socioboard.Models.Facebookaccounts>();
                        List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount = new List<Domain.Socioboard.Models.Instagramaccounts>();
                        SocioBoardMailSenderServices.EmailServices.FbPageStat _FbPageStat = new SocioBoardMailSenderServices.EmailServices.FbPageStat();
                        string FollowerIds = string.Empty;

                        foreach (Domain.Socioboard.Models.Groupprofiles item_GroupProfiles in lstGroupProfiles)
                        {
                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                            {
                                TwitterProfileId += item_GroupProfiles.profileId + ",";
                                List<TwitterAccount> _TwitterAccount = (List<TwitterAccount>)ES.GetTwitterAccountDetailsById(item_group.adminId);

                                List<TwitterAccount> lstfollowers = (List<TwitterAccount>)ES.GetTwitterFollowers(item_group.adminId, item_GroupProfiles.groupId, "90");
                                lsttwitterfollower = lstfollowers;

                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                            {

                                FacebookProfileId += item_GroupProfiles.profileId + ",";
                                List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookAccountDetailsById(item_group.adminId);
                                lstFacebookProfiles = _FacebookAccount;
                            }

                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                            {
                                try
                                {
                                    List<Facebookaccounts> _FacebookAccount = (List<Facebookaccounts>)ES.getFacebookpageAccountDetailsById(item_group.adminId);
                                    string fbuserid = _FacebookAccount.First().FbUserId;
                                    string accesstoken = _FacebookAccount.First().AccessToken;
                                    lastFacebookPage = _FacebookAccount;
                                    if (!string.IsNullOrEmpty(accesstoken))
                                    {
                                        string totalLikes = "0";
                                        string talkingAbout = "0";
                                        int fblikers = 0;
                                        int fbunliker = 0;
                                        int fbimpression = 0;
                                        try
                                        {
                                            // SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                                            //List<Domain.Socioboard.Models.Mongo.FacebookPagePost> fbpagelikes = SocioBoardMailSenderServices.EmailServices.FacebookPageStat.getfblikes(fbuserid, 90);
                                            SocioBoardMailSenderServices.Repositories.FacebookRepository fblst = new SocioBoardMailSenderServices.Repositories.FacebookRepository();
                                            List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fblstdata = fblst.getFacaebookPageReports(fbuserid, 90);
                                            TotalLikes = fblstdata.Sum(t => Convert.ToInt64(t.totalLikes));
                                            PageImpression = fblstdata.Sum(t => t.impression);
                                            PageUnlike = fblstdata.Sum(t => t.unlikes);
                                            TalkingAbout = fblstdata.Sum(t => Convert.ToInt64(t.talkingAbout));
                                            PageLike = fblstdata.Sum(t => t.likes);
                                        }
                                       catch(Exception ex)
                                        {
                                            Console.WriteLine(ex.Message);
                                        }

                                    }
                                }
                                catch(Exception ex)
                                {
                                    Console.WriteLine(ex.Message);
                                }
                                
                            }


                            if (!string.IsNullOrEmpty(item_GroupProfiles.profileId) && item_GroupProfiles.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                            {
                                List<Instagramaccounts> _InstagramAccount = (List<Instagramaccounts>)ES.UserInformation(item_group.adminId);

                                InstagramProfileId += item_GroupProfiles.profileId + ",";
                                lstInstagramAccount = _InstagramAccount;
                            }
                        }
                        try
                        {
                            TwitterProfileId = TwitterProfileId.Substring(0, TwitterProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            TwitterProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            InstagramProfileId = InstagramProfileId.Substring(0, InstagramProfileId.Length - 1);
                        }
                        catch (Exception e)
                        {
                            InstagramProfileId = string.Empty;
                            Console.WriteLine(e.Message);
                        }
                        try
                        {
                            FacebookProfileId = FacebookProfileId.Substring(0, FacebookProfileId.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FacebookProfileId = string.Empty;
                        }
                        try
                        {
                            FollowerIds = FollowerIds.Substring(0, FollowerIds.Length - 1);
                        }
                        catch (Exception ex)
                        {
                            FollowerIds = string.Empty;
                        }


                        //Facebookpage data
                        _FbPageStat.TotalLikes = TotalLikes.ToString();
                        _FbPageStat.TalkingAbout = TalkingAbout.ToString();
                        _FbPageStat.PageLike = PageLike.ToString();
                        _FbPageStat.PageUnlike = PageUnlike.ToString();
                        _FbPageStat.PageImpression = PageImpression.ToString();
                        _FbPageStat.lstFacebookAccount = lstFacebookProfiles;
                        _FbPageStat.lstFacebookpage = lastFacebookPage;

                        try
                        {
                            //twitter data
                            DateTime date = DateTime.UtcNow;
                            DateTime end = DateTime.UtcNow.AddDays(-90);
                            var lstTwitterMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterMessages(TwitterProfileId, date, end);
                            var lstTwitterDirectMessages = SocioBoardMailSenderServices.EmailServices.TwitterStat.GetTwitterDirectMessages(TwitterProfileId, date, end);
                            Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports todayReports = new Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports();
                            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
                            _SocialStat.Mentions = todayReports.mentions.ToString();
                            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            _SocialStat.New_Followers = todayReports.newFollowers.ToString();
                            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
                            _SocialStat.Retweets = todayReports.retweets.ToString();
                            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
                            _SocialStat.Direct_Message = todayReports.directMessagesReceived.ToString();
                            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
                            _SocialStat.Messages_Sent = todayReports.directMessagesSent.ToString();
                            _SocialStat.lsttwitterfollower = lsttwitterfollower;

                        }
                        catch(Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }

                        try
                        {
                            //Instagram data
                            SocioBoardMailSenderServices.EmailServices.InstagramStat _InstagramStat = new SocioBoardMailSenderServices.EmailServices.InstagramStat();
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostComments(InstagramProfileId, 90);
                            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = SocioboardDataServices.Reports.InstagramReports.GetInstagramPostLikes(InstagramProfileId, 90);
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = SocioboardDataServices.Reports.InstagramReports.GetVideoPosts(InstagramProfileId, 90);
                            Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = SocioboardDataServices.Reports.InstagramReports.GetImagePosts(InstagramProfileId, 90);
                            var lstMongoTwitterMessage = SocioboardDataServices.Reports.InstagramReports.GetInstagramFollwerFollowing(InstagramProfileId, 90);
                            _InstagramStat.NewFollowers = Convert.ToString(_InstagramDailyReport.followcount);
                            _InstagramStat.NewFollowings = Convert.ToString(_InstagramDailyReport.followingcount);
                            _InstagramStat.LikesCount = Convert.ToString(lstGetInstagramPostLikes.Count);
                            _InstagramStat.CommentCount = Convert.ToString(lstGetInstagramPostComments.Count);
                            _InstagramStat.ImageCount = Convert.ToString(lstGetImagePosts.Count);
                            _InstagramStat.VideoCount = Convert.ToString(lstGetVideoPosts.Count);
                            _InstagramStat.lstInstagramAccount = lstInstagramAccount;
                      
                       
                            List<Domain.Socioboard.Models.Groups> lstGroupmembers = new List<Domain.Socioboard.Models.Groups>();
                            List<Groupmembers> groupMembers = (List<Groupmembers>)ES.Getgroupmembersbyid(item_group.id).ToList();
                            foreach (Groupmembers _Groupmembers in groupMembers)
                            {
                                List<User> _User = (List<User>)ES.getUsersById(_Groupmembers.userId, "");
                                foreach (User usr in _User)
                                {
                                    string status = _User.First().ActivationStatus.ToString();
                                    int mailstatus = Convert.ToInt16(_User.First().days90GrpReportsSummery);
                                    string retMail = string.Empty;
                                    if (_User != null)
                                    {
                                        if (status == "Active")
                                        {
                                            if (mailstatus == 1)
                                            {
                                                try
                                                {
                                                    if (usr.mailstatusfor90daysreport.Date <= DateTime.UtcNow.Date || usr.mailstatusfor90daysreport.Date == null)
                                                    {
                                                        retMail = MailSender.SendGroupReporsByDay(item_group.groupName, _Groupmembers.email, _SocialStat, _FbPageStat, _InstagramStat, 90, "", "");
                                                        Console.WriteLine("<----Mail sent to:" + usr.EmailId + "------->");
                                                        if (retMail != null)
                                                        {
                                                            usr.mailstatusfor90daysreport = DateTime.UtcNow.AddDays(90);
                                                            int res = dbr.Update<User>(usr);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine("<------------------------------------------------->");
                                                        Console.WriteLine("<----Mail already sent to:" + usr.EmailId + "------->");
                                                        Console.WriteLine("<------------------------------------------------->");
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    Console.WriteLine(ex.Message);
                                                }

                                            }
                                        }
                                    }
                                    }
                                }


                            }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }


                    }

                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public string GetBouncedMailFromElasticMail(int count)
        {
            int count1 = count;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
            try
            {
                List<string> lstusermail = (List<string>)ES.GetBouncedListOfMailFromElasticMail(count1);
                foreach (string item in lstusermail)
                {
                    
                    User usr = dbr.Single<User>(t => t.EmailId == item);
                    if(usr != null)
                    {
                        Groupmembers grpmember = dbr.Single<Groupmembers>(t => t.email == item);
                        Groups grps = dbr.Single<Groups>(t => t.id == grpmember.groupid);
                        List<Groupprofiles> grpprofiles = dbr.Find<Groupprofiles>(t => t.groupId == grpmember.groupid).ToList();
                        try
                        {
                            if (grpprofiles != null)
                            {
                                foreach (Groupprofiles grpprofile in grpprofiles)
                                {
                                    if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook)
                                    {
                                        try
                                        {
                                            Facebookaccounts fbaccount = dbr.Single<Facebookaccounts>(t => t.FbUserId == grpprofile.profileId);
                                            dbr.Delete<Facebookaccounts>(fbaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);
                                        }
                                        catch (Exception ex)
                                        {

                                        }

                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                                    {
                                        try
                                        {
                                            TwitterAccount twittersaccount = dbr.Single<TwitterAccount>(t => t.twitterUserId == grpprofile.profileId);
                                            dbr.Delete<TwitterAccount>(twittersaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram)
                                    {
                                        try
                                        {
                                            Instagramaccounts instagramsaccount = dbr.Single<Instagramaccounts>(t => t.InstagramId == grpprofile.profileId);
                                            dbr.Delete<Instagramaccounts>(instagramsaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.GPlus)
                                    {
                                        try
                                        {
                                            Googleplusaccounts gplusaccount = dbr.Single<Googleplusaccounts>(t => t.GpUserId == grpprofile.profileId);
                                            dbr.Delete<Googleplusaccounts>(gplusaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn)
                                    {
                                        try
                                        {
                                            LinkedInAccount linkedinaccount = dbr.Single<LinkedInAccount>(t => t.LinkedinUserId == grpprofile.profileId);
                                            dbr.Delete<LinkedInAccount>(linkedinaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage)
                                    {
                                        try
                                        {
                                            LinkedinCompanyPage linkedincompanypageaccount = dbr.Single<LinkedinCompanyPage>(t => t.LinkedinPageId == grpprofile.profileId);
                                            dbr.Delete<LinkedinCompanyPage>(linkedincompanypageaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                    else if (grpprofile.profileType == Domain.Socioboard.Enum.SocialProfileType.GoogleAnalytics)
                                    {
                                        try
                                        {
                                            GoogleAnalyticsAccount googleanalyticsaccount = dbr.Single<GoogleAnalyticsAccount>(t => t.GaProfileId == grpprofile.profileId);
                                            dbr.Delete<GoogleAnalyticsAccount>(googleanalyticsaccount);
                                            dbr.Delete<Groupprofiles>(grpprofile);

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                    }
                                }
                                try
                                {
                                    dbr.Delete<Groups>(grps);
                                    dbr.Delete<Groupmembers>(grpmember);
                                    dbr.Delete<User>(usr);
                                }
                               catch(Exception)
                                {

                                }
                            }
                          }
                        catch (Exception ex)
                        {

                        }
                    }
                  }
                return "done";
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return "done";
        }
        public string GetreportfromElasticmail(int count)
        {
            int count1 = count;
            SocioBoardMailSenderServices.Helper.DatabaseRepository dbr = new SocioBoardMailSenderServices.Helper.DatabaseRepository();
            SocioBoardMailSenderServices.EmailServices.EmailService ES = new EmailServices.EmailService();
            try
            {
                List<string> addreport = (List<string>)ES.addreportfromelastic(count1);
            }
            catch(Exception ex)
            {

            }
           
            return "done";
        }
        public string DeleteoldReportfromMongoforElasticMail()
        {
           // int count1 = count;
           
            try
            {
                double date = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp( DateTime.UtcNow.AddDays(-60));
                SocioBoardMailSenderServices.Model.MongoRepository mongorep = new SocioBoardMailSenderServices.Model.MongoRepository("ElasticmailDailyReport");
                //var getlstemails = mongorep.Find<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.time.Date <= date.Date);
                mongorep.Delete<Domain.Socioboard.Models.Mongo.ElasticmailReport>(t => t.time < date);

            }
            catch (Exception ex)
            {

            }

            return "done";
        }
    }
    }
