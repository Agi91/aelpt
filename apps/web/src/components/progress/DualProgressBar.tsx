import React from 'react';
import { cn } from '@/lib/utils';

interface DualProgressBarProps {
  completion: number;
  understanding: number;
  showLabels?: boolean;
  className?: string;
}

export function DualProgressBar({
  completion,
  understanding,
  showLabels = true,
  className,
}: DualProgressBarProps) {
  // Clamp percentages between 0 and 100
  const compPercent = Math.max(0, Math.min(100, completion));
  const undPercent = Math.max(0, Math.min(100, understanding));
  const gap = Math.max(0, compPercent - undPercent);

  return (
    <div className={cn('space-y-2 w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Syllabus: {compPercent}%
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Understanding: {undPercent}%
            </span>
          </div>
          {gap > 0 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-medium">
              Gap: {gap}%
            </span>
          )}
        </div>
      )}

      {/* Unified track wrapper */}
      <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
        {/* Completion Bar (Blue) */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500/40 dark:bg-blue-600/40 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${compPercent}%` }}
        />

        {/* Understanding Bar (Purple) - overlaid */}
        <div
          className="absolute top-0 left-0 h-full bg-purple-600 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${undPercent}%` }}
        />
      </div>
    </div>
  );
}
