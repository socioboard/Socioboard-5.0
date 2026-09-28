import type { Story, StoryDefault } from '@ladle/react';
import { CalendarDays, Copy, Images, Moon, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Pane } from '../stories/frame';
import { Button } from './button';
import { CommandPalette } from './command-palette';
import { ConfirmDialog } from './confirm-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Input, Label } from './form';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './popover';
import { toast } from './toast';
import { Tooltip } from './tooltip';

export default { title: 'Overlays' } satisfies StoryDefault;

export const DialogAndDrawer: Story = () => (
  <Pane>
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Halden Coffee</DialogTitle>
            <DialogDescription>
              We email them a link to join. It works for 7 days.
            </DialogDescription>
          </DialogHeader>
          <Input aria-label="Email" placeholder="name@example.com" />
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button variant="primary">Send invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>tulip-latte.jpg</DrawerTitle>
            <DrawerDescription>A right-hand panel; a bottom sheet on phones.</DrawerDescription>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button className="self-start">Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  </Pane>
);

export const Confirm: Story = () => {
  const [open, setOpen] = useState(false);
  return (
    <Pane>
      <Button
        variant="danger"
        className="self-start"
        onClick={() => {
          setOpen(true);
        }}
      >
        Delete workspace…
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Delete Halden Coffee?"
        description="Members lose access at once. Everything is permanently deleted after 30 days."
        confirmLabel="Delete workspace"
        cancelLabel="Cancel"
        typeToConfirm={{ value: 'Halden Coffee', label: 'Type Halden Coffee to confirm' }}
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
      />
    </Pane>
  );
};

export const MenuPopoverTooltip: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Post actions</Button>
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
          <DropdownMenuGroup>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value="system">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="danger">
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover>
        <PopoverTrigger asChild>
          <Button>New folder</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="New folder">
          <div className="flex flex-col gap-3">
            <Label htmlFor="story-folder">Folder name</Label>
            <Input id="story-folder" placeholder="Brand kit" />
            <PopoverClose asChild>
              <Button size="sm" variant="primary" className="self-end">
                Create
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <Tooltip content="Switch to dark theme">
        <Button size="icon" variant="ghost" aria-label="Switch to dark theme">
          <Moon aria-hidden="true" />
        </Button>
      </Tooltip>
      <Button
        onClick={() =>
          toast.success('Post scheduled', { description: 'Saturday 26 September, 10:00' })
        }
      >
        Show a toast
      </Button>
    </div>
  </Pane>
);

export const Palette: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <Pane>
      <Button
        className="self-start"
        onClick={() => {
          setOpen(true);
        }}
      >
        Open ⌘K
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        title="Command palette"
        searchLabel="Search or jump to"
        emptyText="Nothing matches. Try another word."
        groups={[
          {
            heading: 'Go to',
            commands: [
              {
                id: 'cal',
                label: 'Calendar',
                icon: CalendarDays,
                keywords: 'schedule',
                onSelect: () => undefined,
              },
              { id: 'media', label: 'Media', icon: Images, onSelect: () => undefined },
            ],
          },
          {
            heading: 'Preferences',
            commands: [
              { id: 'dark', label: 'Use the dark theme', icon: Moon, onSelect: () => undefined },
            ],
          },
        ]}
      />
    </Pane>
  );
};
