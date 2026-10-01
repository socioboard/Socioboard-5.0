import {
  apiRoutes,
  type Post,
  type Recurrence,
  type RecurrenceRuleInput,
} from '@socioboard/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { api, ApiError, NETWORK_ERROR } from '../../lib/api';
import { postKeys, rememberPost, rememberRecurrence } from '../posts';
import type { PostBody } from './draft';

/** Autosave runs at most this long after the first unsaved change (docs: "every 10 s"). */
export const AUTOSAVE_MS = 10_000;

export type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: Date }
  | { kind: 'error'; error: unknown };

/** What the composer is sending the post off to do, if anything. */
export type Acting = 'publish' | 'schedule' | 'queue' | 'repeat' | 'unschedule' | 'stop' | null;

/**
 * Saving the composer's post and sending it on its way (docs/frontend/areas/composer.md,
 * "Actions").
 * - The first save creates the draft (`onCreated` gets its id); later ones update it.
 * - Saves run one at a time; changes made while one is under way stay unsaved and go next.
 * - Autosave: while there are unsaved changes, at most `AUTOSAVE_MS` after the first of them,
 *   so steady typing is still saved every 10 s. Off for a post that's scheduled or repeats: what
 *   is saved there goes out, so it's saved when the person says so.
 * - Publish, schedule, add to queue and repeat save first when needed. Publish sends an
 *   Idempotency-Key that is kept for a retry after a dropped connection, so the post can't go out
 *   twice.
 */
export function useSavePost({
  workspaceId,
  initialPost,
  body,
  hasContent,
  enabled,
  autosave = true,
  onCreated,
}: {
  workspaceId: string;
  initialPost: Post | undefined;
  body: PostBody;
  /** Something worth saving (accounts, text or media); an empty new post isn't created. */
  hasContent: boolean;
  enabled: boolean;
  autosave?: boolean;
  onCreated: (postId: string) => void;
}) {
  const queryClient = useQueryClient();
  const key = JSON.stringify(body);
  const [postId, setPostId] = useState<string | null>(initialPost?.id ?? null);
  // What the server has: the body last saved (or loaded). Unsaved when the draft differs.
  const [savedKey, setSavedKey] = useState<string | null>(initialPost ? key : null);
  const [state, setState] = useState<SaveState>({ kind: 'idle' });
  const [acting, setActing] = useState<Acting>(null);
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
    if (!autosave || !dirty || saving) return;
    const timer = setTimeout(() => {
      void save();
    }, AUTOSAVE_MS);
    return () => {
      clearTimeout(timer);
    };
    // Restart only when the saved version changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave, dirty, savedKey, saving]);

  /**
   * One thing at a time: saves first (unless told not to), then runs `send` with the post's id.
   * Null when the save failed (the footer says why). If the server refuses `send` (which may be
   * two requests), the post is re-read so the screen shows where the server left it.
   */
  const act = useCallback(
    async <T>(
      kind: NonNullable<Acting>,
      send: (params: { workspaceId: string; postId: string }) => Promise<T>,
      { saveFirst = true } = {},
    ): Promise<T | null> => {
      setActing(kind);
      try {
        const id = saveFirst ? await save() : postIdRef.current;
        if (!id) return null;
        try {
          return await send({ workspaceId, postId: id });
        } catch (error) {
          // The server answered, and may have done part of it: read the post again. (With no
          // answer there's nothing new to read, and the same key retries it safely.)
          if (!(error instanceof ApiError && error.code === NETWORK_ERROR)) {
            void queryClient.invalidateQueries({ queryKey: postKeys.detail(workspaceId, id) });
          }
          throw error;
        }
      } finally {
        setActing(null);
      }
    },
    [save, workspaceId, queryClient],
  );

  const publish = useCallback(
    () =>
      act('publish', async (params) => {
        idempotencyKey.current ??= crypto.randomUUID();
        try {
          const post = await api(apiRoutes.posts.publishNow, {
            params,
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
        }
      }),
    [act, remember],
  );

  /** Every account at `at`. A post that repeats stops repeating first (the server asks for it). */
  const schedule = useCallback(
    (at: Date, was: { repeating: boolean }) =>
      act('schedule', async (params) => {
        if (was.repeating) {
          await api(apiRoutes.scheduling.deleteRecurrence, { params });
          rememberRecurrence(queryClient, workspaceId, params.postId, null);
        }
        const post = await api(apiRoutes.scheduling.schedulePost, {
          params,
          body: { at: at.toISOString() },
        });
        remember(post);
        return post;
      }),
    [act, remember, queryClient, workspaceId],
  );

  /** Each account's next free posting time. */
  const addToQueue = useCallback(
    () =>
      act('queue', async (params) => {
        const post = await api(apiRoutes.scheduling.queuePost, { params });
        remember(post);
        return post;
      }),
    [act, remember],
  );

  /** Repeat by `rule`. A scheduled post is unscheduled first (the server asks for it). */
  const repeat = useCallback(
    (rule: RecurrenceRuleInput, was: { scheduled: boolean }) =>
      act('repeat', async (params): Promise<{ postId: string; recurrence: Recurrence }> => {
        if (was.scheduled) remember(await api(apiRoutes.scheduling.unschedulePost, { params }));
        const recurrence = await api(apiRoutes.scheduling.setRecurrence, { params, body: rule });
        rememberRecurrence(queryClient, workspaceId, params.postId, recurrence);
        return { postId: params.postId, recurrence };
      }),
    [act, remember, queryClient, workspaceId],
  );

  /** Back to a draft. Unsaved changes stay unsaved: nothing is sent but the unscheduling. */
  const unschedule = useCallback(
    () =>
      act(
        'unschedule',
        async (params) => {
          const post = await api(apiRoutes.scheduling.unschedulePost, { params });
          remember(post);
          return post;
        },
        { saveFirst: false },
      ),
    [act, remember],
  );

  /** Stops repeating; copies that haven't gone out are removed by the server. */
  const stopRepeating = useCallback(
    () =>
      act(
        'stop',
        async (params) => {
          await api(apiRoutes.scheduling.deleteRecurrence, { params });
          rememberRecurrence(queryClient, workspaceId, params.postId, null);
          return true;
        },
        { saveFirst: false },
      ),
    [act, queryClient, workspaceId],
  );

  return {
    postId,
    state,
    dirty,
    save,
    acting,
    publishing: acting === 'publish',
    publish,
    schedule,
    addToQueue,
    repeat,
    unschedule,
    stopRepeating,
  };
}
