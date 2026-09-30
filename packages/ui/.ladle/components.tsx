import './ladle.css';
import '@fontsource-variable/instrument-sans';

import type { GlobalProvider } from '@ladle/react';
import { useEffect } from 'react';

import { Backdrop } from '../src/backdrop';
import { Toaster } from '../src/components/toast';
import { TooltipProvider } from '../src/components/tooltip';
import { MotionProvider } from '../src/motion';
import { ThemeProvider, useTheme } from '../src/theme';

/** Follows Ladle's light/dark switch, so every story renders in the theme it shows. */
function SyncTheme({ theme }: { theme: 'light' | 'dark' | 'auto' }) {
  const { setPreference } = useTheme();
  useEffect(() => {
    setPreference(theme === 'auto' ? 'system' : theme);
  }, [theme, setPreference]);
  return null;
}

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <ThemeProvider>
    <SyncTheme theme={globalState.theme} />
    <MotionProvider>
      <TooltipProvider>
        <Backdrop />
        <div className="relative min-h-dvh p-6 sm:p-10">{children}</div>
        <Toaster />
      </TooltipProvider>
    </MotionProvider>
  </ThemeProvider>
);
