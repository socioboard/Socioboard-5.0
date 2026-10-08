import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { MEDIA_MAX_BYTES, MEDIA_MIME_KINDS, MediaAsset, MediaKind, MediaMime } from './media';
import { NetworkId } from './networks';
import { defineRoute } from './route';

// AI generation (P4-C2, docs/backend/modules/ai.md). No templates: each type has fixed inputs,
// sent to the AI service as they are. The last two routes are the ones the AI service calls,
// specified for its team in docs/backend/ai-callbacks.openapi.yaml.

export const AiJobType = z.enum(['text', 'image', 'video']);
export type AiJobType = z.infer<typeof AiJobType>;

export const AI_PROMPT_MAX = 2_000;
const Prompt = z.string().trim().min(1).max(AI_PROMPT_MAX);

export const AiTone = z.enum(['friendly', 'professional', 'playful', 'bold']);
export const AiTextLength = z.enum(['short', 'medium', 'long']);
export const AiImageRatio = z.enum(['1:1', '4:5', '9:16', '16:9']);
export const AiVideoRatio = z.enum(['9:16', '16:9', '1:1']);
export const AI_VIDEO_MIN_SEC = 5;
export const AI_VIDEO_MAX_SEC = 60;

export const AiTextInput = z.object({
  prompt: Prompt,
  tone: AiTone,
  length: AiTextLength,
  variations: z.number().int().min(1).max(5),
});
export const AiImageInput = z.object({
  prompt: Prompt,
  aspectRatio: AiImageRatio,
  count: z.number().int().min(1).max(4),
  /** A library image to start from; sent to the AI service as a signed URL. */
  referenceAssetId: Id.optional(),
});
export const AiVideoInput = z.object({
  prompt: Prompt,
  aspectRatio: AiVideoRatio,
  durationSec: z.number().int().min(AI_VIDEO_MIN_SEC).max(AI_VIDEO_MAX_SEC),
  referenceAssetId: Id.optional(),
});

/** What the person asked for: the type and its inputs. */
export const AiRequest = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), input: AiTextInput }),
  z.object({ type: z.literal('image'), input: AiImageInput }),
  z.object({ type: z.literal('video'), input: AiVideoInput }),
]);
export type AiRequest = z.infer<typeof AiRequest>;

const Networks = z
  .array(NetworkId)
  .max(NetworkId.options.length)
  .refine((n) => new Set(n).size === n.length, 'The same network is given twice');

export const AI_INSTRUCTION_MAX = 500;

export const CreateAiJobBody = z.intersection(
  AiRequest,
  z.object({
    /** Networks the result is for: their limits are sent so outputs fit. */
    networks: Networks.default([]),
    /** A follow-up ("shorter", "less formal") on an earlier job, whose results go as context. */
    refine: z
      .object({ jobId: Id, instruction: z.string().trim().min(1).max(AI_INSTRUCTION_MAX) })
      .optional(),
  }),
);
export type CreateAiJobBody = z.infer<typeof CreateAiJobBody>;

export const AiJobStatus = z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']);
export type AiJobStatus = z.infer<typeof AiJobStatus>;

export const AiJob = z.intersection(
  AiRequest,
  z.object({
    id: Id,
    networks: z.array(NetworkId),
    refinesJobId: Id.nullable(),
    instruction: z.string().nullable(),
    status: AiJobStatus,
    /** 0 to 1 while running, when the AI service reports it. */
    progress: z.number().min(0).max(1).nullable(),
    /** Generated text, one entry per variation. */
    text: z.array(z.string()),
    /** Generated files, in the media library (source `ai`). */
    assets: z.array(MediaAsset),
    /** Null until the job ends, and on self-hosted servers without billing. */
    creditsUsed: z.number().int().nonnegative().nullable(),
    /** `CONTENT_POLICY` when the AI service refused the request; its message is shown as is. */
    error: z.object({ code: z.string(), message: z.string() }).nullable(),
    createdAt: IsoDateTime,
    finishedAt: IsoDateTime.nullable(),
  }),
);
export type AiJob = z.infer<typeof AiJob>;

export const AiStatus = z.object({
  /** False when this server has no AI service: the UI hides AI. */
  enabled: z.boolean(),
  types: z.array(AiJobType),
});
export type AiStatus = z.infer<typeof AiStatus>;

// ── Called by the AI service (signed with X-Socioboard-Signature) ───────────────────────────────

export const AI_MAX_OUTPUTS = 20;
export const AI_MAX_TEXTS = 10;
export const AI_TEXT_MAX = 10_000;

export const AiUploadRequest = z
  .object({ mime: MediaMime, sizeBytes: z.number().int().positive() })
  .refine((b) => b.sizeBytes <= MEDIA_MAX_BYTES[MEDIA_MIME_KINDS[b.mime]], {
    message: 'Too large for this type of file',
    path: ['sizeBytes'],
  });
export type AiUploadRequest = z.infer<typeof AiUploadRequest>;

export const AiUploadSlot = z.object({
  /** Names this file in the result update. Opaque to the AI service. */
  key: z.string(),
  uploadUrl: z.url(),
  method: z.literal('PUT'),
  /** Sent exactly with the PUT. */
  headers: z.record(z.string(), z.string()),
  expiresAt: IsoDateTime,
});
export type AiUploadSlot = z.infer<typeof AiUploadSlot>;

export const AiOutput = z.object({
  type: MediaKind,
  key: z.string().min(1),
  mime: MediaMime,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationSec: z.number().nonnegative().nullable(),
  sizeBytes: z.number().int().positive(),
});

export const AiUsage = z.object({
  model: z.string().min(1).max(200),
  tokens: z.number().int().nonnegative(),
  images: z.number().int().nonnegative(),
  seconds: z.number().nonnegative(),
});
export type AiUsage = z.infer<typeof AiUsage>;

export const AiResultUpdate = z
  .object({
    reference: Id,
    jobId: z.string().min(1).max(200),
    status: z.enum(['running', 'succeeded', 'failed']),
    progress: z.number().min(0).max(1).optional(),
    outputs: z.array(AiOutput).max(AI_MAX_OUTPUTS).default([]),
    text: z.array(z.string().max(AI_TEXT_MAX)).max(AI_MAX_TEXTS).default([]),
    usage: AiUsage.optional(),
    error: z
      .object({
        code: z.string().min(1).max(100),
        message: z.string().max(2_000),
        retryable: z.boolean(),
      })
      .optional(),
  })
  .superRefine((u, ctx) => {
    if (u.status === 'running') return;
    if (!u.usage)
      ctx.addIssue({ code: 'custom', path: ['usage'], message: 'Required when the job ends' });
    if (u.status === 'failed' && !u.error) {
      ctx.addIssue({ code: 'custom', path: ['error'], message: 'Required when the job failed' });
    }
    if (u.status === 'succeeded' && u.outputs.length === 0 && u.text.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['outputs'],
        message: 'A finished job needs an output or text',
      });
    }
  });
export type AiResultUpdate = z.infer<typeof AiResultUpdate>;

const workspaceParams = z.object({ workspaceId: Id });
const jobParams = workspaceParams.extend({ jobId: Id });

export const aiRoutes = {
  getAiStatus: defineRoute({
    method: 'GET',
    path: '/api/v1/ai',
    access: 'user',
    summary: 'Whether AI generation is available on this server, and for which types',
    responses: { 200: AiStatus },
  }),
  createAiJob: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/ai/jobs',
    access: 'ai:generate',
    summary:
      'Start generating; send an Idempotency-Key header. Text may come back finished at once',
    params: workspaceParams,
    body: CreateAiJobBody,
    responses: { 201: AiJob },
  }),
  listAiJobs: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/ai/jobs',
    access: 'ai:generate',
    summary: 'My recent AI jobs, newest first',
    params: workspaceParams,
    query: PageQuery,
    responses: { 200: page(AiJob) },
  }),
  getAiJob: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/ai/jobs/:jobId',
    access: 'ai:generate',
    summary: 'One AI job: status, progress, results',
    params: jobParams,
    responses: { 200: AiJob },
  }),
  cancelAiJob: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/ai/jobs/:jobId/cancel',
    access: 'ai:generate',
    summary: 'Stop waiting for a job; its result is ignored when it arrives',
    params: jobParams,
    responses: { 200: AiJob },
  }),

  createAiUpload: defineRoute({
    method: 'POST',
    path: '/api/v1/ai/callbacks/jobs/:reference/uploads',
    // The AI service, by its signature: checked in the service.
    access: 'public',
    summary: 'AI service: an upload slot for one output file of a running job',
    params: z.object({ reference: Id }),
    body: AiUploadRequest,
    responses: { 201: AiUploadSlot },
  }),
  aiResultUpdate: defineRoute({
    method: 'POST',
    path: '/api/v1/ai/callbacks/result',
    // The AI service, by its signature: checked in the service.
    access: 'public',
    summary: "AI service: a job's progress or result",
    body: AiResultUpdate,
    responses: { 204: null },
  }),
};
