import { Id, TargetStatus } from '@socioboard/contracts';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarPage, calendarDate, type CalendarSearch } from '../features/calendar';

const idParam = (value: unknown) => {
  const id = Id.safeParse(value);
  return id.success ? id.data : undefined;
};

export const Route = createFileRoute('/w/$slug/calendar')({
  validateSearch: (search): CalendarSearch => {
    const status = TargetStatus.safeParse(search.status);
    return {
      view: search.view === 'week' || search.view === 'month' ? search.view : undefined,
      date: calendarDate(search.date),
      account: idParam(search.account),
      status: status.success ? status.data : undefined,
      label: idParam(search.label),
      separate: search.separate === true || search.separate === 'true' ? true : undefined,
    };
  },
  component: function Calendar() {
    const navigate = Route.useNavigate();
    const { slug } = Route.useParams();
    return (
      <CalendarPage
        key={slug}
        search={Route.useSearch()}
        onSearchChange={(patch) =>
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
        }
      />
    );
  },
});
