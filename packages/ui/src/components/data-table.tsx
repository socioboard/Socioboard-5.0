import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

import { cn } from '../cn';
import { Button } from './button';
import { Skeleton } from './display';

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** The server can sort by this column. */
  sortable?: boolean;
  /** Tailwind width/alignment classes for the column's cells, e.g. 'w-40 text-right'. */
  className?: string;
}

export interface SortState {
  id: string;
  desc: boolean;
}

export interface DataTableLabels {
  loadMore: string;
  retry: string;
  loading: string;
}

export interface DataTableProps<T> {
  /** Accessible name of the table. */
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Sorting happens on the server: the table only reports what was asked for. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  onRowClick?: (row: T) => void;
  /** First load: skeleton rows instead of content. */
  loading?: boolean;
  /** Shown instead of rows when loading failed. */
  error?: ReactNode;
  onRetry?: () => void;
  /** Shown when there are no rows (usually an EmptyState). */
  empty?: ReactNode;
  /** Cursor pagination: more rows exist on the server. */
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  labels?: Partial<DataTableLabels>;
  className?: string;
}

/** Rows stagger in groups of this many, so rows added by "Load more" arrive quickly too. */
const PAGE_STAGGER = 25;

const defaultLabels: DataTableLabels = {
  loadMore: 'Load more',
  retry: 'Try again',
  loading: 'Loading',
};

/**
 * A list view for server data: sortable headers, keyboard-reachable rows, and the four states
 * every view handles (loading, empty, error, content), plus "Load more" for cursor pages.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  onRowClick,
  loading = false,
  error,
  onRetry,
  empty,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  labels,
  className,
}: DataTableProps<T>) {
  const text = { ...defaultLabels, ...labels };
  const showEmpty = !loading && !error && rows.length === 0;

  const toggleSort = (id: string) => {
    onSortChange?.({ id, desc: sort?.id === id ? !sort.desc : false });
  };
  const onRowKey = (event: KeyboardEvent, row: T) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div className={cn('flex min-w-0 flex-col overflow-x-auto', className)}>
      <table
        className="w-full table-fixed border-collapse text-sm"
        aria-busy={loading || undefined}
      >
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-hair border-b">
            {columns.map((col) => {
              const active = sort?.id === col.id;
              const ariaSort = active ? (sort.desc ? 'descending' : 'ascending') : 'none';
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={col.sortable ? ariaSort : undefined}
                  className={cn(
                    'text-ink-3 h-10 px-3 text-left text-xs font-semibold',
                    col.className,
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => {
                        toggleSort(col.id);
                      }}
                      className={cn(
                        'hover:text-ink -mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1',
                        active && 'text-ink',
                      )}
                    >
                      {col.header}
                      {active ? (
                        sort.desc ? (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }, (_, i) => (
              <tr key={`skeleton-${String(i)}`} className="border-hair border-b">
                {columns.map((col) => (
                  <td key={col.id} className={cn('h-12 px-3', col.className)}>
                    <Skeleton className="h-3.5 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading &&
            !error &&
            rows.map((row, index) => (
              <tr
                key={getRowId(row)}
                // Rows rise in one after another as they arrive (a page, or "Load more").
                style={{ '--i': index % PAGE_STAGGER } as CSSProperties}
                className={cn(
                  'border-hair animate-enter border-b transition-colors duration-200 last:border-b-0',
                  onRowClick && 'hover:bg-chip focus-visible:bg-chip cursor-pointer',
                )}
                {...(onRowClick
                  ? {
                      tabIndex: 0,
                      onClick: () => {
                        onRowClick(row);
                      },
                      onKeyDown: (e: KeyboardEvent) => {
                        onRowKey(e, row);
                      },
                    }
                  : {})}
              >
                {columns.map((col) => (
                  <td key={col.id} className={cn('text-ink h-12 px-3', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {loading && <span className="sr-only">{text.loading}</span>}
      {error && !loading && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm"
        >
          <p className="text-ink-2 max-w-sm leading-relaxed">{error}</p>
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              {text.retry}
            </Button>
          )}
        </div>
      )}
      {showEmpty && empty}
      {hasMore && !loading && !error && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button size="sm" variant="ghost" loading={loadingMore} onClick={onLoadMore}>
            {text.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
