'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeProvider — Wraps next-themes ThemeProvider
// Placed inside RootLayout above AuthProvider
// Enables: light / dark / system theme switching
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
