import type { NetworkId } from '@socioboard/contracts';

import { InstagramPanel } from './instagram-panel';
import type { OptionsPanel } from './types';

/**
 * The options panel of each network that has settings (P3-F2). A network's owner adds its panel
 * here with its adapter (P3-B1…B7); networks without one show no options.
 */
export const OPTION_PANELS: Partial<Record<NetworkId, OptionsPanel>> = {
  instagram: { Component: InstagramPanel, needsChoices: false },
};
