'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// ComingSoon — Placeholder page / section for features not yet implemented
//
// Shown on route placeholders that will be built in future phases.
// Provides a polished "under construction" UI rather than a blank page.
//
// Props:
//   featureName – human-readable name of the upcoming feature
//   description – optional short description of what's coming
//   phase       – optional phase label (e.g. "Phase 7 — AI Integration")
//   className   – optional extra class names on the wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface ComingSoonProps {
  featureName: string;
  description?: string;
  phase?: string;
  className?: string;
}

export function ComingSoon({
  featureName,
  description,
  phase,
  className,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4',
        className
      )}
    >
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400"
      >
        <Construction className="h-9 w-9" />
      </motion.div>

      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="space-y-2 max-w-sm"
      >
        <h2 className="text-lg font-bold text-foreground">{featureName}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description ??
            'This feature is currently being built and will be available soon.'}
        </p>
        {phase !== undefined && phase !== '' && (
          <p className="mt-3 inline-block rounded-full bg-purple-600/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
            {phase}
          </p>
        )}
      </motion.div>

      {/* Decorative dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-1.5"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="h-1.5 w-1.5 rounded-full bg-purple-500"
          />
        ))}
      </motion.div>
    </div>
  );
}
