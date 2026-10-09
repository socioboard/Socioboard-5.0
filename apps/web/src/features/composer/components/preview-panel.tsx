import type { MediaAssetDetails, Network, NetworkId, SocialAccount } from '@socioboard/contracts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useChangeMotion,
} from '@socioboard/ui';
import { Eye } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { contentFor, type Draft } from '../draft';
import { useAttachedMedia } from '../media';
import { FacebookPreview } from '../previews/facebook-preview';
import { InstagramPreview } from '../previews/instagram-preview';
import { LinkedInPreview } from '../previews/linkedin-preview';
import type { PreviewFile } from '../previews/shared';
import { ThreadsPreview } from '../previews/threads-preview';
import { TumblrPreview } from '../previews/tumblr-preview';
import { XPreview } from '../previews/x-preview';
import { NetworkTabs } from './network-tabs';

/** Originals up to this size are shown for a lone picture; beyond it, or in a grid, the thumbnail. */
const FULL_PICTURE_MAX_BYTES = 2 * 1024 * 1024;

/**
 * A file as previews show it. The 480 px thumbnail is plenty for grid tiles and carousel slides;
 * only a lone, modest picture loads its original, so a post of large photos stays light.
 */
function toPreviewFile(
  id: string,
  asset: MediaAssetDetails | undefined,
  fallbackAlt: string,
  alone: boolean,
): PreviewFile {
  if (!asset) return { id, kind: 'image', src: null, width: null, height: null, alt: fallbackAlt };
  return {
    id,
    kind: asset.kind,
    // Videos show their poster (the thumbnail).
    src:
      asset.kind !== 'video' && alone && asset.sizeBytes <= FULL_PICTURE_MAX_BYTES
        ? (asset.url ?? asset.thumbnailUrl)
        : asset.thumbnailUrl,
    // Ready videos play in the preview from their own file.
    videoSrc: asset.kind === 'video' && asset.status === 'ready' ? asset.url : null,
    width: asset.width,
    height: asset.height,
    alt: asset.altText ?? asset.name,
  };
}

/**
 * The live preview (docs/frontend/areas/composer.md): a tab per selected network, drawn from
 * the network's preview spec with the account's real name and avatar, updating as the user
 * types. Where several accounts of one network are selected, "Preview as" picks which.
 */
export function PreviewPanel({
  workspaceId,
  draft,
  selected,
  accounts,
  networks,
  active,
  onActiveChange,
}: {
  workspaceId: string;
  draft: Draft;
  selected: NetworkId[];
  accounts: SocialAccount[];
  networks: Network[];
  active: NetworkId | null;
  onActiveChange: (network: NetworkId) => void;
}) {
  const { t } = useTranslation('composer');
  const panelId = useId();
  const [as, setAs] = useState<Partial<Record<NetworkId, string>>>({});
  const network = active && selected.includes(active) ? active : selected[0];
  // Another network or account refreshes the preview in place.
  const previewMotion = useChangeMotion(`${network ?? ''}:${network ? (as[network] ?? '') : ''}`);

  if (!network) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-ink-3">
        <Eye className="size-6" aria-hidden="true" />
        {t('preview.empty')}
      </div>
    );
  }

  const choices = draft.accountIds
    .map((id) => accounts.find((a) => a.id === id))
    .filter((a): a is SocialAccount => a?.network === network);
  const account = choices.find((a) => a.id === as[network]) ?? choices[0];
  const spec = networks.find((n) => n.id === network)?.preview;

  return (
    <div className="flex flex-col gap-3">
      <NetworkTabs
        networks={selected}
        active={network}
        customised={new Set()}
        onChange={(n) => {
          if (n) onActiveChange(n);
        }}
        panelId={panelId}
        withAll={false}
        label={t('preview.tabs')}
      />
      {choices.length > 1 && account && (
        <Select
          value={account.id}
          onValueChange={(id) => {
            setAs((m) => ({ ...m, [network]: id }));
          }}
        >
          <SelectTrigger aria-label={t('preview.as')} className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {choices.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {t('preview.asAccount', { name: a.displayName })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div
        ref={previewMotion}
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${panelId}-tab-${network}`}
        className="flex justify-center"
      >
        {account && spec ? (
          <NetworkPreview
            workspaceId={workspaceId}
            draft={draft}
            network={network}
            account={account}
            spec={spec}
          />
        ) : (
          <p className="text-ink-3 py-6 text-sm">{t('preview.unsupported')}</p>
        )}
      </div>
    </div>
  );
}

function NetworkPreview({
  workspaceId,
  draft,
  network,
  account,
  spec,
}: {
  workspaceId: string;
  draft: Draft;
  network: NetworkId;
  account: SocialAccount;
  spec: Network['preview'];
}) {
  const { t } = useTranslation('composer');
  const content = contentFor(draft, network);
  const assets = useAttachedMedia(workspaceId, content.mediaIds);
  const files = content.mediaIds.map((id, i) =>
    toPreviewFile(
      id,
      assets[i]?.data,
      t('preview.file', { n: i + 1 }),
      content.mediaIds.length === 1,
    ),
  );
  const link = draft.link.trim() === '' ? null : draft.link.trim();
  const firstComment = draft.firstComment.trim() === '' ? null : draft.firstComment;

  if (network === 'facebook_page') {
    return (
      <FacebookPreview
        account={{ name: account.displayName, avatarUrl: account.avatarUrl }}
        text={content.text}
        files={files}
        link={link}
        firstComment={firstComment}
        spec={spec}
      />
    );
  }
  if (network === 'instagram') {
    return (
      <InstagramPreview
        account={{
          name: account.displayName,
          username: account.username,
          avatarUrl: account.avatarUrl,
        }}
        text={content.text}
        files={files}
        format={content.format}
        firstComment={firstComment}
        spec={spec}
      />
    );
  }
  if (network === 'x') {
    return (
      <XPreview
        account={{
          name: account.displayName,
          username: account.username,
          avatarUrl: account.avatarUrl,
        }}
        text={content.text}
        files={files}
        link={link}
        spec={spec}
      />
    );
  }
  if (network === 'threads') {
    return (
      <ThreadsPreview
        account={{
          name: account.displayName,
          username: account.username,
          avatarUrl: account.avatarUrl,
        }}
        text={content.text}
        files={files}
        link={link}
        firstComment={firstComment}
        spec={spec}
      />
    );
  }
  if (network === 'linkedin_person') {
    return (
      <LinkedInPreview
        account={{ name: account.displayName, avatarUrl: account.avatarUrl }}
        text={content.text}
        files={files}
        link={link}
        spec={spec}
      />
    );
  }
  if (network === 'tumblr') {
    return (
      <TumblrPreview
        account={{
          name: account.displayName,
          username: account.username,
          avatarUrl: account.avatarUrl,
        }}
        text={content.text}
        files={files}
        link={link}
        spec={spec}
      />
    );
  }
  return <p className="text-ink-3 py-6 text-sm">{t('preview.unsupported')}</p>;
}
