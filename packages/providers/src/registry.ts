import { NetworkId, type LoginProvider, type Network } from '@socioboard/contracts';

import type { LoginAdapter, NetworkAdapter } from './types';

/** A network or login that isn't configured on this server (its app keys aren't set). */
export class NetworkNotEnabledError extends Error {
  readonly code = 'NETWORK_NOT_ENABLED';
  constructor(id: string) {
    super(`${id} is not enabled on this server`);
    this.name = 'NetworkNotEnabledError';
  }
}

export interface Registry {
  login(id: LoginProvider): LoginAdapter;
  network(id: NetworkId): NetworkAdapter;
  hasLogin(id: LoginProvider): boolean;
  /** A network is enabled when its adapter and at least one login that reaches it are set up. */
  isEnabled(id: NetworkId): boolean;
  /** Enabled networks as `GET /api/v1/networks` returns them, in NetworkId order. */
  networks(): Network[];
}

/**
 * Built once at startup from the adapters whose env keys are set (the API and worker decide
 * that), so self-hosters only see what they configured. Logins are listed in the order given,
 * which is the order the UI offers them.
 */
export function createRegistry(input: {
  logins: readonly LoginAdapter[];
  networks: readonly NetworkAdapter[];
}): Registry {
  const logins = new Map(input.logins.map((l) => [l.id, l]));
  const networks = new Map(input.networks.map((n) => [n.id, n]));
  const loginsFor = (id: NetworkId) => input.logins.filter((l) => l.networks.includes(id));
  const isEnabled = (id: NetworkId) => networks.has(id) && loginsFor(id).length > 0;

  return {
    login(id) {
      const adapter = logins.get(id);
      if (!adapter) throw new NetworkNotEnabledError(id);
      return adapter;
    },
    network(id) {
      const adapter = networks.get(id);
      if (!adapter || !isEnabled(id)) throw new NetworkNotEnabledError(id);
      return adapter;
    },
    hasLogin: (id) => logins.has(id),
    isEnabled,
    networks() {
      return NetworkId.options.flatMap((id) => {
        const n = networks.get(id);
        if (!n || !isEnabled(id)) return [];
        return [
          {
            id,
            displayName: n.displayName,
            capabilities: n.capabilities,
            rules: n.rules,
            preview: n.preview,
            logins: loginsFor(id).map((l) => ({
              provider: l.id,
              supportsAccountSelection: l.supportsAccountSelection,
            })),
          },
        ];
      });
    },
  };
}
