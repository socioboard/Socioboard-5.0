import type { Me } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import { halden, meWith } from '../../testing/render';
import { routeAfterSignIn, safeRedirect, withRedirect } from '../redirect';

describe('safeRedirect', () => {
  it('keeps paths inside the app, with their query and hash', () => {
    expect(safeRedirect('/invite/abc')).toBe('/invite/abc');
    expect(safeRedirect('/w/halden/posts?status=failed#top')).toBe(
      '/w/halden/posts?status=failed#top',
    );
  });

  it.each([
    ['another site', 'https://evil.test/phish'],
    ['protocol-relative', '//evil.test'],
    ['backslash trick', '/\\evil.test'],
    ['javascript', 'javascript:alert(1)'],
    ['relative path', 'invite/abc'],
    ['empty', ''],
    ['not a string', 42],
  ])('drops %s', (_label, value) => {
    expect(safeRedirect(value)).toBeUndefined();
  });
});

describe('routeAfterSignIn', () => {
  const second = {
    workspace: {
      ...halden.workspace,
      id: '01a0d816-827a-74d6-a46e-409c7db36f94',
      slug: 'roastery',
    },
    role: 'editor',
  };

  it('sends people without a workspace to onboarding, or to verify first when required', () => {
    expect(routeAfterSignIn(meWith({}) as Me)).toBe('/onboarding');
    expect(
      routeAfterSignIn(meWith({ emailVerified: false }) as Me, { emailVerificationRequired: true }),
    ).toBe('/verify-email');
    expect(
      routeAfterSignIn(meWith({ emailVerified: false }) as Me, {
        emailVerificationRequired: false,
      }),
    ).toBe('/onboarding');
  });

  it('opens the active workspace, else the first one', () => {
    const both = { memberships: [halden, second] };
    expect(
      routeAfterSignIn(meWith({ ...both, activeWorkspaceId: second.workspace.id }) as Me),
    ).toBe('/w/roastery');
    expect(routeAfterSignIn(meWith(both) as Me)).toBe('/w/halden');
  });
});

describe('withRedirect', () => {
  it('adds the destination, encoded, only when there is one', () => {
    expect(withRedirect('/login', '/invite/abc?x=1')).toBe(
      '/login?redirect=%2Finvite%2Fabc%3Fx%3D1',
    );
    expect(withRedirect('/login')).toBe('/login');
  });
});
