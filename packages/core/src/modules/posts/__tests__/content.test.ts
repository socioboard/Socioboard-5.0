import type { TargetStatus } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import { deriveStatus, resolveContent } from '../content';

const targets = (...statuses: TargetStatus[]) => statuses.map((status) => ({ status }));

describe('resolveContent', () => {
  const shared = {
    text: 'Fresh roast today',
    mediaIds: ['m1', 'm2'],
    link: 'https://halden.test',
    firstComment: '#coffee',
  };

  it('uses the shared content when a network has no override', () => {
    expect(resolveContent(shared, null)).toEqual({ ...shared, options: {} });
  });

  it('an override replaces only what it sets, even with an empty value', () => {
    const r = resolveContent(shared, {
      text: '',
      options: { instagram: { format: 'reel' } },
    });
    expect(r.text).toBe('');
    expect(r.mediaIds).toEqual(['m1', 'm2']);
    expect(r.options).toEqual({ instagram: { format: 'reel' } });
    expect(resolveContent(shared, { mediaIds: [] }).mediaIds).toEqual([]);
  });
});

describe('deriveStatus', () => {
  it('keeps the editorial status while nothing has been sent', () => {
    expect(deriveStatus('draft', [])).toBe('draft');
    expect(deriveStatus('draft', targets('pending', 'pending'))).toBe('draft');
    expect(deriveStatus('approved', targets('pending'))).toBe('approved');
    // A post that was sending but lost all its targets goes back to draft.
    expect(deriveStatus('publishing', targets('cancelled'))).toBe('draft');
  });

  it('is publishing while any target is, or while some are done and others wait', () => {
    expect(deriveStatus('draft', targets('publishing', 'pending'))).toBe('publishing');
    expect(deriveStatus('failed', targets('failed', 'pending'))).toBe('publishing');
  });

  it('once every target is done: published, failed or partial', () => {
    expect(deriveStatus('publishing', targets('published', 'published'))).toBe('published');
    expect(deriveStatus('publishing', targets('failed', 'failed'))).toBe('failed');
    expect(deriveStatus('publishing', targets('published', 'failed'))).toBe('partial');
  });

  it('ignores cancelled targets', () => {
    expect(deriveStatus('publishing', targets('published', 'cancelled'))).toBe('published');
    expect(deriveStatus('scheduled', targets('scheduled', 'cancelled'))).toBe('scheduled');
  });

  it('is scheduled when every remaining target is scheduled', () => {
    expect(deriveStatus('draft', targets('scheduled', 'scheduled'))).toBe('scheduled');
    expect(deriveStatus('draft', targets('scheduled', 'pending'))).toBe('draft');
  });
});
