using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Socioboard.Instagram.Authentication
{
    public interface ICache
    {
        void Add(string key, object obj);
        void Add(string key, object obj, int timeout);
        void Remove(string key);
        object Get(string key);
        T Get<T>(string key);
        bool Exists(string key);
    }
}
