import { cn } from '../cn';

export interface SpinnerProps {
  className?: string;
  /** Announced to screen readers; omit when the surrounding control already says it is busy. */
  label?: string;
}

/** A progress indicator; it keeps turning under reduced motion because it shows work in progress. */
export function Spinner({ className, label }: SpinnerProps) {
  return (
    <svg
      className={cn('size-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
