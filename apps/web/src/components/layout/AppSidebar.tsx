'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Layers,
  FolderOpen,
  RefreshCw,
  Sparkles,
  BarChart2,
  Trophy,
  Calendar,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants/routes';
import { useUiStore } from '@/store/useUiStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAP — maps iconName string from NAV_ITEMS to Lucide component
// ─────────────────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  FileText,
  Layers,
  FolderOpen,
  RefreshCw,
  Sparkles,
  BarChart2,
  Trophy,
  Calendar,
  Heart,
  Settings,
  Search,
  HelpCircle,
};

// ─────────────────────────────────────────────────────────────────────────────
// AppSidebar — Desktop & Tablet sidebar navigation
// Responsibilities:
//   • Full navigation list with icons and labels
//   • Active route highlighting via pathname matching
//   • Collapse / expand toggle (icon-only mode on tablet)
//   • User profile section at the bottom
// ─────────────────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const { profile } = useAuth();

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-sidebar-border px-3 shrink-0',
          isSidebarCollapsed ? 'justify-center' : 'gap-2 px-4'
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-sm shrink-0">
          A
        </div>
        {!isSidebarCollapsed && (
          <span className="font-semibold text-sidebar-foreground text-sm tracking-tight truncate">
            AELPT
          </span>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName];
            const isActive =
              item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive &&
                      'bg-purple-600/15 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 hover:text-purple-500 dark:hover:text-purple-300',
                    isSidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-sidebar-foreground/70'
                      )}
                    />
                  ) : null}
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] px-1.5 py-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Profile Section */}
      <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
        {/* Streak badge */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 rounded-md px-2.5 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span>0 day streak — keep going!</span>
          </div>
        )}

        {/* Avatar row */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-2.5 py-2',
            isSidebarCollapsed && 'justify-center px-2'
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {profile?.fullName ?? 'Student'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {profile?.email ?? ''}
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
          className={cn(
            'flex items-center w-full rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            isSidebarCollapsed ? 'justify-center px-2' : 'gap-3'
          )}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
