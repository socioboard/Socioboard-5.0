using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Domain.Socioboard.Interfaces.Repositories
{
   public interface IDatabaseRepository
    {
        void Delete<T>(Expression<Func<T, bool>> expression) where T : class, new();
        void Delete<T>(T item) where T : class, new();
        void DeleteAll<T>() where T : class, new();
        T Single<T>(Expression<Func<T, bool>> expression) where T : class, new();
        System.Linq.IQueryable<T> All<T>() where T : class, new();
        System.Linq.IQueryable<T> All<T>(int page, int pageSize) where T : class, new();
        int Add<T>(T item) where T : class, new();
        int Add<T>(IEnumerable<T> items) where T : class, new();
        IList<T> Find<T>(Expression<Func<T, bool>> query) where T : class, new();

        int GetCount<T>(Expression<Func<T, bool>> query) where T : class, new();
    }
}
