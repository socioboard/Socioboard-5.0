// P3-Q2: every provider is held to the provider contract. Each provider folder (meta, x, and each
// phase 3 network as it lands) needs a contract test that ends with describeContractCoverage, so
// none of its logins or networks can go without a suite; the suites themselves require the
// success, auth, rate-limit and content-refusal cases (testing/contract.ts).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = new URL('../', import.meta.url);
const NOT_PROVIDERS = new Set(['__tests__', '__fixtures__', 'testing']);

const providers = readdirSync(src, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !NOT_PROVIDERS.has(d.name))
  .map((d) => d.name);

describe('contract coverage', () => {
  it('finds the providers', () => {
    expect(providers).toEqual(expect.arrayContaining(['meta', 'x']));
  });

  it.each(providers)('%s has a contract test that checks all its adapters are covered', (name) => {
    const file = new URL(`${name}/__tests__/contract.test.ts`, src);
    expect(existsSync(file), `${name}/__tests__/contract.test.ts is missing`).toBe(true);
    expect(readFileSync(file, 'utf8')).toMatch(/describeContractCoverage\(/);
  });
});
