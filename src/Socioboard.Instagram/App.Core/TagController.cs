using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.TagsMethods;

namespace Socioboard.Instagram.App.Core
{
    class TagController
    {
         /// <summary>
        /// Get information about a tag object. 
        /// </summary>
        /// <param name="tagname"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Tag> GetTagDetails(string tagname, string accessToken)
        {
            Tags objTags = new Tags();
            return objTags.TagDetails(tagname, accessToken);
        }

          /// <summary>
        /// Search for tags by name. Results are ordered first as an exact match, then by popularity.
        /// </summary>
        /// <param name="query"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Tag[]> GetTagSearch(string query, string accessToken)
        {
             Tags objTags = new Tags();
             return objTags.TagSearch(query, accessToken);
        }

          /// <summary>
        /// Get a list of recently tagged media. 
        /// </summary>
        /// <param name="tagname"></param>
        /// <param name="min_id"></param>
        /// <param name="max_id"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> GetListTagMedia(string tagname, string min_id, string max_id, string accessToken)
        {
             Tags objTags = new Tags();
             return objTags.TagMedia(tagname, min_id, max_id, accessToken);
        }
        public static Tag[] TagsInMediaList(InstagramMedia[] media)
        {
            List<string> t = new List<string>();
            foreach (var instagramMedia in media)
            {
                foreach (string tag in instagramMedia.tags)
                {
                    if (!t.Contains(tag))
                        t.Add(tag);
                }
            }

            return TagsFromStrings(t.ToArray());
        }
        public static Tag[] TagsFromStrings(string[] tags)
        {
            List<Tag> taglist = new List<Tag>(tags.Length);
            foreach (string s in tags)
            {
                Tag tag = new Tag
                {
                    media_count = 0,
                    name = s
                };
                taglist.Add(tag);
            }
            return taglist.ToArray();
        }
    }
}
