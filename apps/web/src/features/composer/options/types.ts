import type {
  AccountOptionChoices,
  NetworkId,
  SocialAccount,
  TargetOptions,
  TargetOptionsKey,
} from '@socioboard/contracts';
import type { ComponentType } from 'react';

/** One selected account of the panel's network. */
export interface PanelAccount {
  account: SocialAccount;
  /** What it offers (boards, privacy levels…); `undefined` for panels that ask for nothing. */
  choices: AccountOptionChoices | undefined;
  /** Its own settings (`ACCOUNT_OPTION_FIELDS`), only the keys that apply to its network. */
  own: TargetOptions;
  /** Merges into its own settings under `key`; `undefined` clears a setting. */
  setOwn: (key: TargetOptionsKey, values: Record<string, unknown>) => void;
}

export interface OptionsPanelProps {
  network: NetworkId;
  /** The selected accounts of this network whose choices are in, in the order picked. */
  accounts: PanelAccount[];
  /** The network's settings, shared by all its accounts. */
  options: TargetOptions;
  /** Merges into the network's settings under `key`; `undefined` clears a setting. */
  set: (key: TargetOptionsKey, values: Record<string, unknown>) => void;
}

export interface OptionsPanel {
  Component: ComponentType<OptionsPanelProps>;
  /** Asks each account for its choices (`GET …/accounts/:id/options`) before showing. */
  needsChoices: boolean;
}
