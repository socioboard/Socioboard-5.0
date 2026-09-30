import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';

import {
  AnimatePresence,
  Collapse,
  LayoutGroup,
  Leaving,
  listItem,
  motion,
  springs,
  staggerStyle,
  Swap,
} from '../motion';
import { Pane } from '../stories/frame';
import { Button } from './button';
import { Card } from './card';
import { LabelChip } from './label-chip';

export default { title: 'Motion' } satisfies StoryDefault;

/** Opening to the content's height, and a status changing in place. */
export const CollapseAndSwap: Story = () => {
  const [open, setOpen] = useState(true);
  const states = ['Saving…', 'Saved at 14:05', 'Unsaved changes'];
  const [at, setAt] = useState(0);
  return (
    <Pane title="Collapse and Swap">
      <div className="flex flex-col gap-4">
        <Button
          className="self-start"
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          {open ? 'Hide history' : 'Show history'}
        </Button>
        <Collapse open={open}>
          <ol className="text-ink-2 flex flex-col gap-1 text-sm">
            <li>Attempt 1: retried automatically</li>
            <li>Attempt 2: published</li>
          </ol>
        </Collapse>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setAt((i) => (i + 1) % states.length);
            }}
          >
            Next status
          </Button>
          <span className="text-ink-3 relative text-[13px]">
            <Swap id={String(at)}>{states[at]}</Swap>
          </span>
        </div>
      </div>
    </Pane>
  );
};

/** Items arriving in turn, leaving, and the rest moving up to close the gap. */
export const Lists: Story = () => {
  const [items, setItems] = useState(['Autumn campaign', 'Launch', 'Recipes', 'Events']);
  return (
    <Pane title="Lists">
      <div className="flex flex-col gap-4">
        <Button
          className="self-start"
          onClick={() => {
            setItems((list) => [...list, `Label ${String(list.length + 1)}`]);
          }}
        >
          Add a label
        </Button>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {items.map((name, i) => (
              <motion.span key={name} {...listItem(i)} className="inline-flex">
                <LabelChip
                  name={name}
                  color={(['orange', 'blue', 'green', 'violet'] as const)[i % 4] ?? 'gray'}
                  onRemove={() => {
                    setItems((list) => list.filter((n) => n !== name));
                  }}
                />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="stagger-children grid grid-cols-3 gap-2">
          {['One', 'Two', 'Three'].map((n) => (
            <Card key={n} className="hover-lift p-4 text-sm">
              {n}: hover me
            </Card>
          ))}
        </div>
        <ul className="flex flex-col gap-1">
          {['First', 'Second', 'Third'].map((n, i) => (
            <li key={n} className="animate-enter text-ink-2 text-sm" style={staggerStyle(i)}>
              {n} row, arriving in turn
            </li>
          ))}
        </ul>
      </div>
    </Pane>
  );
};

/** One highlight gliding between choices (sidebar, tabs, switches). */
export const SlidingHighlight: Story = () => {
  const options = ['Edit', 'Preview', 'Schedule'];
  const [value, setValue] = useState('Edit');
  return (
    <Pane title="Sliding highlight">
      <LayoutGroup id="story-highlight">
        <div className="glass-chip rounded-control inline-flex p-1">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={value === o}
              onClick={() => {
                setValue(o);
              }}
              className="text-ink-2 aria-pressed:text-ink relative isolate h-8 rounded-lg px-4 text-[13px] font-medium"
            >
              {value === o && (
                <motion.span
                  layoutId="story-pill"
                  aria-hidden="true"
                  className="bg-chip absolute inset-0 -z-10 rounded-lg shadow-sm"
                  transition={springs.snappy}
                />
              )}
              {o}
            </button>
          ))}
        </div>
      </LayoutGroup>
    </Pane>
  );
};

/** Content that leaves stops being usable at once (inert), while it fades out. */
export const LeavingContent: Story = () => {
  const [shown, setShown] = useState(true);
  return (
    <Pane title="Leaving">
      <div className="flex flex-col gap-3">
        <Button
          className="self-start"
          onClick={() => {
            setShown((s) => !s);
          }}
        >
          {shown ? 'Dismiss the note' : 'Bring it back'}
        </Button>
        <AnimatePresence>
          {shown && (
            <Leaving
              key="note"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="glass-chip rounded-control p-3 text-sm"
            >
              A note with a <a href="#here">link</a> that can't be clicked once it's leaving.
            </Leaving>
          )}
        </AnimatePresence>
      </div>
    </Pane>
  );
};
