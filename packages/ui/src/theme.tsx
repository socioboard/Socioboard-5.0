import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** localStorage key; index.html reads it before first paint so the page never flashes. */
export const THEME_STORAGE_KEY = 'sb-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** A UI preference, so it lives in localStorage; storage can be unavailable (private mode). */
function readPreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function writePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not persisted; the choice still applies for this visit.
  }
}

const systemPrefersDark = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Follow the operating system while the preference is "system".
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      setSystemDark(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);

  // Another tab changed the theme: follow it.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreferenceState(readPreference());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const resolved: ResolvedTheme =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    writePreference(next);
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

type TransitionDocument = Document & {
  startViewTransition?: (options: { update: () => void; types: string[] }) => unknown;
};

/**
 * Switches to `next` with the new theme revealed in a circle growing from `from` (the toggle's
 * centre), where the browser has typed view transitions; under reduced motion that's a
 * crossfade (styles.css). Elsewhere it just switches.
 */
export function switchTheme(
  next: ResolvedTheme,
  setPreference: (preference: ThemePreference) => void,
  from?: { x: number; y: number },
) {
  const apply = () => {
    // The class changes at once, so the new snapshot already has the new colours.
    document.documentElement.classList.toggle('dark', next === 'dark');
    setPreference(next);
  };
  const doc = document as TransitionDocument;
  // Reduced motion still gets a transition: styles.css turns it into a crossfade, so the change
  // of brightness isn't abrupt.
  if (typeof doc.startViewTransition !== 'function') {
    apply();
    return;
  }
  const root = document.documentElement.style;
  const x = from?.x ?? window.innerWidth / 2;
  const y = from?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.setProperty('--sb-reveal-x', `${String(x)}px`);
  root.setProperty('--sb-reveal-y', `${String(y)}px`);
  root.setProperty('--sb-reveal-r', `${String(radius)}px`);
  try {
    doc.startViewTransition({ update: apply, types: ['theme'] });
  } catch {
    // A browser without typed transitions: switch without the reveal.
    apply();
  }
}

export function useTheme(): ThemeState {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
