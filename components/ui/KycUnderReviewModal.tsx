'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShieldWarning, Sparkle, ArrowRight, X } from '@phosphor-icons/react';

interface KycUnderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinedAt?: string;
}

export function KycUnderReviewModal({ isOpen, onClose, joinedAt }: KycUnderReviewModalProps) {
  if (!isOpen) return null;

  const formattedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-amber-200/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-slide-in relative overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Top Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
            <Clock size={26} weight="fill" />
          </div>
          <div>
            <span className="text-[10px] font-mono-num font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Verification Pending
            </span>
            <h3 className="font-display font-bold text-lg leading-tight text-slate-900">
              Application Under Review
            </h3>
          </div>
        </div>

        {/* Core Message Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2 text-xs text-amber-950">
          <p className="font-medium leading-relaxed">
            We&apos;ll send you an SMS when you are verified. It usually takes <strong>24 to 48 hours</strong>.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono-num font-semibold text-amber-800 border-t border-amber-200/60">
            <Clock size={14} className="shrink-0" />
            <span>Submitted on: {formattedDate}</span>
          </div>
        </div>

        {/* Sign-up Bonus Notice */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
          <Sparkle size={20} className="text-emerald-600 shrink-0 mt-0.5" weight="fill" />
          <div className="text-xs text-emerald-900 font-medium leading-snug">
            <span className="font-bold block text-emerald-950">100 PrimePoints Sign-Up Bonus</span>
            After verification, you will receive your <strong>100 PrimePoints</strong> sign-up bonus credited directly to your wallet!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Link
            href="/kyc"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span>Check Application Status</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-semibold text-xs rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
