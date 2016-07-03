using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Interfaces.Models
{
   public interface IUser
    {
         Int64 Id { get; set; }
         string UserName { get; set; }
        string Password { get; set; }
        string EmailId { get; set; }
        string PhoneNumber { get; set; }
    }
}
