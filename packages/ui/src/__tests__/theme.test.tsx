import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY, ThemeProvider, useTheme, type ThemePreference } from '../theme';

/** A fake prefers-color-scheme the test can flip. */
function mockSystem(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList);
  return (next: boolean) => {
    media.matches = next;
    act(() => {
      for (const fn of listeners) fn();
    });
  };
}

function Probe({ pick }: { pick?: ThemePreference }) {
  const { preference, resolved, setPreference } = useTheme();
  return (
    <button
      onClick={() => {
        if (pick) setPreference(pick);
      }}
    >
      {preference}:{resolved}
    </button>
  );
}

describe('ThemeProvider', () => {
  it('follows the system by default and updates when it changes', () => {
    const flip = mockSystem(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('system:light');
    expect(document.documentElement).not.toHaveClass('dark');
    flip(true);
    expect(screen.getByRole('button')).toHaveTextContent('system:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('remembers an explicit choice and ignores the system for it', () => {
    const flip = mockSystem(false);
    render(
      <ThemeProvider>
        <Probe pick="dark" />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByRole('button').click();
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    flip(false);
    expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('starts from the stored choice, and "system" clears it', () => {
    mockSystem(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(
      <ThemeProvider>
        <Probe pick="system" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('light:light');
    act(() => {
      screen.getByRole('button').click();
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole('button')).toHaveTextContent('system:dark');
  });

  it('follows a theme change made in another tab', () => {
    mockSystem(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
    });
    expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('works when storage is blocked', () => {
    mockSystem(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(
      <ThemeProvider>
        <Probe pick="dark" />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByRole('button').click();
    });
    expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
  });
});
