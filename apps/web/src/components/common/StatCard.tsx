'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — Dashboard KPI metric card
//
// Used in the analytics overview grid (e.g. Overall Score, Topics Completed, etc.)
//
// Props:
//   title     – metric label (e.g. "Overall Score")
//   value     – display value (string or number)
//   subtitle  – optional context line below the value (e.g. "of 120 topics")
//   trend     – optional { direction: 'up'|'down'|'flat', label: string }
//   icon      – optional React node for a small icon in the top-right
//   accent    – optional accent color class for the icon bg (default: purple)
//   className – optional extra class names
// ─────────────────────────────────────────────────────────────────────────────

type TrendDirection = 'up' | 'down' | 'flat';

interface StatTrend {
  direction: TrendDirection;
  label: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: StatTrend;
  icon?: React.ReactNode;
  accent?: string;
  className?: string;
}

const trendConfig: Record<
  TrendDirection,
  { Icon: React.ComponentType<{ className?: string }>; class: string }
> = {
  up: { Icon: TrendingUp, class: 'text-green-600 dark:text-green-400' },
  down: { Icon: TrendingDown, class: 'text-red-600 dark:text-red-400' },
  flat: { Icon: Minus, class: 'text-muted-foreground' },
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accent = 'bg-purple-600/10 text-purple-600 dark:text-purple-400',
  className,
}: StatCardProps) {
  const trendCfg = trend ? trendConfig[trend.direction] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border border-border bg-card p-5 flex flex-col gap-3',
        className
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        {icon !== undefined && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
              accent
            )}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>

      {/* Subtitle + trend */}
      <div className="flex items-center gap-2 flex-wrap">
        {subtitle !== undefined && subtitle !== '' && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
        {trendCfg !== null && trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trendCfg.class
            )}
          >
            <trendCfg.Icon className="h-3 w-3" />
            {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
