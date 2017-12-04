using Api.Socioboard.Helper;
using Domain.Socioboard.Interfaces.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using NHibernate.Linq;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Api.Socioboard.Model
{
    public class DatabaseRepository : IDatabaseRepository
    {
        public DatabaseRepository(ILogger logger, IHostingEnvironment env)
        {
            _logger = logger;
            _env = env;
        }
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _env;

        public IList<T> Find<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().Where(query).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }

            return result;
        }
        //public int Sum<T>(Expression<Func<T, bool>> query,Expression column) where T : class, new()
        //{
        //    int result = 0;
        //    try
        //    {
        //        using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
        //        {
        //            var futureCount = session.Query<T>().Where(query).Sum<T>(column);
                       
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogCritical(ex.Message);
        //        _logger.LogError(ex.StackTrace);
        //        try
        //        {
        //            _logger.LogError(ex.InnerException.Message);

        //        }
        //        catch { }
        //    }

        //    return result;
        //}

        public IList<T> FindWithRange<T>(Expression<Func<T, bool>> query, int skip, int take) where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().Where(query).Skip(skip).Take(take).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }

            return result;

        }

        public int GetCount<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            int PiadUser = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
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
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }
            return PiadUser;
        }

        public int Counts<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            int PiadUser = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {

                    var futureCount = session.Query<T>().Where(query).Count();
                    PiadUser = Convert.ToInt32(futureCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }
            return PiadUser;
        }



        public IList<T> FindAll<T>() where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().ToList();
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }

            return result;
        }
        public T FindSingle<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            T result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().Where(query).SingleOrDefault();
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
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
                    using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
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
                    _logger.LogCritical(ex.Message);
                    _logger.LogError(ex.StackTrace);
                }
            }

            return result;
        }

        public int Add<T>(T item) where T : class, new()
        {
            int result = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
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
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException.Message);
                    _logger.LogError(ex.InnerException.StackTrace);

                }
            }


            return result;
        }
        public T Single<T>(Expression<Func<T, bool>> expression) where T : class, new()
        {
            T result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().Single(expression);
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
            }

            return result;
        }
        public void Delete<T>(T item) where T : class, new()
        {
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    using (NHibernate.ITransaction transaction = session.BeginTransaction())
                    {
                        session.Delete(item);
                        transaction.Commit();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException.Message);
                    _logger.LogError(ex.InnerException.StackTrace);

                }
            }
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
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
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
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException.Message);
                    _logger.LogError(ex.InnerException.StackTrace);

                }
            }


            return result;
        }

        public int UpdateAll<T>(IList item) where T : class, new()
        {

            int result = 0;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    using (NHibernate.ITransaction transaction = session.BeginTransaction())
                    {
                        foreach (var temp in item)
                        {
                            session.Update(temp);
                        }                       
                        transaction.Commit();
                        result = 1;
                    }
                }
            }
            catch (Exception ex)
            {
                result = 0;
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException.Message);
                    _logger.LogError(ex.InnerException.StackTrace);

                }
            }


            return result;
        }

        public void DeleteAllList<T>(IList item) where T : class, new()
        {
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    using (NHibernate.ITransaction transaction = session.BeginTransaction())
                    {
                        foreach (var temp in item)
                        {
                            session.Delete(temp);
                        }
                        transaction.Commit();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException.Message);
                    _logger.LogError(ex.InnerException.StackTrace);

                }
            }
        }

        public IList<T> FindWithRangeDesct<T>(Expression<Func<T, bool>> query, int skip, int take, Expression<Func<T, long>> DescVar) where T : class, new()
        {
            IList<T> result = null;
            try
            {
                using (NHibernate.ISession session = SessionFactory.GetNewSession(_env))
                {
                    result = session.Query<T>().OrderByDescending(DescVar).Where(query).Skip(skip).Take(take).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
                _logger.LogError(ex.StackTrace);
                try
                {
                    _logger.LogError(ex.InnerException.Message);

                }
                catch { }
            }

            return result;

        }
    }
}
