import { apiRoutes, type Post } from '@socioboard/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { api, ApiError, NETWORK_ERROR } from '../../lib/api';
import { rememberPost } from '../posts';
import type { PostBody } from './draft';

/** Autosave runs at most this long after the first unsaved change (docs: "every 10 s"). */
export const AUTOSAVE_MS = 10_000;

export type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: Date }
  | { kind: 'error'; error: unknown };

/**
 * Saving and publishing the composer's post (docs/frontend/areas/composer.md, "Actions").
 * - The first save creates the draft (`onCreated` gets its id); later ones update it.
 * - Saves run one at a time; changes made while one is under way stay unsaved and go next.
 * - Autosave: while there are unsaved changes, at most `AUTOSAVE_MS` after the first of them,
 *   so steady typing is still saved every 10 s.
 * - Publish saves first when needed, then publishes with an Idempotency-Key that is kept for a
 *   retry after a dropped connection, so the post can't go out twice.
 */
export function useSavePost({
  workspaceId,
  initialPost,
  body,
  hasContent,
  enabled,
  onCreated,
}: {
  workspaceId: string;
  initialPost: Post | undefined;
  body: PostBody;
  /** Something worth saving (accounts, text or media); an empty new post isn't created. */
  hasContent: boolean;
  enabled: boolean;
  onCreated: (postId: string) => void;
}) {
  const queryClient = useQueryClient();
  const key = JSON.stringify(body);
  const [postId, setPostId] = useState<string | null>(initialPost?.id ?? null);
  // What the server has: the body last saved (or loaded). Unsaved when the draft differs.
  const [savedKey, setSavedKey] = useState<string | null>(initialPost ? key : null);
  const [state, setState] = useState<SaveState>({ kind: 'idle' });
  const [publishing, setPublishing] = useState(false);
  // What the next save sends, kept current after each render (saves run later, in a queue).
  const latest = useRef({ body, key });
  useLayoutEffect(() => {
    latest.current = { body, key };
  });
  const postIdRef = useRef(postId);
  const queue = useRef<Promise<string | null>>(Promise.resolve(null));
  const idempotencyKey = useRef<string | null>(null);
  // The saved key as the queued saves see it (state is a render behind).
  const savedKeyRef = useRef(savedKey);
  // Whether the composer is still on screen: a save that finishes after the user left (they chose
  // "Leave" while it ran) mustn't take them back to the post.
  const onScreen = useRef(true);
  useEffect(() => {
    onScreen.current = true;
    return () => {
      onScreen.current = false;
    };
  }, []);

  const dirty = enabled && hasContent && key !== savedKey;
  const saving = state.kind === 'saving';

  const remember = useCallback(
    (post: Post) => {
      rememberPost(queryClient, workspaceId, post);
    },
    [queryClient, workspaceId],
  );

  /** Saves what's in the composer now; resolves to the post's id (null when it failed). */
  const save = useCallback((): Promise<string | null> => {
    const run = async (): Promise<string | null> => {
      const { body: sending, key: sentKey } = latest.current;
      const id = postIdRef.current;
      if (id && sentKey === savedKeyRef.current) return id;
      setState({ kind: 'saving' });
      try {
        const post = id
          ? await api(apiRoutes.posts.updatePost, {
              params: { workspaceId, postId: id },
              body: sending,
            })
          : await api(apiRoutes.posts.createPost, { params: { workspaceId }, body: sending });
        remember(post);
        savedKeyRef.current = sentKey;
        setSavedKey(sentKey);
        setState({ kind: 'saved', at: new Date() });
        if (!id) {
          postIdRef.current = post.id;
          setPostId(post.id);
          if (onScreen.current) onCreated(post.id);
        }
        return post.id;
      } catch (error) {
        setState({ kind: 'error', error });
        return null;
      }
    };
    queue.current = queue.current.then(run, run);
    return queue.current;
  }, [workspaceId, remember, onCreated]);

  // Autosave: a timer starts with the first unsaved change and isn't reset by typing.
  useEffect(() => {
    if (!dirty || saving) return;
    const timer = setTimeout(() => {
      void save();
    }, AUTOSAVE_MS);
    return () => {
      clearTimeout(timer);
    };
    // Restart only when the saved version changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, savedKey, saving]);

  const publish = useCallback(async (): Promise<Post | null> => {
    setPublishing(true);
    try {
      const id = await save();
      if (!id) return null;
      idempotencyKey.current ??= crypto.randomUUID();
      const post = await api(apiRoutes.posts.publishNow, {
        params: { workspaceId, postId: id },
        headers: { 'Idempotency-Key': idempotencyKey.current },
      });
      idempotencyKey.current = null;
      remember(post);
      return post;
    } catch (error) {
      // A dropped connection may have reached the server: the retry reuses the key, so the
      // server answers it without publishing twice. Any real answer ends this attempt.
      if (!(error instanceof ApiError && error.code === NETWORK_ERROR))
        idempotencyKey.current = null;
      throw error;
    } finally {
      setPublishing(false);
    }
  }, [save, workspaceId, remember]);

  return { postId, state, dirty, save, publish, publishing };
}
