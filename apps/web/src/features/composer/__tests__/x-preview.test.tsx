// The X preview (P3-B2, P3-F1): the text X will post, X's photo layouts and its link card.
import type { PreviewSpec } from '@socioboard/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import '../../../lib/i18n';
import { xShownText } from '../previews/model';
import type { PreviewFile } from '../previews/shared';
import { XPreview } from '../previews/x-preview';

const spec: PreviewSpec = {
  truncateAt: null,
  truncateLines: null,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: true,
};
const account = { name: 'Halden Coffee', username: 'haldencoffee', avatarUrl: null };
const photo = (n: number): PreviewFile => ({
  id: `f${String(n)}`,
  kind: 'image',
  src: `https://cdn.test/${String(n)}.jpg`,
  width: 1200,
  height: 800,
  alt: `Photo ${String(n)}`,
});

describe('xShownText', () => {
  it('adds the link after the text, as X posts it, unless the text has it', () => {
    expect(xShownText('Menu ', 'https://h.test/m')).toBe('Menu\n\nhttps://h.test/m');
    expect(xShownText('See https://h.test/m', 'https://h.test/m')).toBe('See https://h.test/m');
    expect(xShownText('', 'https://h.test/m')).toBe('https://h.test/m');
    expect(xShownText('Only text', null)).toBe('Only text');
  });
});

describe('XPreview', () => {
  it('shows the account, its handle, the whole text with the link, and a link card', () => {
    render(
      <XPreview
        account={account}
        text={'New menu'}
        files={[]}
        link="https://h.test/m"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on X' });
    expect(figure).toHaveTextContent('Halden Coffee');
    expect(figure).toHaveTextContent('@haldencoffee · now');
    expect(figure).toHaveTextContent('New menu https://h.test/m');
    expect(figure).toHaveTextContent('From h.test');
  });

  it('photos: up to four, and no link card with media', () => {
    render(
      <XPreview
        account={account}
        text="Four"
        files={[1, 2, 3, 4, 5].map(photo)}
        link="https://h.test/m"
        spec={spec}
      />,
    );
    expect(screen.getAllByRole('img', { name: /^Photo/ })).toHaveLength(4);
    expect(screen.queryByText(/^From /)).not.toBeInTheDocument();
  });
});
