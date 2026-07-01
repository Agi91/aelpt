import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

// --------------------------------------------------------
// CONSTITUTION SECTION 24.2 — Typography
// Primary body font: Inter (clean, legible, professional)
// Monospace font: JetBrains Mono (code blocks, academic data)
// Note: We load these fonts via runtime HTML link tags rather
// than build-time next/font imports to bypass server-side
// network request blocks during local builds.
// --------------------------------------------------------

// --------------------------------------------------------
// Root metadata — will be updated per-page in later phases
// --------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: 'AELPT — AI Enhancement Learning Progress Tracker',
    template: '%s | AELPT',
  },
  description:
    'Your AI-powered personal learning operating system. Track real understanding, not just completion. Built for students preparing for placements.',
  keywords: [
    'learning tracker',
    'AI study planner',
    'placement preparation',
    'understanding score',
  ],
  authors: [{ name: 'AELPT Team' }],
  creator: 'AELPT',
  openGraph: {
    type: 'website',
    title: 'AELPT — AI Enhancement Learning Progress Tracker',
    description: 'Your AI-powered personal learning operating system.',
    siteName: 'AELPT',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased"
        style={
          {
            '--font-sans': 'Inter, system-ui, -apple-system, sans-serif',
            '--font-mono': '"JetBrains Mono", monospace',
          } as React.CSSProperties
        }
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" closeButton richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
