import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// CardSkeleton — Pulsing placeholder for loading states
//
// Variants:
//   default – generic card placeholder (full-height)
//   stat    – compact stat card placeholder (used in dashboard stat grid)
//   row     – single list-row placeholder (used in tables / lists)
//
// Props:
//   variant   – 'default' | 'stat' | 'row' (default: 'default')
//   className – optional extra class names on the wrapper
// ─────────────────────────────────────────────────────────────────────────────

type CardSkeletonVariant = 'default' | 'stat' | 'row';

interface CardSkeletonProps {
  variant?: CardSkeletonVariant;
  className?: string;
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-md bg-muted animate-pulse', className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({
  variant = 'default',
  className,
}: CardSkeletonProps) {
  // ── Stat card: small square with number + label ──────────────────────────
  if (variant === 'stat') {
    return (
      <div
        role="status"
        aria-label="Loading…"
        className={cn(
          'rounded-xl border border-border bg-card p-4 flex flex-col gap-3',
          className
        )}
      >
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-7 w-16" />
        <Shimmer className="h-2.5 w-32" />
      </div>
    );
  }

  // ── Row: single slim list item ────────────────────────────────────────────
  if (variant === 'row') {
    return (
      <div
        role="status"
        aria-label="Loading…"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3',
          className
        )}
      >
        <Shimmer className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3 w-3/5" />
          <Shimmer className="h-2.5 w-2/5" />
        </div>
        <Shimmer className="h-5 w-14 rounded-full shrink-0" />
      </div>
    );
  }

  // ── Default: full card placeholder ───────────────────────────────────────
  return (
    <div
      role="status"
      aria-label="Loading…"
      className={cn(
        'rounded-xl border border-border bg-card p-5 space-y-4',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-2/5" />
          <Shimmer className="h-3 w-3/5" />
        </div>
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>

      {/* Body lines */}
      <div className="space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <Shimmer className="h-3 w-4/6" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Shimmer className="h-7 w-20 rounded-lg" />
        <Shimmer className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CardSkeletonGrid — Renders N CardSkeleton placeholders in a responsive grid
// Use this to fill a page while data loads.
// ─────────────────────────────────────────────────────────────────────────────

interface CardSkeletonGridProps {
  count?: number;
  variant?: CardSkeletonVariant;
  className?: string;
}

export function CardSkeletonGrid({
  count = 6,
  variant = 'default',
  className,
}: CardSkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
