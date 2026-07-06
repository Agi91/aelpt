'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout — Protected layout wrapping all /dashboard/* pages
// Responsibilities:
//   • Auth guard: redirect unauthenticated users to /login
//   • Compose the full app shell:
//       ┌────────────────────────────────────────┐
//       │  AppSidebar (desktop/tablet)           │
//       │  MobileSidebar (mobile drawer)         │
//       │  ┌──────────────────────────────────┐  │
//       │  │  AppHeader                       │  │
//       │  │  ──────────────────────────────  │  │
//       │  │  main content (children)         │  │
//       │  └──────────────────────────────────┘  │
//       └────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while auth state is resolving
  if (loading || user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop / tablet sidebar */}
      <AppSidebar />

      {/* Mobile slide-in drawer */}
      <MobileSidebar />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar */}
        <AppHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
