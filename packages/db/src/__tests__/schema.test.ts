import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { WORKSPACE_SCOPED_MODELS } from '../scoped-models';

const schema = readFileSync(new URL('../../prisma/schema.prisma', import.meta.url), 'utf8');
const models = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)].map(([, name, body]) => ({
  name: name ?? '',
  body: body ?? '',
}));

describe('schema conventions', () => {
  it('lists exactly the models that have a workspaceId column as workspace-scoped', () => {
    const withWorkspaceId = models
      .filter((m) => /^\s+workspaceId\s/m.test(m.body))
      .map((m) => m.name)
      .sort();
    expect([...WORKSPACE_SCOPED_MODELS].sort()).toEqual(withWorkspaceId);
  });

  it('uses UUID ids on every model', () => {
    for (const m of models) {
      expect(m.body, m.name).toMatch(/^\s+id\s+String\s+@id @default\(uuid\(7\)\) @db\.Uuid/m);
    }
  });

  it('links workspace-owned models to each other only through composite keys', () => {
    const scoped = new Set(WORKSPACE_SCOPED_MODELS);
    for (const m of models.filter((x) => scoped.has(x.name))) {
      for (const [line, target] of m.body.matchAll(/^\s+\w+\s+(\w+)\??\s+@relation\(.*$/gm)) {
        if (!target || !scoped.has(target)) continue;
        expect(line, `${m.name} -> ${target}`).toMatch(
          /fields: \[\w+, workspaceId\], references: \[id, workspaceId\]/,
        );
      }
    }
  });
});
