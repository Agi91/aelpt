'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user !== null) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-xl text-white">
            A
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            AELPT
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            AI-Powered Personalized Learning OS
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
