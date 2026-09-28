import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

import { useTheme } from '../theme';

export { toast };

/**
 * Render once near the root. Short confirmations and errors: toast.success('Post scheduled'),
 * toast.error(message). Toasts are announced politely to screen readers.
 */
export function Toaster(props: ToasterProps) {
  const { resolved } = useTheme();
  return (
    <Sonner
      theme={resolved}
      position="bottom-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'glass rounded-[14px] flex w-(--width) items-start gap-3 p-4 text-sm text-ink data-[type=error]:[&_[data-icon]]:text-danger data-[type=success]:[&_[data-icon]]:text-success data-[type=warning]:[&_[data-icon]]:text-warning',
          title: 'font-semibold',
          description: 'text-ink-2 mt-0.5 leading-relaxed',
          icon: 'mt-0.5 shrink-0',
          actionButton:
            'accent-lit ml-auto h-8 shrink-0 cursor-pointer rounded-lg px-3 text-[13px] font-semibold',
          cancelButton:
            'glass-chip ml-auto h-8 shrink-0 cursor-pointer rounded-lg px-3 text-[13px] font-semibold text-ink',
          closeButton: 'glass-chip text-ink-2',
        },
      }}
      {...props}
    />
  );
}
