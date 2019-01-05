using Newtonsoft.Json;
using StackExchange.Redis;
using System;

namespace Api.Socioboard.Helper
{
    /// <summary>
    /// 
    /// </summary>
    public class Cache
    {
        private readonly ConnectionMultiplexer _redisConnections;
        private static Cache _instance;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="configuration"></param>
        /// <returns></returns>
        public static Cache GetCacheInstance(string configuration)
        {
            return _instance ?? (_instance = new Cache(configuration));
        }

        private Cache(string configuration)
        {
            try
            {
                if (_redisConnections == null)
                {
                    var configurationOptions = new ConfigurationOptions
                    {
                        EndPoints = { configuration },
                        AbortOnConnectFail = false,
                        Ssl = false,
                        ConnectTimeout = 1000,
                        SyncTimeout = 3000
                    };

                    _redisConnections = ConnectionMultiplexer.Connect(configurationOptions);
                }
            }
            catch
            {
                //todo : codes to handle exceptions
            }
        }


        /// <summary>
        /// To set the value with specified key from redis database
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="objectToCache">object to cache</param>
        /// <typeparam name="T">any class</typeparam>
        public void Set<T>(string key, T objectToCache) where T : class
        {
            try
            {
                var db = _redisConnections.GetDatabase();

                var value = JsonConvert.SerializeObject(objectToCache, Formatting.Indented, new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                    PreserveReferencesHandling = PreserveReferencesHandling.Objects
                });

                db.StringSet(key, value);
            }
            catch (Exception ex)
            {
                //todo : codes to handle exceptions
            }

        }



        /// <summary>
        /// To Fetch the value from redis database
        /// </summary>
        /// <param name="key">key to fetch the details</param>
        /// <typeparam name="T">any class</typeparam>
        /// <returns>return the object which matches the key in redis database,otherwise null</returns>
        public T Get<T>(string key) where T : class
        {
            try
            {
                var db = _redisConnections.GetDatabase();
                var redisObject = db.StringGet(key);

                if (redisObject.HasValue)
                {
                    return JsonConvert.DeserializeObject<T>(redisObject
                            , new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                                PreserveReferencesHandling = PreserveReferencesHandling.Objects
                            });
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }


        /// <summary>
        /// To Delete the key from redis cache
        /// </summary>
        /// <param name="key"></param>
        public void Delete(string key)
        {
            try
            {
                var db = _redisConnections.GetDatabase();
                db.KeyDelete(key);
            }
            catch
            {
                //todo : codes to handle exceptions
            }
        }

    }
}
