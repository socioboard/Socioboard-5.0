import { YouTubePrivacy } from '@socioboard/contracts';
import { CharacterCounter, Input, Label, RadioCard, RadioGroup, Switch } from '@socioboard/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { OptionsPanelProps } from './types';

const MAX_TITLE_CHARS = 100;

/** YouTube (P3-B3): title, privacy, tags and made-for-kids setting. */
export function YouTubePanel({ accounts, options, set }: OptionsPanelProps) {
  const { t } = useTranslation('composer');
  const titleId = useId();
  const privacyId = useId();
  const tagsId = useId();
  const kidsId = useId();

  const current = options.youtube ?? {};
  const title = current.title ?? '';
  const tagsStr = (current.tags ?? []).join(', ');
  const madeForKids = current.madeForKids ?? false;
  const privacy = current.privacy ?? 'private';

  // Offered privacy levels from the first connected YouTube channel's choices
  const firstChoice = accounts[0]?.choices;
  const allowedPrivacy =
    firstChoice?.network === 'youtube' ? firstChoice.privacyLevels : YouTubePrivacy.options;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Video Title */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={titleId} className="text-ink text-[13px] font-medium">
            {t('youtube.title')}
          </Label>
          <CharacterCounter count={title.length} max={MAX_TITLE_CHARS} network="youtube" />
        </div>
        <Input
          id={titleId}
          value={title}
          maxLength={MAX_TITLE_CHARS}
          placeholder={t('youtube.titlePlaceholder')}
          onChange={(e) => {
            set('youtube', { title: e.target.value });
          }}
        />
      </div>

      {/* 2. Privacy Level */}
      <div className="flex flex-col gap-2">
        <span id={privacyId} className="text-ink text-[13px] font-medium">
          {t('youtube.privacy')}
        </span>
        <RadioGroup
          aria-labelledby={privacyId}
          value={privacy}
          onValueChange={(v) => {
            const parsed = YouTubePrivacy.parse(v);
            set('youtube', { privacy: parsed });
          }}
          className="grid gap-2 @xl:grid-cols-3"
        >
          {allowedPrivacy.map((p) => (
            <RadioCard
              key={p}
              value={p}
              label={t(`youtube.${p}`)}
              description={t(`youtube.${p}Hint`)}
            />
          ))}
        </RadioGroup>
      </div>

      {/* 3. Tags */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={tagsId} className="text-ink text-[13px] font-medium">
          {t('youtube.tags')}
        </Label>
        <Input
          id={tagsId}
          value={tagsStr}
          placeholder={t('youtube.tagsPlaceholder')}
          onChange={(e) => {
            const parsed = e.target.value
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
            set('youtube', { tags: parsed });
          }}
        />
        <p className="text-ink-3 text-xs leading-relaxed">{t('youtube.tagsHint')}</p>
      </div>

      {/* 4. Made for Kids (COPPA) */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--sb-line)] p-3">
        <div className="flex flex-col gap-0.5">
          <label htmlFor={kidsId} className="text-ink text-[13px] font-medium cursor-pointer">
            {t('youtube.madeForKids')}
          </label>
          <span className="text-ink-3 text-xs">{t('youtube.madeForKidsHint')}</span>
        </div>
        <Switch
          id={kidsId}
          checked={madeForKids}
          onCheckedChange={(checked) => {
            set('youtube', { madeForKids: checked });
          }}
        />
      </div>
    </div>
  );
}
