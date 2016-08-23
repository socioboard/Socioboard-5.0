using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class TaskCommentsViewModel
    {
        public virtual Tasks tasks { get; set; }
        public virtual User user { get; set; }
        public virtual List<TaskCommentViewModel> lstTaskComments { get; set; }
    }

    public class TaskCommentViewModel
    {
        public virtual TaskComments taskComments { get; set; }
        public virtual User user { get; set; }
    }

}
