'use client';

import React, { useMemo } from 'react';
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
  Crown,
  ShieldCheck
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';

export default function RewardsPage() {
  const { totalPoints, referrals, redemptions } = usePartnerStore();

  // Dynamically compute effective active level based on totalPoints
  const activeLevel: 'Silver' | 'Gold' | 'Platinum' = useMemo(() => {
    if (totalPoints >= 20000) return 'Platinum';
    if (totalPoints >= 5000) return 'Gold';
    return 'Silver';
  }, [totalPoints]);

  // Level Progression & Bar Calculations
  const levelDetails = useMemo(() => {
    if (activeLevel === 'Silver') {
      const needed = Math.max(0, 5000 - totalPoints);
      const progress = Math.min(100, Math.max(0, Math.round((totalPoints / 5000) * 100)));
      return {
        currentLevelName: 'Silver Partner',
        nextLevelName: 'Gold Partner',
        targetPoints: 5000,
        pointsNeeded: needed,
        progressPercent: progress,
        levelSubtext: `${needed.toLocaleString()} Pts needed to unlock Gold Partner tier`,
      };
    }

    if (activeLevel === 'Gold') {
      const span = 20000 - 5000;
      const currentInTier = totalPoints - 5000;
      const progress = Math.min(100, Math.max(0, Math.round((currentInTier / span) * 100)));
      const needed = Math.max(0, 20000 - totalPoints);
      return {
        currentLevelName: 'Gold Partner',
        nextLevelName: 'Platinum VIP',
        targetPoints: 20000,
        pointsNeeded: needed,
        progressPercent: progress,
        levelSubtext: `${needed.toLocaleString()} Pts needed to unlock Platinum VIP tier`,
      };
    }

    // Platinum VIP
    return {
      currentLevelName: 'Platinum VIP Partner',
      nextLevelName: 'Max Level Reached',
      targetPoints: 20000,
      pointsNeeded: 0,
      progressPercent: 100,
      levelSubtext: '🏆 Maximum VIP Level Active (+30% bonus points per case)',
    };
  }, [activeLevel, totalPoints]);

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

      {/* 2. FULL-WIDTH HERO BALANCE & DYNAMIC TIER PROGRESSION BANNER */}
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
                (&asymp; ₹{(totalPoints / 10).toLocaleString('en-IN')} Value)
              </span>
            </div>
          </div>

          <div className="space-y-2 md:text-right">
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-xs font-mono-num text-slate-500 font-semibold">Tier Progress:</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono-num text-xs font-bold rounded-full">
                {levelDetails.progressPercent}% to {levelDetails.nextLevelName}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {levelDetails.levelSubtext}
            </p>
          </div>
        </div>

        {/* Progression Bar Track (Restored original layout with dynamic tier milestone color) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-num font-bold">
              <span className="text-slate-500 uppercase tracking-wider">OVERALL TIER PROGRESSION</span>
              <span className={`font-bold ${
                activeLevel === 'Platinum' ? 'text-rose-600' : activeLevel === 'Gold' ? 'text-amber-600' : 'text-[#1B2A72]'
              }`}>
                {levelDetails.progressPercent}% Completed
              </span>
            </div>
            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 shadow-xs relative ${
                  activeLevel === 'Platinum'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-400'
                    : activeLevel === 'Gold'
                    ? 'bg-gradient-to-r from-amber-500 to-[#F5C518]'
                    : 'bg-[#1B2A72]'
                }`}
                style={{ width: `${levelDetails.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Roadmap Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono-num">
              Partner Tier Roadmap
            </span>
            <span className="text-xs font-mono-num text-slate-700 font-bold">
              Current Level: <strong className={activeLevel === 'Platinum' ? 'text-rose-600' : activeLevel === 'Gold' ? 'text-amber-600' : 'text-[#1B2A72]'}>{levelDetails.currentLevelName}</strong>
            </span>
          </div>

          {/* 3 DYNAMIC ROADMAP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. SILVER TIER */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              activeLevel === 'Silver' ? 'bg-white border-[#1B2A72] ring-2 ring-[#1B2A72]/20 shadow-lg' : 'bg-white border-slate-200'
            }`}>
              <div className="h-44 relative p-6 flex flex-col justify-between overflow-hidden">
                <img
                  src="/tier1-wave.svg"
                  alt="Silver Wave Banner"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-extrabold tracking-tight text-white drop-shadow-md">Silver Partner</span>
                  </div>

                  {totalPoints >= 5000 ? (
                    <span className="px-3 py-1 bg-emerald-500 text-white font-mono-num text-[11px] font-extrabold uppercase rounded-full shadow-md tracking-wider flex items-center gap-1">
                      <Check size={14} weight="bold" /> COMPLETED
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-400 text-amber-950 font-mono-num text-[11px] font-extrabold uppercase rounded-full shadow-md tracking-wider">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-mono-num text-slate-200 font-bold tracking-wider uppercase">0 &ndash; 4,999 PrimePoints</p>
                </div>
              </div>

              <div className="p-6 space-y-3 bg-white">
                <ul className="text-sm text-slate-700 space-y-2.5 font-medium leading-relaxed">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className="text-emerald-600 shrink-0" weight="fill" />
                    <span>500 Pts base reward / referral</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className="text-emerald-600 shrink-0" weight="fill" />
                    <span>Standard 24h voucher delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. GOLD TIER */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              activeLevel === 'Gold'
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                : totalPoints >= 20000
                ? 'bg-white border-slate-200'
                : 'bg-slate-100/90 border-slate-300 brightness-95 opacity-85'
            }`}>
              <div className="h-44 relative p-6 flex flex-col justify-between overflow-hidden">
                <img
                  src="/tier2-wave.svg"
                  alt="Gold Wave Banner"
                  className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none ${totalPoints < 5000 ? 'brightness-75' : ''}`}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                      <span>Gold Partner</span>
                      <Sparkle size={18} className="text-amber-300" weight="fill" />
                    </span>
                  </div>

                  {totalPoints >= 20000 ? (
                    <span className="px-3 py-1 bg-emerald-500 text-white font-mono-num text-[11px] font-extrabold uppercase rounded-full shadow-md tracking-wider flex items-center gap-1">
                      <Check size={14} weight="bold" /> COMPLETED
                    </span>
                  ) : totalPoints >= 5000 ? (
                    <span className="px-3 py-1 bg-amber-400 text-amber-950 font-mono-num text-[11px] font-extrabold uppercase rounded-full shadow-md tracking-wider">
                      ACTIVE UNLOCKED
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-black/80 text-slate-100 font-mono-num text-[11px] font-bold uppercase rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
                      <LockKey size={14} weight="fill" className="text-amber-400" />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-mono-num text-amber-200/90 font-bold tracking-wider uppercase">5,000 &ndash; 19,999 PrimePoints</p>
                </div>
              </div>

              <div className="p-6 space-y-3 bg-white">
                <ul className="text-sm space-y-2.5 font-medium leading-relaxed text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className={totalPoints >= 5000 ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} weight="fill" />
                    <span className="font-semibold text-slate-900">+15% Bonus (575 Pts / case)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className={totalPoints >= 5000 ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} weight="fill" />
                    <span>Dedicated Relationship Manager</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. PLATINUM VIP TIER */}
            <div className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              activeLevel === 'Platinum'
                ? 'bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                : 'bg-slate-100/90 border-slate-300 brightness-95 opacity-85'
            }`}>
              <div className="h-44 relative p-6 flex flex-col justify-between overflow-hidden">
                <img
                  src="/tier3-wave.svg"
                  alt="Platinum Wave Banner"
                  className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none ${totalPoints < 20000 ? 'brightness-75' : ''}`}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                      <span>Platinum VIP</span>
                      <Crown size={18} className="text-amber-300" weight="fill" />
                    </span>
                  </div>

                  {totalPoints >= 20000 ? (
                    <span className="px-3 py-1 bg-rose-500 text-white font-mono-num text-[11px] font-extrabold uppercase rounded-full shadow-md tracking-wider flex items-center gap-1">
                      <Sparkle size={14} weight="fill" /> ACTIVE VIP
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-black/80 text-slate-100 font-mono-num text-[11px] font-bold uppercase rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
                      <LockKey size={14} weight="fill" className="text-rose-400" />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-mono-num text-rose-200/90 font-bold tracking-wider uppercase">20,000+ PrimePoints</p>
                </div>
              </div>

              <div className="p-6 space-y-3 bg-white">
                <ul className="text-sm space-y-2.5 font-medium leading-relaxed text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className={totalPoints >= 20000 ? 'text-rose-500 shrink-0' : 'text-slate-400 shrink-0'} weight="fill" />
                    <span className="font-semibold text-slate-900">+30% Bonus (650 Pts / case)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle size={17} className={totalPoints >= 20000 ? 'text-rose-500 shrink-0' : 'text-slate-400 shrink-0'} weight="fill" />
                    <span>Same-day automated payout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. POINTS ACTIVITY HISTORY LEDGER TABLE */}
      <Card variant="elevated" className="p-6 space-y-4 rounded-2xl shadow-xs">
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
  );
}
