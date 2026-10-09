import type { PreviewSpec } from '@socioboard/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import '../../../lib/i18n';
import { TumblrPreview } from '../previews/tumblr-preview';
import type { PreviewFile } from '../previews/shared';

const spec: PreviewSpec = {
  truncateAt: 500,
  truncateLines: 6,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: true,
};

const account = {
  name: 'Halden Coffee Roasters',
  username: 'haldenroasters',
  avatarUrl: null,
};

const photo = (n: number): PreviewFile => ({
  id: `f${String(n)}`,
  kind: 'image',
  src: `https://cdn.test/${String(n)}.jpg`,
  width: 1200,
  height: 800,
  alt: `Photo ${String(n)}`,
});

describe('TumblrPreview', () => {
  it('renders the blog name, domain meta, and text content', () => {
    render(
      <TumblrPreview
        account={account}
        text="Special single origin blend #coffee"
        files={[]}
        link={null}
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Tumblr' });
    expect(figure).toHaveTextContent('Halden Coffee Roasters');
    expect(figure).toHaveTextContent('haldenroasters.tumblr.com');
    expect(figure).toHaveTextContent('Special single origin blend #coffee');
  });

  it('renders photo media attached to post', () => {
    render(
      <TumblrPreview
        account={account}
        text="Check our new roaster"
        files={[photo(1), photo(2)]}
        link={null}
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Tumblr' });
    expect(figure).toHaveTextContent('Check our new roaster');
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders link card when link is attached and there are no files', () => {
    render(
      <TumblrPreview
        account={account}
        text="Read our story"
        files={[]}
        link="https://halden.test/story"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Tumblr' });
    expect(figure).toHaveTextContent('halden.test');
    expect(figure).toHaveTextContent('https://halden.test/story');
  });
});
