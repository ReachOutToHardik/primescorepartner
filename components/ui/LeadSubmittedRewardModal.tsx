'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Coins, Sparkle, ArrowRight, ShieldCheck, Trophy } from '@phosphor-icons/react';
import { calculateTier, getReferredUserEnrollmentPoints, getCaseCommissionRate, Tier } from '@/lib/store';

interface LeadSubmittedRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  service: string;
  totalPoints: number;
}

export const LeadSubmittedRewardModal: React.FC<LeadSubmittedRewardModalProps> = ({
  isOpen,
  onClose,
  customerName,
  service,
  totalPoints,
}) => {
  if (!isOpen) return null;

  const currentTier: Tier = calculateTier(totalPoints);
  const enrollmentPoints = getReferredUserEnrollmentPoints(currentTier);
  const commissionRatePct = getCaseCommissionRate(currentTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-up">
        {/* Top Header Banner */}
        <div className="bg-[#0F1A4E] text-white p-6 relative overflow-hidden text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg transform -rotate-3 border-2 border-white/20">
            <CheckCircle size={32} weight="bold" />
          </div>
          <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold uppercase rounded-full tracking-wider border border-amber-400/30">
            Lead Registered Successfully
          </span>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            Referral Recorded for {customerName}!
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Service Requested: <strong className="text-white font-medium">{service}</strong>
          </p>
        </div>

        {/* Reward Potential Breakdown Card */}
        <div className="p-6 space-y-4 bg-white">
          <div className="text-center space-y-1">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-center gap-1.5">
              <Coins size={20} className="text-amber-500" weight="fill" /> Your Guaranteed Reward Earnings Potential
            </h3>
            <p className="text-xs text-slate-500">
              Here is what you will earn as <strong className="text-[#1B2A72]">{currentTier} Partner</strong> when this case progresses:
            </p>
          </div>

          <div className="space-y-3">
            {/* Step 1 Earnings */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-slate-900">
                    Client Platform Dashboard Enrollment
                  </span>
                  <span className="font-mono font-bold text-emerald-600 text-xs">
                    +{enrollmentPoints} PrimePoints
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Earned immediately when <strong>{customerName}</strong> registers on their personal bureau dashboard.
                </p>
              </div>
            </div>

            {/* Step 2 Earnings */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-slate-900">
                    Case Completion Commission ({commissionRatePct}%)
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {commissionRatePct}% of Case Amount
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Credited to your balance upon credit rectification case closure!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <Link
              href="/rewards"
              onClick={onClose}
              className="w-full py-3 px-4 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Trophy size={18} weight="bold" />
              <span>See Full Details in Rewards Center</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Submit Another Referral Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
