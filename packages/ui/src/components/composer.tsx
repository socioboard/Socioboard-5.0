// Building blocks of the composer and posts screens (P1-F9): who a post goes to, how long it is,
// what's wrong with it, its media, and the frame network previews are drawn in.
import type { AccountStatus, NetworkId, ValidationIssue } from '@socioboard/contracts';
import {
  Check,
  CircleAlert,
  Film,
  Image as ImageIcon,
  ImageOff,
  Play,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { cn } from '../cn';
import { AnimatePresence, motion, springs } from '../motion';
import { Avatar } from './display';
import { NetworkIcon, networkName } from './network-icon';
import { Spinner } from './spinner';
import { Tooltip } from './tooltip';

// ---------------------------------------------------------------- AccountPicker

export interface PickerAccount {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  network: NetworkId;
  status: AccountStatus;
  /** The login it comes through ("via Priya"), for telling same-named Pages apart. */
  loginName?: string | null;
}

export interface AccountPickerProps {
  accounts: PickerAccount[];
  value: readonly string[];
  onChange: (ids: string[]) => void;
  /** Words shown to people; English by default. */
  labels?: {
    group?: string;
    /** Why an account can't be chosen, by status. */
    unavailable?: Partial<Record<AccountStatus, string>>;
  };
  className?: string;
}

const UNAVAILABLE: Partial<Record<AccountStatus, string>> = {
  reauth_required: 'Reconnect this account to post to it',
  paused: 'This account is paused',
  disconnected: 'This account is disconnected',
};

/**
 * Choose the accounts a post goes to: avatars grouped by network, each marked with its network.
 * Accounts that can't post (needs reconnecting, paused) are shown but can't be chosen, with the
 * reason on hover and focus (`aria-disabled`, not `disabled`: a disabled button gets neither, so
 * the reason would never show). Each avatar is a toggle button (`aria-pressed`).
 */
export function AccountPicker({
  accounts,
  value,
  onChange,
  labels,
  className,
}: AccountPickerProps) {
  const chosen = new Set(value);
  const byNetwork = new Map<NetworkId, PickerAccount[]>();
  for (const a of accounts) byNetwork.set(a.network, [...(byNetwork.get(a.network) ?? []), a]);
  const toggle = (id: string) => {
    onChange(chosen.has(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <div
      role="group"
      aria-label={labels?.group ?? 'Accounts'}
      className={cn('flex flex-wrap gap-x-5 gap-y-3', className)}
    >
      {[...byNetwork].map(([network, list]) => (
        <div key={network} className="flex items-center gap-2">
          <NetworkIcon network={network} size="sm" className="text-ink-3" />
          <div className="flex flex-wrap gap-1.5">
            {list.map((a) => {
              const reason =
                a.status === 'active'
                  ? null
                  : (labels?.unavailable?.[a.status] ?? UNAVAILABLE[a.status] ?? null);
              const on = chosen.has(a.id);
              // Chosen before it needed reconnecting: it can still be taken off the post.
              const blocked = Boolean(reason) && !on;
              const detail = [
                a.username ? `@${a.username}` : null,
                a.loginName ? `via ${a.loginName}` : null,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <Tooltip key={a.id} content={reason ?? (detail ? `${a.name} (${detail})` : a.name)}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${a.name}, ${networkName(a.network)}${reason ? `: ${reason}` : ''}`}
                    aria-disabled={blocked || undefined}
                    onClick={() => {
                      if (!blocked) toggle(a.id);
                    }}
                    className={cn(
                      'relative rounded-full p-0.5 outline-none',
                      'transition-[transform,opacity,box-shadow,filter] duration-200 ease-out-soft',
                      !blocked && 'active:scale-95',
                      'focus-visible:ring-selected motion-reduce:transition-none',
                      !blocked && 'hover:-translate-y-px',
                      on ? 'ring-selected' : 'opacity-70',
                      !on && !blocked && 'hover:opacity-100',
                      reason && 'cursor-not-allowed opacity-40 grayscale',
                    )}
                  >
                    <Avatar name={a.name} src={a.avatarUrl ?? null} size="lg" decorative />
                    <NetworkIcon
                      network={a.network}
                      variant="tile"
                      size="xs"
                      decorative
                      className="ring-canvas absolute -right-0.5 -bottom-0.5 ring-2"
                    />
                    {on && (
                      <span
                        aria-hidden="true"
                        className="bg-ring ring-canvas animate-scale-in absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-white ring-2"
                      >
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- CharacterCounter

export interface CharacterCounterProps {
  count: number;
  max: number;
  /** Which network's limit (read to screen readers: "… for Instagram"). */
  network?: NetworkId;
  className?: string;
}

/**
 * Characters used against one network's limit. Quiet while there's room; amber from 90 %; red
 * with how far over once past it. The full sentence is what screen readers hear (as hidden text:
 * an aria-label on a plain span is ignored by most of them).
 */
export function CharacterCounter({ count, max, network, className }: CharacterCounterProps) {
  const over = count - max;
  const state = over > 0 ? 'over' : count >= max * 0.9 ? 'near' : 'ok';
  const fmt = (n: number) => n.toLocaleString();
  const where = network ? ` for ${networkName(network)}` : '';
  const spoken =
    state === 'over'
      ? `${fmt(over)} characters over the ${fmt(max)} limit${where}`
      : `${fmt(count)} of ${fmt(max)} characters${where}`;
  return (
    <span
      title={spoken}
      data-state={state}
      className={cn(
        'inline-flex items-center gap-1 text-xs tabular-nums transition-colors duration-300',
        state === 'ok' && 'text-ink-3',
        state === 'near' && 'text-warning font-semibold',
        state === 'over' && 'text-danger font-semibold',
        className,
      )}
    >
      {network && <NetworkIcon network={network} size="xs" decorative />}
      <span aria-hidden="true">
        {state === 'over' ? `−${fmt(over)}` : `${fmt(count)}/${fmt(max)}`}
      </span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}

// ---------------------------------------------------------------- IssueList

export interface IssueItem {
  id: string;
  severity: ValidationIssue['severity'];
  message: ReactNode;
  /** The network the issue belongs to (none for issues with the post as a whole). */
  network?: NetworkId;
  /** Jumps to what needs fixing (the text box, a file). */
  onSelect?: () => void;
}

export interface IssueListProps {
  issues: IssueItem[];
  /** Words shown to people; English by default. */
  labels?: { title?: (errors: number, warnings: number) => string; ready?: string };
  className?: string;
}

const defaultTitle = (errors: number, warnings: number) =>
  [
    errors ? `${String(errors)} ${errors === 1 ? 'problem' : 'problems'} to fix` : null,
    warnings ? `${String(warnings)} ${warnings === 1 ? 'note' : 'notes'}` : null,
  ]
    .filter(Boolean)
    .join(', ');

/**
 * What stands between the post and publishing: errors (they block that network) before warnings
 * (they don't), each with its network. With nothing to report it says so, once.
 */
export function IssueList({ issues, labels, className }: IssueListProps) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const headingId = useId();
  if (issues.length === 0) {
    return labels?.ready === undefined ? null : (
      <p className={cn('text-success animate-enter flex items-center gap-2 text-sm', className)}>
        <Check className="animate-scale-in size-4" aria-hidden="true" />
        {labels.ready}
      </p>
    );
  }
  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col gap-2', className)}>
      <h3 id={headingId} className="text-ink-2 text-xs font-semibold">
        {(labels?.title ?? defaultTitle)(errors.length, warnings.length)}
      </h3>
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {[...errors, ...warnings].map((issue) => {
            const Icon = issue.severity === 'error' ? CircleAlert : TriangleAlert;
            const body = (
              <>
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    issue.severity === 'error' ? 'text-danger' : 'text-warning',
                  )}
                />
                {issue.network && (
                  <NetworkIcon network={issue.network} size="xs" className="mt-0.5" />
                )}
                <span className="text-ink text-left text-[13px] leading-snug">{issue.message}</span>
              </>
            );
            return (
              <motion.li
                key={issue.id}
                layout="position"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', transition: springs.gentle }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.16 } }}
                className="overflow-hidden"
              >
                {issue.onSelect ? (
                  <button
                    type="button"
                    onClick={issue.onSelect}
                    className="hover:bg-chip focus-visible:ring-selected flex w-full items-start gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 outline-none"
                  >
                    {body}
                  </button>
                ) : (
                  <div className="flex items-start gap-2 px-2 py-1.5">{body}</div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------- MediaThumb

export interface MediaThumbProps {
  /** Thumbnail URL; null while there's none yet (processing) or when it can't be shown. */
  src: string | null;
  /** The file's alt text, else its name. */
  alt: string;
  kind: 'image' | 'video' | 'gif';
  durationSec?: number | null;
  status?: 'uploading' | 'processing' | 'ready' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  /** Shows a remove button (composer media strip). */
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

const thumbSizes = { sm: 'size-12', md: 'size-20', lg: 'size-28' } as const;

function duration(sec: number): string {
  const s = Math.round(sec);
  return `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, '0')}`;
}

/** A file as a small square: its picture, what kind it is, and whether it's ready. */
export function MediaThumb({
  src,
  alt,
  kind,
  durationSec,
  status = 'ready',
  size = 'md',
  onRemove,
  removeLabel = 'Remove',
  className,
}: MediaThumbProps) {
  const busy = status === 'uploading' || status === 'processing';
  // A picture that doesn't load (expired link, file gone) falls back to the placeholder instead
  // of the browser's broken-image box.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const showImage = src !== null && src !== brokenSrc && status !== 'failed';
  return (
    <div
      className={cn(
        'group glass-chip animate-scale-in relative shrink-0 overflow-hidden rounded-[14px]',
        thumbSizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'size-full object-cover transition-[opacity,filter,scale] duration-500 ease-out-soft motion-reduce:transition-none',
            loadedSrc === src ? 'opacity-100' : 'scale-105 opacity-0 blur-sm',
          )}
          loading="lazy"
          // A cached picture may be complete before React listens for load.
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setLoadedSrc(src);
          }}
          onLoad={() => {
            setLoadedSrc(src);
          }}
          onError={() => {
            setBrokenSrc(src);
          }}
        />
      ) : (
        <div
          className="text-ink-3 flex size-full items-center justify-center"
          role="img"
          aria-label={alt}
        >
          {status === 'failed' ? (
            <ImageOff className="text-danger size-5" aria-hidden="true" />
          ) : busy ? null : kind === 'video' ? (
            <Film className="size-5" aria-hidden="true" />
          ) : (
            <ImageIcon className="size-5" aria-hidden="true" />
          )}
        </div>
      )}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Spinner
            className="text-white"
            label={status === 'uploading' ? 'Uploading' : 'Processing'}
          />
        </div>
      )}
      {kind !== 'image' && status === 'ready' && (
        <span className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded-md bg-black/60 px-1 py-0.5 text-[10px] font-semibold text-white tabular-nums">
          {kind === 'video' ? (
            <>
              <Play className="size-2.5 fill-current" aria-hidden="true" />
              {durationSec ? duration(durationSec) : null}
            </>
          ) : (
            'GIF'
          )}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel}: ${alt}`}
          className={cn(
            'absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white outline-none',
            'focus-visible:ring-selected opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- PreviewFrame

export interface PreviewFrameProps {
  network: NetworkId;
  account: { name: string; username?: string | null; avatarUrl?: string | null };
  /** Under the name, as the network shows it ("Just now", "Sponsored"…). */
  meta?: ReactNode;
  /** Media above the caption (Instagram) instead of below the text (Facebook). */
  mediaFirst?: boolean;
  media?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** The label read to screen readers; defaults to "Preview on <network>". */
  label?: string;
  className?: string;
}

/**
 * The frame every network preview is drawn in (P1-F3): a post-sized card with the account's
 * header. Previews use the network's own light or dark look through `--sb-preview-*` tokens,
 * not the app's glass, so they read like the real thing.
 */
export function PreviewFrame({
  network,
  account,
  meta,
  mediaFirst = false,
  media,
  children,
  footer,
  label,
  className,
}: PreviewFrameProps) {
  return (
    <figure
      aria-label={label ?? `Preview on ${networkName(network)}`}
      className={cn(
        'w-full max-w-[420px] overflow-hidden rounded-[14px] border',
        'border-[var(--sb-preview-line)] bg-[var(--sb-preview-bg)] text-[var(--sb-preview-ink)] shadow-sm',
        className,
      )}
    >
      <header className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
        <Avatar name={account.name} src={account.avatarUrl ?? null} size="md" decorative />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold">
            {account.username ?? account.name}
          </span>
          {meta && <span className="truncate text-xs text-[var(--sb-preview-ink-2)]">{meta}</span>}
        </div>
        <NetworkIcon network={network} size="sm" />
      </header>
      {mediaFirst && media}
      {children && (
        <div
          className={cn(
            'px-3.5 pb-3 text-[14px] leading-snug break-words whitespace-pre-wrap',
            // Under the media (Instagram), the caption needs air above it too.
            mediaFirst && 'pt-2.5',
          )}
        >
          {children}
        </div>
      )}
      {!mediaFirst && media}
      {footer && (
        <footer className="border-t border-[var(--sb-preview-line)] px-3.5 py-2">{footer}</footer>
      )}
    </figure>
  );
}
