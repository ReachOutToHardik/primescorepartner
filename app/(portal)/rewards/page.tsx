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

      {/* 2. FULL-WIDTH TIER & BALANCE HERO ROADMAP BANNER */}
      <Card
        variant="elevated"
        className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-7 relative overflow-hidden"
      >
        {/* Top Header Metrics Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 font-mono-num block">
              Available Reward Balance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono-num font-bold text-4xl sm:text-5xl text-white tracking-tight">
                {totalPoints.toLocaleString()}
              </span>
              <span className="font-display font-bold text-lg text-amber-400">Pts</span>
              <span className="text-xs font-mono-num text-slate-400 font-semibold pl-1">
                (&asymp; ₹{(totalPoints / 10).toLocaleString()} Value)
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:text-right">
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs font-mono-num text-slate-400">Progress to {nextTierName}:</span>
              <span className="font-mono-num font-bold text-xs text-amber-400">{progressPercent}%</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {currentTier === 'Platinum'
                ? '🏆 Maximum VIP Tier Unlocked'
                : `${(targetPoints - totalPoints).toLocaleString()} Pts needed to unlock ${nextTierName} tier`}
            </p>
          </div>
        </div>

        {/* Continuous Horizontal Progression Roadmap & Milestone Progress Bar */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono-num">
              Partner Tier Progression Roadmap
            </span>
            <span className="text-xs font-mono-num text-amber-400 font-bold">
              Milestone Progress: {totalPoints.toLocaleString()} / 20,000 Pts
            </span>
          </div>

          {/* Continuous Milestone Connecting Progress Line */}
          <div className="relative py-2 hidden md:block">
            {/* Background Line Track */}
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-800 rounded-full" />
            {/* Active Gold Progress Fill Line */}
            <div
              className="absolute top-1/2 left-8 -translate-y-1/2 h-1.5 bg-gradient-to-r from-slate-400 via-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(92, Math.max(8, Math.round((totalPoints / 20000) * 100)))}%` }}
            />

            {/* Milestone Nodes */}
            <div className="relative z-10 grid grid-cols-3 text-center">
              {/* Silver Node */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-slate-300 border-4 border-[#0F172A] shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                </div>
                <span className="text-[11px] font-bold text-white">Silver (Active)</span>
                <span className="text-[10px] font-mono-num text-slate-400">0 Pts</span>
              </div>

              {/* Gold Node */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full border-4 border-[#0F172A] shadow-md flex items-center justify-center ${
                  totalPoints >= 5000 ? 'bg-amber-400' : 'bg-slate-700'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                </div>
                <span className={`text-[11px] font-bold ${totalPoints >= 5000 ? 'text-amber-400' : 'text-slate-400'}`}>Gold Partner</span>
                <span className="text-[10px] font-mono-num text-slate-400">5,000 Pts</span>
              </div>

              {/* Platinum Node */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full border-4 border-[#0F172A] shadow-md flex items-center justify-center ${
                  totalPoints >= 20000 ? 'bg-slate-200' : 'bg-slate-700'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                </div>
                <span className={`text-[11px] font-bold ${totalPoints >= 20000 ? 'text-white' : 'text-slate-400'}`}>Platinum VIP</span>
                <span className="text-[10px] font-mono-num text-slate-400">20,000 Pts</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative pt-2">
            {/* SILVER STEP */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                currentTier === 'Silver'
                  ? 'bg-slate-800/90 border-slate-400 ring-1 ring-slate-400/30'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTier === 'Silver' ? 'bg-slate-300 shadow-xs' : 'bg-slate-600'}`} />
                  <h4 className="font-display font-bold text-sm text-white">Silver Partner</h4>
                </div>
                {currentTier === 'Silver' && (
                  <span className="px-2.5 py-0.5 bg-slate-700 text-slate-200 font-mono-num text-[10px] font-bold uppercase rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs font-mono-num text-slate-400 font-semibold mb-3">0 &ndash; 4,999 Pts</p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-slate-400 shrink-0" weight="fill" />
                  <span>500 Pts base reward / referral</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-slate-400 shrink-0" weight="fill" />
                  <span>Standard 24h voucher turnaround</span>
                </li>
              </ul>
            </div>

            {/* GOLD STEP */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                currentTier === 'Gold'
                  ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTier === 'Gold' ? 'bg-amber-400 shadow-xs' : 'bg-slate-600'}`} />
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Gold Partner</span>
                    <Sparkle size={14} className="text-amber-400" weight="fill" />
                  </h4>
                </div>
                {currentTier === 'Gold' ? (
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-mono-num text-[10px] font-bold uppercase rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-num text-slate-500 uppercase font-bold">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs font-mono-num text-amber-400 font-semibold mb-3">5,000 &ndash; 19,999 Pts</p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400 shrink-0" weight="fill" />
                  <span className="font-bold text-white">+15% Bonus (575 Pts / case)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400 shrink-0" weight="fill" />
                  <span>Dedicated Relationship Manager</span>
                </li>
              </ul>
            </div>

            {/* PLATINUM STEP */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                currentTier === 'Platinum'
                  ? 'bg-slate-800/90 border-slate-400 ring-1 ring-slate-400/30'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTier === 'Platinum' ? 'bg-slate-200 shadow-xs' : 'bg-slate-600'}`} />
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Platinum VIP</span>
                    <Sparkle size={14} className="text-slate-300" weight="fill" />
                  </h4>
                </div>
                {currentTier === 'Platinum' ? (
                  <span className="px-2.5 py-0.5 bg-slate-200 text-slate-950 font-mono-num text-[10px] font-bold uppercase rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-num text-slate-500 uppercase font-bold">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs font-mono-num text-slate-300 font-semibold mb-3">20,000+ Pts</p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-slate-300 shrink-0" weight="fill" />
                  <span className="font-bold text-white">+30% Bonus (650 Pts / case)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-slate-300 shrink-0" weight="fill" />
                  <span>Same-day automated payout</span>
                </li>
              </ul>
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

