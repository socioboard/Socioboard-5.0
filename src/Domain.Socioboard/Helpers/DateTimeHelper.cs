using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public class ScheduleDays
    {
        public ScheduleDays()
        {
            
        }

        public List<string> SelectedDays { get; set; } = new List<string>();
    }

    public class DateTimeHelper
    {
        public static DateTime GetNextScheduleDate(DayOfWeek requiredDay, DateTime startDate)
        {
            for (int countIndex = 0; countIndex < 7; countIndex++)
            {
                var currentDate = startDate.AddDays(countIndex);
                if (currentDate.DayOfWeek == requiredDay)
                    return currentDate;
            }
            return startDate;
        }

        public static DateTime GetNextScheduleDate(List<string> selectedDays,DateTime startDate)
        {

            for (int countIndex = 0; countIndex < 7; countIndex++)
            {
                var currentDate = startDate.AddDays(countIndex);
                if (selectedDays.Contains(currentDate.DayOfWeek.ToString()))
                    return currentDate;
            }
            return startDate;
        }
    }
}
