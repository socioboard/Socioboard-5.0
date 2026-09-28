import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
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
