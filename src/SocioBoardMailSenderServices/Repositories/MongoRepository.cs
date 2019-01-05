using Domain.Socioboard.Interfaces.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace SocioBoardMailSenderServices.Model
{
    public class MongoRepository 
    {
        //private IMongo _provider;
        private IMongoDatabase _db;
        private MongoCollectionSettings settings;
        private string collecionName;
        // private Api.Socioboard.Helper.AppSettings _appSettings;
        // private readonly ILogger _logger;

        public MongoRepository(string CollectionName)
        {
            MongoClient client = new MongoClient("");

            _db = client.GetDatabase("");

            this.collecionName = CollectionName;
            // _logger = logger;

        }

        public void Delete<T>(System.Linq.Expressions.Expression<Func<T, bool>> expression)
   where T : class, new()
        {
            _db.GetCollection<T>(collecionName, settings).DeleteOneAsync(expression);
            //var items = All<T>().Where(expression);
            //foreach (T item in items)
            //{
            //    Delete(item);
            //}
            //throw new NotImplementedException();
        }

        public void Delete<T>(FilterDefinition<T> filter) where T : class, new()
        {

            _db.GetCollection<T>(collecionName, settings).DeleteOneAsync(filter);

        }

        public void DeleteAll<T>() where T : class, new()
        {

            _db.DropCollectionAsync(typeof(T).Name);

        }

        public async Task<IList<T>> Find<T>(Expression<Func<T, bool>> query) where T : class, new()
        {
            // Return the enumerable of the collection
            var collection = _db.GetCollection<T>(collecionName, settings).Find<T>(query);

            var output = await collection.ToListAsync().ConfigureAwait(false);
            return output;

        }
        public async Task<IList<T>> FindWithRange<T>(Expression<Func<T, bool>> query, SortDefinition<T> sort, int skip, int take) where T : class, new()
        {
            var collection = _db.GetCollection<T>(collecionName, settings).Find<T>(query).Sort(sort).Limit(take).Skip(skip);

            var output = await collection.ToListAsync().ConfigureAwait(false);
            return output;

        }


        public T Single<T>(System.Linq.Expressions.Expression<Func<T, bool>> expression)
     where T : class, new()
        {
            //return All<T>().Where(expression).SingleOrDefault();
            throw new NotImplementedException();
        }

        public IQueryable<T> All<T>() where T : class, new()
        {
            //return _db.GetCollection<T>(collecionName).FindAll<T>();
            throw new NotImplementedException();
        }
        public async Task<IList<T>> FindAll<T>() where T : class, new()
        {
            var collection = _db.GetCollection<T>(collecionName, settings).Find<T>(Builders<T>.Filter.Empty);
            var output = await collection.ToListAsync().ConfigureAwait(false);
            return output;
        }
        public IQueryable<T> All<T>(int page, int pageSize) where T : class, new()
        {
            //return PagingExtensions.Page(All<T>(), page, pageSize);
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task Add<T>(T item) where T : class, new()
        {
            var document = BsonDocument.Parse(JsonConvert.SerializeObject(item));

            var collection = _db.GetCollection<BsonDocument>(collecionName);
            return collection.InsertOneAsync(document);

        }
     

        public void Add<T>(IEnumerable<T> items) where T : class, new()
        {
            foreach (T item in items)
            {
                Add(item);
            }
        }

        public System.Threading.Tasks.Task Update<T>(UpdateDefinition<BsonDocument> document, FilterDefinition<BsonDocument> filter)
        {
            //var document = BsonDocument.Parse(new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(item));

            var collection = _db.GetCollection<BsonDocument>(collecionName);
            return collection.UpdateManyAsync(filter, document);

        }
        public Task Update<T>(UpdateDefinition<T> document, Expression<Func<T, bool>> filter) where T : class, new()
        {
            try
            {
                var collection = _db.GetCollection<T>(collecionName);
                return collection.UpdateManyAsync(filter, document);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public Task UpdateReplace<T>(T item, Expression<Func<T, bool>> filter) where T : class, new()
        {
            try
            {
                var collection = _db.GetCollection<T>(collecionName);
                return collection.ReplaceOneAsync(filter, item);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public System.Threading.Tasks.Task AddList<T>(IEnumerable<T> items) where T : class, new()
        {
            List<BsonDocument> lstbson = new List<BsonDocument>();
            foreach (var item in items)
            {
                BsonDocument document = BsonDocument.Parse(JsonConvert.SerializeObject(item));
                lstbson.Add(document);
            }
            var collection = _db.GetCollection<BsonDocument>(collecionName);
            return collection.InsertManyAsync(lstbson);

        }
        public void Dispose()
        {
            // _db.Dispose();
        }
    }
}
