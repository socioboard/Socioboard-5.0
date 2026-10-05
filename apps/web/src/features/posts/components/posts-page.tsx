import type { Post } from '@socioboard/contracts';
import {
  Avatar,
  Button,
  DataTable,
  EmptyState,
  LabelChip,
  LabelSwatch,
  NavTabs,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Column,
} from '@socioboard/ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { FileText, Images, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { POST_TABS, postListQuery, type PostTab } from '../api';
import { labelsOf, labelsQuery } from '../labels';
import { ManageLabelsDialog } from './manage-labels-dialog';
import { AccountStack, PostStatusChip, PostWhen, RepeatMark } from './post-bits';

export interface PostsSearch {
  /** Which tab is open; undefined for All. */
  tab?: PostTab | undefined;
  /** Only posts with this label. */
  label?: string | undefined;
}

type PostLabels = ReturnType<typeof labelsOf>;

const TABS = Object.keys(POST_TABS) as PostTab[];

/**
 * `/w/:slug/posts` (docs/frontend/areas/posts.md): every post of the workspace, newest first, by
 * status. A row opens the post's details.
 */
export function PostsPage({
  search,
  onSearchChange,
}: {
  search: PostsSearch;
  onSearchChange: (patch: Partial<PostsSearch>) => void;
}) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const navigate = useNavigate();
  const tab = search.tab ?? 'all';
  const labels = useQuery(labelsQuery(workspace.id));
  const label = labels.data?.find((l) => l.id === search.label);
  const posts = useInfiniteQuery(postListQuery(workspace.id, tab, search.label));
  const rows = posts.data?.pages.flatMap((p) => p.items) ?? [];
  const canCompose = can('posts:create');
  const canManageLabels = can('posts:approve');
  const [managing, setManaging] = useState(false);

  const columns: Column<Post>[] = [
    {
      id: 'post',
      header: t('table.post'),
      cell: (post) => <Snippet post={post} labels={labelsOf(post.labelIds, labels.data)} />,
    },
    {
      id: 'accounts',
      header: t('table.accounts'),
      cell: (post) => <AccountStack targets={post.targets} />,
      className: 'w-36 @max-2xl:hidden',
    },
    {
      id: 'status',
      header: t('table.status'),
      cell: (post) => <PostStatusChip status={post.status} />,
      className: 'w-28 @xl:w-40',
    },
    {
      id: 'when',
      header: t('table.when'),
      cell: (post) => <PostWhen post={post} />,
      className: 'w-52 @max-3xl:hidden',
    },
    {
      id: 'author',
      header: t('table.author'),
      cell: (post) =>
        post.author ? (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={post.author.name} src={post.author.avatarUrl} size="xs" decorative />
            <span className="text-ink-2 truncate text-[13px]">{post.author.name}</span>
          </span>
        ) : null,
      className: 'w-44 @max-5xl:hidden',
    },
  ];

  const write = canCompose && (
    <Button asChild variant="primary">
      <Link to="/w/$slug/compose/{-$postId}" params={{ slug: workspace.slug, postId: undefined }}>
        <Plus aria-hidden="true" />
        {t('empty.write')}
      </Link>
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* "New post" lives in the sidebar and the mobile menu, a click away from every page. */}
      <PageHeader
        title={t('title')}
        actions={
          <>
            {(labels.data?.length ?? 0) > 0 && (
              <Select
                value={label?.id ?? 'all'}
                onValueChange={(id) => {
                  onSearchChange({ label: id === 'all' ? undefined : id });
                }}
              >
                <SelectTrigger aria-label={t('labels.filter')} className="h-8 w-40 sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">{t('labels.filterAll')}</SelectItem>
                  {labels.data?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex min-w-0 items-center gap-2">
                        <LabelSwatch color={l.color} />
                        <span className="truncate">{l.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {canManageLabels && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={t('labels.manage')}
                onClick={() => {
                  setManaging(true);
                }}
              >
                <Tags aria-hidden="true" />
                <span className="hidden sm:inline" aria-hidden="true">
                  {t('labels.manage')}
                </span>
              </Button>
            )}
          </>
        }
      />
      <NavTabs aria-label={t('tabs.label')}>
        {TABS.map((id) => (
          <Link
            key={id}
            to="/w/$slug/posts"
            params={{ slug: workspace.slug }}
            // Switching tabs keeps the label filter.
            search={{ tab: id === 'all' ? undefined : id, label: search.label }}
            // "All" (no ?tab) must not light up on every tab.
            activeOptions={{ includeSearch: true, explicitUndefined: true }}
          >
            {t(`tabs.${id}`)}
          </Link>
        ))}
      </NavTabs>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 sm:py-4">
          <DataTable
            caption={[`${t('table.caption')}: ${t(`tabs.${tab}`)}`, label?.name]
              .filter(Boolean)
              .join(', ')}
            columns={columns}
            rows={rows}
            getRowId={(post) => post.id}
            onRowClick={(post) =>
              void navigate({
                to: '/w/$slug/posts/$postId',
                params: { slug: workspace.slug, postId: post.id },
              })
            }
            loading={posts.isPending}
            error={posts.isError ? t('loadError') : undefined}
            onRetry={() => void posts.refetch()}
            empty={
              search.label ? (
                <EmptyState
                  icon={<FileText />}
                  title={t('empty.filtered.title')}
                  description={t('empty.filtered.body')}
                  action={
                    <Button
                      onClick={() => {
                        onSearchChange({ label: undefined });
                      }}
                    >
                      {t('empty.showAll')}
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<FileText />}
                  title={t(`empty.${tab}.title`)}
                  description={t(`empty.${tab}.body`)}
                  {...(write && (tab === 'all' || tab === 'drafts') ? { action: write } : {})}
                />
              )
            }
            hasMore={posts.hasNextPage}
            onLoadMore={() => void posts.fetchNextPage()}
            loadingMore={posts.isFetchingNextPage}
            labels={{
              loadMore: t('table.loadMore'),
              retry: t('table.retry'),
              loading: t('table.loading'),
            }}
          />
        </div>
      </div>
      {canManageLabels && <ManageLabelsDialog open={managing} onOpenChange={setManaging} />}
    </div>
  );
}

/** The start of the post's text (two lines), or what it carries when it has no text. */
function Snippet({ post, labels }: { post: Post; labels: PostLabels }) {
  const { t } = useTranslation('posts');
  const text = post.text.trim();
  return (
    <span className="flex min-w-0 flex-col gap-1 py-2">
      {text ? (
        <span className="text-ink line-clamp-2 text-[13px] leading-snug wrap-break-word">
          {text}
        </span>
      ) : (
        <span className="text-ink-3 text-[13px] italic">{t('noText')}</span>
      )}
      <span className="text-ink-3 flex items-center gap-3 text-xs">
        {post.mediaIds.length > 0 && (
          <span className="flex items-center gap-1">
            <Images className="size-3.5" aria-hidden="true" />
            {t('files', { count: post.mediaIds.length })}
          </span>
        )}
        <RepeatMark recurring={post.recurring} />
        {/* Where the columns are hidden (narrow screens), the essentials ride along here. */}
        <span className="@3xl:hidden">
          <PostWhen post={post} />
        </span>
      </span>
      {labels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {labels.map((l) => (
            <LabelChip
              key={l.id}
              name={l.name}
              color={l.color}
              className="h-5 px-1.5 text-[11px]"
            />
          ))}
        </span>
      )}
    </span>
  );
}
