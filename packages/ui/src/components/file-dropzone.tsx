import { Upload } from 'lucide-react';
import { useRef, useState, type DragEvent, type ReactNode } from 'react';

import { cn } from '../cn';

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  /** Text on the overlay while files are dragged over. */
  label: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

/**
 * Makes an area accept dropped files: while files are dragged over it, a glass overlay says what
 * dropping does. Pair it with a visible "Upload" button that opens the file dialog; dragging is
 * never the only way in.
 */
export function FileDropzone({
  onFiles,
  label,
  disabled = false,
  className,
  children,
}: FileDropzoneProps) {
  const [over, setOver] = useState(false);
  // Enter/leave fire for every child element crossed; count them to know when the drag leaves.
  const depth = useRef(0);

  const reset = () => {
    depth.current = 0;
    setOver(false);
  };

  return (
    <div
      className={cn('relative', className)}
      onDragEnter={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault(); // allows the drop
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        if (disabled) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        reset();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFiles(files);
      }}
    >
      {children}
      {over && (
        <div
          aria-hidden="true"
          className="border-ring bg-canvas/60 pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed backdrop-blur-sm"
        >
          <span className="glass-chip text-ring flex size-12 items-center justify-center rounded-full">
            <Upload className="size-5" />
          </span>
          <span className="text-ink text-sm font-semibold">{label}</span>
        </div>
      )}
    </div>
  );
}
