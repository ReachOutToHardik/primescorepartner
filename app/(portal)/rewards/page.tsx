'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import {
  Coins,
  Trophy,
  Gift,
  Sparkle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Lightning,
  LockKey,
  Check,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';

export default function RewardsPage() {
  const { totalPoints, referrals, redemptions, getTier } = usePartnerStore();
  const currentTier = getTier();

  // Next tier details
  let nextTierName = 'Gold';
  let targetPoints = 5000;
  if (currentTier === 'Gold') {
    nextTierName = 'Platinum';
    targetPoints = 20000;
  } else if (currentTier === 'Platinum') {
    nextTierName = 'Max Tier Reached';
    targetPoints = 20000;
  }

  const progressPercent = Math.min(100, Math.round((totalPoints / targetPoints) * 100));

  // Calculated totals
  const totalEarnedFromRefs = referrals
    .filter((r) => r.status === 'completed')
    .reduce((acc, r) => acc + (r.pointsEarned || 500), 0);

  const totalRedeemed = redemptions.reduce((acc, r) => acc + r.points, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Coins size={26} className="text-amber-500" weight="fill" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              PrimePoints & Rewards Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track your accumulated reward points balance, partner tier roadmap, and point activity logs.
          </p>
        </div>

        <Link
          href="/redeem"
          className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-display font-bold text-xs rounded-full transition-all inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg shrink-0"
        >
          <Gift size={16} weight="fill" />
          <span>Redeem Points</span>
        </Link>
      </div>

      {/* 2. FULL-WIDTH HERO BALANCE & TIER PROGRESSION BANNER */}
      <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
              Total Available Reward Balance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono-num font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight">
                {totalPoints.toLocaleString()}
              </span>
              <span className="font-display font-bold text-xl text-[#1B2A72]">PrimePoints</span>
              <span className="text-xs font-mono-num text-slate-500 font-bold pl-1">
                (&asymp; ₹{(totalPoints / 10).toLocaleString()} Value)
              </span>
            </div>
          </div>

          <div className="space-y-2 md:text-right">
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-xs font-mono-num text-slate-500 font-semibold">Tier Progress:</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono-num text-xs font-bold rounded-full">
                {progressPercent}% to {nextTierName}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {currentTier === 'Platinum'
                ? '🏆 Maximum VIP Level Active (+30% bonus points per case)'
                : `${(targetPoints - totalPoints).toLocaleString()} Pts needed to unlock ${nextTierName} tier`}
            </p>
          </div>
        </div>

        {/* Progress Bar & Roadmap */}
        <div className="space-y-5">
          {/* Progress Bar Track: Grey Background with Navy Blue Fill */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-num font-bold">
              <span className="text-slate-500 uppercase tracking-wider">Overall Tier Progression</span>
              <span className="text-[#1B2A72]">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
              <div
                className="bg-[#1B2A72] h-full rounded-full transition-all duration-700 shadow-xs animate-stripe relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Roadmap Header */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono-num">
              Partner Tier Roadmap
            </span>
            <span className="text-xs font-mono-num text-[#1B2A72] font-bold">
              Current Level: {currentTier} Partner
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* SILVER TIER (Base/Completed) */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              currentTier === 'Silver' ? 'bg-white border-[#1B2A72] ring-2 ring-[#1B2A72]/20 shadow-md' : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              {/* Decorative Top Banner with SVG Pattern */}
              <div className="h-14 bg-gradient-to-r from-[#1B2A72] via-[#253390] to-[#0F1A4E] relative p-3 flex items-center justify-between overflow-hidden">
                {/* SVG Geometric Background Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="silverGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#FFFFFF" />
                      <path d="M0 8h16M8 0v16" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 2" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#silverGrid)" />
                </svg>

                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-100">Silver Partner</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check size={12} weight="bold" />
                  </span>
                </div>

                {currentTier === 'Silver' && (
                  <span className="relative z-10 px-2.5 py-0.5 bg-amber-400 text-amber-950 font-mono-num text-[10px] font-extrabold uppercase rounded-full shadow-xs tracking-wider">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs font-mono-num text-[#1B2A72] font-bold">0 &ndash; 4,999 Pts</p>
                <ul className="text-xs text-slate-600 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" weight="fill" />
                    <span>500 Pts base reward / referral</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" weight="fill" />
                    <span>Standard 24h voucher delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GOLD TIER */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              currentTier === 'Gold'
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                : totalPoints >= 5000
                ? 'bg-emerald-50/40 border-emerald-300'
                : 'bg-slate-50/70 border-slate-200/90'
            }`}>
              {/* Decorative Top Banner with SVG Pattern */}
              <div className={`h-14 relative p-3 flex items-center justify-between overflow-hidden ${
                totalPoints >= 5000
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600'
                  : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900'
              }`}>
                {/* SVG Geometric Waves Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="goldWaves" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M0 12 Q 6 6, 12 12 T 24 12" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#goldWaves)" />
                </svg>

                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-white flex items-center gap-1">
                    <span>Gold Partner</span>
                    <Sparkle size={14} className="text-amber-300" weight="fill" />
                  </span>

                  {totalPoints >= 5000 ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check size={12} weight="bold" />
                    </span>
                  ) : null}
                </div>

                {currentTier === 'Gold' ? (
                  <span className="relative z-10 px-2.5 py-0.5 bg-amber-400 text-amber-950 font-mono-num text-[10px] font-extrabold uppercase rounded-full shadow-xs tracking-wider">
                    ACTIVE
                  </span>
                ) : totalPoints < 5000 ? (
                  <span className="relative z-10 px-2.5 py-0.5 bg-black/40 text-slate-200 font-mono-num text-[10px] font-bold uppercase rounded-full flex items-center gap-1 border border-white/20">
                    <LockKey size={12} weight="fill" />
                    <span>LOCKED</span>
                  </span>
                ) : null}
              </div>

              <div className="p-5 space-y-3">
                <p className={`text-xs font-mono-num font-bold ${totalPoints < 5000 ? 'text-slate-400' : 'text-amber-600'}`}>5,000 &ndash; 19,999 Pts</p>
                <ul className={`text-xs space-y-2 font-medium ${totalPoints < 5000 ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className={totalPoints < 5000 ? 'text-slate-300' : 'text-emerald-600'} weight="fill" />
                    <span className={totalPoints < 5000 ? 'text-slate-500' : 'font-bold text-slate-900'}>+15% Bonus (575 Pts / case)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className={totalPoints < 5000 ? 'text-slate-300' : 'text-emerald-600'} weight="fill" />
                    <span>Dedicated Relationship Manager</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* PLATINUM TIER */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              currentTier === 'Platinum'
                ? 'bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                : totalPoints >= 20000
                ? 'bg-emerald-50/40 border-emerald-300'
                : 'bg-slate-50/70 border-slate-200/90'
            }`}>
              {/* Decorative Top Banner with SVG Pattern */}
              <div className={`h-14 relative p-3 flex items-center justify-between overflow-hidden ${
                totalPoints >= 20000
                  ? 'bg-gradient-to-r from-purple-700 via-rose-700 to-indigo-900'
                  : 'bg-gradient-to-r from-slate-800 via-slate-900 to-black'
              }`}>
                {/* SVG Hexagon Diamonds Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="platDiamonds" width="20" height="20" patternUnits="userSpaceOnUse">
                      <polygon points="10,0 20,10 10,20 0,10" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#platDiamonds)" />
                </svg>

                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-white flex items-center gap-1">
                    <span>Platinum VIP</span>
                    <Sparkle size={14} className="text-purple-300" weight="fill" />
                  </span>

                  {totalPoints >= 20000 ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check size={12} weight="bold" />
                    </span>
                  ) : null}
                </div>

                {currentTier === 'Platinum' ? (
                  <span className="relative z-10 px-2.5 py-0.5 bg-purple-400 text-purple-950 font-mono-num text-[10px] font-extrabold uppercase rounded-full shadow-xs tracking-wider">
                    ACTIVE
                  </span>
                ) : totalPoints < 20000 ? (
                  <span className="relative z-10 px-2.5 py-0.5 bg-black/40 text-slate-200 font-mono-num text-[10px] font-bold uppercase rounded-full flex items-center gap-1 border border-white/20">
                    <LockKey size={12} weight="fill" />
                    <span>LOCKED</span>
                  </span>
                ) : null}
              </div>

              <div className="p-5 space-y-3">
                <p className={`text-xs font-mono-num font-bold ${totalPoints < 20000 ? 'text-slate-400' : 'text-purple-600'}`}>20,000+ Pts</p>
                <ul className={`text-xs space-y-2 font-medium ${totalPoints < 20000 ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className={totalPoints < 20000 ? 'text-slate-300' : 'text-emerald-600'} weight="fill" />
                    <span className={totalPoints < 20000 ? 'text-slate-500' : 'font-bold text-slate-900'}>+30% Bonus (650 Pts / case)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={15} className={totalPoints < 20000 ? 'text-slate-300' : 'text-emerald-600'} weight="fill" />
                    <span>Same-day automated payout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. LOWER SECTION: MAIN CONTENT (65%) & SIDEBAR (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN COLUMN (65%) */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Points Activity History
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Recent point accruals from referrals and gift voucher claims.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Transaction Details</th>
                    <th className="py-3 px-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrals.filter((r) => r.status === 'completed').length === 0 && redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        No transactions recorded yet. Completed referrals will log earnings here.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {referrals
                        .filter((r) => r.status === 'completed')
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-2 font-mono-num text-slate-500">
                              {new Date(r.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-sm">
                                Referral
                              </span>
                            </td>
                            <td className="py-3 px-2 font-medium text-slate-900">
                              Referral Case Resolved: <span className="font-bold">{r.customerName}</span> ({r.id})
                            </td>
                            <td className="py-3 px-2 text-right font-mono-num font-bold text-emerald-600">
                              +{r.pointsEarned || 500} Pts
                            </td>
                          </tr>
                        ))}

                      {redemptions.map((rdm) => (
                        <tr key={rdm.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-2 font-mono-num text-slate-500">
                            {new Date(rdm.redeemedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[11px] rounded-sm">
                              Redemption
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-900">
                            Voucher Claimed: <span className="font-bold">{rdm.brand}</span> (₹{rdm.denomination})
                          </td>
                          <td className="py-3 px-2 text-right font-mono-num font-bold text-slate-500">
                            -{rdm.points} Pts
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* SIDEBAR (35%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 font-mono-num">
              Quick Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Total Earned */}
              <Card variant="elevated" className="p-4 space-y-1.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-num">
                  Total Earned
                </span>
                <p className="font-mono-num font-bold text-xl text-slate-900">
                  {totalEarnedFromRefs.toLocaleString()}
                </p>
                <span className="text-[11px] font-mono-num font-semibold text-emerald-600 block">
                  +{totalEarnedFromRefs} Pts
                </span>
              </Card>

              {/* Total Redeemed */}
              <Card variant="elevated" className="p-4 space-y-1.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-num">
                  Total Redeemed
                </span>
                <p className="font-mono-num font-bold text-xl text-slate-900">
                  {totalRedeemed.toLocaleString()}
                </p>
                <span className="text-[11px] font-mono-num font-semibold text-slate-500 block">
                  -{totalRedeemed} Pts
                </span>
              </Card>

              {/* Conversion Rate */}
              <Card variant="elevated" className="p-4 space-y-1.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-num">
                  Conversion
                </span>
                <p className="font-mono-num font-bold text-base text-slate-900">
                  10 Pts = ₹1
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Instant Payout</p>
              </Card>

              {/* Payout Fee */}
              <Card variant="elevated" className="p-4 space-y-1.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-num">
                  Handling Fee
                </span>
                <p className="font-mono-num font-bold text-base text-emerald-600">
                  0% Free
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Free Claims</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

