import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Vitest runs from the package folder.
const src = join(process.cwd(), 'src');

function storyFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : storyFiles(path);
    return entry.name.endsWith('.stories.tsx') ? [path] : [];
  });
}

/** Runtime exports named like components (types, helpers and hooks excluded). */
function exportedComponents(): string[] {
  const index = readFileSync(join(src, 'index.ts'), 'utf8');
  const names = [...index.matchAll(/export \{([^}]+)\}/g)].flatMap((m) =>
    (m[1] ?? '')
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n && !n.startsWith('type ')),
  );
  // PascalCase only: constants like THEME_STORAGE_KEY are not components.
  return names.filter((n) => /^[A-Z][a-z]/.test(n));
}

// Frame pieces every story already runs inside (see .ladle/components.tsx), and DialogOverlay,
// the scrim other overlays render for you.
const PROVIDED = new Set([
  'ThemeProvider',
  'MotionProvider',
  'TooltipProvider',
  'Toaster',
  'Backdrop',
  'DialogOverlay',
]);

describe('component catalog', () => {
  it('has a story rendering every exported component', () => {
    const stories = storyFiles(src)
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n');
    const missing = exportedComponents().filter(
      // Rendered as an element, not merely imported.
      (name) => !PROVIDED.has(name) && !new RegExp(`<${name}[\\s/>]`).test(stories),
    );
    expect(missing).toEqual([]);
  });
});
