import {
  OPTIONS_NETWORKS,
  type NetworkId,
  type Post,
  type TargetOptions,
  type TargetOptionsKey,
  type TargetOverride,
} from '@socioboard/contracts';

/**
 * What one network gets instead of the shared content (docs/frontend/areas/composer.md,
 * "Per-network tabs"). The API keeps an override per account; the composer edits one per
 * network and gives it to every selected account of that network.
 */
export interface NetworkOverride {
  text?: string;
  mediaIds?: string[];
  options?: TargetOptions;
}

export interface Draft {
  /** Selected accounts, in the order they were picked. */
  accountIds: string[];
  text: string;
  mediaIds: string[];
  /** As typed; empty means no link. */
  link: string;
  firstComment: string;
  overrides: Partial<Record<NetworkId, NetworkOverride>>;
  /**
   * Settings that belong to one account rather than its network (`ACCOUNT_OPTION_FIELDS`: a
   * Pinterest board, a TikTok privacy level), by account id. Saving puts them over the network's.
   */
  accountOptions: Record<string, TargetOptions>;
  /** The workspace labels on the post, in the order chosen. */
  labelIds: string[];
}

export const emptyDraft = (): Draft => ({
  accountIds: [],
  text: '',
  mediaIds: [],
  link: '',
  firstComment: '',
  overrides: {},
  accountOptions: {},
  labelIds: [],
});

/**
 * Settings whose choices come from the account itself (its boards, its creator's privacy
 * levels), so two accounts of one network can't share them. Everything else is per network.
 */
export const ACCOUNT_OPTION_FIELDS: Readonly<Partial<Record<TargetOptionsKey, readonly string[]>>> =
  {
    pinterest: ['boardId'],
    tiktok: ['privacy'],
  };

/** Which network each account posts to (from the accounts list). */
export type NetworkOf = (accountId: string) => NetworkId | undefined;

export type DraftAction =
  | { type: 'accounts'; accountIds: string[] }
  | { type: 'text'; network: NetworkId | null; text: string }
  | { type: 'media'; network: NetworkId | null; mediaIds: string[] }
  /** Adds files not attached yet; before the first of `before` that's there, else at the end. */
  | { type: 'attach'; network: NetworkId | null; mediaIds: string[]; before?: string[] }
  | { type: 'link'; link: string }
  | { type: 'firstComment'; firstComment: string }
  | { type: 'labels'; labelIds: string[] }
  /**
   * A network's own settings (P3-B9; the options panels, P3-F2): merges `values` into the
   * network's options under `key`. A value of `undefined` clears that setting.
   */
  | {
      type: 'options';
      network: NetworkId;
      key: TargetOptionsKey;
      values: Record<string, unknown>;
    }
  /** One account's own settings (`ACCOUNT_OPTION_FIELDS`), merged the same way. */
  | {
      type: 'accountOptions';
      accountId: string;
      key: TargetOptionsKey;
      values: Record<string, unknown>;
    }
  | { type: 'reset'; network: NetworkId; part: 'text' | 'media' }
  | { type: 'load'; draft: Draft };

/** The options keys that apply to a network (instagram → `instagram`, pinterest → `pinterest`…). */
export function optionKeysFor(network: NetworkId): TargetOptionsKey[] {
  return (Object.keys(OPTIONS_NETWORKS) as TargetOptionsKey[]).filter((key) =>
    OPTIONS_NETWORKS[key].includes(network),
  );
}

/** A network's options without unset settings and empty keys; undefined when nothing is left. */
function tidyOptions(options: TargetOptions | undefined): TargetOptions | undefined {
  const next: Record<string, Record<string, unknown>> = {};
  for (const [key, values] of Object.entries(options ?? {})) {
    if (!values) continue;
    const kept = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));
    if (Object.keys(kept).length > 0) next[key] = kept;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

/** Drops empty parts, so an override with nothing left in it goes away. */
function tidy(o: NetworkOverride): NetworkOverride | undefined {
  const next: NetworkOverride = {};
  if (o.text !== undefined) next.text = o.text;
  if (o.mediaIds !== undefined) next.mediaIds = o.mediaIds;
  const options = tidyOptions(o.options);
  if (options) next.options = options;
  return Object.keys(next).length > 0 ? next : undefined;
}

function setOverride(
  draft: Draft,
  network: NetworkId,
  patch: (o: NetworkOverride) => NetworkOverride,
) {
  const next = tidy(patch({ ...draft.overrides[network] }));
  const overrides = Object.fromEntries(
    Object.entries(draft.overrides).filter(([key]) => key !== network),
  ) as Draft['overrides'];
  if (next) overrides[network] = next;
  return { ...draft, overrides };
}

/**
 * `network: null` edits the shared content ("All networks"); a network edits (and, the first
 * time, creates) that network's override, starting from the shared content.
 */
export function draftReducer(draft: Draft, action: DraftAction): Draft {
  switch (action.type) {
    case 'load':
      return action.draft;
    case 'accounts':
      // An account taken off the post takes its own settings with it.
      return {
        ...draft,
        accountIds: action.accountIds,
        accountOptions: Object.fromEntries(
          Object.entries(draft.accountOptions).filter(([id]) => action.accountIds.includes(id)),
        ),
      };
    case 'link':
      return { ...draft, link: action.link };
    case 'firstComment':
      return { ...draft, firstComment: action.firstComment };
    case 'labels':
      return { ...draft, labelIds: action.labelIds };
    case 'text':
      return action.network === null
        ? { ...draft, text: action.text }
        : setOverride(draft, action.network, (o) => ({ ...o, text: action.text }));
    case 'media':
      return action.network === null
        ? { ...draft, mediaIds: action.mediaIds }
        : setOverride(draft, action.network, (o) => ({ ...o, mediaIds: action.mediaIds }));
    case 'attach': {
      const current =
        action.network === null
          ? draft.mediaIds
          : (draft.overrides[action.network]?.mediaIds ?? draft.mediaIds);
      const added = action.mediaIds.filter((id) => !current.includes(id));
      const at = current.findIndex((id) => action.before?.includes(id));
      const mediaIds =
        at === -1
          ? [...current, ...added]
          : [...current.slice(0, at), ...added, ...current.slice(at)];
      return draftReducer(draft, { type: 'media', network: action.network, mediaIds });
    }
    case 'options':
      return setOverride(draft, action.network, (o) => ({
        ...o,
        options: {
          ...o.options,
          [action.key]: { ...o.options?.[action.key], ...action.values },
        },
      }));
    case 'accountOptions': {
      const current = draft.accountOptions[action.accountId];
      const next = tidyOptions({
        ...current,
        [action.key]: { ...current?.[action.key], ...action.values },
      });
      const accountOptions = Object.fromEntries(
        Object.entries(draft.accountOptions).filter(([id]) => id !== action.accountId),
      );
      if (next) accountOptions[action.accountId] = next;
      return { ...draft, accountOptions };
    }
    case 'reset':
      return setOverride(draft, action.network, (o) => {
        const next = { ...o };
        if (action.part === 'text') delete next.text;
        else delete next.mediaIds;
        return next;
      });
  }
}

/** What a network actually gets: its override where it has one, else the shared content. */
export function contentFor(draft: Draft, network: NetworkId | null) {
  const o = network ? draft.overrides[network] : undefined;
  return {
    text: o?.text ?? draft.text,
    mediaIds: o?.mediaIds ?? draft.mediaIds,
    textOverridden: o?.text !== undefined,
    mediaOverridden: o?.mediaIds !== undefined,
    /** This network's own settings (only the keys that apply to it). */
    options: network ? optionsFor(o?.options, network) : {},
    format: o?.options?.instagram?.format ?? 'feed',
  };
}

/** The options that apply to `network`; settings stored under another network's key are left out. */
function optionsFor(options: TargetOptions | undefined, network: NetworkId): TargetOptions {
  const keys = optionKeysFor(network);
  return Object.fromEntries(
    Object.entries(options ?? {}).filter(([key]) => keys.includes(key as TargetOptionsKey)),
  );
}

/** One account's own settings, only the keys that apply to its network. */
export function accountOptionsFor(
  draft: Draft,
  accountId: string,
  network: NetworkId,
): TargetOptions {
  return optionsFor(draft.accountOptions[accountId], network);
}

/** The network's settings with the account's own over them, as that account's target gets them. */
function mergedOptions(
  network: TargetOptions | undefined,
  account: TargetOptions | undefined,
): TargetOptions {
  const merged: Record<string, Record<string, unknown> | undefined> = { ...network };
  for (const [key, values] of Object.entries(account ?? {})) {
    merged[key] = { ...merged[key], ...values };
  }
  return merged;
}

/** Networks of the selected accounts, each once, in the order first picked. */
export function selectedNetworks(draft: Draft, networkOf: NetworkOf): NetworkId[] {
  const seen: NetworkId[] = [];
  for (const id of draft.accountIds) {
    const n = networkOf(id);
    if (n && !seen.includes(n)) seen.push(n);
  }
  return seen;
}

/** A post's content and targets as the API takes them (create, update and validate). */
export interface PostBody {
  text: string;
  mediaIds: string[];
  link: string | null;
  firstComment: string | null;
  labelIds: string[];
  targets: { accountId: string; override: TargetOverride | null }[];
}

/**
 * The draft as the API's post body. Each account gets its network's override; overrides of
 * networks no longer selected are left out (they'd be refused, and mean nothing without one).
 */
export function toPostBody(draft: Draft, networkOf: NetworkOf): PostBody {
  const link = draft.link.trim();
  const firstComment = draft.firstComment.trim();
  return {
    text: draft.text,
    mediaIds: draft.mediaIds,
    link: link === '' ? null : link,
    firstComment: firstComment === '' ? null : draft.firstComment,
    labelIds: draft.labelIds,
    targets: draft.accountIds.map((accountId) => {
      const network = networkOf(accountId);
      if (!network) return { accountId, override: null };
      const o = draft.overrides[network] ?? {};
      // Only the options that apply to this network: the API refuses others.
      const options = tidyOptions(
        optionsFor(mergedOptions(o.options, draft.accountOptions[accountId]), network),
      );
      const override = tidy({
        ...(o.text !== undefined ? { text: o.text } : {}),
        ...(o.mediaIds !== undefined ? { mediaIds: o.mediaIds } : {}),
        ...(options ? { options } : {}),
      });
      return { accountId, override: override ? { ...override } : null };
    }),
  };
}

/** Splits a target's options into its account's own settings and the rest (its network's). */
function splitOptions(options: TargetOptions | undefined) {
  const network: Record<string, Record<string, unknown>> = {};
  const account: Record<string, Record<string, unknown>> = {};
  for (const [key, values] of Object.entries(options ?? {})) {
    const own = ACCOUNT_OPTION_FIELDS[key as TargetOptionsKey] ?? [];
    for (const [field, value] of Object.entries<unknown>(values ?? {})) {
      const into = own.includes(field) ? account : network;
      into[key] = { ...into[key], [field]: value };
    }
  }
  return { network: tidyOptions(network), account: tidyOptions(account) };
}

/**
 * A saved post as a draft. Targets of one network normally share an override (the composer
 * writes them that way); if they differ, the first account's wins and saving makes them equal.
 * Each account keeps its own settings (`ACCOUNT_OPTION_FIELDS`).
 */
export function fromPost(post: Post): Draft {
  const overrides: Draft['overrides'] = {};
  const accountOptions: Draft['accountOptions'] = {};
  for (const target of post.targets) {
    if (target.status === 'cancelled' || !target.override) continue;
    const network = target.account.network;
    const split = splitOptions(target.override.options);
    if (split.account) accountOptions[target.account.id] = split.account;
    if (overrides[network]) continue;
    const o = tidy({
      ...(target.override.text !== undefined ? { text: target.override.text } : {}),
      ...(target.override.mediaIds !== undefined ? { mediaIds: target.override.mediaIds } : {}),
      ...(split.network ? { options: split.network } : {}),
    });
    if (o) overrides[network] = o;
  }
  return {
    accountIds: post.targets.filter((t) => t.status !== 'cancelled').map((t) => t.account.id),
    text: post.text,
    mediaIds: post.mediaIds,
    link: post.link ?? '',
    firstComment: post.firstComment ?? '',
    overrides,
    accountOptions,
    labelIds: post.labelIds,
  };
}
