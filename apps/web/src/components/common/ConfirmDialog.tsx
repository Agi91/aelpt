'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmDialog — Modal confirmation for destructive / important actions
//
// Used for: delete semester, delete topic, reset progress, etc.
//
// Props:
//   isOpen       – controlled open state
//   onClose      – called when user dismisses without confirming
//   onConfirm    – called when user clicks the confirm button
//   title        – dialog heading
//   description  – body copy explaining the consequence
//   confirmLabel – label for the confirm button (default: 'Confirm')
//   cancelLabel  – label for the cancel button  (default: 'Cancel')
//   variant      – 'danger' renders the confirm button in destructive style
//   isLoading    – disables buttons and shows spinner while action is pending
// ─────────────────────────────────────────────────────────────────────────────

type ConfirmDialogVariant = 'danger' | 'default';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {/* Warning icon for destructive variant */}
            {isDanger && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-0.5">
                {isDanger ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </span>
            )}
            <div className="min-w-0">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          {/* Cancel */}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>

          {/* Confirm */}
          <Button
            variant={isDanger ? 'destructive' : 'default'}
            onClick={() => void handleConfirm()}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Processing…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
