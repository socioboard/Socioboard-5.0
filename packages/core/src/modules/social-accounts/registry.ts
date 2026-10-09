import {
  createMetaAdapters,
  createRegistry,
  createXAdapters,
  createLinkedInAdapters,
  createPinterestAdapters,
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
    threads: config.networks.threads,
    version: config.networks.graphVersion,
    logger,
  });
  const x = createXAdapters({ x: config.networks.x, logger });
  const linkedin = createLinkedInAdapters({ linkedin: config.networks.linkedin, logger });
  const pinterest = createPinterestAdapters({
    pinterest: config.networks.pinterest,
    sandbox: config.networks.pinterest?.sandbox === true,
    logger,
  });
  const registry = createRegistry({
    logins: [...meta.logins, ...x.logins, ...linkedin.logins, ...pinterest.logins],
    networks: [...meta.networks, ...x.networks, ...linkedin.networks, ...pinterest.networks],
  });
  const enabled = registry.networks().map((n) => n.id);
  logger.info(
    { networks: enabled },
    enabled.length ? 'social networks enabled' : 'no social networks configured',
  );
  return registry;
}
