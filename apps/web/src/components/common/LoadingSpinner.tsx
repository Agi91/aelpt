import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// LoadingSpinner — Animated ring spinner for loading states
//
// Sizes:
//   sm – 16px (h-4 w-4) — inline / tight spaces
//   md – 28px (h-7 w-7) — default card/section loading
//   lg – 40px (h-10 w-10) — full-section loading
//
// Props:
//   size      – 'sm' | 'md' | 'lg' (default: 'md')
//   className – optional extra class names on the wrapper
//   label     – accessible screen reader label (default: 'Loading…')
// ─────────────────────────────────────────────────────────────────────────────

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading…',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span
        className={cn(
          'animate-spin rounded-full border-purple-500 border-t-transparent',
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FullPageSpinner — Centered full-viewport loading indicator
// Used by top-level suspense / route loading boundaries
// ─────────────────────────────────────────────────────────────────────────────

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
