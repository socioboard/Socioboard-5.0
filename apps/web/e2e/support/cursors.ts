import { expect, type Page } from '@playwright/test';

/**
 * Every visible control shows the hand when it can be used and "not allowed" when it can't
 * (docs/frontend/design-system.md). Checked on each screen the end-to-end tests pass through,
 * so a new control without the right cursor fails the run. The dev build's router and query
 * devtools are not part of the app and are skipped.
 */
export async function expectRightCursors(page: Page, where: string) {
  const wrong = await page.evaluate(() => {
    const controls = document.querySelectorAll(
      'button, a[href], summary, select, label[for], input[type=checkbox], input[type=radio], ' +
        'input[type=file], [role=button], [role=tab], [role=link], [role=menuitem], ' +
        '[role=menuitemradio], [role=menuitemcheckbox], [role=option], [role=radio], ' +
        '[role=checkbox], [role=switch]',
    );
    const out: string[] = [];
    for (const el of controls) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (getComputedStyle(el).visibility !== 'visible') continue;
      if (el.closest('.TanStackRouterDevtools, .tsqd-parent-container')) continue;
      const name = (el.getAttribute('aria-label') ?? el.textContent).trim().slice(0, 40);
      if (/tanstack|devtools/i.test(name)) continue;
      const disabled = el.matches(':disabled, [aria-disabled="true"], [data-disabled]');
      const cursor = getComputedStyle(el).cursor;
      const ok = cursor === (disabled ? 'not-allowed' : 'pointer') || /wait|progress/.test(cursor);
      if (!ok) out.push(`<${el.tagName.toLowerCase()}> "${name}": ${cursor}`);
    }
    return out;
  });
  expect(wrong, `controls with the wrong cursor on ${where}`).toEqual([]);
}
