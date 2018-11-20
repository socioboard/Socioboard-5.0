using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Enum
{


    public enum PayPalAccountStatus
    {
        [Description("User not selected Paypal")]
        notadded = 0,
        [Description("User selected Paypal, but still in progress")]
        inprogress = 1,
        [Description("User selected Paypal and added successfully")]
        added =2
    }

}
