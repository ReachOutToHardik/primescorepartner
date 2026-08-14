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
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler,
  Legend
);

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

  // Chart.js Data Configuration
  const chartJsData = useMemo(() => {
    return {
      labels: trendData.map((d) => d.label),
      datasets: [
        {
          fill: true,
          label: 'PrimePoints',
          data: trendData.map((d) => d.points),
          borderColor: '#1B2A72',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 240);
            gradient.addColorStop(0, 'rgba(27, 42, 114, 0.25)');
            gradient.addColorStop(1, 'rgba(27, 42, 114, 0.0)');
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: '#1B2A72',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [trendData]);

  // Chart.js Options
  const chartJsOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1B2A72',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: 'bold' as const },
          bodyFont: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const },
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => `PrimePoints: ${context.parsed.y.toLocaleString()} Pts`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { family: 'DM Sans', size: 11 } },
        },
        y: {
          grid: { color: '#F1F5F9' },
          ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } },
          border: { dash: [4, 4] },
        },
      },
    };
  }, []);

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
      <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
            <Sparkle size={14} className="text-[#F5C518]" weight="fill" />
            <span>Welcome back, {partner?.name || 'Arjun Mehta'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Partner Referral Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor client referral status, track case updates, and view your earned PrimePoints balance.
          </p>
        </div>

        {/* Quick Submit CTA */}
        <div className="relative z-10 shrink-0">
          <Link
            href="/refer"
            className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <UserPlus size={18} weight="bold" />
            <span>Submit Referral</span>
          </Link>
        </div>
      </div>

      {/* Metric Stats Rail (Modern Card Primitives) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Referrals */}
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Referrals
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center shadow-2xs">
              <Users size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-slate-900">
              {totalCount}
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendUp size={14} /> +15%
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Cumulative submitted client leads</p>
        </Card>

        {/* Approved & Completed */}
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Completed & Paid
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle size={20} weight="fill" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-slate-900">
              {completedCount}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {Math.round((completedCount / (totalCount || 1)) * 100)}% Success
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Successfully resolved & rewarded</p>
        </Card>

        {/* Pending In Progress */}
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Active Pending
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Clock size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-slate-900">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">In Pipeline</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Under active bureau processing</p>
        </Card>

        {/* Total Reward Points */}
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              PrimePoints Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center shadow-2xs">
              <Coins size={20} weight="fill" className="text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num font-bold text-3xl text-[#1B2A72]">
              {totalPoints.toLocaleString()}
            </span>
            <span className="text-xs font-mono-num text-slate-500 font-bold">
              (&asymp; ₹{totalPoints / 10})
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Redeemable for Instant Gift Cards</p>
        </Card>
      </div>

      {/* Middle Section: Chart + PrimePoints Tier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral Trend Chart (8 cols) */}
        <Card variant="elevated" className="lg:col-span-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Referral & Earnings Trend
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Monthly volume of client referrals and accumulated reward points.
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
            >
              <option value="15d">Last 15 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>

          <div className="h-64 w-full pt-4">
            <Line data={chartJsData} options={chartJsOptions} />
          </div>
        </Card>

        {/* Right 4 cols: PrimePoints Tier Status & Quick Referral Action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reward Card & Tier Status */}
          <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
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
      <Card variant="elevated" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Recent Referrals Pipeline
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Latest client submissions and active bureau progress.
            </p>
          </div>

          <Link
            href="/referrals"
            className="text-xs text-[#1B2A72] font-bold hover:underline flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/80 transition-all hover:bg-indigo-100"
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
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <EmptyState
                      title="No Referrals Yet"
                      description="You haven't submitted any client referral leads yet. Submit your first referral to earn points."
                      actionText="Submit Referral"
                      actionHref="/refer"
                      icon="user"
                    />
                  </td>
                </tr>
              ) : (
                referrals.slice(0, 5).map((ref) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
