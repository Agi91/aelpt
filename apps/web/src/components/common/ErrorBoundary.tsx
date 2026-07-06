'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBoundary — React class component that catches render errors
//
// Usage:
//   <ErrorBoundary>
//     <SomeCriticalSection />
//   </ErrorBoundary>
//
// Behaviour:
//   - Catches errors during rendering, lifecycle methods, or child constructors
//   - Shows a user-friendly error card with a retry button
//   - Logs error + stack to console in development only
//   - Resets when user clicks "Try Again" (re-mounts children)
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback message */
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, errorMessage: message };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>

          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-foreground">
              {this.props.fallbackMessage ?? 'Something went wrong'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {this.state.errorMessage}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
