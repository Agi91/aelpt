'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Shield,
  CheckCircle,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage — Placeholder page shown after login
// Displays verified profile info. Will be expanded in Phase 9 (Analytics).
// Sign-out is now handled from the AppHeader dropdown.
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-600/15 text-purple-600 dark:text-purple-400">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Welcome, {profile?.fullName ?? 'Academic Explorer'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your learning operating system is ready.
          </p>
        </div>
      </div>

      {/* Profile sync card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Synchronized Profile</CardTitle>
          </div>
          <CardDescription>
            Your account has been created and synced with the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground mb-0.5">Full Name</dt>
              <dd className="font-medium text-foreground">
                {profile?.fullName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Email</dt>
              <dd className="font-medium text-foreground truncate">
                {profile?.email ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Account Created</dt>
              <dd className="font-medium text-foreground">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Onboarding</dt>
              <dd className="flex items-center gap-1.5 font-medium">
                {profile?.onboardingDone === true ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Completed
                    </span>
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Role</dt>
              <dd className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                <Shield className="h-3.5 w-3.5" />
                <span className="capitalize">{profile?.role ?? 'student'}</span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Phase 2 nav hint */}
      <p className="text-xs text-muted-foreground text-center">
        Use the sidebar to navigate. More features coming in upcoming phases.
      </p>
    </div>
  );
}
