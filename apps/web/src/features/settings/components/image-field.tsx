import { Avatar, Button } from '@socioboard/ui';
import { ImageUp } from 'lucide-react';
import { useRef, useState } from 'react';

import { errorMessage } from '../../../lib/i18n';
import { IMAGE_ACCEPT } from '../../../lib/upload';
import { FormError } from '../../auth';

/**
 * A round image with Upload/Replace and Remove, for the workspace logo and the profile photo.
 * `onUpload` does the whole upload-then-save; errors show under the buttons.
 */
export function ImageField({
  name,
  src,
  hint,
  labels,
  onUpload,
  onRemove,
}: {
  /** Whose image: used for the initials and the alt text. */
  name: string;
  src: string | null;
  hint: string;
  labels: { upload: string; replace: string; remove: string };
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [error, setError] = useState<string>();

  const run = async (kind: 'upload' | 'remove', action: () => Promise<void>) => {
    setBusy(kind);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={src} size="xl" />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            loading={busy === 'upload'}
            disabled={busy !== null}
            onClick={() => input.current?.click()}
          >
            <ImageUp aria-hidden="true" />
            {src ? labels.replace : labels.upload}
          </Button>
          {src && (
            <Button
              size="sm"
              variant="ghost"
              loading={busy === 'remove'}
              disabled={busy !== null}
              onClick={() => {
                void run('remove', onRemove);
              }}
            >
              {labels.remove}
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // picking the same file again should upload again
            if (file) void run('upload', () => onUpload(file));
          }}
        />
      </div>
      <p className="text-ink-3 text-xs">{hint}</p>
      <FormError>{error}</FormError>
    </div>
  );
}
