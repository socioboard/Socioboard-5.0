// The provider contract (docs/backend/modules/providers.md): what every login and network adapter
// must do, whatever the network. Each adapter's contract test runs these suites against its
// recordings, so a new network (phase 3) is checked the same way as Meta.
import {
  ContentRules,
  NetworkCapabilities,
  PreviewSpec,
  ValidationIssue,
  type PublishErrorKind,
} from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../errors';
import type {
  AccountCredentials,
  LoginAdapter,
  NetworkAdapter,
  PublishInput,
  TokenSet,
} from '../types';
import { replayFetch, type RecordedCall, type Replay } from './replay';

type Make<T> = (calls: RecordedCall[]) => { adapter: T; replay: Replay };

/**
 * The publish failures every network's contract must cover (P3-Q2): the network refusing the
 * token, limiting us, and refusing the content. A temporary failure (`retryable`) is optional:
 * the shared HTTP client handles most of those the same way for every network.
 */
export const REQUIRED_FAILURES = ['auth', 'rate_limited', 'content'] as const;
type Failures = Record<(typeof REQUIRED_FAILURES)[number], RecordedCall[]> &
  Partial<Record<PublishErrorKind, RecordedCall[]>>;

/** Adapter ids that have a contract suite in this test file (see describeContractCoverage). */
const covered = { logins: new Set<string>(), networks: new Set<string>() };

const httpUrl = (v: string | null) => v === null || /^https?:\/\//.test(v);

export function describeLoginContract(
  name: string,
  make: Make<LoginAdapter>,
  rec: {
    tokens: TokenSet;
    identity: RecordedCall[];
    assets: RecordedCall[];
    /** The network's answer to a token it doesn't accept. */
    invalidToken: RecordedCall[];
  },
) {
  covered.logins.add(make([]).adapter.id);
  describe(`${name}: login contract`, () => {
    it('builds a sign-in URL that carries the state and our callback', () => {
      const { adapter } = make([]);
      const url = new URL(
        adapter.getAuthUrl({
          state: 'state-123',
          redirectUri: 'https://app.test/api/oauth/x/callback',
          // Logins that use PKCE (X) need the pair; the service always makes one for them.
          ...(adapter.usesPkce ? { pkce: { verifier: 'verifier', challenge: 'challenge' } } : {}),
        }),
      );
      expect(url.protocol).toBe('https:');
      expect(url.toString()).toContain('state-123');
      expect(decodeURIComponent(url.toString())).toContain('https://app.test/api/oauth/x/callback');
    });

    it('says who signed in', async () => {
      const { adapter, replay } = make(rec.identity);
      const who = await adapter.getIdentity(rec.tokens);
      expect(who.externalUserId).toMatch(/\S/);
      expect(who.displayName).toMatch(/\S/);
      expect(who.displayName).toBe(who.displayName.trim());
      expect(httpUrl(who.avatarUrl)).toBe(true);
      expect(replay.mismatches).toEqual([]);
    });

    it('lists assets of its own networks, each complete', async () => {
      const { adapter, replay } = make(rec.assets);
      const assets = await adapter.listAssets(rec.tokens);
      expect(assets.length).toBeGreaterThan(0);
      for (const a of assets) {
        expect(adapter.networks).toContain(a.network);
        expect(a.externalId).toMatch(/\S/);
        expect(a.displayName).toBe(a.displayName.trim());
        expect(a.displayName).toMatch(/\S/);
        expect(httpUrl(a.avatarUrl)).toBe(true);
        expect([null, 'not_professional', 'missing_permission']).toContain(a.unavailableReason);
        expect(a.token === null || a.token.accessToken.length > 0).toBe(true);
      }
      const keys = assets.map((a) => `${a.network}:${a.externalId}`);
      expect(new Set(keys).size).toBe(keys.length);
      expect(replay.mismatches).toEqual([]);
    });

    it('treats a token the network refuses as "sign in again"', async () => {
      const { adapter } = make(rec.invalidToken);
      const err = await adapter.getIdentity(rec.tokens).catch((e: unknown) => e);
      expect(isProviderError(err) && err.kind).toBe('auth');
    });
  });
}

export function describeNetworkContract(
  name: string,
  make: Make<NetworkAdapter>,
  rec: {
    account: AccountCredentials;
    /** A post this network accepts, and the recorded calls that publish it. */
    input: PublishInput;
    publish: RecordedCall[];
    /** Recorded failures of that same publish, by the kind they must become. */
    errors: Failures;
  },
) {
  covered.networks.add(make([]).adapter.id);
  describe(`${name}: network contract`, () => {
    it('describes itself with valid capabilities, rules and preview', () => {
      const { adapter } = make([]);
      expect(NetworkCapabilities.safeParse(adapter.capabilities).success).toBe(true);
      expect(ContentRules.safeParse(adapter.rules).success).toBe(true);
      expect(PreviewSpec.safeParse(adapter.preview).success).toBe(true);
      expect(adapter.displayName).toMatch(/\S/);
    });

    it('validates without side effects: valid issues, same answer twice, input untouched', () => {
      const { adapter, replay } = make([]);
      const before = JSON.stringify(rec.input);
      const first = adapter.validate(rec.input);
      expect(adapter.validate(rec.input)).toEqual(first);
      expect(JSON.stringify(rec.input)).toBe(before);
      for (const i of first) expect(ValidationIssue.safeParse(i).success).toBe(true);
      // The post the contract publishes is one the network accepts.
      expect(first.filter((i) => i.severity === 'error')).toEqual([]);
      expect(replay.seen).toEqual([]);
    });

    it('publishes and returns the external id and a link', async () => {
      const { adapter, replay } = make(rec.publish);
      const result = await adapter.publish(rec.input, rec.account);
      expect(result.externalId).toMatch(/\S/);
      expect(httpUrl(result.permalink)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(replay.mismatches).toEqual([]);
      expect(replay.remaining()).toEqual([]);
    });

    for (const [kind, calls] of Object.entries(rec.errors)) {
      it(`turns the network's ${kind} failure into a ProviderError of kind ${kind}`, async () => {
        const { adapter } = make(calls);
        const err = await adapter.publish(rec.input, rec.account).catch((e: unknown) => e);
        expect(isProviderError(err)).toBe(true);
        expect(isProviderError(err) && err.kind).toBe(kind);
        expect(isProviderError(err) && err.message).toMatch(/\S/);
      });
    }
  });
}

/**
 * Checks that every login and network a provider's factory creates (with all its options
 * configured) has a contract suite in this file. Each provider's contract test ends with it, and
 * `src/__tests__/contract-coverage.test.ts` checks every provider's contract test does.
 */
export function describeContractCoverage(
  provider: string,
  adapters: { logins: readonly LoginAdapter[]; networks: readonly NetworkAdapter[] },
) {
  describe(`${provider}: contract coverage`, () => {
    it('every login and network it creates has a contract suite', () => {
      expect({
        logins: adapters.logins.map((l) => l.id).filter((id) => !covered.logins.has(id)),
        networks: adapters.networks.map((n) => n.id).filter((id) => !covered.networks.has(id)),
      }).toEqual({ logins: [], networks: [] });
    });
  });
}

/** Builds a `make` for adapters created from a fetch (as every adapter factory takes). */
export function withReplay<T>(create: (fetch: typeof globalThis.fetch) => T): Make<T> {
  return (calls) => {
    const replay = replayFetch(calls);
    return { adapter: create(replay.fetch), replay };
  };
}
