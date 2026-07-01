import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// --------------------------------------------------------
// CONSTITUTION SECTION 24.2 — Typography
// Primary body font: Inter (clean, legible, professional)
// Monospace font: JetBrains Mono (code blocks, academic data)
// --------------------------------------------------------
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
