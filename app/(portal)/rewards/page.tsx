'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

export default function RewardsPage() {
  const { partner, totalPoints, referrals, redemptions } = usePartnerStore();
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'signup_bonus' | 'referral_earned' | 'voucher_redeemed'>('all');
  const [pointTransactions, setPointTransactions] = useState<{
    id: string;
    transaction_type: string;
    points_change: number;
    balance_after: number;
    title: string;
    reference_id: string | null;
    created_at: string;
  }[]>([]);

  const filteredPointTransactions = useMemo(() => {
    if (txFilter === 'all') return pointTransactions;
    return pointTransactions.filter((tx) => tx.transaction_type === txFilter);
  }, [pointTransactions, txFilter]);

  // Fetch real point transactions from Supabase
  useEffect(() => {
    if (!partner?.id) return;
    const fetchTransactions = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('partner_id', partner.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (data) setPointTransactions(data);
      } catch (err) {
        console.error('Point transactions fetch error:', err);
      }
    };
    fetchTransactions();
  }, [partner?.id]);

  // Dynamically compute effective active level based on totalPoints
  const activeLevel: 'Silver' | 'Gold' | 'Platinum' = useMemo(() => {
    if (totalPoints >= 20000) return 'Platinum';
    if (totalPoints >= 5000) return 'Gold';
    return 'Silver';
  }, [totalPoints]);

  // Level Progression & Text Calculations
  const levelDetails = useMemo(() => {
    if (activeLevel === 'Silver') {
      const needed = Math.max(0, 5000 - totalPoints);
      const progress = Math.min(100, Math.max(0, Math.round((totalPoints / 5000) * 100)));
      return {
        currentLevelName: 'Silver Partner',
        nextLevelName: 'Gold',
        targetPoints: 5000,
        pointsNeeded: needed,
        progressPercent: progress,
        levelSubtext: `${needed.toLocaleString()} Pts needed to unlock Gold tier`,
      };
    }

    if (activeLevel === 'Gold') {
      const span = 20000 - 5000;
      const currentInTier = totalPoints - 5000;
      const progress = Math.min(100, Math.max(0, Math.round((currentInTier / span) * 100)));
      const needed = Math.max(0, 20000 - totalPoints);
      return {
        currentLevelName: 'Gold Partner',
        nextLevelName: 'Platinum',
        targetPoints: 20000,
        pointsNeeded: needed,
        progressPercent: progress,
        levelSubtext: `${needed.toLocaleString()} Pts needed to unlock Platinum tier`,
      };
    }

    // Platinum VIP
    return {
      currentLevelName: 'Platinum VIP',
      nextLevelName: 'Max Tier Reached',
      targetPoints: 20000,
      pointsNeeded: 0,
      progressPercent: 100,
      levelSubtext: '🏆 Maximum VIP Level Active (+30% bonus points per case)',
    };
  }, [activeLevel, totalPoints]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Header Banner */}
      <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
            <Coins size={16} className="text-[#F5C518]" weight="fill" />
            <span>Partner Points & Tier Roadmap</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            PrimePoints & Rewards Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Track your accumulated reward points balance, partner tier roadmap, and point activity logs.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          {partner?.status === 'kyc_approved' ? (
            <Link
              href="/redeem"
              className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Gift size={16} weight="fill" />
              <span>Redeem Points</span>
            </Link>
          ) : (
            <button
              onClick={() => setKycModalOpen(true)}
              className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Gift size={16} weight="fill" />
              <span>Redeem Points</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FULL-WIDTH HERO BALANCE & TIER PROGRESSION BANNER (EXACT SCREENSHOT MATCH) */}
      <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
              TOTAL AVAILABLE REWARD BALANCE
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono-num font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight">
                {totalPoints.toLocaleString()}
              </span>
              <span className="font-display font-bold text-xl text-[#1B2A72]">PrimePoints</span>
              <span className="text-xs font-mono-num text-slate-500 font-semibold pl-1">
                (&asymp; ₹{(totalPoints / 4).toLocaleString('en-IN')} Value)
              </span>
            </div>
          </div>

          <div className="space-y-1.5 md:text-right">
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-xs font-mono-num text-slate-500 font-semibold">Tier Progress:</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono-num text-xs font-bold rounded-full">
                {levelDetails.progressPercent}% to {levelDetails.nextLevelName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {levelDetails.levelSubtext}
            </p>
          </div>
        </div>

        {/* OVERALL TIER PROGRESSION TRACK */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-num font-bold">
              <span className="text-slate-500 uppercase tracking-wider">OVERALL TIER PROGRESSION</span>
              <span className="text-[#1B2A72] font-bold">{levelDetails.progressPercent}% Completed</span>
            </div>

            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 shadow-xs animate-stripe ${
                  activeLevel === 'Platinum'
                    ? 'bg-rose-600'
                    : activeLevel === 'Gold'
                    ? 'bg-amber-500'
                    : 'bg-[#1B2A72]'
                }`}
                style={{ width: `${levelDetails.progressPercent}%` }}
              />
            </div>
          </div>

          {/* PARTNER TIER ROADMAP HEADER */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono-num">
              PARTNER TIER ROADMAP
            </span>
            <span className="text-xs font-mono-num text-slate-700 font-bold">
              Current Level: <strong className="text-[#1B2A72]">{levelDetails.currentLevelName}</strong>
            </span>
          </div>

          {/* 3 ROADMAP CARDS */}
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
                  <p className="text-xs font-mono-num text-slate-200 font-bold tracking-wider uppercase">0 &ndash; 4,999 PRIMEPOINTS</p>
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
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-black/80 text-slate-100 font-mono-num text-[11px] font-bold uppercase rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
                      <LockKey size={14} weight="fill" className="text-amber-400" />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-mono-num text-amber-200/90 font-bold tracking-wider uppercase">5,000 &ndash; 19,999 PRIMEPOINTS</p>
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
                  <p className="text-xs font-mono-num text-rose-200/90 font-bold tracking-wider uppercase">20,000+ PRIMEPOINTS</p>
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

      {/* 3. POINTS ACTIVITY HISTORY LEDGER TABLE & TRANSACTION CATEGORY TABS */}
      <Card variant="elevated" className="p-6 space-y-5 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Points Activity Ledger & Audit History
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Detailed breakdown of sign-up bonuses, referral rewards, admin credits, and voucher claims.
            </p>
          </div>

          {/* Transaction Category Filter Tabs */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto text-center text-xs font-semibold shrink-0">
            {[
              { id: 'all', label: 'All', fullLabel: 'All Transactions' },
              { id: 'signup_bonus', label: 'Bonus', fullLabel: 'Sign-Up Bonus' },
              { id: 'referral_earned', label: 'Referrals', fullLabel: 'Referrals' },
              { id: 'voucher_redeemed', label: 'Redeem', fullLabel: 'Redemptions' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTxFilter(tab.id as any)}
                className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all text-center ${
                  txFilter === tab.id
                    ? 'bg-[#1B2A72] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Mobile Card Stack (shown below md) ── */}
        <div className="md:hidden space-y-2.5">
          {filteredPointTransactions.length > 0 ? (
            filteredPointTransactions.map((tx) => (
              <div key={tx.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 font-bold text-[10px] uppercase rounded-md border ${
                    tx.transaction_type === 'signup_bonus' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    tx.transaction_type === 'voucher_redeemed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {tx.transaction_type === 'signup_bonus' ? 'Sign-Up Bonus' :
                     tx.transaction_type === 'voucher_redeemed' ? 'Redemption' :
                     tx.transaction_type === 'referral_earned' ? 'Referral' :
                     tx.transaction_type === 'enrolled_earned' ? 'Enrollment' :
                     tx.transaction_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono-num">
                    {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-900 leading-snug">{tx.title}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono-num">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Points Change</p>
                    <p className={`font-bold text-sm ${
                      tx.points_change > 0 ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {tx.points_change > 0 ? '+' : ''}{tx.points_change} Pts
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Running Balance</p>
                    <p className="font-bold text-sm text-slate-900">
                      {tx.balance_after.toLocaleString()} Pts
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2.5">
              {(txFilter === 'all' || txFilter === 'signup_bonus') && (
                <div className="bg-white border border-amber-100 bg-amber-50/20 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    {partner?.status === 'kyc_approved' ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">Bonus Credited</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] uppercase rounded-md border border-amber-200">Pending Verification</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium font-mono-num">
                      {partner?.joinedAt ? new Date(partner.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Registration'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    Partner Registration Sign-Up Welcome Bonus{' '}
                    {partner?.status !== 'kyc_approved' && (
                      <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">(Unlocked upon KYC Approval)</span>
                    )}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono-num">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Points Change</p>
                      <p className="font-bold text-sm text-emerald-600">
                        {partner?.status === 'kyc_approved' ? '+100 Pts' : '100 Pts (Locked)'}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Running Balance</p>
                      <p className="font-bold text-sm text-slate-900">
                        {partner?.status === 'kyc_approved' ? '100 Pts' : '0 Pts'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(txFilter === 'all' || txFilter === 'referral_earned') &&
                referrals
                  .filter((r) => r.status === 'completed')
                  .map((r) => (
                    <div key={r.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">Referral</span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono-num">
                          {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 leading-snug">
                        Referral Case Resolved: <span className="font-bold">{r.customerName}</span>
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono-num">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Points Change</p>
                          <p className="font-bold text-sm text-emerald-600">+{r.pointsEarned || 500} Pts</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Running Balance</p>
                          <p className="font-bold text-sm text-slate-900">Points Credited</p>
                        </div>
                      </div>
                    </div>
                  ))}

              {(txFilter === 'all' || txFilter === 'voucher_redeemed') &&
                redemptions.map((rdm) => (
                  <div key={rdm.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-md border border-slate-200">Redemption</span>
                      <span className="text-[10px] text-slate-400 font-medium font-mono-num">
                        {new Date(rdm.redeemedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      Voucher Claimed: <span className="font-bold">{rdm.brand}</span> (₹{rdm.denomination})
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono-num">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Points Change</p>
                        <p className="font-bold text-sm text-slate-500">-{rdm.points} Pts</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 font-sans">Running Balance</p>
                        <p className="font-bold text-sm text-slate-900">Voucher Deducted</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ── Desktop Table (shown md and above) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Transaction Details</th>
                <th className="py-3 px-2 text-right">Points</th>
                <th className="py-3 px-2 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPointTransactions.length > 0 ? (
                filteredPointTransactions.map((tx) => (
                  <tr key={tx.id} className={`hover:bg-slate-50/60 transition-colors ${tx.points_change > 0 ? 'bg-emerald-50/20' : 'bg-slate-50/30'}`}>
                    <td className="py-3 px-2 font-mono-num text-slate-500">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 font-semibold text-[11px] rounded-sm ${
                        tx.transaction_type === 'signup_bonus' ? 'bg-amber-100 text-amber-800' :
                        tx.transaction_type === 'voucher_redeemed' ? 'bg-slate-100 text-slate-600' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {tx.transaction_type === 'signup_bonus' ? 'Sign-Up Bonus' :
                         tx.transaction_type === 'voucher_redeemed' ? 'Redemption' :
                         tx.transaction_type === 'referral_earned' ? 'Referral' :
                         tx.transaction_type === 'enrolled_earned' ? 'Enrollment' :
                         tx.transaction_type === 'team_override' ? 'Team Override' :
                         tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-900">{tx.title}</td>
                    <td className={`py-3 px-2 text-right font-mono-num font-bold ${
                      tx.points_change > 0 ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {tx.points_change > 0 ? '+' : ''}{tx.points_change} Pts
                    </td>
                    <td className="py-3 px-2 text-right font-mono-num text-slate-500">
                      {tx.balance_after.toLocaleString()} Pts
                    </td>
                  </tr>
                ))
              ) : (
                // Fallback: derive from referrals + redemptions if no DB transactions match filter
                <>
                  {(txFilter === 'all' || txFilter === 'signup_bonus') && (
                    <tr className="hover:bg-slate-50/60 transition-colors bg-amber-50/30">
                      <td className="py-3 px-2 font-mono-num text-slate-500">
                        {partner?.joinedAt
                          ? new Date(partner.joinedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
                          : 'Registration'}
                      </td>
                      <td className="py-3 px-2">
                        {partner?.status === 'kyc_approved' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-sm">Bonus Credited</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-[11px] rounded-sm">Pending Verification</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium text-slate-900">
                        Partner Registration Sign-Up Welcome Bonus{' '}
                        {partner?.status !== 'kyc_approved' && (
                          <span className="text-[11px] text-amber-700 font-semibold">(Unlocked upon KYC Approval)</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-mono-num font-bold text-emerald-600" colSpan={2}>
                        {partner?.status === 'kyc_approved' ? '+100 Pts' : '100 Pts (Locked)'}
                      </td>
                    </tr>
                  )}
                  {(txFilter === 'all' || txFilter === 'referral_earned') &&
                    referrals
                      .filter((r) => r.status === 'completed')
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-2 font-mono-num text-slate-500">
                            {new Date(r.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-sm">Referral</span>
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-900">
                            Referral Case Resolved: <span className="font-bold">{r.customerName}</span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono-num font-bold text-emerald-600" colSpan={2}>
                            +{r.pointsEarned || 500} Pts
                          </td>
                        </tr>
                      ))}
                  {(txFilter === 'all' || txFilter === 'voucher_redeemed') &&
                    redemptions.map((rdm) => (
                      <tr key={rdm.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-2 font-mono-num text-slate-500">
                          {new Date(rdm.redeemedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[11px] rounded-sm">Redemption</span>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-900">
                          Voucher Claimed: <span className="font-bold">{rdm.brand}</span> (₹{rdm.denomination})
                        </td>
                        <td className="py-3 px-2 text-right font-mono-num font-bold text-slate-500" colSpan={2}>
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

      {/* KYC Under Review Alert Modal */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.kycSubmittedAt || partner?.joinedAt}
      />
    </div>
  );
}
