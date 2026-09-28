import type { Story, StoryDefault } from '@ladle/react';
import { Plus, Trash2 } from 'lucide-react';

import { Pane } from '../stories/frame';
import { Button } from './button';
import { Kbd } from './page';
import { Spinner } from './spinner';

export default { title: 'Actions / Button' } satisfies StoryDefault;

/** One primary per screen; danger never looks like the primary action. */
export const Variants: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">
        <Plus aria-hidden="true" />
        New post <Kbd className="border-white/30 bg-white/15 text-white">C</Kbd>
      </Button>
      <Button>Save draft</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
    </div>
  </Pane>
);

export const SizesAndStates: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus aria-hidden="true" />
      </Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Spinner />
    </div>
  </Pane>
);
