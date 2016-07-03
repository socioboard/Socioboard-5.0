using System;

namespace Socioboard.Instagram.App.Core
{
    [Serializable]
    public class InstagramResponse<T> {
        public Pagination pagination;
        public Metadata meta;
        public T data;
    }
}
