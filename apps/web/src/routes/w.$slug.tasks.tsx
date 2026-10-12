import { createFileRoute } from '@tanstack/react-router';

import { TasksPage, type TasksSearch } from '../features/tasks';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/tasks')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): TasksSearch => ({
    view: search.view === 'all' ? 'all' : undefined,
    show: search.show === 'done' ? 'done' : undefined,
    task: stringParam(search.task, 64),
  }),
  component: function Tasks() {
    const navigate = Route.useNavigate();
    return (
      <TasksPage
        search={Route.useSearch()}
        onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })}
      />
    );
  },
});
