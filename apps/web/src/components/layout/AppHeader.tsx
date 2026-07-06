'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/useUiStore';
import { useAuth } from '@/hooks/useAuth';
import { AppBreadcrumb } from '@/components/layout/AppBreadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeToggle — Cycles through system → light → dark
// ─────────────────────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <button
      type="button"
      onClick={nextTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {theme === 'light' && <Sun className="h-4 w-4" />}
      {theme === 'dark' && <Moon className="h-4 w-4" />}
      {(theme === 'system' || theme === undefined) && (
        <Monitor className="h-4 w-4" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppHeader — Top navigation bar
// Responsibilities:
//   • Mobile hamburger that opens the mobile sidebar drawer
//   • Breadcrumb trail in the left area
//   • Theme toggle, notification bell, and user avatar dropdown on the right
// ─────────────────────────────────────────────────────────────────────────────

export function AppHeader() {
  const router = useRouter();
  const { toggleMobileSidebar } = useUiStore();
  const { profile, signOut } = useAuth();

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.replace(ROUTES.LOGIN);
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header className="flex items-center h-14 border-b border-border bg-background px-3 gap-3 shrink-0">
      {/* Mobile hamburger */}
      <button
        type="button"
        id="mobile-nav-toggle"
        onClick={toggleMobileSidebar}
        aria-label="Toggle navigation menu"
        className={cn(
          'md:hidden flex items-center justify-center h-8 w-8 rounded-md',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
        )}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Breadcrumb / page context */}
      <div className="flex-1 min-w-0">
        <AppBreadcrumb />
      </div>

      {/* Right action group */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell — placeholder */}
        <button
          type="button"
          id="notifications-trigger"
          aria-label="Notifications (coming soon)"
          className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            id="user-menu-trigger"
            aria-label="Open user menu"
            className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-1">
              <p className="font-semibold text-foreground truncate">
                {profile?.fullName ?? 'Student'}
              </p>
              <p className="truncate">{profile?.email ?? ''}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Profile link */}
            <DropdownMenuItem
              id="dropdown-profile-link"
              onClick={() => router.push(ROUTES.PROFILE)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>

            {/* Settings link */}
            <DropdownMenuItem
              id="dropdown-settings-link"
              onClick={() => router.push(ROUTES.SETTINGS)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sign out */}
            <DropdownMenuItem
              id="dropdown-signout-btn"
              onClick={() => void handleSignOut()}
              variant="destructive"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
