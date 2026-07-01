'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  LogOut,
  Loader2,
  Shield,
  CheckCircle,
  User as UserIcon,
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Sign out failed';
      toast.error(errMsg);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-xl space-y-6">
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/50 border border-purple-500/20 text-purple-400">
              <UserIcon className="size-6" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-white mt-4">
              Welcome, {profile?.fullName || 'Academic Explorer'}!
            </CardTitle>
            <CardDescription className="text-zinc-400">
              AI Enhancement Learning Progress Tracker Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Synchronized Profile Info
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-zinc-400 block">Database UID:</span>
                  <span className="font-mono text-xs text-zinc-300 break-all">
                    {profile?.uid || 'Not Synced'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Email Address:</span>
                  <span className="text-zinc-300">
                    {profile?.email || 'Not Synced'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Account Created:</span>
                  <span className="text-zinc-300">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">
                    Onboarding Complete:
                  </span>
                  <span className="flex items-center space-x-1 text-zinc-300">
                    {profile?.onboardingDone === true ? (
                      <>
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block size-2 rounded-full bg-amber-500"></span>
                        <span>Pending Onboarding</span>
                      </>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">
                    User Access Level:
                  </span>
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Shield className="size-4" />
                    <span className="capitalize">
                      {profile?.role || 'student'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 text-center leading-relaxed">
              Your profile document has been successfully synchronized in
              Firestore and integrated with Firebase Authentication.
            </p>
          </CardContent>
          <CardFooter className="justify-end border-t border-zinc-800/50 py-4">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="bg-red-950/40 border border-red-500/20 hover:bg-red-900/60 text-red-300 font-semibold transition"
            >
              {loggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
