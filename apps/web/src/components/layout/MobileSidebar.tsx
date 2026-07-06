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
  X,
  Flame,
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
};

// ─────────────────────────────────────────────────────────────────────────────
// MobileSidebar — Slide-in drawer for mobile (< md breakpoint)
// Controlled by useUiStore: isMobileSidebarOpen / closeMobileSidebar
// ─────────────────────────────────────────────────────────────────────────────

export function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUiStore();
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
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={closeMobileSidebar}
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300',
          isMobileSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 border-b border-sidebar-border px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-sm shrink-0">
              A
            </div>
            <span className="font-semibold text-sidebar-foreground text-sm tracking-tight">
              AELPT
            </span>
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
            className="p-1.5 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
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
                    onClick={closeMobileSidebar}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive &&
                        'bg-purple-600/15 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20'
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
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
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
          <div className="flex items-center gap-2 rounded-md px-2.5 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span>0 day streak — keep going!</span>
          </div>
          <div className="flex items-center gap-3 rounded-md px-2.5 py-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {profile?.fullName ?? 'Student'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {profile?.email ?? ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
