import * as emails from '@socioboard/emails';
import type { RenderedEmail } from '@socioboard/emails';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware, isAPIError } from 'better-auth/api';
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned';
import { magicLink } from 'better-auth/plugins/magic-link';
import { organization } from 'better-auth/plugins/organization';
import { twoFactor } from 'better-auth/plugins/two-factor';

import {
  newId,
  type Config,
  type Db,
  type EventBus,
  type Kv,
  type Logger,
  type Mailer,
} from '../../platform';
import { promoteFirstUser } from './bootstrap';
import type { AuthEvents } from './events';
import { workspaceAc, workspaceRoles } from './roles';

export interface AuthDeps {
  config: Config;
  db: Db;
  kv: Kv;
  mailer: Mailer;
  logger: Logger;
  events: EventBus<AuthEvents>;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60;

/** Better Auth instance: the handler for /api/auth/* and `auth.api.*` for server-side calls. */
export function createAuth({ config, db, kv, mailer, logger, events }: AuthDeps) {
  // Emails go out in the background: awaiting them would slow responses and let response times
  // reveal whether an address has an account.
  const send = (to: string, kind: string, email: Promise<RenderedEmail>) => {
    email
      .then((rendered) => mailer.send({ to, ...rendered }))
      .catch((err: unknown) => {
        logger.error({ err, email: kind }, 'auth email failed');
      });
  };

  const options = {
    appName: 'Socioboard',
    // The web app serves the API under /api on the same origin (Vite proxy in dev, one domain in
    // production), so auth links and cookies use the app URL.
    baseURL: config.appUrl,
    basePath: '/api/auth',
    secret: config.auth.secret,
    trustedOrigins: [config.appUrl],
    database: prismaAdapter(db.client, { provider: 'postgresql' }),

    // Sessions live in Postgres (so they can be listed and revoked) and are cached in Valkey;
    // rate-limit counters live in Valkey only.
    secondaryStorage: {
      get: (key) => kv.get(`auth:${key}`),
      getAndDelete: (key) => kv.getAndDelete(`auth:${key}`),
      increment: (key, ttl) => kv.incr(`auth:${key}`, ttl),
      set: (key, value, ttl) => kv.set(`auth:${key}`, value, ttl),
      delete: (key) => kv.delete(`auth:${key}`),
    },
    session: { storeSessionInDatabase: true },

    user: {
      additionalFields: {
        avatarKey: { type: 'string', required: false, input: false },
        timezone: { type: 'string', required: false },
        locale: { type: 'string', required: false, defaultValue: 'en' },
        isPlatformAdmin: { type: 'boolean', required: false, defaultValue: false, input: false },
      },
    },
    account: { encryptOAuthTokens: true },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      // Unverified users can sign in; creating a workspace needs a verified email (P0-B5).
      requireEmailVerification: false,
      revokeSessionsOnPasswordReset: true,
      onPasswordReset: async ({ user }) => {
        await events.emit('user.password_changed', { userId: user.id });
      },
      sendResetPassword: ({ user, url }) => {
        send(user.email, 'reset-password', emails.resetPassword({ name: user.name, url }));
        return Promise.resolve();
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: ({ user, url }) => {
        send(user.email, 'verify-email', emails.verifyEmail({ name: user.name, url }));
        return Promise.resolve();
      },
    },

    socialProviders: {
      ...(config.auth.google
        ? { google: { ...config.auth.google, prompt: 'select_account' as const } }
        : {}),
      ...(config.auth.microsoft ? { microsoft: config.auth.microsoft } : {}),
    },

    rateLimit: {
      enabled: true,
      storage: 'secondary-storage',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 10 },
        '/sign-up/email': { window: 3600, max: 5 },
        '/sign-in/magic-link': { window: 60, max: 5 },
        '/request-password-reset': { window: 3600, max: 5 },
        '/send-verification-email': { window: 3600, max: 5 },
        '/two-factor/verify-totp': { window: 60, max: 10 },
      },
    },

    advanced: {
      cookiePrefix: 'sb',
      database: { generateId: () => newId() },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await promoteFirstUser(db, user.id, logger);
            await events.emit('user.signed_up', { userId: user.id, email: user.email });
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            await events.emit('user.signed_in', {
              userId: session.userId,
              sessionId: session.id,
              ipAddress: session.ipAddress ?? null,
            });
          },
        },
      },
    },

    hooks: {
      // Changing the password while signed in has no callback; reset uses onPasswordReset above.
      after: createAuthMiddleware(async (ctx) => {
        const session = ctx.context.session;
        if (ctx.path === '/change-password' && session && !isAPIError(ctx.context.returned)) {
          await events.emit('user.password_changed', { userId: session.user.id });
        }
      }),
    },

    plugins: [
      organization({
        ac: workspaceAc,
        roles: workspaceRoles,
        creatorRole: 'owner',
        invitationExpiresIn: SEVEN_DAYS,
        schema: {
          organization: {
            modelName: 'workspace',
            additionalFields: {
              timezone: { type: 'string', required: true },
              requireReviewForAll: { type: 'boolean', required: false, defaultValue: false },
            },
          },
          member: { fields: { organizationId: 'workspaceId' } },
          invitation: { fields: { organizationId: 'workspaceId' } },
          session: { fields: { activeOrganizationId: 'activeWorkspaceId' } },
        },
      }),
      twoFactor({ issuer: 'Socioboard' }),
      magicLink({
        expiresIn: 600,
        sendMagicLink: ({ email, url }) => {
          send(email, 'magic-link', emails.magicLink({ url }));
          return Promise.resolve();
        },
      }),
      ...(config.auth.breachedPasswordCheck
        ? [
            haveIBeenPwned({
              customPasswordCompromisedMessage:
                'This password has appeared in a data breach. Please choose a different one.',
            }),
          ]
        : []),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(options);
}

export type Auth = ReturnType<typeof createAuth>;
