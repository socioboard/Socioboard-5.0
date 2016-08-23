using Microsoft.AspNetCore.Hosting;
using System;
using System.Reflection;

namespace Api.Socioboard.Helper
{
    public class SessionFactory
    {
        public static NHibernate.ISessionFactory sFactory;
        /// <summary>
        /// initializes the session for database
        /// </summary>
        /// 
        //  private static ILog logger = LogManager.GetLogger(typeof(SessionFactory));

        public static string configfilepath { get; set; }

        public static void Init(IHostingEnvironment env)
        {
          
            try
            {
                NHibernate.Cfg.Configuration config = new NHibernate.Cfg.Configuration();
                string path = string.Empty;
                if (string.IsNullOrEmpty(configfilepath))
                {
                  //  var appEnv = CallContextServiceLocator.Locator.ServiceProvider.GetService(typeof(IHostingEnvironment)) as IHostingEnvironment;
                    path = System.IO.Path.Combine(env.ContentRootPath, "hibernate.cfg.xml");
                    //path = @"D:\Suresh\BickBucket\src\Api.Socioboard\hibernate.cfg.xml";
                }
                else
                {
                    path = configfilepath;
                }
                config.Configure(path);
                config.AddAssembly(Assembly.GetExecutingAssembly());//adds all the embedded resources .hbm.xml
                sFactory = config.BuildSessionFactory();
            }
            catch (Exception ex)
            {
                throw ex;
                //Console.Write(ex.StackTrace);
                //logger.Error(ex.Message);
            }
        }



        /// <summary>
        /// checks wheteher the session already exists. if not then creates it
        /// </summary>
        /// <returns></returns>
        public static NHibernate.ISessionFactory GetSessionFactory(IHostingEnvironment env)
        {
            if (sFactory == null)
            {
                Init(env);
            }
            return sFactory;

        }

        /// <summary>
        /// creates a database connection and opens up a session
        /// </summary>
        /// <returns></returns>
        public static NHibernate.ISession GetNewSession(IHostingEnvironment env)
        {
            return GetSessionFactory(env).OpenSession();
        }



    }
}
