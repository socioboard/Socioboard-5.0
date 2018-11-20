using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Enum
{
    public enum AdsOfferAccountStatus
    {     
        [Description("Client enables always free options")]
        Active = 1,

        [Description("Client disable always free options")]
        InActive = 0,
    }
}
