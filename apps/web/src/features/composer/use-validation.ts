import { apiRoutes, type Network, type NetworkId } from '@socioboard/contracts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { api } from '../../lib/api';
import { toPostBody, type Draft, type NetworkOf, type PostBody } from './draft';
import {
  blockedNetworks,
  clientIssues,
  isWebAddress,
  mergeIssues,
  serverIssues,
  type ComposerIssue,
} from './validation';

/** How long typing must pause before the server checks (docs/frontend/areas/composer.md). */
export const VALIDATE_DEBOUNCE_MS = 500;

export interface Validation {
  issues: ComposerIssue[];
  /** Networks with an error (publishing to them is blocked). */
  blocked: ReadonlySet<NetworkId>;
  /** The server is checking the latest content. */
  checking: boolean;
  /** The server couldn't be asked; only the quick checks are shown. */
  unavailable: boolean;
}

/**
 * Validation while composing: the quick checks on every change, and `POST /posts/validate` once
 * typing pauses for 500 ms. The last server answer stays on screen while the next one is on its
 * way; a link that isn't a web address is reported at once and not sent (the API would refuse
 * the whole request).
 */
export function useValidation({
  workspaceId,
  draft,
  networkOf,
  selected,
  rulesOf,
  enabled,
}: {
  workspaceId: string;
  draft: Draft;
  networkOf: NetworkOf;
  selected: NetworkId[];
  rulesOf: (n: NetworkId) => Network['rules'] | undefined;
  enabled: boolean;
}): Validation {
  // Labels don't change what the networks accept: they're left out of the check.
  const { labelIds: _labels, ...body } = toPostBody(draft, networkOf);
  const key = JSON.stringify(body);
  const [settled, setSettled] = useState(key);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(key);
    }, VALIDATE_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [key]);

  const sendable =
    enabled && body.targets.length > 0 && (body.link === null || isWebAddress(body.link));
  const server = useQuery({
    queryKey: ['workspaces', workspaceId, 'posts', 'validate', settled],
    queryFn: ({ signal }) =>
      api(apiRoutes.posts.validatePost, {
        params: { workspaceId },
        body: JSON.parse(settled) as Omit<PostBody, 'labelIds'>,
        signal,
      }),
    enabled: sendable,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false,
  });

  const quick = clientIssues(draft, selected, rulesOf);
  const fromServer = sendable && server.data ? serverIssues(server.data, networkOf) : [];
  // Accounts no longer selected don't keep their old findings on screen.
  const current = fromServer.filter(
    (i) => i.accountId === null || draft.accountIds.includes(i.accountId),
  );
  const issues = mergeIssues(quick, current).filter(
    (i) => i.network === null || selected.includes(i.network),
  );
  return {
    issues,
    blocked: blockedNetworks(issues),
    checking: sendable && (settled !== key || server.isFetching),
    unavailable: sendable && server.isError,
  };
}
