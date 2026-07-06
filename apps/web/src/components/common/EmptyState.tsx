'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState — Centered placeholder for empty lists / zero-data states
//
// Philosophy: Never show a blank space. Every empty list uses this component.
//
// Props:
//   icon        – Lucide icon component (passed as element, not class)
//   title       – short heading (e.g. "No semesters yet")
//   description – explanation / motivational copy
//   action      – optional CTA button: { label, onClick }
//   className   – optional extra class names on the wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center',
          className
        )}
      >
        {/* Icon wrapper */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-muted text-muted-foreground"
        >
          {icon}
        </motion.div>

        {/* Copy */}
        <div className="space-y-1 max-w-xs">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA */}
        {action !== undefined && (
          <Button onClick={action.onClick} size="sm" className="mt-1">
            {action.label}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
