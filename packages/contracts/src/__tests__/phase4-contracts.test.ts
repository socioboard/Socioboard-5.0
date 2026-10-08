// Phase 4 contracts: the AI service's payloads as its API reference shows them (2026-10-08), so a
// change on either side shows up here first.
import { describe, expect, it } from 'vitest';

import { AiImageInput, AiResultUpdate, CreateAiJobBody } from '../ai';

const reference = '0190f5e0-0000-7000-8000-000000000001';

describe('AI result update', () => {
  it("takes the AI service's final result: files, joined text and its parts", () => {
    const update = AiResultUpdate.parse({
      reference,
      jobId: 'job_83af',
      status: 'succeeded',
      outputs: [
        {
          option: 0,
          type: 'image',
          key: 'ai_7Qm2cKp9',
          mime: 'image/png',
          width: 1080,
          height: 1350,
          durationSec: null,
          sizeBytes: 1843200,
        },
      ],
      text: ['Fresh roast, Monday mood. #coffee #morning  Order today.'],
      copies: [
        {
          caption: 'Fresh roast, Monday mood.',
          hashtags: ['coffee', 'morning'],
          cta: 'Order today.',
        },
      ],
      usage: { model: 'example-image-model', tokens: 0, images: 2, seconds: 0 },
    });
    expect(update.copies[0]?.hashtags).toEqual(['coffee', 'morning']);
  });

  it('takes progress without usage, and usage null', () => {
    expect(
      AiResultUpdate.safeParse({ reference, jobId: 'j', status: 'running', progress: 0.4 }).success,
    ).toBe(true);
    expect(
      AiResultUpdate.safeParse({
        reference,
        jobId: 'j',
        status: 'running',
        progress: 0.4,
        usage: null,
      }).success,
    ).toBe(true);
  });

  it('needs usage when a job ends, and an error with a label when it failed', () => {
    expect(
      AiResultUpdate.safeParse({ reference, jobId: 'j', status: 'succeeded', text: ['Hi'] })
        .success,
    ).toBe(false);
    const failed = {
      reference,
      jobId: 'j',
      status: 'failed',
      usage: { model: 'm', tokens: 0, images: 0, seconds: 0 },
    };
    expect(AiResultUpdate.safeParse(failed).success).toBe(false);
    expect(
      AiResultUpdate.safeParse({
        ...failed,
        error: {
          code: 'content_policy',
          label: "We can't create images of real people.",
          message: 'Provider safety block: person_likeness (HTTP 400)',
          retryable: false,
        },
      }).success,
    ).toBe(true);
  });
});

describe('AI image input', () => {
  it('defaults to one plain post and refuses more than five reference images', () => {
    expect(AiImageInput.parse({ prompt: 'Coffee beans' })).toEqual({
      prompt: 'Coffee beans',
      postType: 'post',
      count: 1,
      referenceAssetIds: [],
    });
    const six = Array.from(
      { length: 6 },
      (_, i) => `0190f5e0-0000-7000-8000-00000000001${String(i)}`,
    );
    expect(AiImageInput.safeParse({ prompt: 'x', referenceAssetIds: six }).success).toBe(false);
  });

  it('makes images and captions; video comes later', () => {
    expect(CreateAiJobBody.safeParse({ type: 'image', input: { prompt: 'x' } }).success).toBe(true);
    const caption = CreateAiJobBody.safeParse({
      type: 'text',
      input: { prompt: 'Caption this', count: 3, referenceAssetIds: [reference] },
    });
    expect(caption.success).toBe(true);
    expect(CreateAiJobBody.safeParse({ type: 'video', input: { prompt: 'x' } }).success).toBe(
      false,
    );
    expect(
      CreateAiJobBody.safeParse({ type: 'text', input: { prompt: 'x', count: 5 } }).success,
    ).toBe(false);
  });
});
