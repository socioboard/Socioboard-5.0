// Threads in the composer (P3-B10): its preview (the text as posted, media in a row, the link
// card, the first comment as a reply) and the "Who can reply" panel filing its setting.
import type { PreviewSpec, TargetOptions, TargetOptionsKey } from '@socioboard/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import '../../../lib/i18n';
import { ThreadsPanel } from '../options/threads-panel';
import type { PreviewFile } from '../previews/shared';
import { ThreadsPreview } from '../previews/threads-preview';

const spec: PreviewSpec = {
  truncateAt: null,
  truncateLines: null,
  captionPosition: 'above_media',
  mediaLayout: 'carousel',
  cropAspectRatio: null,
  linkCard: true,
};
const account = { name: 'Halden Coffee', username: 'halden.coffee', avatarUrl: null };
const photo = (n: number): PreviewFile => ({
  id: `f${String(n)}`,
  kind: 'image',
  src: `https://cdn.test/${String(n)}.jpg`,
  width: 1080,
  height: 1080,
  alt: `Photo ${String(n)}`,
});

describe('ThreadsPreview', () => {
  it('shows the username, the text, a link card without media, and the reply', () => {
    render(
      <ThreadsPreview
        account={account}
        text="New menu"
        files={[]}
        link="https://halden.test/menu"
        firstComment="#coffee"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Threads' });
    expect(figure).toHaveTextContent('halden.coffee');
    expect(figure).toHaveTextContent('New menu');
    expect(figure).toHaveTextContent('halden.test');
    expect(figure).toHaveTextContent('Reply');
    expect(figure).toHaveTextContent('#coffee');
  });

  it('with photos, the link goes at the end of the text and every photo shows', () => {
    render(
      <ThreadsPreview
        account={account}
        text="Two roasts"
        files={[photo(1), photo(2)]}
        link="https://halden.test"
        firstComment={null}
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Threads' });
    expect(figure).toHaveTextContent(/Two roasts\s*https:\/\/halden\.test/);
    expect(screen.getByRole('img', { name: 'Photo 1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo 2' })).toBeInTheDocument();
    expect(figure).not.toHaveTextContent('Reply');
  });
});

describe('ThreadsPanel', () => {
  it('files who can reply; choosing Anyone again clears it (Threads’ default)', async () => {
    const set = vi.fn<(key: TargetOptionsKey, values: Record<string, unknown>) => void>();
    const options: TargetOptions = {};
    const { rerender } = render(
      <ThreadsPanel network="threads" accounts={[]} options={options} set={set} />,
    );
    const user = userEvent.setup();
    expect(screen.getByRole('radio', { name: /Anyone/ })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: /Your followers/ }));
    expect(set).toHaveBeenLastCalledWith('threads', { replyControl: 'followers_only' });

    rerender(
      <ThreadsPanel
        network="threads"
        accounts={[]}
        options={{ threads: { replyControl: 'followers_only' } }}
        set={set}
      />,
    );
    await user.click(screen.getByRole('radio', { name: /Anyone/ }));
    expect(set).toHaveBeenLastCalledWith('threads', { replyControl: undefined });
  });
});
