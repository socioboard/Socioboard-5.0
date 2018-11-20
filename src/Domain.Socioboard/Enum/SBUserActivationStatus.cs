
using System.ComponentModel;

namespace Domain.Socioboard.Enum
{
    public enum SBUserActivationStatus
    {
        [Description("Account already active")]
        Active =0,

        [Description("Account not active,but has been sent")]
        MailSent =1,

        [Description("Account not active,and also hasn't been sent")]
        InActive =2,

        [Description("Account disable due to illlegal activity")]
        Disable =3
    }
}
