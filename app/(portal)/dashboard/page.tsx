'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  CheckCircle,
  Clock,
  Coins,
  TrendUp,
  UserPlus,
  ArrowRight,
  Sparkle,
  Trophy,
  ShieldCheck,
  Building,
  Headset,
  BookBookmark,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Lightning,
  Funnel
} from '@phosphor-icons/react';

// Chart.js Setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PartnerDashboard() {
  const { partner, referrals, redemptions, totalPoints, tier } = usePartnerStore();
  const currentTier = tier || 'Gold';

  // Metrics calculation
  const totalCount = referrals.length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;
  const pendingCount = referrals.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length;

  // Time range filter state & Chart Metric mode toggle
  const [timeRange, setTimeRange] = useState<'15d' | '30d' | '6m' | '1y'>('6m');
  const [chartMetricMode, setChartMetricMode] = useState<'both' | 'referrals' | 'points'>('both');

  // Interactive trend datasets dynamically aggregated from EVERY real partner referral log
  const trendData = useMemo(() => {
    const now = new Date();

    if (timeRange === '6m') {
      const monthsMap = new Map<string, { label: string; referrals: number; points: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('en-US', { month: 'short' });
        monthsMap.set(monthKey, { label: monthKey, referrals: 0, points: i === 0 ? (totalPoints || 0) : 0 });
      }

      referrals.forEach((r) => {
        const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
        const mKey = refDate.toLocaleString('en-US', { month: 'short' });
        if (monthsMap.has(mKey)) {
          const existing = monthsMap.get(mKey)!;
          existing.referrals += 1;
        }
      });

      return Array.from(monthsMap.values());
    }

    if (timeRange === '30d') {
      const weeks = [
        { label: 'Week 1', referrals: 0, points: 0 },
        { label: 'Week 2', referrals: 0, points: 0 },
        { label: 'Week 3', referrals: 0, points: 0 },
        { label: 'Week 4', referrals: 0, points: totalPoints || 0 },
      ];

      referrals.forEach((r) => {
        const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
        const diffDays = Math.floor((now.getTime() - refDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30) {
          const weekIdx = Math.min(3, Math.floor(diffDays / 7));
          const target = weeks[3 - weekIdx];
          if (target) {
            target.referrals += 1;
          }
        }
      });

      return weeks;
    }

    if (timeRange === '15d') {
      const days = [
        { label: '15d ago', referrals: 0, points: 0 },
        { label: '10d ago', referrals: 0, points: 0 },
        { label: '5d ago', referrals: 0, points: 0 },
        { label: 'Today', referrals: 0, points: totalPoints || 0 },
      ];

      referrals.forEach((r) => {
        const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
        const diffDays = Math.floor((now.getTime() - refDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 15) {
          const idx = diffDays === 0 ? 3 : diffDays <= 5 ? 2 : diffDays <= 10 ? 1 : 0;
          const target = days[idx];
          if (target) {
            target.referrals += 1;
          }
        }
      });

      return days;
    }

    const quarters = [
      { label: 'Q1', referrals: 0, points: 0 },
      { label: 'Q2', referrals: 0, points: 0 },
      { label: 'Q3', referrals: 0, points: 0 },
      { label: 'Q4', referrals: 0, points: totalPoints || 0 },
    ];

    referrals.forEach((r) => {
      const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
      const qIdx = Math.floor(refDate.getMonth() / 3);
      if (quarters[qIdx]) {
        quarters[qIdx].referrals += 1;
      }
    });

    return quarters;
  }, [timeRange, referrals, totalPoints]);

  // Chart.js Dual Dataset Configuration
  const chartJsData = useMemo(() => {
    const datasets: any[] = [];

    if (chartMetricMode === 'points' || chartMetricMode === 'both') {
      datasets.push({
        fill: true,
        label: 'PrimePoints Earned (Pts)',
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
        yAxisID: 'y',
      });
    }

    if (chartMetricMode === 'referrals' || chartMetricMode === 'both') {
      datasets.push({
        fill: true,
        label: 'Referral Leads Submitted',
        data: trendData.map((d) => d.referrals),
        borderColor: '#E63329',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(230, 51, 41, 0.2)');
          gradient.addColorStop(1, 'rgba(230, 51, 41, 0.0)');
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: '#E63329',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: chartMetricMode === 'both' ? 'y1' : 'y',
      });
    }

    return {
      labels: trendData.map((d) => d.label),
      datasets,
    };
  }, [trendData, chartMetricMode]);

  // Chart.js Options
  const chartJsOptions: any = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 11, weight: '600' },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: '#0F1A4E',
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 } },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          min: 0,
          ticks: {
            font: { family: 'Inter', size: 11 },
            precision: 0,
          },
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
        },
        y1: chartMetricMode === 'both' ? {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          min: 0,
          ticks: {
            font: { family: 'Inter', size: 11 },
            precision: 0,
          },
          grid: { drawOnChartArea: false },
        } : undefined,
      },
    };
  }, [chartMetricMode]);

  // Chronologically sorted transaction ledger for IN / OUT activity
  const passbookLedger = useMemo(() => {
    const transactions: {
      id: string;
      date: string;
      rawDate: Date;
      category: 'earned_referral' | 'earned_enrolled' | 'submitted' | 'redeemed_voucher';
      title: string;
      referenceId: string;
      amount: number;
      runningBalance: number;
    }[] = [];

    referrals.forEach((r) => {
      const d = r.createdAt ? new Date(r.createdAt) : new Date();
      if (r.status === 'completed') {
        transactions.push({
          id: `tx-ref-comp-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'earned_referral',
          title: `Referral Case Resolved (${r.customerName})`,
          referenceId: r.id,
          amount: r.pointsEarned || 500,
          runningBalance: 0,
        });
      } else if (r.status === 'enrolled') {
        transactions.push({
          id: `tx-ref-enr-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'earned_enrolled',
          title: `Customer Enrolled (${r.customerName})`,
          referenceId: r.id,
          amount: 20,
          runningBalance: 0,
        });
      } else {
        transactions.push({
          id: `tx-ref-sub-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'submitted',
          title: `Client Lead Submitted (${r.customerName})`,
          referenceId: r.id,
          amount: 0,
          runningBalance: 0,
        });
      }
    });

    redemptions.forEach((rdm) => {
      const d = rdm.redeemedAt ? new Date(rdm.redeemedAt) : new Date();
      transactions.push({
        id: `tx-rdm-${rdm.id}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: d,
        category: 'redeemed_voucher',
        title: `Voucher Redemption Claim (${rdm.brand} ₹${rdm.denomination})`,
        referenceId: rdm.id,
        amount: -(rdm.points || 0),
        runningBalance: 0,
      });
    });

    transactions.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    let currBalance = 0;
    transactions.forEach((tx) => {
      currBalance += tx.amount;
      tx.runningBalance = Math.max(0, currBalance);
    });

    return transactions.reverse();
  }, [referrals, redemptions]);

  // Recent 5 referrals
  const recentReferrals = useMemo(() => referrals.slice(0, 5), [referrals]);

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

      {/* Metric Stats Rail (2x2 Grid on Mobile, 4 Blocks on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Referrals */}
        <Link href="/referrals" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-[#1B2A72]/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-[#1B2A72] transition-colors tracking-wider truncate">
                Total Referrals
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 text-[#1B2A72] group-hover:bg-[#1B2A72] group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Users size={18} weight="bold" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {totalCount}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendUp size={12} /> +15%
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Submitted client leads</p>
          </Card>
        </Link>

        {/* Approved & Completed */}
        <Link href="/referrals?status=completed" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-emerald-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-emerald-700 transition-colors tracking-wider truncate">
                Completed & Paid
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <CheckCircle size={18} weight="fill" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {completedCount}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                {Math.round((completedCount / (totalCount || 1)) * 100)}% Success
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Resolved & rewarded</p>
          </Card>
        </Link>

        {/* Pending In Progress */}
        <Link href="/referrals?status=pending" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-amber-700 transition-colors tracking-wider truncate">
                Active Pending
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Clock size={18} weight="bold" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {pendingCount}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border border-amber-200">In Pipeline</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Active bureau processing</p>
          </Card>
        </Link>

        {/* Total Reward Points */}
        <Link href="/rewards" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-[#1B2A72] transition-colors tracking-wider truncate">
                PrimePoints Balance
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100/60 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Coins size={18} weight="fill" className="text-amber-500 group-hover:text-white" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-[#1B2A72]">
                {totalPoints.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                (≈ ₹{(totalPoints / 10).toLocaleString('en-IN')})
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Instant Gift Vouchers</p>
          </Card>
        </Link>
      </div>

      {/* Middle Section: Chart + PrimePoints Tier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral & Earnings Trend Chart (8 cols) */}
        <Card variant="elevated" className="lg:col-span-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Referral & Earnings Trend
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Compare client referral volumes and accumulated reward points over time.
              </p>
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
            >
              <option value="15d">15 Days</option>
              <option value="30d">30 Days</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>

          <div className="h-64 w-full pt-4">
            <Line data={chartJsData} options={chartJsOptions} />
          </div>
        </Card>

        {/* Right 4 cols: PrimePoints Tier Status & Quick Action */}
        <div className="lg:col-span-4 space-y-6">
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
                {totalPoints.toLocaleString()} Pts
              </span>
              <p className="text-xs text-[#F5C518] font-bold mt-1 font-mono-num">
                &asymp; ₹{(totalPoints / 10).toLocaleString('en-IN')} INR Payout Equivalent
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/rewards"
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 group"
              >
                <span>View Rewards Roadmap</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/redeem"
                className="px-3.5 py-1.5 bg-white text-[#1B2A72] hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                Redeem
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized PrimePoints Transaction Passbook & Audit Ledger Table */}
      <Card variant="elevated" className="p-6 space-y-4 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt size={22} className="text-[#1B2A72]" /> Itemized PrimePoints Transaction Passbook
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Complete chronological audit log of all points earned from client referrals, team overrides, and redeemed gift vouchers.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shrink-0">
            {passbookLedger.length} Total Activity Log(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Transaction Details & Reference</th>
                <th className="py-3.5 px-4 text-right">Points Change</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-num">
              {passbookLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No points transactions recorded yet. Submit client referrals or claim gift vouchers to log activities.
                  </td>
                </tr>
              ) : (
                passbookLedger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-sans">
                      {tx.date}
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.category === 'earned_referral' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">
                          <ArrowUpRight size={12} className="text-emerald-600" /> Earned IN
                        </span>
                      ) : tx.category === 'earned_enrolled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase rounded-md border border-blue-200">
                          <ArrowUpRight size={12} className="text-blue-600" /> Enrolled IN
                        </span>
                      ) : tx.category === 'redeemed_voucher' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-md border border-red-200">
                          <ArrowDownRight size={12} className="text-red-600" /> Redeemed OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                          Submitted
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                      <div>{tx.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Ref: {tx.referenceId}</div>
                    </td>

                    <td className={`py-3.5 px-4 text-right font-bold text-sm font-mono ${
                      tx.amount > 0 ? 'text-emerald-600' : tx.amount < 0 ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()} Pts` : tx.amount < 0 ? `${tx.amount.toLocaleString()} Pts` : '0 Pts'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {tx.runningBalance.toLocaleString()} Pts
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
