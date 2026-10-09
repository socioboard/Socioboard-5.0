// YouTube in the composer (P3-B3, P3-F1, P3-F2): preview and options panel.
import type { PreviewSpec, TargetOptions, TargetOptionsKey } from '@socioboard/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import '../../../lib/i18n';
import { YouTubePanel } from '../options/youtube-panel';
import type { PreviewFile } from '../previews/shared';
import { YouTubePreview } from '../previews/youtube-preview';

const spec: PreviewSpec = {
  truncateAt: 125,
  truncateLines: 3,
  captionPosition: 'below_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: false,
};

const account = { name: 'Halden Roastery', username: 'haldenroastery', avatarUrl: null };
const videoFile: PreviewFile = {
  id: 'v1',
  kind: 'video',
  src: 'https://cdn.test/video.mp4',
  width: 1920,
  height: 1080,
  alt: 'Coffee roasting video',
};

describe('YouTubePreview', () => {
  it('shows video player card, title, description, and action buttons', () => {
    render(
      <YouTubePreview
        account={account}
        text="Special single-origin roast"
        files={[videoFile]}
        title="Single Origin Ethiopia Roast"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on YouTube' });
    expect(figure).toHaveTextContent('Halden Roastery');
    expect(figure).toHaveTextContent('@haldenroastery');
    expect(figure).toHaveTextContent('Single Origin Ethiopia Roast');
    expect(figure).toHaveTextContent('Special single-origin roast');
    expect(figure).toHaveTextContent('Like');
    expect(figure).toHaveTextContent('Share');
  });

  it('shows fallback when video file is not added yet', () => {
    render(<YouTubePreview account={account} text="Description only" files={[]} spec={spec} />);
    expect(screen.getByText(/Add a video file to preview/i)).toBeInTheDocument();
  });
});

describe('YouTubePanel', () => {
  it('allows entering video title, tags, and toggling made for kids', async () => {
    const set = vi.fn<(key: TargetOptionsKey, values: Record<string, unknown>) => void>();
    const options: TargetOptions = {};

    render(<YouTubePanel network="youtube" accounts={[]} options={options} set={set} />);
    const user = userEvent.setup();

    // Title input
    const titleInput = screen.getByPlaceholderText(/Add a title/i);
    await user.type(titleInput, 'My New Video');
    expect(set).toHaveBeenCalledWith('youtube', { title: 'M' });

    // Privacy selection
    expect(screen.getByRole('radio', { name: /Private/ })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: /Public/ }));
    expect(set).toHaveBeenCalledWith('youtube', { privacy: 'public' });

    // Made for kids toggle
    const kidsSwitch = screen.getByRole('switch');
    await user.click(kidsSwitch);
    expect(set).toHaveBeenCalledWith('youtube', { madeForKids: true });
  });
});
