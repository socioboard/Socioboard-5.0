import type { Story, StoryDefault } from '@ladle/react';
import type { NetworkId } from '@socioboard/contracts';
import { useState } from 'react';

import { Pane } from '../stories/frame';
import {
  AccountPicker,
  CharacterCounter,
  IssueList,
  MediaThumb,
  PreviewFrame,
  type PickerAccount,
} from './composer';
import { NetworkIcon } from './network-icon';
import { StatusChip } from './status-chip';

export default { title: 'Composer and posts' } satisfies StoryDefault;

const NETWORKS: NetworkId[] = [
  'facebook_page',
  'instagram',
  'linkedin_org',
  'x',
  'youtube',
  'pinterest',
  'tiktok',
  'snapchat',
  'tumblr',
];

export const NetworkIcons: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-center gap-3">
      {NETWORKS.map((n) => (
        <NetworkIcon key={n} network={n} variant="tile" size="lg" />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {NETWORKS.map((n) => (
        <NetworkIcon key={n} network={n} size="md" />
      ))}
    </div>
  </Pane>
);

export const StatusChips: Story = () => (
  <Pane>
    <div className="flex flex-wrap gap-2">
      {(
        [
          'draft',
          'in_review',
          'approved',
          'scheduled',
          'publishing',
          'published',
          'partial',
          'failed',
        ] as const
      ).map((s) => (
        <StatusChip key={s} status={s} />
      ))}
    </div>
    <div className="flex flex-wrap gap-2">
      {(['pending', 'cancelled'] as const).map((s) => (
        <StatusChip key={s} status={s} />
      ))}
    </div>
  </Pane>
);

const accounts: PickerAccount[] = [
  {
    id: 'a1',
    name: 'Halden Coffee',
    network: 'facebook_page',
    status: 'active',
    loginName: 'Priya',
  },
  {
    id: 'a2',
    name: 'Halden Roastery',
    network: 'facebook_page',
    status: 'active',
    loginName: 'Brand Admin',
  },
  {
    id: 'a3',
    name: 'Halden Kiosk',
    network: 'facebook_page',
    status: 'reauth_required',
    loginName: 'Priya',
  },
  {
    id: 'a4',
    name: 'Halden Coffee',
    username: 'halden.coffee',
    network: 'instagram',
    status: 'active',
  },
  {
    id: 'a5',
    name: 'Halden Roastery',
    username: 'haldenroastery',
    network: 'instagram',
    status: 'paused',
  },
];

export const AccountPickerStory: Story = () => {
  const [value, setValue] = useState<string[]>(['a1', 'a4']);
  return (
    <Pane>
      <AccountPicker accounts={accounts} value={value} onChange={setValue} />
      <p className="text-ink-3 text-xs">Chosen: {value.join(', ') || 'none'}</p>
    </Pane>
  );
};
AccountPickerStory.storyName = 'Account picker';

export const Counters: Story = () => (
  <Pane>
    <div className="flex flex-wrap gap-4">
      <CharacterCounter count={184} max={63206} network="facebook_page" />
      <CharacterCounter count={2014} max={2200} network="instagram" />
      <CharacterCounter count={2231} max={2200} network="instagram" />
    </div>
  </Pane>
);

export const Issues: Story = () => (
  <Pane>
    <IssueList
      issues={[
        {
          id: '1',
          severity: 'warning',
          network: 'instagram',
          message: "Links in Instagram captions aren't clickable.",
        },
        {
          id: '2',
          severity: 'error',
          network: 'instagram',
          message: 'Instagram needs images between 4:5 and 1.91:1; this one is 0.56:1.',
          onSelect: () => undefined,
        },
        { id: '3', severity: 'error', message: 'Choose at least one account.' },
      ]}
    />
    <IssueList issues={[]} labels={{ ready: 'Ready to publish' }} />
  </Pane>
);

const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3b17a"/><stop offset="1" stop-color="#8a3a1c"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/><circle cx="80" cy="80" r="34" fill="#fff" fill-opacity=".85"/></svg>',
  );

export const MediaThumbs: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-end gap-3">
      <MediaThumb
        src={photo}
        alt="Latte art on an oak table"
        kind="image"
        onRemove={() => undefined}
      />
      <MediaThumb src={photo} alt="Pour-over, slow motion" kind="video" durationSec={47} />
      <MediaThumb src={photo} alt="Steam loop" kind="gif" size="sm" />
      <MediaThumb src={null} alt="Roastery tour.mp4" kind="video" status="processing" />
      <MediaThumb src={null} alt="menu.webp" kind="image" status="failed" size="lg" />
    </div>
  </Pane>
);

export const PreviewFrames: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-start gap-4">
      <PreviewFrame
        network="facebook_page"
        account={{ name: 'Halden Coffee' }}
        meta="Just now"
        media={<img src={photo} alt="" className="aspect-[1.91/1] w-full object-cover" />}
      >
        Fresh roast today: Ethiopia Guji, washed. Come by the bar before noon for a free taster.
      </PreviewFrame>
      <PreviewFrame
        network="instagram"
        account={{ name: 'Halden Coffee', username: 'halden.coffee' }}
        mediaFirst
        media={<img src={photo} alt="" className="aspect-square w-full object-cover" />}
      >
        <b>halden.coffee</b> Fresh roast today ☕ #coffee #specialtycoffee
      </PreviewFrame>
    </div>
  </Pane>
);
