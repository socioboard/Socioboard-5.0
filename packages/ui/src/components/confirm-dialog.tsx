import { useId, useState, type ReactNode } from 'react';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Input, Label } from './form';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** What happens, in plain words, including what can't be undone. */
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /** `danger` for removing or deleting things. */
  tone?: 'default' | 'danger';
  /**
   * Runs on confirm. The dialog shows progress and stays open until it resolves; if it throws, the
   * dialog stays open and shows `errorMessage(error)`.
   */
  onConfirm: () => Promise<void> | void;
  errorMessage?: (error: unknown) => ReactNode;
  /** Ask the person to type this (e.g. the workspace name) before the confirm button works. */
  typeToConfirm?: { value: string; label: ReactNode };
  /** Extra content between the description and the buttons (a select, a warning). */
  children?: ReactNode;
  closeLabel?: string;
}

/** "Are you sure?" for actions that remove, revoke or can't be undone. */
export function ConfirmDialog({ open, onOpenChange, closeLabel, ...body }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...(closeLabel ? { closeLabel } : {})}>
        {/* Mounted only while open, so typed text and errors start fresh each time. */}
        <ConfirmBody
          {...body}
          close={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function ConfirmBody({
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'default',
  onConfirm,
  errorMessage,
  typeToConfirm,
  children,
  close,
}: Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'closeLabel'> & { close: () => void }) {
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReactNode>();
  const matches = !typeToConfirm || typed.trim() === typeToConfirm.value;

  const confirm = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await onConfirm();
      close();
    } catch (err) {
      setError(errorMessage ? errorMessage(err) : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (matches && !busy) void confirm();
      }}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
      {typeToConfirm && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={inputId}>{typeToConfirm.label}</Label>
          <Input
            id={inputId}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="bg-danger-tint text-danger rounded-control px-3 py-2.5 text-sm">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button onClick={close} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant={tone === 'danger' ? 'danger' : 'primary'}
          loading={busy}
          disabled={!matches}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
