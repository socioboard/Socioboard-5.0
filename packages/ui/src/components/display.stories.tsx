import type { Story, StoryDefault } from '@ladle/react';
import { Images } from 'lucide-react';

import { Pane } from '../stories/frame';
import { Banner } from './banner';
import { Button } from './button';
import { Card } from './card';
import { Avatar, Badge, EmptyState, Skeleton } from './display';
import { FileDropzone } from './file-dropzone';
import { LABEL_COLOR_NAMES, LabelChip, LabelSwatch } from './label-chip';
import { ProgressBar } from './progress-bar';
import { Spinner } from './spinner';
import { toast } from './toast';

export default { title: 'Display and feedback' } satisfies StoryDefault;

export const AvatarsAndBadges: Story = () => (
  <Pane>
    <div className="flex flex-wrap items-center gap-2">
      <Avatar name="Priya Raman" size="xs" />
      <Avatar name="Marco Alves" size="sm" />
      <Avatar name="Ana de la Cruz" />
      <Avatar name="Halden Coffee" size="lg" />
      <Avatar name="Roastery Social" size="xl" />
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge tone="success" dot>
        Published
      </Badge>
      <Badge dot>Scheduled</Badge>
      <Badge tone="warning" dot>
        Needs approval
      </Badge>
      <Badge tone="danger" dot>
        Failed
      </Badge>
      <Badge tone="accent">AI</Badge>
      <Badge tone="outline">Draft</Badge>
    </div>
  </Pane>
);

export const Banners: Story = () => (
  <Pane>
    <Banner tone="info">Instagram limits posts to 25 a day per account.</Banner>
    <Banner
      tone="warning"
      onDismiss={() => undefined}
      action={
        <Button size="sm" variant="ghost">
          Send the link again
        </Button>
      }
    >
      Verify your email address. We sent a link to priya@halden.test.
    </Banner>
    <Banner tone="danger">LinkedIn needs reconnecting: 3 posts can’t publish.</Banner>
  </Pane>
);

export const LoadingAndEmpty: Story = () => (
  <Pane>
    <div className="flex items-center gap-3">
      <Spinner />
      <Skeleton className="h-4 w-48" />
    </div>
    <ProgressBar label="Uploading harvest-reel.mp4" value={64} />
    <ProgressBar label="Processing" />
    <EmptyState
      icon={<Images />}
      title="No media yet"
      description="Upload images and videos to use in posts."
      action={<Button>Upload</Button>}
    />
  </Pane>
);

export const CardsAndDropzone: Story = () => (
  <Pane>
    <FileDropzone
      onFiles={(files) => {
        toast(`${String(files.length)} file(s) dropped`);
      }}
      label="Drop files to upload"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {['tulip-latte.jpg', 'brunch-pairing.jpg', 'roastery-tour.mp4'].map((name, i) => (
          <Card key={name} selected={i === 0}>
            <span className="bg-chip aspect-square" />
            <span className="px-3 py-2.5 text-[13px] font-medium">{name}</span>
          </Card>
        ))}
      </div>
    </FileDropzone>
    <p className="text-ink-3 text-xs">Drag files from your desktop onto the cards.</p>
  </Pane>
);

/** Post labels in every colour: chips (one removable) and the swatches pickers use. */
export const Labels: Story = () => (
  <Pane>
    <div className="flex flex-wrap gap-2">
      {LABEL_COLOR_NAMES.map((color) => (
        <LabelChip
          key={color}
          name={color.charAt(0).toUpperCase() + color.slice(1)}
          color={color}
        />
      ))}
      <LabelChip name="Autumn campaign" color="orange" onRemove={() => undefined} />
    </div>
    <div className="mt-4 flex gap-2">
      {LABEL_COLOR_NAMES.map((color) => (
        <LabelSwatch key={color} color={color} />
      ))}
    </div>
  </Pane>
);
