import { IssueList, Spinner, type IssueItem } from '@socioboard/ui';
import { CloudOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Validation } from '../use-validation';
import type { ComposerIssue } from '../validation';

/**
 * What stands between the post and publishing (docs/frontend/areas/composer.md, "Validation"):
 * errors block the network they're about; warnings don't. Each issue jumps to what needs fixing.
 */
export function IssuesPanel({
  validation,
  wording,
  onSelect,
}: {
  validation: Validation;
  wording: (issue: ComposerIssue) => string;
  onSelect: (issue: ComposerIssue) => void;
}) {
  const { t } = useTranslation('composer');
  const items: IssueItem[] = validation.issues.map((issue) => ({
    id: issue.key,
    severity: issue.severity,
    message: wording(issue),
    ...(issue.network ? { network: issue.network } : {}),
    onSelect: () => {
      onSelect(issue);
    },
  }));
  return (
    <section
      aria-label={t('issues.title')}
      className="glass-chip rounded-pane flex flex-col gap-2 p-4 sm:p-5"
    >
      <IssueList
        issues={items}
        labels={{
          title: (errors, warnings) =>
            [
              errors ? t('issues.summaryErrors', { count: errors }) : null,
              warnings ? t('issues.summaryWarnings', { count: warnings }) : null,
            ]
              .filter(Boolean)
              .join(', '),
          ready: t('issues.ready'),
        }}
      />
      {/* Announced politely: people hear when the check finishes, not every keystroke. */}
      <p className="text-ink-3 flex min-h-4 items-center gap-1.5 text-xs" aria-live="polite">
        {validation.checking ? (
          <>
            <Spinner className="size-3" />
            {t('issues.checking')}
          </>
        ) : validation.unavailable ? (
          <>
            <CloudOff className="size-3.5" aria-hidden="true" />
            {t('issues.unavailable')}
          </>
        ) : null}
      </p>
    </section>
  );
}
