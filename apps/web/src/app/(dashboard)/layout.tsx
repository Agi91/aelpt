'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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

  if (loading || user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-zinc-400 text-sm font-medium">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  // Once authenticated, render children dashboard pages
  return <>{children}</>;
}
