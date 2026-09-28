import type { Story, StoryDefault } from '@ladle/react';

import { Pane } from './frame';

export default { title: 'Foundations' } satisfies StoryDefault;

const colors = [
  ['canvas', 'bg-canvas', 'Page base behind the glows'],
  ['glass', 'bg-glass', 'Panes (with blur)'],
  ['chip', 'bg-chip', 'Fields and chips on glass'],
  ['ink', 'bg-ink', 'Primary text'],
  ['ink-2', 'bg-ink-2', 'Secondary text'],
  ['ink-3', 'bg-ink-3', 'Hints, placeholders'],
  ['accent', 'bg-accent', 'Primary buttons and the calendar now line only'],
  ['ring', 'bg-ring', 'Selection and focus (Aurora violet)'],
  ['success', 'bg-success', 'Published'],
  ['warning', 'bg-warning', 'Needs approval'],
  ['danger', 'bg-danger', 'Failed, destructive'],
] as const;

/** The tokens from styles.css; switch Ladle's theme to see the dark values. */
export const Tokens: Story = () => (
  <div className="flex flex-col gap-4">
    <Pane title="Color">
      <ul className="grid gap-3 sm:grid-cols-2">
        {colors.map(([name, className, use]) => (
          <li key={name} className="flex items-center gap-3">
            <span className={`${className} border-hair size-10 shrink-0 rounded-[10px] border`} />
            <span className="flex flex-col">
              <code className="text-ink text-[13px] font-semibold">{name}</code>
              <span className="text-ink-3 text-xs">{use}</span>
            </span>
          </li>
        ))}
      </ul>
    </Pane>
    <Pane title="Type (Instrument Sans, tabular figures)">
      <p className="text-[21px] font-semibold tracking-tight">21 · Page and dialog titles</p>
      <p className="text-base font-semibold">16 · Page header</p>
      <p className="text-sm">14 · Body and controls</p>
      <p className="text-[13px]">13 · Dense UI: sidebar, tables</p>
      <p className="text-ink-2 text-xs">12 · Hints, captions</p>
      <p className="text-ink-3 text-[11px] font-semibold">11 · Badges, keys</p>
    </Pane>
    <Pane title="Surfaces and radius">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-pane p-4 text-sm">glass · pane 18</div>
        <div className="glass-float rounded-[14px] p-4 text-sm">glass-float · 14</div>
        <div className="glass-chip rounded-control p-4 text-sm">glass-chip · control 10</div>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="accent-lit rounded-control px-3 py-2 text-sm font-semibold">
          accent-lit
        </span>
        <span className="glass-chip ring-selected rounded-control px-3 py-2 text-sm">
          ring-selected
        </span>
      </div>
    </Pane>
  </div>
);
