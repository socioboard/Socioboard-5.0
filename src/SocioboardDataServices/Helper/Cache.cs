using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.Helper
{
    public class Cache
    {
        private readonly ConnectionMultiplexer redisConnections;

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
                if (redisConnections == null)
                {
                    var configurationOptions = new ConfigurationOptions
                    {
                        EndPoints = { configuration },
                        AbortOnConnectFail = false
                    };

                    redisConnections = ConnectionMultiplexer.Connect(configurationOptions);
                }
            }
            catch
            {
                //todo : codes to handle exceptions
            }
        }
        public void Set<T>(string key, T objectToCache) where T : class
        {
            try
            {
                var db = this.redisConnections.GetDatabase();
                db.StringSet(key, JsonConvert.SerializeObject(objectToCache
                            , Formatting.Indented
                            , new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                                PreserveReferencesHandling = PreserveReferencesHandling.Objects
                            }));
            }
            catch
            {
                //todo : codes to handle exceptions
            }

        }



        public T Get<T>(string key) where T : class
        {
            try
            {
                var db = this.redisConnections.GetDatabase();
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
                else
                {
                    return (T)null;
                }
            }
            catch (Exception ex)
            {
                //todo : codes to handle exceptions
                return (T)null;
            }
        }
        public void Delete(string key)
        {
            try
            {
                var db = this.redisConnections.GetDatabase();
                db.KeyDelete(key);
            }
            catch
            {
                //todo : codes to handle exceptions
            }
        }

    }
}
