import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeader — Sub-section heading within a page
//
// Lighter than PageHeader; used for card sections, tabs, or grouped content.
// Props:
//   title     – section heading (rendered as <h2>)
//   subtitle  – optional description below the title
//   actions   – optional ReactNode (e.g. "View all" link)
//   className – optional extra class names
// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 mb-4', className)}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground leading-snug truncate">
          {title}
        </h2>
        {subtitle !== undefined && subtitle !== '' && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions !== undefined && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
