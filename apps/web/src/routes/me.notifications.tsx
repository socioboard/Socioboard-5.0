import { NotificationType } from '@socioboard/contracts';
import { createFileRoute } from '@tanstack/react-router';

import { NotificationsPage, type NotificationsSearch } from '../features/notifications';
import { AccountPage } from '../features/profile';

export const Route = createFileRoute('/me/notifications')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): NotificationsSearch => {
    const type = NotificationType.safeParse(search.type);
    return {
      unread: search.unread === true || search.unread === 'true' ? true : undefined,
      type: type.success && type.data !== 'digest' ? type.data : undefined,
    };
  },
  component: function Notifications() {
    const navigate = Route.useNavigate();
    return (
      <AccountPage>
        <NotificationsPage
          search={Route.useSearch()}
          onSearchChange={(patch) =>
            void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
          }
        />
      </AccountPage>
    );
  },
});
