// Videos in the previews: a ready video plays in place from its poster's play button; one whose
// file isn't known yet shows the poster with a play mark only.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import '../../../lib/i18n';
import { FileTile, type PreviewFile } from '../previews/shared';

const video = (videoSrc: string | null): PreviewFile => ({
  id: 'v1',
  kind: 'video',
  src: 'https://cdn.test/v1-thumb.webp',
  videoSrc,
  width: 1280,
  height: 720,
  alt: 'launch.mp4',
});

describe('a video in the preview', () => {
  it('plays in place when its play button is pressed', async () => {
    const { container } = render(<FileTile file={video('https://cdn.test/v1.mp4')} />);
    expect(container.querySelector('video')).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Play launch.mp4' }));
    const player = container.querySelector('video');
    expect(player).toHaveAttribute('src', 'https://cdn.test/v1.mp4');
    expect(player).toHaveAttribute('poster', 'https://cdn.test/v1-thumb.webp');
    expect(player).toHaveAttribute('controls');
  });

  it('shows only the poster while its file is not known', () => {
    render(<FileTile file={video(null)} />);
    expect(screen.queryByRole('button', { name: /Play/ })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'launch.mp4' })).toBeInTheDocument();
  });
});
