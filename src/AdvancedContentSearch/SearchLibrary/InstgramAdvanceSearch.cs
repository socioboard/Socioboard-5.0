using System;
using System.Collections.Generic;
using System.Linq;
using AdvancedContentSearch.Helper;
using AdvancedContentSearch.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using Socioboard.Instagram.Custom;

namespace AdvancedContentSearch.SearchLibrary
{
    public class InstgramAdvanceSearch
    {
        public static void instgramSearch()
        {
            DatabaseRepository dbr = new DatabaseRepository();
            List<Discovery> lst_discovery = dbr.Find<Discovery>(t => t.SearchKeyword != "").ToList();
            foreach (var itemdis in lst_discovery)
            {
                MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                try
                {
                    JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(itemdis.SearchKeyword, AppSetting.instagramToken));
                    foreach (JObject obj in JArray.Parse(recentactivities["data"].ToString()))
                    {
                        Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                        _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                        _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                        _AdvanceSerachData.domainType = "https://www.instagram.com/?";
                        _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.image;
                        _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.instagram;
                      
                        try
                        {
                            _AdvanceSerachData.ImageUrl = obj["images"]["standard_resolution"]["url"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.postUrl = obj["link"].ToString();
                        }
                        catch { }
                        try
                        {
                            foreach (JValue tag in JArray.Parse(obj["tags"].ToString()))
                            {
                                try
                                {
                                    _AdvanceSerachData.postdescription = tag.ToString() + ",";
                                }
                                catch { }
                            }
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.postedTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(obj["created_time"].ToString()));
                        }
                        catch
                        {
                            _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        }
                        try
                        {
                            _AdvanceSerachData.postId = obj["id"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.userName = obj["user"]["username"].ToString();
                        }
                        catch { }
                        try
                        {
                            _AdvanceSerachData.userName = obj["user"]["full_name"].ToString();
                        }
                        catch { }
                        int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                        if (count == 0)
                        {
                            mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                        }
                       
                    }
                }
                catch(Exception ex) {
                    Console.WriteLine(ex.Message);
                }
            }


        }
    }
}
