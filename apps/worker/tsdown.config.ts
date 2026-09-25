import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/main.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  deps: {
    // Workspace packages ship TypeScript source, so they are always bundled, and with them
    // their npm dependencies. The app's own dependencies stay external (installed in the image).
    alwaysBundle: [/^@socioboard\//],
    onlyBundle: false,
    // Native addons can't be bundled (they load a platform binary from their own folder), so
    // they stay external and are dependencies of this app.
    neverBundle: ['sharp'],
  },
});
