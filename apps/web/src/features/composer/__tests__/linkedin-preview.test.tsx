// The LinkedIn preview (P3-B1, P3-F1): the text as LinkedIn receives it (the link after it, no
// card), cut at "…more", LinkedIn's photo layouts and a video on its own.
import type { PreviewSpec } from '@socioboard/contracts';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import '../../../lib/i18n';
import { LinkedInPreview } from '../previews/linkedin-preview';
import type { PreviewFile } from '../previews/shared';

// The adapter's LINKEDIN_PREVIEW.
const spec: PreviewSpec = {
  truncateAt: 210,
  truncateLines: 3,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: false,
};
const account = { name: 'Priya Raman', avatarUrl: null };
const photo = (n: number): PreviewFile => ({
  id: `f${String(n)}`,
  kind: 'image',
  src: `https://cdn.test/${String(n)}.jpg`,
  width: 1200,
  height: 800,
  alt: `Photo ${String(n)}`,
});

describe('LinkedInPreview', () => {
  it('shows the member, a public post just now, the text with the link after it, and no card', () => {
    render(
      <LinkedInPreview
        account={account}
        text="New roast (Kenya) #coffee"
        files={[]}
        link="https://h.test/m"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on LinkedIn' });
    expect(figure).toHaveTextContent('Priya Raman');
    expect(figure).toHaveTextContent('Just now');
    expect(screen.getByLabelText('Public')).toBeInTheDocument();
    // What people see: brackets as typed (the adapter's escaping is for LinkedIn, not readers).
    expect(figure).toHaveTextContent('New roast (Kenya) #coffee https://h.test/m');
    expect(figure).not.toHaveTextContent(/From h\.test/);
  });

  it('cuts long text after three lines with "…more", which opens the rest', () => {
    render(
      <LinkedInPreview
        account={account}
        text={'One\nTwo\nThree\nFour'}
        files={[]}
        link={null}
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on LinkedIn' });
    expect(figure).not.toHaveTextContent('Four');
    fireEvent.click(screen.getByRole('button', { name: 'more' }));
    expect(figure).toHaveTextContent('Four');
  });

  it('photos: one alone, three as one above two, six as one above three with "+2"', () => {
    const { unmount } = render(
      <LinkedInPreview account={account} text="" files={[photo(1)]} link={null} spec={spec} />,
    );
    expect(screen.getAllByRole('img', { name: /^Photo/ })).toHaveLength(1);
    unmount();

    const three = render(
      <LinkedInPreview
        account={account}
        text=""
        files={[1, 2, 3].map(photo)}
        link={null}
        spec={spec}
      />,
    );
    expect(screen.getAllByRole('img', { name: /^Photo/ })).toHaveLength(3);
    three.unmount();

    render(
      <LinkedInPreview
        account={account}
        text=""
        files={[1, 2, 3, 4, 5, 6].map(photo)}
        link={null}
        spec={spec}
      />,
    );
    expect(screen.getAllByRole('img', { name: /^Photo/ })).toHaveLength(4);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('a video shows on its own', () => {
    render(
      <LinkedInPreview
        account={account}
        text="Roasting day"
        files={[{ ...photo(1), kind: 'video', src: null, alt: 'Clip' }]}
        link={null}
        spec={spec}
      />,
    );
    expect(screen.getByRole('img', { name: 'Clip' })).toBeInTheDocument();
  });
});
