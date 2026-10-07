import { ThreadsReplyControl } from '@socioboard/contracts';
import { RadioCard, RadioGroup } from '@socioboard/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { OptionsPanelProps } from './types';

/** Threads (P3-B10): who can reply to the post; one choice for all its accounts. */
export function ThreadsPanel({ options, set }: OptionsPanelProps) {
  const { t } = useTranslation('composer');
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-ink text-[13px] font-medium">
        {t('threads.replyControl')}
      </span>
      <RadioGroup
        aria-labelledby={id}
        value={options.threads?.replyControl ?? 'everyone'}
        onValueChange={(v) => {
          const replyControl = ThreadsReplyControl.parse(v);
          // Anyone is Threads' default: saying so adds nothing.
          set('threads', { replyControl: replyControl === 'everyone' ? undefined : replyControl });
        }}
        className="grid gap-2 @xl:grid-cols-2"
      >
        {ThreadsReplyControl.options.map((c) => (
          <RadioCard
            key={c}
            value={c}
            label={t(`threads.${c}`)}
            description={t(`threads.${c}Hint`)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
