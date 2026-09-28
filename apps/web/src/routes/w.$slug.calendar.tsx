// Placeholder until the calendar (phase 2) replaces it; it gives the shell a page to open on.
import { EmptyState, PageHeader } from '@socioboard/ui';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/w/$slug/calendar')({
  component: function Calendar() {
    const { t } = useTranslation('shell');
    return (
      <>
        <PageHeader title={t('calendar.title')} />
        <div className="grid flex-1 place-items-center p-6">
          <EmptyState
            icon={<CalendarDays />}
            title={t('calendar.emptyTitle')}
            description={t('calendar.emptyBody')}
          />
        </div>
      </>
    );
  },
});
