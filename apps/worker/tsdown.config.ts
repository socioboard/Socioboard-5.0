import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  // Workspace packages ship TypeScript source, so bundle them into the app.
  noExternal: [/^@socioboard\//],
});
