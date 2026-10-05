import { Button, PageHeader, Spinner } from '@socioboard/ui';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Where the API serves Bull Board (read-only; docs/backend/modules/admin.md, "Mounting"). */
export const BULL_BOARD_URL = '/api/admin/queues';

/**
 * `/admin/queues`: Bull Board, read-only, inside the console. Retrying or cancelling a delivery
 * goes through Publishing (audited), never a raw job action.
 */
export function AdminQueuesPage() {
  const { t } = useTranslation('admin');
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('queues.title')}
        actions={
          <Button asChild size="sm" variant="ghost">
            <a href={BULL_BOARD_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              {t('queues.newTab')}
            </a>
          </Button>
        }
      />
      <p className="text-ink-2 border-hair border-b px-5 py-2.5 text-xs leading-relaxed">
        {t('queues.body')}
      </p>
      <div className="relative min-h-0 flex-1">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <Spinner className="size-6" />
          </div>
        )}
        <iframe
          title={t('queues.frame')}
          src={BULL_BOARD_URL}
          onLoad={() => {
            setLoaded(true);
          }}
          className="size-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
