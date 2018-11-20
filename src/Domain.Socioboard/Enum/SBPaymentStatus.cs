
using System.ComponentModel;

namespace Domain.Socioboard.Enum
{
    public enum SBPaymentStatus
    {
        [Description("Paid version")]
        Paid = 0,

        [Description("Unpaid version")]
        UnPaid = 1
    }
}
