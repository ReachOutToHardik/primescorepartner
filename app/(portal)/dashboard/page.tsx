'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePartnerStore, ReferralStatus } from '@/lib/store';
import {
  Users,
  CheckCircle,
  Clock,
  Coins,
  ArrowRight,
  UserPlus,
  Trophy,
  Sparkle,
  TrendUp,
  CaretRight,
  ShareNetwork,
  Lightning,
} from '@phosphor-icons/react';

// Recharts components
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { partner, referrals, totalPoints, getTier } = usePartnerStore();

  const currentTier = getTier();

  // Metrics calculation
  const totalCount = referrals.length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;
  const pendingCount = referrals.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length;

  // Time range filter state
  const [timeRange, setTimeRange] = useState<'15d' | '30d' | '6m' | '1y'>('6m');

  // Interactive trend datasets based on selected time range
  const trendData = useMemo(() => {
    switch (timeRange) {
      case '15d':
        return [
          { label: '01 Aug', referrals: 1, points: 100 },
          { label: '04 Aug', referrals: 2, points: 250 },
          { label: '07 Aug', referrals: 3, points: 400 },
          { label: '10 Aug', referrals: 4, points: 650 },
          { label: '13 Aug', referrals: totalCount || 5, points: totalPoints || 1000 },
        ];
      case '30d':
        return [
          { label: '15 Jul', referrals: 2, points: 200 },
          { label: '22 Jul', referrals: 3, points: 400 },
          { label: '29 Jul', referrals: 5, points: 700 },
          { label: '05 Aug', referrals: 7, points: 1000 },
          { label: '13 Aug', referrals: Math.max(totalCount, 8), points: totalPoints || 1500 },
        ];
      case '1y':
        return [
          { label: 'Aug 23', referrals: 3, points: 300 },
          { label: 'Oct 23', referrals: 8, points: 900 },
          { label: 'Dec 23', referrals: 14, points: 1800 },
          { label: 'Feb 24', referrals: 22, points: 3200 },
          { label: 'Apr 24', referrals: 35, points: 5400 },
          { label: 'Jun 24', referrals: 48, points: 7800 },
          { label: 'Aug 24', referrals: Math.max(totalCount, 60), points: totalPoints || 10000 },
        ];
      case '6m':
      default:
        return [
          { label: 'Jul', referrals: 2, points: 200 },
          { label: 'Aug', referrals: 4, points: 500 },
          { label: 'Sep', referrals: 5, points: 750 },
          { label: 'Oct', referrals: 8, points: 1200 },
          { label: 'Nov', referrals: 12, points: 2500 },
          { label: 'Dec', referrals: Math.max(totalCount, 15), points: totalPoints || 3000 },
        ];
    }
  }, [timeRange, totalCount, totalPoints]);

  // Helper for status badge styling
  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EBF7ED] text-[#3DAA4B] text-[11px] font-bold uppercase tracking-wider rounded-xs border border-[#3DAA4B]/30">
            <CheckCircle size={12} weight="fill" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FEF9E7] text-[#1A1917] text-[11px] font-bold uppercase tracking-wider rounded-xs border border-[#F5C518]">
            <Clock size={12} weight="fill" className="text-[#F5C518]" /> In Progress
          </span>
        );
      case 'enrolled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-[#1B2A72] text-[11px] font-bold uppercase tracking-wider rounded-xs border border-[#1B2A72]/30">
            Enrolled
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-bold uppercase tracking-wider rounded-xs border border-purple-300">
            Received
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-[var(--ink-muted)] text-[11px] font-bold uppercase tracking-wider rounded-xs border border-[var(--border)]">
            Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider rounded-xs border border-red-200">
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner Header */}
      <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-xs border border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-xs border border-white/15">
            <Sparkle size={14} className="text-[#F5C518]" weight="fill" />
            <span>Welcome back, {partner?.name || 'Arjun Mehta'}!</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Partner Growth & Referral Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Track your submitted client referrals, monitor stage progress, and convert completed cases into cashable PrimePoints rewards.
          </p>
        </div>

        {/* Quick Submit CTA */}
        <div className="relative z-10 shrink-0">
          <Link
            href="/refer"
            className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-semibold text-sm rounded-xs transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <UserPlus size={18} weight="bold" />
            <span>Submit New Referral</span>
          </Link>
        </div>
      </div>

      {/* Metric Stats Rail (Count-Up Feel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[var(--ink-muted)] tracking-wider">
              Total Referrals
            </span>
            <div className="w-9 h-9 rounded-xs bg-[#1B2A72]/10 text-[#1B2A72] flex items-center justify-center">
              <Users size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-[var(--ink)]">
              {totalCount}
            </span>
            <span className="text-xs text-[#3DAA4B] font-semibold flex items-center gap-0.5">
              <TrendUp size={14} /> +15%
            </span>
          </div>
          <p className="text-[11px] text-[var(--ink-subtle)]">Cumulative submitted client leads</p>
        </div>

        {/* Approved & Completed */}
        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[var(--ink-muted)] tracking-wider">
              Completed & Paid
            </span>
            <div className="w-9 h-9 rounded-xs bg-[#3DAA4B]/10 text-[#3DAA4B] flex items-center justify-center">
              <CheckCircle size={20} weight="fill" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-[var(--ink)]">
              {completedCount}
            </span>
            <span className="text-xs text-[#3DAA4B] font-semibold">
              ({Math.round((completedCount / (totalCount || 1)) * 100)}% Success)
            </span>
          </div>
          <p className="text-[11px] text-[var(--ink-subtle)]">Successfully resolved & rewarded</p>
        </div>

        {/* Pending In Progress */}
        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[var(--ink-muted)] tracking-wider">
              Active Pending
            </span>
            <div className="w-9 h-9 rounded-xs bg-[#F5C518]/20 text-[#1A1917] flex items-center justify-center">
              <Clock size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-[var(--ink)]">
              {pendingCount}
            </span>
            <span className="text-xs text-[var(--ink-muted)] font-semibold">In Pipeline</span>
          </div>
          <p className="text-[11px] text-[var(--ink-subtle)]">Under active bureau processing</p>
        </div>

        {/* Total Reward Points */}
        <div className="bg-white border border-[var(--border)] p-5 rounded-xs shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[var(--ink-muted)] tracking-wider">
              PrimePoints Balance
            </span>
            <div className="w-9 h-9 rounded-xs bg-[#F5C518]/20 text-[#1A1917] flex items-center justify-center">
              <Coins size={20} weight="fill" className="text-[#F5C518]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-[#1B2A72]">
              {totalPoints.toLocaleString()}
            </span>
            <span className="text-xs font-mono-num text-[var(--ink-muted)] font-semibold">
              (&asymp; ₹{totalPoints / 10})
            </span>
          </div>
          <p className="text-[11px] text-[var(--ink-subtle)]">Redeemable for Instant Gift Cards</p>
        </div>
      </div>

      {/* Middle Section: Chart + PrimePoints Tier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                Referral & Earnings Trend
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Monthly volume of client referrals and accumulated reward points.
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xs text-[var(--ink)] focus:border-[#1B2A72] cursor-pointer"
            >
              <option value="15d">Last 15 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B2A72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1B2A72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDECEA" vertical={false} />
                <XAxis dataKey="label" stroke="#6B6764" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B6764" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1A4E',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'DM Sans',
                    padding: '8px 12px',
                  }}
                  itemStyle={{
                    color: '#F5C518',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                  labelStyle={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#1B2A72"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                  name="PrimePoints"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 cols: PrimePoints Tier Status & Quick Referral Action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reward Card & Tier Status */}
          <div className="bg-[#1B2A72] text-white p-6 rounded-xs border border-white/10 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
                Partner Tier Status
              </span>
              <span className="px-3 py-1 bg-[#F5C518] text-[#0F1A4E] font-display font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1 shadow-xs">
                <Trophy size={14} weight="fill" /> {currentTier} Tier
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-300 block">Available Balance</span>
              <span className="font-mono-num font-bold text-3xl text-white">
                {totalPoints.toLocaleString()} <span className="text-sm font-normal text-[#F5C518]">Pts</span>
              </span>
            </div>

            {/* Progress bar to next tier */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Gold Tier Progress</span>
                <span className="font-mono-num text-white">
                  {totalPoints >= 5000 ? '100%' : `${Math.min(100, Math.round((totalPoints / 5000) * 100))}%`}
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-xs overflow-hidden">
                <div
                  className="bg-[#F5C518] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalPoints / 5000) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-300">
                {totalPoints >= 5000
                  ? '🎉 You unlocked Gold Partner perks (+15% bonus points per referral)!'
                  : `${5000 - totalPoints} pts needed to reach Gold Partner status.`}
              </p>
            </div>

            <Link
              href="/redeem"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-[#1B2A72] font-display font-bold text-xs rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Redeem Gift Cards Now</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>

          {/* Quick Action Link Sharing Card */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#1B2A72]">
              <ShareNetwork size={20} weight="bold" />
              <h3 className="font-display font-bold text-sm text-[var(--ink)]">
                Instant Referral URL
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">
              Share your direct client signup link or scan to open referral submission form.
            </p>
            <Link
              href="/refer"
              className="w-full py-2.5 px-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--ink)] font-display font-semibold text-xs rounded-xs transition-colors flex items-center justify-between"
            >
              <span>Generate Client QR & Link</span>
              <CaretRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Referrals Mini-Table */}
      <div className="bg-white border border-[var(--border)] rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Recent Referrals Pipeline
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Latest client submissions and active bureau progress.
            </p>
          </div>

          <Link
            href="/referrals"
            className="text-xs text-[#1B2A72] font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Referrals</span>
            <CaretRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface)] border-y border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">City</th>
                <th className="p-3">Requested Service</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted Date</th>
                <th className="p-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {referrals.slice(0, 5).map((ref) => (
                <tr key={ref.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="p-3 font-mono-num font-semibold text-[var(--ink)]">{ref.id}</td>
                  <td className="p-3 font-semibold text-[var(--ink)]">
                    {ref.customerName}
                    <span className="block text-[10px] text-[var(--ink-subtle)] font-mono-num">
                      {ref.customerPhone}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--ink-2)]">{ref.city}</td>
                  <td className="p-3 font-medium text-[#1B2A72]">{ref.service}</td>
                  <td className="p-3">{getStatusBadge(ref.status)}</td>
                  <td className="p-3 font-mono-num text-[var(--ink-muted)]">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right font-mono-num font-bold text-[#3DAA4B]">
                    {ref.pointsEarned > 0 ? `+${ref.pointsEarned} Pts` : '—'}
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
