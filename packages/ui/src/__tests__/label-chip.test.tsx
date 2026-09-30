import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LABEL_COLOR_NAMES, LABEL_COLORS, LabelChip } from '../components/label-chip';

describe('LabelChip', () => {
  it('every colour the API allows has a chip and a swatch for both themes', () => {
    expect(LABEL_COLOR_NAMES).toEqual([
      'gray',
      'red',
      'orange',
      'amber',
      'green',
      'teal',
      'blue',
      'indigo',
      'violet',
      'pink',
    ]);
    for (const color of LABEL_COLOR_NAMES) {
      expect(LABEL_COLORS[color].chip).toMatch(/dark:/);
      expect(LABEL_COLORS[color].swatch).toMatch(/dark:/);
    }
  });

  it('shows the name, and a named remove button when removable', async () => {
    const onRemove = vi.fn();
    render(
      <LabelChip name="Launch" color="blue" onRemove={onRemove} removeLabel="Remove Launch" />,
    );
    expect(screen.getByText('Launch')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove Launch' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
