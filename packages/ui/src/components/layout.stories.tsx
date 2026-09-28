import type { Story, StoryDefault } from '@ladle/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Pane } from '../stories/frame';
import { Button } from './button';
import { DataTable, type Column, type SortState } from './data-table';
import { Avatar, Badge } from './display';
import { NavTabs } from './nav-tabs';
import { Kbd, PageHeader } from './page';

export default { title: 'Layout and data' } satisfies StoryDefault;

export const HeaderAndTabs: Story = () => (
  <Pane className="gap-0 p-0">
    <PageHeader
      title="Settings"
      actions={
        <Button variant="primary" size="sm">
          <Plus aria-hidden="true" />
          New post <Kbd className="border-white/30 bg-white/15 text-white">C</Kbd>
        </Button>
      }
    />
    <NavTabs>
      <a href="#general" data-status="active">
        General
      </a>
      <a href="#members">Members</a>
    </NavTabs>
    <p className="text-ink-2 p-5 text-sm">
      Tabs that are pages are links; the router marks the active one.
    </p>
  </Pane>
);

interface Asset {
  id: string;
  name: string;
  size: number;
  status: 'ready' | 'processing' | 'failed';
  by: string;
}
const assets: Asset[] = [
  { id: '1', name: 'tulip-latte.jpg', size: 312, status: 'ready', by: 'Marco Alves' },
  { id: '2', name: 'roastery-tour.mp4', size: 48_200, status: 'processing', by: 'Priya Raman' },
  { id: '3', name: 'beans-loop.gif', size: 2_400, status: 'failed', by: 'Ana de la Cruz' },
];
const tone = { ready: 'success', processing: 'neutral', failed: 'danger' } as const;
const columns: Column<Asset>[] = [
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    cell: (a) => <span className="font-medium">{a.name}</span>,
  },
  {
    id: 'size',
    header: 'Size',
    sortable: true,
    className: 'text-right',
    cell: (a) => `${a.size.toLocaleString()} KB`,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (a) => (
      <Badge tone={tone[a.status]} dot>
        {a.status}
      </Badge>
    ),
  },
  {
    id: 'by',
    header: 'Added by',
    cell: (a) => (
      <span className="flex items-center gap-2">
        <Avatar name={a.by} size="sm" decorative />
        {a.by}
      </span>
    ),
  },
];

export const Table: Story<{ state: 'rows' | 'loading' | 'empty' | 'error' }> = ({ state }) => {
  const [sort, setSort] = useState<SortState | null>({ id: 'name', desc: false });
  return (
    <Pane>
      <DataTable
        caption="Media"
        columns={columns}
        rows={state === 'rows' ? assets : []}
        getRowId={(a) => a.id}
        sort={sort}
        onSortChange={setSort}
        loading={state === 'loading'}
        {...(state === 'error'
          ? { error: 'Media couldn’t be loaded.', onRetry: () => undefined }
          : {})}
        empty="No media yet."
        hasMore={state === 'rows'}
        onLoadMore={() => undefined}
      />
    </Pane>
  );
};
Table.args = { state: 'rows' };
Table.argTypes = {
  state: { options: ['rows', 'loading', 'empty', 'error'], control: { type: 'radio' } },
};
