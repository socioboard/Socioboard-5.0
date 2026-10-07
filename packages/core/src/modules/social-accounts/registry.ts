import {
  createMetaAdapters,
  createRegistry,
  createXAdapters,
  type Registry,
} from '@socioboard/providers';

import type { Config, Logger } from '../../platform';

/**
 * The network adapters this server has keys for (docs/backend/modules/providers.md#registry).
 * Built once per process; the API and the worker each build their own.
 */
export function createNetworkRegistry(config: Config, logger: Logger): Registry {
  const meta = createMetaAdapters({
    facebook: config.networks.facebook,
    instagram: config.networks.instagram,
    version: config.networks.graphVersion,
    logger,
  });
  const x = createXAdapters({ x: config.networks.x, logger });
  const registry = createRegistry({
    logins: [...meta.logins, ...x.logins],
    networks: [...meta.networks, ...x.networks],
  });
  const enabled = registry.networks().map((n) => n.id);
  logger.info(
    { networks: enabled },
    enabled.length ? 'social networks enabled' : 'no social networks configured',
  );
  return registry;
}
