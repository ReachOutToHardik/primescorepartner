'use client';

import React, { useEffect } from 'react';
import { WarningCircle, ArrowClockwise, House } from '@phosphor-icons/react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in production wire this to Sentry or similar
    console.error('[Portal Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <WarningCircle size={32} className="text-red-500" weight="fill" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            An unexpected error occurred in the portal. Your data is safe — try refreshing this page or go back to the dashboard.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre className="mt-3 text-left text-xs bg-slate-100 border border-slate-200 rounded-xl p-3 text-red-700 overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2A72] hover:bg-[#152059] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <ArrowClockwise size={16} />
            Try Again
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <House size={16} />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
