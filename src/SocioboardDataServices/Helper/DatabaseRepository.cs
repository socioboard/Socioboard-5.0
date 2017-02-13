using Domain.Socioboard.Interfaces.Repositories;
using NHibernate.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace SocioboardDataServices.Helper
{
    public class DatabaseRepository : IDatabaseRepository
    {

        public IList<T> Find<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {
                    result = session.Query<T>().Where(query).ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StackTrace);
                //_logger.LogCritical(ex.Message);
                //_logger.LogError(ex.StackTrace);
            }

            return result;
        }
        public int GetCount<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            int PiadUser = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {

                    var futureCount = session.QueryOver<T>().Where(query)
                       .Select(NHibernate.Criterion.Projections.RowCount())
                      .FutureValue<int>()
                          .Value;
                    PiadUser = Convert.ToInt32(futureCount);
                }
            }
            catch (Exception ex)
            {
               
            }
            return PiadUser;
        }
        public IList<T> FindAll<T>() where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {
                    result = session.Query<T>().ToList();
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }

        public System.Linq.IQueryable<T> All<T>() where T : class, new()
        {
            throw new NotImplementedException();
        }
        public System.Linq.IQueryable<T> All<T>(int page, int pageSize) where T : class, new()
        {
            throw new NotImplementedException();
        }

        public int Add<T>(IEnumerable<T> items) where T : class, new()
        {
            int result = 0;
            foreach (var item in items)
            {
                try
                {
                    using (NHibernate.ISession session = SessionFactory.GetNewSession())
                    {
                        using (NHibernate.ITransaction transaction = session.BeginTransaction())
                        {
                            session.Save(item);
                            transaction.Commit();
                            result = 1;
                        }
                    }
                }
                catch (Exception ex)
                {
                    result = 0;
                    //_logger.LogCritical(ex.Message);
                    //_logger.LogError(ex.StackTrace);
                }
            }

            return result;
        }

        public int Add<T>(T item) where T : class, new()
        {
            int result = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {
                    using (NHibernate.ITransaction transaction = session.BeginTransaction())
                    {
                        session.Save(item);
                        transaction.Commit();
                        result = 1;
                    }
                }
            }
            catch (Exception ex)
            {
                result = 0;
                //_logger.LogCritical(ex.Message);
                //_logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    //_logger.LogError(ex.InnerException.Message);
                    //_logger.LogError(ex.InnerException.StackTrace);

                }
            }


            return result;
        }
        public T Single<T>(Expression<Func<T, bool>> expression) where T : class, new()
        {
            T result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {
                    result = session.Query<T>().Single(expression);
                }
            }
            catch (Exception ex)
            {
                //_logger.LogCritical(ex.Message);
                //_logger.LogError(ex.StackTrace);
            }

            return result;
        }
        public void Delete<T>(T item) where T : class, new()
        {
            throw new NotImplementedException();
        }
        public void Delete<T>(Expression<Func<T, bool>> expression) where T : class, new()
        {
            throw new NotImplementedException();
        }


        public void DeleteAll<T>() where T : class, new()
        {
            throw new NotImplementedException();
        }

        public int Update<T>(T item) where T : class, new()
        {
            int result = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession())
                {
                    using (NHibernate.ITransaction transaction = session.BeginTransaction())
                    {
                        session.Update(item);
                        transaction.Commit();
                        result = 1;
                    }
                }
            }
            catch (Exception ex)
            {
                result = 0;
                //_logger.LogCritical(ex.Message);
                //_logger.LogError(ex.StackTrace);
                //if (ex.InnerException != null)
                //{
                //    _logger.LogError(ex.InnerException.Message);
                //    _logger.LogError(ex.InnerException.StackTrace);

                //}
            }


            return result;
        }

    }
}
