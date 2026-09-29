import type { LoginProvider, Network, NetworkId, NetworkLogin } from '@socioboard/contracts';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  NetworkIcon,
  Skeleton,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { networksQuery, startConnect } from '../api';

type Step =
  | { kind: 'network' }
  | { kind: 'login'; network: Network }
  | { kind: 'tip'; network: Network; login: NetworkLogin };

/**
 * The network chooser (docs/frontend/areas/accounts.md): pick a network, then how to sign in
 * where there's more than one way, then off to the network's consent screen. Adding a second
 * login of a network that can't show its own account picker first explains how to switch
 * accounts, since the network would otherwise sign in the same person again.
 */
export function ConnectDialog({
  open,
  onOpenChange,
  initialNetwork,
  existingProviders,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opens on this network ("Connect another Facebook account"). */
  initialNetwork?: NetworkId | undefined;
  /** Logins the workspace already has: connecting one of these again is "another account". */
  existingProviders: ReadonlySet<LoginProvider>;
}) {
  const { t } = useTranslation('accounts');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('details.close')} className="sm:max-w-lg">
        {/* Radix unmounts the content once closed, so each opening starts at the first step. */}
        <ChooserBody initialNetwork={initialNetwork} existingProviders={existingProviders} />
      </DialogContent>
    </Dialog>
  );
}

function ChooserBody({
  initialNetwork,
  existingProviders,
}: {
  initialNetwork: NetworkId | undefined;
  existingProviders: ReadonlySet<LoginProvider>;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const networks = useQuery(networksQuery);
  // Null until the user picks: "Connect another <network> account" opens a step further in.
  const [picked, setPicked] = useState<Step | null>(null);
  const [starting, setStarting] = useState<LoginProvider | null>(null);
  const [error, setError] = useState<unknown>(null);
  const opening = networks.data?.find((n) => n.id === initialNetwork);
  const step: Step =
    picked ?? (opening ? stepFor(opening, existingProviders) : { kind: 'network' });

  const go = async (provider: LoginProvider) => {
    setStarting(provider);
    setError(null);
    try {
      await startConnect(workspace.id, provider, existingProviders.has(provider));
      // The browser is leaving; keep the button busy until it does.
    } catch (err) {
      setError(err);
      setStarting(null);
    }
  };

  const pickLogin = (network: Network, login: NetworkLogin) => {
    if (needsTip(login, existingProviders)) setPicked({ kind: 'tip', network, login });
    else void go(login.provider);
  };

  const pickNetwork = (network: Network) => {
    const [only, ...more] = network.logins;
    if (only && more.length === 0) pickLogin(network, only);
    else setPicked({ kind: 'login', network });
  };

  if (step.kind === 'tip') {
    const provider = t(`providers.${step.login.provider}`);
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('chooser.tipTitle', { provider })}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('chooser.tip', { provider })}
          </DialogDescription>
        </DialogHeader>
        <div className="glass-chip rounded-control flex gap-3 p-4">
          <Info className="text-ring mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-ink-2 text-sm leading-relaxed">{t('chooser.tip', { provider })}</p>
        </div>
        {error !== null && <FormError>{errorMessage(error)}</FormError>}
        <DialogFooter>
          <BackButton
            onClick={() => {
              setPicked(
                step.network.logins.length > 1
                  ? { kind: 'login', network: step.network }
                  : { kind: 'network' },
              );
            }}
          />
          <Button
            variant="primary"
            disabled={starting !== null}
            onClick={() => void go(step.login.provider)}
          >
            {starting ? t('chooser.starting', { provider }) : t('chooser.continue', { provider })}
          </Button>
        </DialogFooter>
      </>
    );
  }

  if (step.kind === 'login') {
    const network = step.network;
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('chooser.loginTitle')}</DialogTitle>
          <DialogDescription>
            {t('chooser.loginDescription', { network: network.displayName })}
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {network.logins.map((login) => (
            <li key={login.provider}>
              <Choice
                icon={
                  <NetworkIcon
                    network={login.provider === 'facebook' ? 'facebook_page' : network.id}
                    variant="tile"
                    size="md"
                    decorative
                  />
                }
                title={loginText(t, login.provider).label}
                description={loginText(t, login.provider).description}
                busy={starting === login.provider}
                disabled={starting !== null}
                onClick={() => {
                  pickLogin(network, login);
                }}
              />
            </li>
          ))}
        </ul>
        {error !== null && <FormError>{errorMessage(error)}</FormError>}
        <DialogFooter>
          <BackButton
            onClick={() => {
              setPicked({ kind: 'network' });
            }}
          />
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('chooser.title')}</DialogTitle>
        <DialogDescription>{t('chooser.description')}</DialogDescription>
      </DialogHeader>
      {networks.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="rounded-control h-16" />
          <Skeleton className="rounded-control h-16" />
        </div>
      ) : networks.isError ? (
        <FormError>{t('chooser.loadError')}</FormError>
      ) : networks.data.length === 0 ? (
        <p className="text-ink-2 text-sm leading-relaxed">{t('chooser.noneEnabled')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {networks.data.map((network) => {
            const single = network.logins.length === 1 ? network.logins[0] : undefined;
            return (
              <li key={network.id}>
                <Choice
                  icon={<NetworkIcon network={network.id} variant="tile" size="md" decorative />}
                  title={network.displayName}
                  description={t('chooser.supports', {
                    types: new Intl.ListFormat(undefined, { type: 'conjunction' }).format(
                      network.capabilities.postTypes.map((p) => t(`chooser.postTypes.${p}`)),
                    ),
                  })}
                  busy={starting !== null && starting === single?.provider}
                  disabled={starting !== null}
                  onClick={() => {
                    pickNetwork(network);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
      {error !== null && <FormError>{errorMessage(error)}</FormError>}
    </>
  );
}

/** A second login of a network that can't show its own account picker: explain first. */
const needsTip = (login: NetworkLogin, existing: ReadonlySet<LoginProvider>) =>
  existing.has(login.provider) && !login.supportsAccountSelection;

/**
 * Where "Connect another <network> account" opens: the switch-account tip, or the ways to sign
 * in (a single one included, so leaving the app is always the user's click).
 */
function stepFor(network: Network, existing: ReadonlySet<LoginProvider>): Step {
  const [only, ...more] = network.logins;
  if (only && more.length === 0 && needsTip(only, existing)) {
    return { kind: 'tip', network, login: only };
  }
  return { kind: 'login', network };
}

function loginText(
  t: ReturnType<typeof useTranslation<'accounts'>>['t'],
  provider: LoginProvider,
): { label: string; description: string } {
  if (provider === 'facebook' || provider === 'instagram') {
    return {
      label: t(`chooser.logins.${provider}.label`),
      description: t(`chooser.logins.${provider}.description`),
    };
  }
  const name = t(`providers.${provider}`);
  return { label: t('chooser.continue', { provider: name }), description: '' };
}

/** One option: a whole-row button with the network's tile. */
function Choice({
  icon,
  title,
  description,
  busy,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className="glass-chip rounded-control hover:bg-chip focus-visible:ring-selected flex w-full items-center gap-3 p-3 text-left outline-none disabled:cursor-wait disabled:opacity-60"
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ink text-sm font-semibold">{title}</span>
        {description && <span className="text-ink-3 text-xs leading-relaxed">{description}</span>}
      </span>
      <ChevronRight className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('accounts');
  return (
    <Button variant="ghost" onClick={onClick} className="mr-auto">
      <ArrowLeft aria-hidden="true" />
      {t('chooser.back')}
    </Button>
  );
}
