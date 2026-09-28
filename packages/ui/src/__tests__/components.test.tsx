import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Banner,
  FileDropzone,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ProgressBar,
  Checkbox,
  ConfirmDialog,
  RadioCard,
  RadioGroup,
  Switch,
  Combobox,
  CommandPalette,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipProvider,
  Avatar,
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  EmptyState,
  FormField,
  initials,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeProvider,
  toast,
  Toaster,
  type Column,
  type SortState,
} from '../index';

describe('Button', () => {
  it('is a real button that does not submit forms by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('blocks clicks and says it is busy while loading, even if disabled={false}', async () => {
    const onClick = vi.fn();
    render(
      <Button loading disabled={false} onClick={onClick}>
        Schedule
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Schedule' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('can render a link with button styles', () => {
    render(
      <Button asChild variant="primary">
        <a href="/compose">New post</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'New post' })).toHaveClass('accent-lit');
  });
});

describe('FormField', () => {
  it('links the label, and the hint through aria-describedby', () => {
    render(
      <FormField label="Workspace name" hint="Shown to your team" required>
        {(p) => <Input {...p} />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: /Workspace name/ });
    expect(input).toHaveAccessibleDescription('Shown to your team');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('shows the error instead of the hint and marks the field invalid', () => {
    render(
      <FormField label="Email" hint="We never share it" error="Enter a valid email address">
        {(p) => <Input {...p} type="email" />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email address');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address');
    expect(screen.queryByText('We never share it')).not.toBeInTheDocument();
  });
});

describe('Dialog', () => {
  it('opens with its title and description, traps focus, closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Delete workspace</Button>
        </DialogTrigger>
        <DialogContent closeLabel="Close dialog">
          <DialogTitle>Delete Halden Coffee?</DialogTitle>
          <DialogDescription>Everything in it is removed after 30 days.</DialogDescription>
          <Button variant="danger">Delete</Button>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Delete workspace' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Delete Halden Coffee?' });
    expect(dialog).toHaveAccessibleDescription('Everything in it is removed after 30 days.');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('Drawer', () => {
  it('opens as a dialog and closes with its close button', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Details</Button>
        </DrawerTrigger>
        <DrawerContent closeLabel="Close details" aria-describedby={undefined}>
          <DrawerTitle>tulip-latte.jpg</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByRole('dialog', { name: 'tulip-latte.jpg' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Select', () => {
  function Timezone() {
    const [value, setValue] = useState('UTC');
    return (
      <>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger aria-label="Time zone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="Europe/Lisbon">Lisbon</SelectItem>
          </SelectContent>
        </Select>
        <output>{value}</output>
      </>
    );
  }

  it('picks an option with the pointer and with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Timezone />);
    await user.click(screen.getByRole('combobox', { name: 'Time zone' }));
    await user.click(await screen.findByRole('option', { name: 'Lisbon' }));
    expect(screen.getByRole('status')).toHaveTextContent('Europe/Lisbon');

    screen.getByRole('combobox', { name: 'Time zone' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowUp}{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('UTC');
  });
});

describe('Combobox', () => {
  const zones = [
    { value: 'UTC', label: 'UTC', hint: 'GMT' },
    { value: 'Europe/Lisbon', label: 'Lisbon', hint: 'GMT+1', keywords: 'Portugal' },
    { value: 'Asia/Kolkata', label: 'Kolkata', hint: 'GMT+5:30', keywords: 'India Calcutta' },
  ];
  function Zone() {
    const [value, setValue] = useState('UTC');
    return (
      <>
        <Combobox
          aria-label="Time zone"
          options={zones}
          value={value}
          onValueChange={setValue}
          searchLabel="Search time zones"
          emptyText="No matching time zone"
        />
        <output>{value}</output>
      </>
    );
  }

  it('filters by any word, including hidden keywords, and picks with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Zone />);
    await user.click(screen.getByRole('button', { name: 'Time zone' }));
    const search = await screen.findByRole('combobox', { name: 'Search time zones' });
    expect(search).toHaveFocus();
    expect(screen.getByRole('option', { name: /UTC/ })).toHaveAttribute('aria-selected', 'true');

    await user.type(search, 'india');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Asia/Kolkata');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Time zone' })).toHaveFocus();
  });

  it('moves with the arrow keys and picks with the pointer', async () => {
    const user = userEvent.setup();
    render(<Zone />);
    await user.click(screen.getByRole('button', { name: 'Time zone' }));
    const search = await screen.findByRole('combobox', { name: 'Search time zones' });
    await user.keyboard('{ArrowDown}');
    const lisbon = screen.getByRole('option', { name: /Lisbon/ });
    expect(search).toHaveAttribute('aria-activedescendant', lisbon.id);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Asia/Kolkata');

    await user.click(screen.getByRole('button', { name: 'Time zone' }));
    await user.click(await screen.findByRole('option', { name: /Lisbon/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Europe/Lisbon');
  });

  it('says so when nothing matches, and Escape keeps the value', async () => {
    const user = userEvent.setup();
    render(<Zone />);
    await user.click(screen.getByRole('button', { name: 'Time zone' }));
    await user.type(await screen.findByRole('combobox'), 'atlantis');
    expect(screen.getByText('No matching time zone')).toBeInTheDocument();
    await user.keyboard('{Enter}{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('UTC');
  });
});

describe('DropdownMenu', () => {
  it('runs items and picks a radio choice from the keyboard', async () => {
    const onSignOut = vi.fn();
    function Menu() {
      const [theme, setTheme] = useState('system');
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>Account</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuItem tone="danger" onSelect={onSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <output>{theme}</output>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark');

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});

describe('Tooltip', () => {
  it('names an icon button on keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip content="Collapse sidebar">
          <button type="button" aria-label="Collapse sidebar">
            ‹
          </button>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Collapse sidebar');
  });
});

describe('Checkbox, Switch and RadioGroup', () => {
  it('toggle from their labels and the keyboard', async () => {
    const user = userEvent.setup();
    function Form() {
      const [role, setRole] = useState('editor');
      return (
        <>
          <Checkbox label="Sign out other devices" description="Recommended" defaultChecked />
          <Switch aria-label="Two-factor authentication" />
          <RadioGroup value={role} onValueChange={setRole} aria-label="Role">
            <RadioCard value="admin" label="Admin" description="Manages members and settings" />
            <RadioCard value="editor" label="Editor" description="Publishes and approves posts" />
          </RadioGroup>
          <output>{role}</output>
        </>
      );
    }
    render(<Form />);
    const box = screen.getByRole('checkbox', { name: 'Sign out other devices' });
    expect(box).toHaveAccessibleDescription('Recommended');
    expect(box).toBeChecked();
    await user.click(screen.getByText('Sign out other devices'));
    expect(box).not.toBeChecked();

    const toggle = screen.getByRole('switch', { name: 'Two-factor authentication' });
    await user.click(toggle);
    expect(toggle).toBeChecked();

    const editor = screen.getByRole('radio', { name: 'Editor' });
    expect(editor).toHaveAccessibleDescription('Publishes and approves posts');
    expect(editor).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Admin' }));
    expect(screen.getByRole('status')).toHaveTextContent('admin');
  });
});

describe('ConfirmDialog', () => {
  it('confirms only once the name is typed, and stays open with the error on failure', async () => {
    const user = userEvent.setup();
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('Try again'))
      .mockResolvedValueOnce(undefined);
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Halden Coffee?"
          description="Everything in it is deleted after 30 days."
          confirmLabel="Delete workspace"
          cancelLabel="Cancel"
          tone="danger"
          onConfirm={onConfirm}
          errorMessage={(error) => (error as Error).message}
          typeToConfirm={{ value: 'Halden Coffee', label: 'Type the workspace name' }}
        />
      );
    }
    render(<Harness />);
    const confirm = screen.getByRole('button', { name: 'Delete workspace' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Type the workspace name'), 'Halden Coffee');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(confirm);
    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});

describe('ProgressBar', () => {
  it('announces its value, or none while the amount is unknown', () => {
    const { rerender } = render(<ProgressBar label="Uploading reel.mp4" value={64.4} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading reel.mp4' });
    expect(bar).toHaveAttribute('aria-valuenow', '64');
    rerender(<ProgressBar label="Processing" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });
});

/** The dropzone wrapping the element with this text. */
function dropzoneOf(text: string): HTMLElement {
  const zone = screen.getByText(text).parentElement;
  if (!zone) throw new Error(`No dropzone around "${text}"`);
  return zone;
}

describe('FileDropzone', () => {
  it('shows what dropping does while files hover, then hands over the dropped files', () => {
    const onFiles = vi.fn();
    render(
      <FileDropzone onFiles={onFiles} label="Drop to upload">
        <p>Media</p>
      </FileDropzone>,
    );
    const zone = dropzoneOf('Media');
    const file = new File(['x'], 'latte.jpg', { type: 'image/jpeg' });
    const dataTransfer = { types: ['Files'], files: [file], dropEffect: 'none' };
    fireEvent.dragEnter(zone, { dataTransfer });
    expect(screen.getByText('Drop to upload')).toBeInTheDocument();
    fireEvent.drop(zone, { dataTransfer });
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument();
  });

  it('ignores drags that carry no files (text, links)', () => {
    render(
      <FileDropzone onFiles={vi.fn()} label="Drop to upload">
        <p>Media</p>
      </FileDropzone>,
    );
    const zone = dropzoneOf('Media');
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'], files: [] } });
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument();
  });
});

describe('Popover', () => {
  it('opens from its trigger and closes with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>New folder</PopoverTrigger>
        <PopoverContent aria-label="New folder">
          <input aria-label="Folder name" />
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'New folder' }));
    expect(await screen.findByLabelText('Folder name')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByLabelText('Folder name')).not.toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('names the person, unless the name is already shown beside it', () => {
    const { rerender, container } = render(<Avatar name="Priya Raman" />);
    expect(screen.getByText('Priya Raman')).toBeInTheDocument();
    rerender(<Avatar name="Priya Raman" decorative />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Banner', () => {
  it('is a polite status, a danger banner an alert, and can be dismissed', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Banner tone="warning" onDismiss={onDismiss} dismissLabel="Dismiss notice">
        Verify your email
      </Banner>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Verify your email');
    await user.click(screen.getByRole('button', { name: 'Dismiss notice' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    rerender(<Banner tone="danger">Payment failed</Banner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('CommandPalette', () => {
  function Palette({ onGo }: { onGo: (to: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
          Open palette
        </button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Command palette"
          searchLabel="Search or jump to"
          emptyText="Nothing matches."
          groups={[
            {
              heading: 'Go to',
              commands: [
                {
                  id: 'cal',
                  label: 'Calendar',
                  keywords: 'schedule',
                  onSelect: () => {
                    onGo('calendar');
                  },
                },
                {
                  id: 'media',
                  label: 'Media',
                  onSelect: () => {
                    onGo('media');
                  },
                },
              ],
            },
            {
              heading: 'Workspaces',
              commands: [
                {
                  id: 'w',
                  label: 'Roastery',
                  hint: 'Owner',
                  onSelect: () => {
                    onGo('roastery');
                  },
                },
              ],
            },
          ]}
        />
      </>
    );
  }

  it('filters across groups by label, keywords and heading, and runs with Enter', async () => {
    const onGo = vi.fn();
    const user = userEvent.setup();
    render(<Palette onGo={onGo} />);
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    const search = await screen.findByRole('combobox', { name: 'Search or jump to' });
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.type(search, 'schedule');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(onGo).toHaveBeenCalledWith('calendar');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('wraps with the arrow keys, and opens with an empty search each time', async () => {
    const onGo = vi.fn();
    const user = userEvent.setup();
    render(<Palette onGo={onGo} />);
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    await user.type(await screen.findByRole('combobox'), 'zzz');
    expect(screen.getByText('Nothing matches.')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    expect(await screen.findByRole('combobox')).toHaveValue('');
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onGo).toHaveBeenCalledWith('roastery');
  });
});

describe('Toaster', () => {
  it('shows a toast', async () => {
    render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>,
    );
    act(() => {
      toast.success('Post scheduled');
    });
    expect(await screen.findByText('Post scheduled')).toBeInTheDocument();
  });
});

describe('Avatar, Badge and EmptyState', () => {
  it('shows initials and the name for screen readers when there is no photo', () => {
    render(<Avatar name="Priya Raman" />);
    expect(screen.getByText('PR')).toBeInTheDocument();
    expect(screen.getByText('Priya Raman')).toHaveClass('sr-only');
    expect(initials('  marco  ')).toBe('M');
    expect(initials('Ana de la Cruz')).toBe('AC');
  });

  it('renders a status badge and an empty state with its action', () => {
    render(
      <>
        <Badge tone="danger" dot>
          Failed
        </Badge>
        <EmptyState
          title="No media yet"
          description="Upload images and videos to use them in posts."
          action={<Button variant="primary">Upload</Button>}
        />
      </>,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No media yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  interface Row {
    id: string;
    name: string;
    size: number;
  }
  const columns: Column<Row>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
    { id: 'size', header: 'Size', cell: (r) => `${String(r.size)} KB`, sortable: true },
  ];
  const rows: Row[] = [
    { id: '1', name: 'tulip-latte.jpg', size: 312 },
    { id: '2', name: 'brunch.jpg', size: 402 },
  ];

  function Table(props: Partial<Parameters<typeof DataTable<Row>>[0]>) {
    const [sort, setSort] = useState<SortState | null>({ id: 'name', desc: false });
    return (
      <DataTable<Row>
        caption="Media files"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        {...props}
      />
    );
  }

  it('lists rows and asks the server to re-sort from the headers', async () => {
    const user = userEvent.setup();
    render(<Table />);
    const table = screen.getByRole('table', { name: 'Media files' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await user.click(within(nameHeader).getByRole('button'));
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await user.click(screen.getByRole('button', { name: /Size/ }));
    expect(screen.getByRole('columnheader', { name: /Size/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
  });

  it('opens a row with the keyboard', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Table onRowClick={onRowClick} />);
    await user.tab(); // sort button
    await user.tab(); // sort button
    await user.tab(); // first row
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('shows skeletons while loading, the empty view when there are no rows, and errors with retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<Table loading />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('tulip-latte.jpg')).not.toBeInTheDocument();

    rerender(<Table rows={[]} empty={<p>No files yet</p>} />);
    expect(screen.getByText('No files yet')).toBeInTheDocument();

    rerender(<Table error="Could not load media." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load media.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('loads the next page', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const { rerender } = render(<Table hasMore onLoadMore={onLoadMore} />);
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalled();
    rerender(<Table hasMore onLoadMore={onLoadMore} loadingMore />);
    expect(screen.getByRole('button', { name: 'Load more' })).toHaveAttribute('aria-busy', 'true');
  });
});
