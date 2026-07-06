import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — Displays a TopicStatus value with appropriate color coding
//
// Status ➜ Color mapping (from DEVELOPMENT_ROADMAP.md):
//   not_started  → gray
//   in_progress  → blue
//   completed    → green
//   mastered     → purple
//
// Props:
//   status    – one of the four TopicStatus values
//   className – optional extra class names
// ─────────────────────────────────────────────────────────────────────────────

export type TopicStatus =
  'not_started' | 'in_progress' | 'completed' | 'mastered';

interface StatusBadgeProps {
  status: TopicStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  TopicStatus,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  not_started: {
    label: 'Not Started',
    dotClass: 'bg-zinc-400',
    textClass: 'text-zinc-600 dark:text-zinc-400',
    bgClass: 'bg-zinc-100 dark:bg-zinc-800/60',
  },
  in_progress: {
    label: 'In Progress',
    dotClass: 'bg-blue-500',
    textClass: 'text-blue-700 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-900/30',
  },
  mastered: {
    label: 'Mastered',
    dotClass: 'bg-purple-500',
    textClass: 'text-purple-700 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {/* Color dot */}
      <span
        className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)}
      />
      {config.label}
    </span>
  );
}
