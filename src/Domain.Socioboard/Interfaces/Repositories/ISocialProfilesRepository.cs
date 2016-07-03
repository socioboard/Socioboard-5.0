using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;


namespace Domain.Socioboard.Interfaces.Repositories
{
    public interface ISocialProfilesRepository
    {
        List<T> getAllSocialProfilesOfUser<T>(Guid userid) where T : class, new();
        void addSocialProfile<T>(T SocialProfile) where T : class, new();
        bool IsSocialProfileExist<T>(T SocialProfile) where T : class, new();
        int updateSocialProfile<T>(T SocialProfile) where T : class, new();
    }
}
