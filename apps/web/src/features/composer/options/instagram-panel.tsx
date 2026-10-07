import { InstagramFormat } from '@socioboard/contracts';
import { RadioCard, RadioGroup } from '@socioboard/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { OptionsPanelProps } from './types';

/** Instagram: feed (one file or a carousel), reel or story; one choice for all its accounts. */
export function InstagramPanel({ options, set }: OptionsPanelProps) {
  const { t } = useTranslation('composer');
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-ink text-[13px] font-medium">
        {t('instagram.format')}
      </span>
      <RadioGroup
        aria-labelledby={id}
        value={options.instagram?.format ?? 'feed'}
        onValueChange={(v) => {
          const format = InstagramFormat.parse(v);
          // Feed is the default: saying so adds nothing.
          set('instagram', { format: format === 'feed' ? undefined : format });
        }}
        className="grid gap-2 @xl:grid-cols-3"
      >
        {InstagramFormat.options.map((f) => (
          <RadioCard
            key={f}
            value={f}
            label={t(`instagram.${f}`)}
            description={t(`instagram.${f}Hint`)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
