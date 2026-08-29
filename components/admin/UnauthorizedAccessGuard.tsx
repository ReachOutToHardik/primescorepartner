'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldWarning, LockKey, ArrowLeft, WarningCircle } from '@phosphor-icons/react';

interface UnauthorizedAccessGuardProps {
  userRole?: string;
  adminEmail?: string | null;
}

export function UnauthorizedAccessGuard({ userRole, adminEmail }: UnauthorizedAccessGuardProps) {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fade-up">
      <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#1B2A72] text-white flex items-center justify-center mx-auto shadow-md">
          <LockKey size={30} weight="bold" />
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider rounded-lg font-mono-num">
            <span>Security Policy • 403 Forbidden</span>
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
            You Are Not Authorized to View This Page
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            Your staff account profile does not have access permissions for this section. Confidentially protected page records and API requests have been blocked.
          </p>
        </div>

        {/* Account Details Panel */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Staff Account Email:</span>
            <span className="font-mono text-[#1B2A72]">{adminEmail || 'Staff Member'}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-t border-slate-200/80 pt-2.5">
            <span>Staff Assigned Role:</span>
            <span className="font-semibold capitalize text-slate-900 bg-slate-200/90 px-2.5 py-0.5 rounded-md text-[11px]">
              {userRole ? userRole.replace('_', ' ') : 'Restricted Staff'}
            </span>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <Link
            href="/admin"
            className="w-full py-3 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span>Return to Executive Control Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
