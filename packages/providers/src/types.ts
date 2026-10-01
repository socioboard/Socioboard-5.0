import type {
  ContentRules,
  LoginProvider,
  MediaKind,
  NetworkCapabilities,
  NetworkId,
  PreviewSpec,
  TargetOptions,
  ValidationIssue,
} from '@socioboard/contracts';

/** OAuth tokens of one login, as the network returned them. Never logged, stored encrypted. */
export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  /** Permissions the person actually granted (they may untick some). */
  scopes: string[];
}

/** PKCE pair for networks that use it (the verifier is kept in OAuthState). */
export interface Pkce {
  verifier: string;
  challenge: string;
}

/** Who signed in: detects the same login connected twice, and reconnecting as someone else. */
export interface LoginIdentity {
  externalUserId: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Something a login can post to, as the network lists it. */
export interface ProviderAsset {
  network: NetworkId;
  externalId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  /** Per-asset token where the network issues one (Facebook Page tokens). */
  token: { accessToken: string; expiresAt: Date | null } | null;
  /** Network extras kept on the account (e.g. the Page an Instagram account is linked to). */
  meta: Record<string, unknown>;
  unavailableReason: 'not_professional' | 'missing_permission' | null;
}

export interface AuthUrlInput {
  state: string;
  redirectUri: string;
  pkce?: Pkce;
  forceAccountSelection?: boolean;
}

export interface ExchangeCodeInput {
  code: string;
  redirectUri: string;
  pkce?: Pkce;
}

/** One OAuth app: signs in, says who signed in and lists what they can post to. */
export interface LoginAdapter {
  id: LoginProvider;
  /** The networks its assets can be. */
  networks: readonly NetworkId[];
  supportsAccountSelection: boolean;
  /** Whether the flow uses PKCE (the service then creates and stores a verifier). */
  usesPkce: boolean;
  /** Permissions without which nothing can be listed; missing ones fail the connect clearly. */
  requiredScopes: readonly string[];
  getAuthUrl(input: AuthUrlInput): string;
  exchangeCode(input: ExchangeCodeInput): Promise<TokenSet>;
  /** Fresh tokens before they expire; absent when the network's tokens can't be refreshed. */
  refresh?(tokens: TokenSet): Promise<TokenSet>;
  getIdentity(tokens: TokenSet): Promise<LoginIdentity>;
  listAssets(tokens: TokenSet): Promise<ProviderAsset[]>;
}

/** A file attached to a post, as validation sees it. */
export interface ContentMedia {
  id: string;
  kind: MediaKind;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  altText: string | null;
}

/** The final content for one target: shared content merged with its override. */
export interface ContentInput {
  text: string;
  media: ContentMedia[];
  link: string | null;
  firstComment: string | null;
  options: TargetOptions;
}

/**
 * A file ready to publish. Adapters upload its bytes (read from `readUrl`) where the network
 * allows it, else give the network `publicUrl` to fetch (docs/backend/modules/media.md,
 * "Delivering media to networks").
 */
export interface PublishMedia extends ContentMedia {
  /** Where we read the file: a signed storage URL, reachable by the worker, maybe not beyond. */
  readUrl: string;
  /** A signed address on `media.<domain>` the network can fetch; null when not configured. */
  publicUrl: string | null;
}

export interface PublishInput extends ContentInput {
  media: PublishMedia[];
}

/** The account a post goes to and the token to use (the asset's, else its login's). */
export interface AccountCredentials {
  externalId: string;
  accessToken: string;
  meta: Record<string, unknown>;
}

export interface PublishResult {
  externalId: string;
  permalink: string | null;
  /** Things that went wrong without failing the post (e.g. the first comment was refused). */
  warnings: string[];
}

/**
 * What a network accepts for images. The worker fits images to it before publishing (media's
 * prepareVariant: convert, shrink, re-compress), so validation doesn't flag what it can fix.
 */
export interface ImagePrep {
  mimes: readonly string[];
  /** Widest image the network takes; null for any width. */
  maxWidth: number | null;
  maxBytes: number;
}

/** At most `max` publishes in any `perSec` seconds (a moving window). */
export interface RateWindow {
  max: number;
  perSec: number;
}

/**
 * How fast the network lets us publish, enforced by the publishing worker before each try
 * (docs/backend/modules/publishing.md, "Rate limits"). `perAccount` counts each account's
 * publishes; `perApp` counts every publish through one login's OAuth app (e.g. all of Meta's).
 */
export interface RateLimits {
  perAccount: readonly RateWindow[];
  perApp: readonly RateWindow[];
}

/** A kind of postable asset: its rules, preview, validation and publishing. */
export interface NetworkAdapter {
  id: NetworkId;
  displayName: string;
  capabilities: NetworkCapabilities;
  rules: ContentRules;
  preview: PreviewSpec;
  /** Set when the worker should fit images to the network before publishing. */
  imagePrep?: ImagePrep;
  rateLimits: RateLimits;
  /** Pure: the composer's live checks and the API's check before saving and publishing. */
  validate(input: ContentInput): ValidationIssue[];
  publish(input: PublishInput, account: AccountCredentials): Promise<PublishResult>;
  deletePost?(externalId: string, account: AccountCredentials): Promise<void>;
}
