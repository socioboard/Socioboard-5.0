// The chaos suite's network: Meta's real adapters (rules, validation, rate limits), with publish
// replaced by a ledger. Each call is written to a file the moment the "network" receives it, then
// takes PUBLISH_MS, like a real call during which a worker can die. The file outlives every
// process the suite kills, so it is the truth about what reached the network.
import { appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';

import { createMetaAdapters, createRegistry, type NetworkAdapter } from '@socioboard/providers';

export const PUBLISH_MS = 1_500;

/** One line of the ledger: a post the network received. */
export interface Sent {
  text: string;
  pid: number;
  at: number;
}

export function ledgerRegistry(ledger: string) {
  const { logins, networks } = createMetaAdapters({
    facebook: { appId: 'chaos', appSecret: 'chaos' },
    instagram: { appId: 'chaos', appSecret: 'chaos' },
    fetch: () => Promise.reject(new Error('the chaos suite never calls Meta')),
  });
  const played = networks.map((n): NetworkAdapter => ({
    ...n,
    async publish(input) {
      const sent: Sent = { text: input.text, pid: process.pid, at: Date.now() };
      appendFileSync(ledger, `${JSON.stringify(sent)}\n`);
      await sleep(PUBLISH_MS);
      return { externalId: `chaos-${randomUUID()}`, permalink: null, warnings: [] };
    },
  }));
  return createRegistry({ logins, networks: played });
}
