'use client';

import React from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import {
  Coins,
  Trophy,
  Gift,
  ArrowRight,
  Sparkle,
  TrendUp,
  CheckCircle,
  Clock,
  ListChecks,
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
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Coins size={26} className="text-[#F5C518]" weight="fill" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            PrimePoints & Rewards Center
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
          Track your accumulated reward points balance, partner tier privileges, and point earning logs.
        </p>
      </div>

      {/* Big Balance Header Card */}
      <div className="bg-[#0F1A4E] text-white p-6 sm:p-10 rounded-xs border border-white/10 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
              Total Available Reward Balance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono-num font-bold text-4xl sm:text-5xl text-white">
                {totalPoints.toLocaleString()}
              </span>
              <span className="font-display font-bold text-xl text-[#F5C518]">PrimePoints</span>
              <span className="text-sm font-mono-num text-slate-300">
                (&asymp; ₹{(totalPoints / 10).toLocaleString()} Value)
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/redeem"
              className="px-6 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-sm rounded-xs transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <Gift size={18} weight="fill" />
              <span>Redeem Gift Vouchers</span>
            </Link>
          </div>
        </div>

        {/* Tier Progress Section */}
        <div className="pt-6 border-t border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-[#F5C518]" weight="fill" />
              <span className="font-display font-bold text-white">
                Current Level: {currentTier} Partner
              </span>
            </div>
            <span className="font-mono-num font-bold text-[#F5C518]">
              {progressPercent}% to {nextTierName}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/15 h-3 rounded-xs overflow-hidden">
            <div
              className="bg-[#F5C518] h-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-300 gap-1">
            <p>
              {currentTier === 'Platinum'
                ? '🏆 Maximum Partner Tier Unlocked! Enjoy 30% bonus points on every successful referral.'
                : `Earn ${targetPoints - totalPoints} more points to reach ${nextTierName} tier and unlock higher commission bonuses.`}
            </p>
            <span className="font-mono-num text-[11px] text-slate-400">
              {totalPoints} / {targetPoints} Pts
            </span>
          </div>
        </div>
      </div>

      {/* Points Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2">
          <span className="text-xs uppercase font-semibold text-[var(--ink-muted)]">
            Total Points Earned
          </span>
          <p className="font-mono-num font-bold text-2xl text-[#3DAA4B]">
            +{totalEarnedFromRefs.toLocaleString()} Pts
          </p>
          <p className="text-[11px] text-[var(--ink-subtle)]">From completed client referrals</p>
        </div>

        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2">
          <span className="text-xs uppercase font-semibold text-[var(--ink-muted)]">
            Total Points Redeemed
          </span>
          <p className="font-mono-num font-bold text-2xl text-[#E63329]">
            -{totalRedeemed.toLocaleString()} Pts
          </p>
          <p className="text-[11px] text-[var(--ink-subtle)]">Claimed as Amazon / Flipkart vouchers</p>
        </div>

        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2">
          <span className="text-xs uppercase font-semibold text-[var(--ink-muted)]">
            Conversion Rate
          </span>
          <p className="font-mono-num font-bold text-2xl text-[#1B2A72]">
            10 Pts = ₹1.00
          </p>
          <p className="text-[11px] text-[var(--ink-subtle)]">Instant 0% transaction fee payout</p>
        </div>
      </div>

      {/* Partner Tier Privileges Visual Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            Partner Tier Privileges
          </h2>
          <p className="text-xs text-[var(--ink-muted)]">
            Advance your tier status by completing more client referrals to unlock higher commission rates and VIP privileges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SILVER TIER CARD */}
          <Card
            variant={currentTier === 'Silver' ? 'elevated' : 'default'}
            className={`overflow-hidden flex flex-col justify-between relative transition-all ${
              currentTier === 'Silver'
                ? 'ring-2 ring-[#1B2A72]'
                : ''
            }`}
          >
            {/* SVG Banner */}
            <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] p-5 text-white relative overflow-hidden">
              <svg
                className="absolute right-0 top-0 bottom-0 opacity-15 w-36 h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path d="0 0 L100 0 L100 100 Z" fill="#FFFFFF" />
                <circle cx="80" cy="50" r="30" fill="none" stroke="#FFFFFF" strokeWidth="3" />
              </svg>

              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 font-mono-num">
                    Tier 01
                  </span>
                  {currentTier === 'Silver' && (
                    <span className="px-2.5 py-0.5 bg-[#3DAA4B] text-white font-mono-num text-[10px] font-bold uppercase rounded-full shadow-2xs">
                      Active Tier
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Silver Partner</h3>
                <p className="text-xs font-mono-num text-slate-300 font-semibold">
                  0 – 4,999 Points
                </p>
              </div>
            </div>

            {/* Perks Content */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
              <ul className="space-y-2.5 text-xs text-[var(--ink-2)]">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">500 Pts per referral</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">Base reward rate for every approved client</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">Standard Payouts</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">24-48 hour payout turnaround</span>
                  </div>
                </li>
              </ul>

              <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--ink-subtle)] font-mono-num">
                Requirement: Default tier upon KYC approval
              </div>
            </div>
          </Card>

          {/* GOLD TIER CARD */}
          <div
            className={`bg-white border rounded-xs shadow-xs overflow-hidden flex flex-col justify-between relative transition-all ${
              currentTier === 'Gold'
                ? 'border-[#F5C518] ring-2 ring-[#F5C518]/30'
                : 'border-[var(--border)]'
            }`}
          >
            {/* SVG Banner */}
            <div className="bg-[#0F1A4E] p-5 text-white relative overflow-hidden border-b border-[#F5C518]/30">
              <svg
                className="absolute right-0 top-0 bottom-0 opacity-20 w-36 h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polygon points="20,0 100,0 100,100 50,100" fill="#F5C518" />
                <circle cx="75" cy="40" r="25" fill="none" stroke="#F5C518" strokeWidth="2" />
              </svg>

              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5C518] font-mono-num">
                    Tier 02 &bull; Recommended
                  </span>
                  {currentTier === 'Gold' && (
                    <span className="px-2 py-0.5 bg-[#F5C518] text-[#0F1A4E] font-mono-num text-[10px] font-bold uppercase rounded-xs">
                      Active Tier
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <span>Gold Partner</span>
                  <Trophy size={20} className="text-[#F5C518]" weight="fill" />
                </h3>
                <p className="text-xs font-mono-num text-[#F5C518] font-semibold">
                  5,000 – 19,999 Points
                </p>
              </div>
            </div>

            {/* Perks Content */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
              <ul className="space-y-2.5 text-xs text-[var(--ink-2)]">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">+15% Bonus Points</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">Earn 575 Pts per successful referral</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">Relationship Manager</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">Dedicated advisor for fast dispute priority</span>
                  </div>
                </li>
              </ul>

              <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--ink-subtle)] font-mono-num">
                Requirement: 10 completed client cases
              </div>
            </div>
          </div>

          {/* PLATINUM TIER CARD */}
          <div
            className={`bg-white border rounded-xs shadow-xs overflow-hidden flex flex-col justify-between relative transition-all ${
              currentTier === 'Platinum'
                ? 'border-[#E63329] ring-2 ring-[#E63329]/20'
                : 'border-[var(--border)]'
            }`}
          >
            {/* SVG Banner */}
            <div className="bg-[#1A1917] p-5 text-white relative overflow-hidden border-b border-[#E63329]/40">
              <svg
                className="absolute right-0 top-0 bottom-0 opacity-25 w-36 h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path d="M30 0 L100 0 L100 100 L0 100 Z" fill="#E63329" />
                <circle cx="85" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E63329] font-mono-num">
                    Tier 03 &bull; VIP Status
                  </span>
                  {currentTier === 'Platinum' && (
                    <span className="px-2 py-0.5 bg-[#E63329] text-white font-mono-num text-[10px] font-bold uppercase rounded-xs">
                      Active Tier
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <span>Platinum VIP</span>
                  <Sparkle size={20} className="text-[#E63329]" weight="fill" />
                </h3>
                <p className="text-xs font-mono-num text-slate-300 font-semibold">
                  20,000+ Points
                </p>
              </div>
            </div>

            {/* Perks Content */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
              <ul className="space-y-2.5 text-xs text-[var(--ink-2)]">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">+30% Bonus Points</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">Earn 650 Pts per successful referral</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#3DAA4B] shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">Same-Day Cash Payouts</span>
                    <span className="text-[11px] text-[var(--ink-muted)]">Instant bank transfer on completion</span>
                  </div>
                </li>
              </ul>

              <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--ink-subtle)] font-mono-num">
                Requirement: 40 completed client cases
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earning History Table */}
      <div className="bg-white border border-[var(--border)] rounded-xs p-6 shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--ink)]">
          Points Activity History Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface)] border-y border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                <th className="p-3">Activity / Description</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Points Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {/* Combine completed referrals and redemptions */}
              {referrals
                .filter((r) => r.status === 'completed')
                .map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--ink)]">
                      Referral Resolution Completed: {r.customerName} ({r.id})
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#EBF7ED] text-[#3DAA4B] font-bold text-[10px] uppercase rounded-xs">
                        Credit Earnings
                      </span>
                    </td>
                    <td className="p-3 font-mono-num text-[var(--ink-muted)]">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-mono-num font-bold text-[#3DAA4B]">
                      +{r.pointsEarned || 500} Pts
                    </td>
                  </tr>
                ))}

              {redemptions.map((rdm) => (
                <tr key={rdm.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="p-3 font-semibold text-[var(--ink)]">
                    Gift Voucher Redemption: {rdm.brand} (₹{rdm.denomination})
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#FDECEA] text-[#E63329] font-bold text-[10px] uppercase rounded-xs">
                      Voucher Claim
                    </span>
                  </td>
                  <td className="p-3 font-mono-num text-[var(--ink-muted)]">
                    {new Date(rdm.redeemedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right font-mono-num font-bold text-[#E63329]">
                    -{rdm.points} Pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
