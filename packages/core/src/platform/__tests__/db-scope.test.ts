import { describe, expect, it } from 'vitest';

import { scopeArgs, TenantScopeError } from '../db';

const W = 'ws-1';

describe('scopeArgs', () => {
  it('adds the workspace filter to reads and bulk writes', () => {
    expect(scopeArgs('findMany', undefined, W)).toEqual({ where: { workspaceId: W } });
    expect(scopeArgs('findMany', { where: { status: 'draft' }, take: 5 }, W)).toEqual({
      where: { AND: [{ status: 'draft' }, { workspaceId: W }] },
      take: 5,
    });
    for (const op of ['findFirst', 'count', 'aggregate', 'groupBy', 'deleteMany']) {
      expect(scopeArgs(op, { where: { id: 'x' } }, W).where).toEqual({
        AND: [{ id: 'x' }, { workspaceId: W }],
      });
    }
  });

  it('adds the workspace to unique lookups, so another workspace’s id is not found', () => {
    expect(scopeArgs('findUnique', { where: { id: 'p1' } }, W)).toEqual({
      where: { id: 'p1', workspaceId: W },
    });
    expect(scopeArgs('delete', { where: { id: 'p1' } }, W).where).toEqual({
      id: 'p1',
      workspaceId: W,
    });
  });

  it('stamps creates with the workspace', () => {
    expect(scopeArgs('create', { data: { title: 'a' } }, W)).toEqual({
      data: { title: 'a', workspaceId: W },
    });
    expect(scopeArgs('createMany', { data: [{ t: 1 }, { t: 2 }] }, W).data).toEqual([
      { t: 1, workspaceId: W },
      { t: 2, workspaceId: W },
    ]);
    const upsert = scopeArgs(
      'upsert',
      { where: { id: 'p1' }, create: { t: 1 }, update: { t: 2 } },
      W,
    );
    expect(upsert).toEqual({
      where: { id: 'p1', workspaceId: W },
      create: { t: 1, workspaceId: W },
      update: { t: 2 },
    });
  });

  it('refuses to write into or move rows to another workspace', () => {
    expect(() => scopeArgs('create', { data: { workspaceId: 'other' } }, W)).toThrow(
      TenantScopeError,
    );
    expect(() => scopeArgs('createMany', { data: [{ workspaceId: 'other' }] }, W)).toThrow(
      TenantScopeError,
    );
    expect(() =>
      scopeArgs('update', { where: { id: 'p1' }, data: { workspaceId: 'other' } }, W),
    ).toThrow(TenantScopeError);
    expect(() => scopeArgs('updateMany', { data: { workspaceId: 'other' } }, W)).toThrow(
      TenantScopeError,
    );
    // Setting it to the same workspace is harmless.
    expect(() => scopeArgs('create', { data: { workspaceId: W } }, W)).not.toThrow();
  });

  it('fails closed on operations it does not know', () => {
    expect(() => scopeArgs('$queryRaw', {}, W)).toThrow(/not supported/);
  });
});
