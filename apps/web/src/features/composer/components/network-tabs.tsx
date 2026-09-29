import type { NetworkId } from '@socioboard/contracts';
import { cn, NetworkIcon, networkName } from '@socioboard/ui';
import { Layers } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * "All networks" and a tab per selected network (docs/frontend/areas/composer.md). A dot marks
 * a network whose content differs from the shared content. Arrow keys move between tabs.
 */
export function NetworkTabs({
  networks,
  active,
  customised,
  onChange,
  panelId,
}: {
  networks: NetworkId[];
  active: NetworkId | null;
  customised: ReadonlySet<NetworkId>;
  onChange: (network: NetworkId | null) => void;
  panelId: string;
}) {
  const { t } = useTranslation('composer');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs: (NetworkId | null)[] = [null, ...networks];

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : index + step;
    if (step === 0 && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next = (to + tabs.length) % tabs.length;
    onChange(tabs[next] ?? null);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t('tabs.label')}
      className="flex gap-1 overflow-x-auto [scrollbar-width:none]"
    >
      {tabs.map((network, i) => {
        const selected = network === active;
        const custom = network !== null && customised.has(network);
        const name = network === null ? t('tabs.all') : networkName(network);
        return (
          <button
            key={network ?? 'all'}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${panelId}-tab-${network ?? 'all'}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              onChange(network);
            }}
            onKeyDown={(e) => {
              onKeyDown(e, i);
            }}
            className={cn(
              'rounded-control flex h-9 shrink-0 items-center gap-2 px-3 text-[13px] font-medium whitespace-nowrap outline-none',
              'focus-visible:ring-selected',
              selected ? 'bg-chip text-ink shadow-sm' : 'text-ink-3 hover:text-ink',
            )}
          >
            {network === null ? (
              <Layers className="size-4" aria-hidden="true" />
            ) : (
              <NetworkIcon network={network} size="xs" decorative />
            )}
            <span aria-hidden={custom || undefined}>{name}</span>
            {custom && (
              <>
                <span className="bg-ring size-1.5 rounded-full" aria-hidden="true" />
                <span className="sr-only">{t('tabs.custom', { network: name })}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
