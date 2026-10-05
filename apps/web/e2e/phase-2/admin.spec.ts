// P2-F6 in a real browser: the admin console against fixed API answers (a platform admin with 2FA
// verified needs a real 2FA sign-in, which the API's own tests cover). It checks the pages render,
// the reason dialog works, cursors are right and nothing overflows on a phone.
import { expect, test, type Page } from '@playwright/test';

import { expectRightCursors } from '../support/cursors';

const WID = '01a0d816-827a-74d6-a46e-409c7db36f93';
const T1 = '01a0d816-827a-74d6-a46e-409c7db35001';

async function adminServer(page: Page) {
  const writes: { path: string; body: unknown }[] = [];
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/api/v1/me')
      return json(200, {
        user: {
          id: '01a0d816-827a-74d6-a46e-409c7db36f92',
          email: 'staff@socioboard.test',
          emailVerified: true,
          name: 'Sam Staff',
          avatarUrl: null,
          timezone: 'UTC',
          locale: 'en',
          twoFactorEnabled: true,
          isPlatformAdmin: true,
          createdAt: '2026-09-28T10:00:00Z',
        },
        memberships: [
          {
            workspace: {
              id: WID,
              name: 'Halden Coffee',
              slug: 'halden',
              logoUrl: null,
              timezone: 'UTC',
            },
            role: 'owner',
          },
        ],
        activeWorkspaceId: WID,
      });
    if (path === '/api/v1/auth/options')
      return json(200, { socialProviders: [], emailVerificationRequired: true });
    if (path === '/api/admin/overview')
      return json(200, {
        generatedAt: new Date().toISOString(),
        signups24h: 12,
        activeWorkspaces30d: 340,
        published24h: 1820,
        failed24h: 7,
        stuckTargets: 2,
        accountsNeedingAttention: 4,
        queues: [
          { name: 'publish', waiting: 3, delayed: 120, active: 1, failed: 0 },
          { name: 'notifications', waiting: 0, delayed: 0, active: 0, failed: 4 },
          { name: 'reconcile', waiting: 0, delayed: 1, active: 0, failed: 0 },
        ],
      });
    if (path === '/api/admin/publishing/health')
      return json(200, {
        range: '24h',
        generatedAt: new Date().toISOString(),
        networks: [
          {
            network: 'facebook_page',
            published: 980,
            failed: 20,
            retried: 31,
            successRate: 0.98,
            topErrors: [
              {
                kind: 'auth',
                networkCode: '190',
                message: 'Error validating access token',
                count: 12,
              },
              { kind: 'retryable', networkCode: null, message: 'Facebook timed out', count: 8 },
            ],
          },
          {
            network: 'instagram',
            published: 410,
            failed: 45,
            retried: 12,
            successRate: 0.901,
            topErrors: [
              {
                kind: 'content',
                networkCode: '36003',
                message: 'Aspect ratio not supported',
                count: 30,
              },
            ],
          },
        ],
      });
    if (path === '/api/admin/publishing/failed')
      return json(200, {
        items: [
          {
            id: T1,
            postId: '01a0d816-827a-74d6-a46e-409c7db34001',
            workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
            account: {
              id: '01a0d816-827a-74d6-a46e-409c7db31001',
              network: 'facebook_page',
              displayName: 'Halden Roastery',
              username: null,
              status: 'active',
            },
            status: 'failed',
            stuck: false,
            scheduledAt: null,
            attempts: 5,
            lastAttemptAt: new Date().toISOString(),
            lastError: { kind: 'retryable', networkCode: null, message: 'Facebook timed out' },
          },
        ],
        nextCursor: null,
      });
    if (path === `/api/admin/publishing/targets/${T1}/retry`) {
      writes.push({ path, body: request.postDataJSON() });
      return json(202, {});
    }
    if (path === '/api/admin/accounts/expiring')
      return json(200, {
        items: [
          {
            id: '01a0d816-827a-74d6-a46e-409c7db31002',
            workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
            network: 'instagram',
            displayName: 'halden.coffee',
            username: 'halden.coffee',
            status: 'reauth_required',
            statusReason: 'The password was changed.',
            tokenExpiresAt: null,
            lastCheckedAt: new Date().toISOString(),
            scheduledTargets: 3,
          },
        ],
        nextCursor: null,
      });
    if (path.startsWith('/api/admin/queues'))
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Bull Board</h1>' });
    if (path === '/api/v1/notifications')
      return json(200, { items: [], nextCursor: null, unreadCount: 0 });
    return json(404, { error: { code: 'NOT_FOUND', message: path } });
  });
  return { writes };
}

test('the admin console: overview, publishing with a retry, queues and accounts', async ({
  page,
}) => {
  const server = await adminServer(page);
  await page.goto('/admin');
  const nav = page.getByRole('navigation', { name: 'Admin console' });
  await expect(page.getByRole('region', { name: 'Last 24 hours' })).toContainText('1,820');
  await expectRightCursors(page, 'admin overview');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/admin-overview.png' });

  await nav.getByRole('link', { name: 'Publishing', exact: true }).click();
  await expect(page.getByText('98%')).toBeVisible();
  await expectRightCursors(page, 'admin publishing');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/admin-publishing.png', fullPage: true });
  await page.getByRole('button', { name: 'Retry Halden Roastery' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: /Why/ }).fill('Facebook outage ended');
  await expectRightCursors(page, 'admin reason dialog');
  await dialog.getByRole('button', { name: 'Retry' }).click();
  await expect(dialog).toBeHidden();
  expect(server.writes[0]?.body).toEqual({ reason: 'Facebook outage ended' });

  await nav.getByRole('link', { name: 'Queues', exact: true }).click();
  await expect(page.frameLocator('iframe[title="Bull Board"]').getByRole('heading')).toHaveText(
    'Bull Board',
  );
  await nav.getByRole('link', { name: 'Accounts', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Accounts needing attention' })).toContainText(
    'The password was changed.',
  );
  await expectRightCursors(page, 'admin accounts');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/admin');
  await expect(page.getByRole('region', { name: 'Last 24 hours' })).toContainText('1,820');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/admin-overview-dark.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/publishing');
  await expect(page.getByText('98%')).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
