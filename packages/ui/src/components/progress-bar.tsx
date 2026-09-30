import { cn } from '../cn';

export interface ProgressBarProps {
  /** 0–100; omit for "working, amount unknown". */
  value?: number;
  /** Accessible name, e.g. "Uploading harvest-reel.mp4". */
  label: string;
  tone?: 'default' | 'danger';
  className?: string;
}

/** A thin progress bar (uploads, jobs). Announced as a progressbar with its value. */
export function ProgressBar({ value, label, tone = 'default', className }: ProgressBarProps) {
  const known = value !== undefined;
  const clamped = known ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      {...(known ? { 'aria-valuenow': Math.round(clamped) } : {})}
      className={cn('bg-hair relative h-1 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500 ease-out-soft motion-reduce:transition-none',
          tone === 'danger' ? 'bg-danger' : 'bg-ring',
          !known && 'animate-indeterminate w-1/3',
        )}
        style={known ? { width: `${String(clamped)}%` } : undefined}
      />
    </div>
  );
}
