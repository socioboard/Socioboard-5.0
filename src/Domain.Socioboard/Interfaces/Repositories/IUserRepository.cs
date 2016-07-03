

using Domain.Socioboard.Models;

namespace Domain.Socioboard.Interfaces.Repositories
{
    public interface IUserRepository
    {
        User RegisterUser(User userModel);
        User FindUser(string userName);
        User FindUser(string userName, string password);
        void Delete(string userName);
    }
}
