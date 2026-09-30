// Placeholder until the calendar (phase 2) replaces it; it gives the shell a page to open on.
import { EmptyState, PageHeader } from '@socioboard/ui';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { GettingStarted } from '../features/onboarding';

export const Route = createFileRoute('/w/$slug/calendar')({
  component: function Calendar() {
    const { t } = useTranslation('shell');
    return (
      <>
        <PageHeader title={t('calendar.title')} />
        <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto p-6">
          <GettingStarted />
          <EmptyState
            className="my-auto"
            icon={<CalendarDays />}
            title={t('calendar.emptyTitle')}
            description={t('calendar.emptyBody')}
          />
        </div>
      </>
    );
  },
});
