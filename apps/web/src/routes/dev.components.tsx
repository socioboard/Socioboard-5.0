// Development-only preview of the design system, for checking components in both themes.
// Replaced by the component catalog in P0-F8; returns "not found" in production builds.
import {
  Banner,
  Combobox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
  PageHeader,
  Tooltip,
  TooltipProvider,
  Avatar,
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  EmptyState,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  toast,
  useTheme,
  type Column,
  type SortState,
} from '@socioboard/ui';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { Copy, ImagePlus, Moon, Pencil, Plus, Sun, Trash2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { timezoneOptions } from '../features/onboarding';

export const Route = createFileRoute('/dev/components')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: Preview,
});

interface Asset {
  id: string;
  name: string;
  kind: string;
  size: number;
  status: 'ready' | 'processing' | 'failed';
  by: string;
}

const assets: Asset[] = [
  {
    id: '1',
    name: 'tulip-latte.jpg',
    kind: 'Image',
    size: 312,
    status: 'ready',
    by: 'Marco Alves',
  },
  {
    id: '2',
    name: 'roastery-tour.mp4',
    kind: 'Video',
    size: 48_200,
    status: 'processing',
    by: 'Priya Raman',
  },
  {
    id: '3',
    name: 'autumn-blend-bag.png',
    kind: 'Image',
    size: 1_100,
    status: 'ready',
    by: 'Priya Raman',
  },
  {
    id: '4',
    name: 'beans-loop.gif',
    kind: 'GIF',
    size: 2_400,
    status: 'failed',
    by: 'Ana de la Cruz',
  },
];

const statusTone = { ready: 'success', processing: 'neutral', failed: 'danger' } as const;

const columns: Column<Asset>[] = [
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    cell: (a) => <span className="font-medium">{a.name}</span>,
  },
  { id: 'kind', header: 'Type', cell: (a) => <span className="text-ink-2">{a.kind}</span> },
  {
    id: 'size',
    header: 'Size',
    sortable: true,
    className: 'text-right',
    cell: (a) => <span className="text-ink-2">{a.size.toLocaleString()} KB</span>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (a) => (
      <Badge tone={statusTone[a.status]} dot>
        {a.status === 'ready' ? 'Ready' : a.status === 'processing' ? 'Processing' : 'Failed'}
      </Badge>
    ),
  },
  {
    id: 'by',
    header: 'Added by',
    cell: (a) => (
      <span className="flex items-center gap-2">
        <Avatar name={a.by} size="sm" />
        <span className="text-ink-2">{a.by}</span>
      </span>
    ),
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass rounded-pane flex flex-col gap-4 p-6">
      <h2 className="text-ink-3 text-xs font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Preview() {
  const { resolved, setPreference } = useTheme();
  const [sort, setSort] = useState<SortState | null>({ id: 'name', desc: false });
  const [tableState, setTableState] = useState<'rows' | 'loading' | 'empty' | 'error'>('rows');
  const [loadingMore, setLoadingMore] = useState(false);
  const zones = useMemo(() => timezoneOptions(), []);
  const [zone, setZone] = useState('Europe/Lisbon');

  return (
    <TooltipProvider>
      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-8">
        <header className="flex items-center gap-3">
          <img src="/sb-mark.svg" alt="" width={24} height={27} />
          <h1 className="text-xl font-semibold tracking-tight">Design system preview</h1>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            aria-label={resolved === 'dark' ? 'Switch to light' : 'Switch to dark'}
            onClick={() => {
              setPreference(resolved === 'dark' ? 'light' : 'dark');
            }}
          >
            {resolved === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">
                <Plus />
                New post
              </Button>
              <Button>Save draft</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="danger">
                <Trash2 />
                Delete
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading>
                Scheduling
              </Button>
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg" variant="primary">
                Large
              </Button>
              <Button size="icon" aria-label="Add media">
                <ImagePlus />
              </Button>
            </div>
          </Section>

          <Section title="Form fields">
            <FormField label="Workspace name" hint="Your team sees this name." required>
              {(p) => <Input {...p} defaultValue="Halden Coffee" />}
            </FormField>
            <FormField label="Email" error="Enter a valid email address, like name@example.com.">
              {(p) => <Input {...p} type="email" defaultValue="priya@" />}
            </FormField>
            <FormField
              label="Time zone (Combobox)"
              hint="Searches city, country, offset and long name."
            >
              {(p) => (
                <Combobox
                  {...p}
                  options={zones}
                  value={zone}
                  onValueChange={setZone}
                  searchLabel="Search by city, country or offset"
                  emptyText="No matching time zone."
                />
              )}
            </FormField>
            <FormField label="Time zone (Select)">
              {(p) => (
                <Select defaultValue="Europe/Lisbon">
                  <SelectTrigger {...p}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Europe</SelectLabel>
                      <SelectItem value="Europe/Lisbon">Lisbon (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin (GMT+2)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Asia</SelectLabel>
                      <SelectItem value="Asia/Kolkata">Kolkata (GMT+5:30)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Caption">
              {(p) => (
                <Textarea
                  {...p}
                  defaultValue="Slow Saturday? Our autumn blend was roasted for this."
                />
              )}
            </FormField>
          </Section>

          <Section title="Menus, banners and page header">
            <div className="glass-chip overflow-hidden rounded-control">
              <PageHeader
                title="Posts"
                actions={
                  <Tooltip content="New post (C)">
                    <Button size="sm" variant="primary">
                      <Plus aria-hidden="true" />
                      New post <Kbd className="border-white/30 bg-white/15 text-white">C</Kbd>
                    </Button>
                  </Tooltip>
                }
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="self-start">Post actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Autumn blend launch</DropdownMenuLabel>
                <DropdownMenuItem hint="E">
                  <Pencil aria-hidden="true" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem hint="D">
                  <Copy aria-hidden="true" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem tone="danger">
                  <Trash2 aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Banner tone="info">Instagram limits posts to 25 a day per account.</Banner>
            <Banner
              tone="warning"
              onDismiss={() => undefined}
              action={
                <Button size="sm" variant="ghost">
                  Send the link again
                </Button>
              }
            >
              Verify your email address. We sent a link to priya@halden.test.
            </Banner>
            <Banner tone="danger">LinkedIn needs reconnecting: 3 posts can’t publish.</Banner>
          </Section>

          <Section title="Badges, avatars and loading">
            <div className="flex flex-wrap gap-2">
              <Badge tone="success" dot>
                Published
              </Badge>
              <Badge dot>Scheduled</Badge>
              <Badge tone="warning" dot>
                Needs approval
              </Badge>
              <Badge tone="danger" dot>
                Failed
              </Badge>
              <Badge tone="accent">Owner</Badge>
              <Badge tone="outline">Draft</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Avatar name="Priya Raman" size="xl" />
              <Avatar name="Marco Alves" size="lg" />
              <Avatar name="Ana de la Cruz" />
              <Avatar name="Sam Okafor" size="sm" />
              <Avatar name="Lee" size="xs" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Section>

          <Section title="Overlays and notifications">
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="danger">Delete workspace</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Halden Coffee?</DialogTitle>
                    <DialogDescription>
                      Scheduled posts stop publishing now. Everything in the workspace is removed
                      after 30 days, and you can restore it until then.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button>Keep workspace</Button>
                    <Button variant="danger">Delete workspace</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button>File details</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>tulip-latte.jpg</DrawerTitle>
                    <DrawerDescription>
                      1080 × 1080, 312 KB. Added by Marco Alves.
                    </DrawerDescription>
                  </DrawerHeader>
                  <FormField label="Alt text">
                    {(p) => (
                      <Textarea {...p} defaultValue="Latte with a tulip pour, seen from above." />
                    )}
                  </FormField>
                  <Button variant="primary" className="mt-auto">
                    Use in new post
                  </Button>
                </DrawerContent>
              </Drawer>
              <Button
                onClick={() => {
                  toast.success('Post scheduled', { description: 'Saturday 26 September, 10:00' });
                }}
              >
                Success toast
              </Button>
              <Button
                onClick={() => {
                  toast.error('Couldn’t publish to LinkedIn', {
                    description: 'Reconnect the account, then try again.',
                    action: { label: 'Reconnect', onClick: () => undefined },
                  });
                }}
              >
                Error toast
              </Button>
            </div>
          </Section>
        </div>

        <Section title="Data table">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Table state">
            {(['rows', 'loading', 'empty', 'error'] as const).map((state) => (
              <Button
                key={state}
                size="sm"
                variant={tableState === state ? 'primary' : 'secondary'}
                aria-pressed={tableState === state}
                onClick={() => {
                  setTableState(state);
                }}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </Button>
            ))}
          </div>
          <DataTable<Asset>
            caption="Media files"
            columns={columns}
            rows={tableState === 'empty' ? [] : assets}
            getRowId={(a) => a.id}
            sort={sort}
            onSortChange={setSort}
            onRowClick={(a) => {
              toast(`Opened ${a.name}`);
            }}
            loading={tableState === 'loading'}
            {...(tableState === 'error'
              ? {
                  error: 'Couldn’t load your media. Check your connection.',
                  onRetry: () => undefined,
                }
              : {})}
            empty={
              <EmptyState
                icon={<ImagePlus />}
                title="No media yet"
                description="Upload images and videos here to use them in any post."
                action={<Button variant="primary">Upload files</Button>}
              />
            }
            hasMore
            loadingMore={loadingMore}
            onLoadMore={() => {
              setLoadingMore(true);
              setTimeout(() => {
                setLoadingMore(false);
              }, 1200);
            }}
          />
        </Section>
      </main>
    </TooltipProvider>
  );
}
