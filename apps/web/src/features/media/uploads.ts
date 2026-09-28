import type { QueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { onSignedOut } from '../../lib/session';
import { mediaKeys } from './api';
import { checkFile, uploadMedia, type RejectReason } from './upload';

export interface UploadItem {
  id: string;
  workspaceId: string;
  folderId: string | undefined;
  file: File;
  /** queued → uploading → (removed when done) | failed; rejected never starts. */
  status: 'queued' | 'uploading' | 'failed' | 'rejected';
  progress: number;
  error?: unknown;
  reject?: RejectReason;
}

/** Two files upload at once; the rest wait their turn. */
const FILE_CONCURRENCY = 2;

// Module-level on purpose: uploads keep going while people move around the app.
let items: UploadItem[] = [];
const controllers = new Map<string, AbortController>();
const listeners = new Set<() => void>();
let nextId = 0;
let client: QueryClient | null = null;

// `items` is React's snapshot: always replace it, never change it in place.
function emit() {
  for (const listener of listeners) listener();
}

function update(id: string, patch: Partial<UploadItem>) {
  items = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
  emit();
}

function remove(id: string) {
  controllers.get(id)?.abort();
  controllers.delete(id);
  items = items.filter((item) => item.id !== id);
  emit();
}

function pump() {
  let running = items.filter((item) => item.status === 'uploading').length;
  for (const item of items) {
    if (running >= FILE_CONCURRENCY) break;
    if (item.status !== 'queued') continue;
    running += 1;
    void run(item);
  }
}

async function run(item: UploadItem) {
  const controller = new AbortController();
  controllers.set(item.id, controller);
  update(item.id, { status: 'uploading', progress: 0, error: undefined });
  try {
    await uploadMedia(item.workspaceId, item.file, {
      folderId: item.folderId,
      signal: controller.signal,
      onProgress: (progress) => {
        update(item.id, { progress });
      },
    });
    remove(item.id);
    // The new asset shows up (as "processing") in whatever list is open.
    await client?.invalidateQueries({ queryKey: mediaKeys.lists(item.workspaceId) });
  } catch (err) {
    if (controller.signal.aborted) return; // dismissed while uploading
    update(item.id, { status: 'failed', error: err });
  } finally {
    controllers.delete(item.id);
    pump();
  }
}

/** Queue files for upload; files the API would refuse are shown as rejected right away. */
export function startUploads(
  queryClient: QueryClient,
  workspaceId: string,
  files: File[],
  folderId?: string,
) {
  client = queryClient;
  const added = files.map((file): UploadItem => {
    const reject = checkFile(file);
    nextId += 1;
    return {
      id: `upload-${String(nextId)}`,
      workspaceId,
      folderId,
      file,
      status: reject ? 'rejected' : 'queued',
      progress: 0,
      ...(reject ? { reject } : {}),
    };
  });
  items = [...items, ...added];
  emit();
  pump();
}

export function retryUpload(id: string) {
  update(id, { status: 'queued', progress: 0, error: undefined });
  pump();
}

/** Stops an upload in flight, or clears a failed or rejected one. */
export function dismissUpload(id: string) {
  remove(id);
  pump();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** This workspace's uploads that are waiting, running, failed or rejected. */
export function useUploads(workspaceId: string): UploadItem[] {
  const all = useSyncExternalStore(subscribe, () => items);
  return all.filter((item) => item.workspaceId === workspaceId);
}

/** For tests: forget everything. */
export function resetUploads() {
  for (const controller of controllers.values()) controller.abort();
  controllers.clear();
  items = [];
  emit();
}

// Nothing from one person's uploads (file names, progress) stays for the next person on this browser.
onSignedOut(resetUploads);
