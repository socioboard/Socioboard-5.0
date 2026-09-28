import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY } from '@socioboard/ui';

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
const html = read('../../../index.html');
const tokens = read('../../../../../packages/ui/src/styles.css');

describe('index.html first paint', () => {
  it('uses the same base colors as the design tokens', () => {
    const [light, dark] = [...tokens.matchAll(/--sb-base: (#[0-9a-f]{6});/g)].map((m) => m[1]);
    expect(html).toContain(`html { background: ${String(light)}; }`);
    expect(html).toContain(`html.dark { background: ${String(dark)};`);
  });

  it('reads the theme from the same storage key as ThemeProvider', () => {
    expect(html).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
  });
});
