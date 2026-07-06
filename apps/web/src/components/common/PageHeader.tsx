import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — Top-of-page heading section
//
// Used at the top of every dashboard page.
// Props:
//   title      – main page heading (rendered as <h1>)
//   subtitle   – optional descriptive line below the title
//   actions    – optional ReactNode slot (button group, filters, etc.) on the right
//   className  – optional extra class names on the wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6',
        className
      )}
    >
      {/* Title + subtitle */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-foreground leading-tight truncate">
          {title}
        </h1>
        {subtitle !== undefined && subtitle !== '' && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Optional right-side actions */}
      {actions !== undefined && (
        <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
