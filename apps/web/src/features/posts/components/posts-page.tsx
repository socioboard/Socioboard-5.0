import type { Post } from '@socioboard/contracts';
import {
  Avatar,
  Button,
  DataTable,
  EmptyState,
  NavTabs,
  PageHeader,
  type Column,
} from '@socioboard/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { FileText, Images, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { POST_TABS, postListQuery, type PostTab } from '../api';
import { AccountStack, PostStatusChip, PostWhen } from './post-bits';

export interface PostsSearch {
  /** Which tab is open; undefined for All. */
  tab?: PostTab | undefined;
}

const TABS = Object.keys(POST_TABS) as PostTab[];

/**
 * `/w/:slug/posts` (docs/frontend/areas/posts.md): every post of the workspace, newest first, by
 * status. A row opens the post's details.
 */
export function PostsPage({ search }: { search: PostsSearch }) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const navigate = useNavigate();
  const tab = search.tab ?? 'all';
  const posts = useInfiniteQuery(postListQuery(workspace.id, tab));
  const rows = posts.data?.pages.flatMap((p) => p.items) ?? [];
  const canCompose = can('posts:create');

  const columns: Column<Post>[] = [
    {
      id: 'post',
      header: t('table.post'),
      cell: (post) => <Snippet post={post} />,
    },
    {
      id: 'accounts',
      header: t('table.accounts'),
      cell: (post) => <AccountStack targets={post.targets} />,
      className: 'w-36 max-md:hidden',
    },
    {
      id: 'status',
      header: t('table.status'),
      cell: (post) => <PostStatusChip status={post.status} />,
      className: 'w-40',
    },
    {
      id: 'when',
      header: t('table.when'),
      cell: (post) => <PostWhen post={post} />,
      className: 'w-52 max-lg:hidden',
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
      className: 'w-44 max-xl:hidden',
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
      <PageHeader title={t('title')} />
      <NavTabs aria-label={t('tabs.label')}>
        {TABS.map((id) => (
          <Link
            key={id}
            to="/w/$slug/posts"
            params={{ slug: workspace.slug }}
            search={{ tab: id === 'all' ? undefined : id }}
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
            caption={`${t('table.caption')}: ${t(`tabs.${tab}`)}`}
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
              <EmptyState
                icon={<FileText />}
                title={t(`empty.${tab}.title`)}
                description={t(`empty.${tab}.body`)}
                {...(write && (tab === 'all' || tab === 'drafts') ? { action: write } : {})}
              />
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
    </div>
  );
}

/** The start of the post's text (two lines), or what it carries when it has no text. */
function Snippet({ post }: { post: Post }) {
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
        {/* Where the columns are hidden (narrow screens), the essentials ride along here. */}
        <span className="lg:hidden">
          <PostWhen post={post} />
        </span>
      </span>
    </span>
  );
}
