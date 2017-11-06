using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using SitemapXml.Models;

namespace SitemapXml.Core
{
    public class Db
    {
        public static List<Store> GetStores()
        {
            return new List<Store>
            {
                new Store("Active Ride Shop", "Active-Ride-Shop", DateTime.Now),
                new Store("Aerie", "Aerie", DateTime.Now),
                new Store("Affordable Optical", "Affordable-Optical", DateTime.Now)
            };
        }

        public static List<Video> GetVideos()
        {
            return new List<Video>
            {
                new Video("The English Teacher", "", "tet-1.jpg", "The-English-Teacher"),
                new Video("Nobody Walks", "", "nw-1.jpg", "Nobody-Walks"),
                new Video("Starlet", "", "s-1.jpg", "Starletr")
            };
        } 
    }
}