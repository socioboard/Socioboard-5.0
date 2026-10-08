# Adding a network

As of 2026-10-08 · For whoever builds a phase 3 network (P3-B1…B7) · See also: [providers](modules/providers.md), [social-accounts](modules/social-accounts.md), [composer](../frontend/areas/composer.md), [phase 3](../stages/phase-3.md), [developer apps](../developer-apps.md)

A network is one task (e.g. `P3-B1`) and one pull request: its adapters, contract tests, preview, options panel, docs and QA checks together. Copy the closest network that's already built:

| If the network… | Copy |
| --- | --- |
| uses OAuth 2 with PKCE, uploads media itself, refresh tokens rotate | **X**: `packages/providers/src/x` |
| creates a container, waits for it, then publishes | **Threads**: `packages/providers/src/meta/threads.ts` (or Instagram) |
| has one login reaching several kinds of account (LinkedIn person + organization) | **Facebook Login**: one login, `networks: ['facebook_page', 'instagram']` |

Both X and Threads were built this way: [918c57ac](https://github.com/Socioboard-developers/Socioboard-5.0/commit/918c57ac) (X) and [660535e9](https://github.com/Socioboard-developers/Socioboard-5.0/commit/660535e9) (Threads) show every file a network touches.

## Already in place

You don't need to add these; every phase 3 network already has them:

- Its ids: `NetworkId` and `LoginProvider` in `packages/contracts/src/networks.ts`, and the Prisma enums `SocialNetwork` and `LoginProvider`. **No migration is needed** to add a network.
- Its name and icon (`apps/web/src/locales/en/accounts.json`, `packages/ui/src/components/network-icon.tsx`), and its name in notifications and sign-in errors (`NETWORK_NAMES`, `PROVIDER_NAMES` in core).
- Its keys: `<NETWORK>_CLIENT_ID` / `<NETWORK>_CLIENT_SECRET` in config (`config.networks.linkedin`, `.youtube`, `.pinterest`, `.tiktok`, `.snapchat`, `.tumblr`; Bitly is `config.shorteners.bitly`) and in `.env.example`.
- Its options schema where it has settings (Pinterest, YouTube, TikTok): `packages/contracts/src/network-options.ts`, with the choices an account offers (`PinterestChoices`, `TikTokChoices`, `YouTubeChoices`) and `GET /accounts/:aid/options`.
- The OAuth callback: `GET /api/oauth/<provider>/callback` works for any registered login. Token storage, encryption, refresh before publishing (under a row lock), reconnect alerts, retries, rate limiting and the publish history are all generic.

## Steps

### 1. Developer app and keys

Check the network's section of [developer apps](../developer-apps.md): scopes, review, and limits before approval. The tech lead creates the app and puts the keys in the team's password manager; you put them in your `.env`. Callback: `https://app-dev.socioboard.ai/api/oauth/<provider>/callback` on staging; locally `http://localhost:5173/api/oauth/<provider>/callback` where the network accepts http (X does), else your dev tunnel ([callback URLs](../developer-apps.md#callback-urls)).

You can build and test everything up to step 6 without keys: the tests run on recorded answers.

### 2. Adapters: `packages/providers/src/<provider>/`

- `login.ts`: a `LoginAdapter` (`packages/providers/src/types.ts`). `getAuthUrl` (add the network's account-picker parameter if it has one and set `supportsAccountSelection`), `exchangeCode`, `refresh` if its tokens can be refreshed, `getIdentity`, `listAssets` (each page, board, blog or channel the person can post to, as a `ProviderAsset`). Put the scopes in an exported `<NETWORK>_SCOPES` and the ones nothing works without in `requiredScopes`.
- `<network>.ts`: a `NetworkAdapter`.
  - `capabilities`, `rules` and `preview` from the network's documentation, with the date you checked it in a comment. These drive the composer's checks and preview.
  - `validate` is pure and has the final say: anything `rules` can't say (the network's own way of counting characters, a required board or title, TikTok's branded-content rule) goes here as a `ValidationIssue` with a clear message.
  - `publish` returns the post's id and its link (`permalink`); a first comment the network refuses is a `warning`, not a failure.
  - Errors: map every network error to a `ProviderError` kind (`auth`, `rate_limited`, `content`, `retryable`, …) in an `errors.ts`, as X does. The kind decides whether we retry, ask for a reconnect, or tell the person what to fix.
  - `rateLimits` from the network's published limits; `imagePrep` if it only takes some image types or sizes (the worker fits images before publishing).
  - `optionChoices` if the composer needs something from the account (Pinterest boards, TikTok creator info).
  - Media: upload the bytes from `readUrl` where the network allows it; otherwise give it `publicUrl` to fetch.
- `index.ts`: `create<Network>Adapters(config)` returning `{ logins, networks }`, empty when the keys aren't set. Export it from `packages/providers/src/index.ts`.
- Register it in `packages/core/src/modules/social-accounts/registry.ts` with its `config.networks.<network>`.

### 3. Tests

- **Fixtures** in `packages/providers/src/__fixtures__/<provider>/` with a README saying where their shapes come from (see the X one). Use fake ids, names and tokens. Replace them with real recorded answers (`recorded/`) once you have a test account.
- **Contract test** `src/<provider>/__tests__/contract.test.ts`: `describeLoginContract`, `describeNetworkContract` with the recorded `auth`, `rate_limited` and `content` failures (it won't compile without them), and `describeContractCoverage(...)` last. CI fails if the folder has no contract test or an adapter has no suite.
- **Adapter tests** `src/<provider>/__tests__/<network>.test.ts`: validation rules, each post type, uploads, polling, error mapping.
- Add your adapters to the coverage table in [providers](modules/providers.md#testing).

### 4. Composer

- **Preview**: `apps/web/src/features/composer/previews/<network>-preview.tsx`, drawn from the network's `PreviewSpec`, with the account's real name and avatar. Add a branch to `NetworkPreview` in `components/preview-panel.tsx`, and a test (`__tests__/<network>.test.tsx`). It should look like the network's real post closely enough that the person isn't surprised.
- **Options panel** (if the network has settings): `options/<network>-panel.tsx`, registered in `options/registry.ts` (`needsChoices: true` if it reads `optionChoices`). The draft already stores each network's options.
- Text goes through i18n (`apps/web/src/locales/en/composer.json`). Follow the design system: tokens, motion helpers, pointer and not-allowed cursors.

### 5. Docs and QA

In the same pull request:
- [providers](modules/providers.md): the network's row in "Per-network notes" (auth, publish path, gotchas).
- [developer apps](../developer-apps.md): tick what's done; add what you learned.
- `docs/qa/accounts.md` and `docs/qa/composer.md`: checks for connecting the network and posting to it, written for testers.
- [phase 3](../stages/phase-3.md): what's done on your line, and what's left. Tick it only when step 6 is done.

### 6. On staging

After the pull request is merged and deployed (the tech lead adds the keys to staging):
- Connect a test account, and a second login of the same network (both must work side by side).
- Publish now: text, an image, a video, and each option. Then schedule one and let the worker publish it.
- Check that each preview matches the real post.
- Write down what you checked on your line in [phase 3](../stages/phase-3.md), then tick it.
- If the network's review needs a demo video (Pinterest Standard access, TikTok audit, Google verification), record it now; see "Screencasts" in [developer apps](../developer-apps.md).

## Files you'll edit that others edit too

Add your line at the end of its group and don't reformat the lines around it ([AGENTS.md](../../AGENTS.md#shared-files)); rebase on `origin/6.0` daily, and conflicts will be one line each:

- `packages/providers/src/index.ts` (export)
- `packages/core/src/modules/social-accounts/registry.ts` (register)
- `apps/web/src/features/composer/components/preview-panel.tsx` (preview import and branch)
- `apps/web/src/features/composer/options/registry.ts` (panel)
- `apps/web/src/locales/en/composer.json` (your keys under your network's name)
- `docs/backend/modules/providers.md`, `docs/qa/*.md`, `docs/stages/phase-3.md`

If you need a new options field or a database change, say so on the board first: contracts and migrations are reviewed by the tech lead, and only one migration can be open at a time.

## Done when

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass for the whole repo, and CI is green.
- Contract suites cover the login and every network the factory creates.
- The network's preview and options work in the composer, with tests.
- Docs and QA checks are updated.
- It's verified on staging (step 6), with any review video recorded.
