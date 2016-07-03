using Domain.Socioboard.Enum;
using System;


namespace Domain.Socioboard.Interfaces.Models
{
    public interface ISocialProfile
    {
        Guid Id { get; set; }
        Guid UserId { get; set; }
        string ProfileId { get; set; }
        string UserName { get; set; }
        SocialProfileType ProfileType { get; set; }
        string ProfielPic { get; set; }
        string AccessToken { get; set; }
        SocialProfileStatus ProfileStatus { get; set; }
    }
}
