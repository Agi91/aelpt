'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB SEGMENT LABEL MAP
// Maps raw path segments to human-readable labels
// ─────────────────────────────────────────────────────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  semesters: 'Semesters',
  notes: 'Notes',
  flashcards: 'Flashcards',
  resources: 'Resources',
  revision: 'Revision',
  'ai-mentor': 'AI Mentor',
  analytics: 'Analytics',
  achievements: 'Achievements',
  planner: 'Planner',
  wellness: 'Wellness',
  settings: 'Settings',
  profile: 'Profile',
  subjects: 'Subjects',
  units: 'Units',
  topics: 'Topics',
};

type Crumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];

  // Always start with Home
  crumbs.push({
    label: 'Home',
    href: ROUTES.DASHBOARD,
    isCurrent: pathname === ROUTES.DASHBOARD,
  });

  segments.forEach((seg, idx) => {
    // Skip the "dashboard" segment since it's already covered by Home
    if (seg === 'dashboard') return;

    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = SEGMENT_LABELS[seg] ?? seg; // Fallback to raw segment (e.g. dynamic IDs)
    const isCurrent = idx === segments.length - 1;

    crumbs.push({ label, href, isCurrent });
  });

  return crumbs;
}

// ─────────────────────────────────────────────────────────────────────────────
// AppBreadcrumb — Reads current pathname and renders a breadcrumb trail
// ─────────────────────────────────────────────────────────────────────────────

export function AppBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  // Don't render breadcrumb on the root dashboard page
  if (pathname === ROUTES.DASHBOARD) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.href}>
          {idx === 0 ? (
            <Link
              href={crumb.href}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
          ) : crumb.isCurrent ? (
            <span
              className="text-foreground font-medium truncate max-w-[160px]"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]'
              )}
            >
              {crumb.label}
            </Link>
          )}

          {idx < crumbs.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
