'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
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
  Funnel,
  ShareNetwork,
  Copy,
  CaretRight,
  QrCode,
  LockKey
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

import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [pointTransactions, setPointTransactions] = useState<{
    id: string;
    transaction_type: string;
    points_change: number;
    balance_after: number;
    title: string;
    reference_id: string | null;
    created_at: string;
  }[]>([]);

  // Fetch real point_transactions from DB table (Single Source of Truth)
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
        console.warn('Point transactions fetch error:', err);
      }
    };
    fetchTransactions();
  }, [partner?.id]);

  // Interactive trend datasets dynamically aggregated from EVERY real partner referral log
  const trendData = useMemo(() => {
    const now = new Date();

    if (timeRange === '15d') {
      const days: { key: string; label: string; referrals: number; points: number }[] = [];
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        days.push({ key, label, referrals: 0, points: i === 0 ? (totalPoints || 0) : 0 });
      }

      referrals.forEach((r) => {
        if (!r.createdAt) return;
        const refDate = new Date(r.createdAt);
        const refKey = refDate.toISOString().split('T')[0];
        const match = days.find((day) => day.key === refKey);
        if (match) match.referrals += 1;
      });

      return days;
    }

    if (timeRange === '30d') {
      const days: { key: string; label: string; referrals: number; points: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        days.push({ key, label, referrals: 0, points: i === 0 ? (totalPoints || 0) : 0 });
      }

      referrals.forEach((r) => {
        if (!r.createdAt) return;
        const refDate = new Date(r.createdAt);
        const refKey = refDate.toISOString().split('T')[0];
        const match = days.find((day) => day.key === refKey);
        if (match) match.referrals += 1;
      });

      return days;
    }

    if (timeRange === '6m') {
      const months: { key: string; label: string; referrals: number; points: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleString('en-US', { month: 'short' });
        months.push({ key, label, referrals: 0, points: i === 0 ? (totalPoints || 0) : 0 });
      }

      referrals.forEach((r) => {
        const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
        const refKey = `${refDate.getFullYear()}-${refDate.getMonth()}`;
        const match = months.find((m) => m.key === refKey);
        if (match) match.referrals += 1;
      });

      return months;
    }

    // 1 Year (All 12 months up to current month)
    const months12: { key: string; label: string; referrals: number; points: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      months12.push({ key, label, referrals: 0, points: i === 0 ? (totalPoints || 0) : 0 });
    }

    referrals.forEach((r) => {
      const refDate = r.createdAt ? new Date(r.createdAt) : new Date();
      const refKey = `${refDate.getFullYear()}-${refDate.getMonth()}`;
      const match = months12.find((m) => m.key === refKey);
      if (match) match.referrals += 1;
    });

    return months12;
  }, [timeRange, referrals, totalPoints]);

  // Chart.js Dataset Configuration
  const chartJsData = useMemo(() => {
    const datasets: any[] = [];

    if (chartMetricMode === 'points' || chartMetricMode === 'both') {
      datasets.push({
        fill: true,
        label: 'PrimePoints Earned',
        data: trendData.map((d) => d.points),
        borderColor: '#1B2A72',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(27, 42, 114, 0.12)');
          gradient.addColorStop(1, 'rgba(27, 42, 114, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#1B2A72',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: trendData.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      });
    }

    if (chartMetricMode === 'referrals' || chartMetricMode === 'both') {
      datasets.push({
        fill: chartMetricMode === 'referrals',
        label: 'Referrals Submitted',
        data: trendData.map((d) => d.referrals),
        borderColor: '#E63329',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(230, 51, 41, 0.12)');
          gradient.addColorStop(1, 'rgba(230, 51, 41, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#E63329',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: trendData.length > 20 ? 2 : 4,
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
    const scalesConfig: any = {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 10, weight: '500' }, color: '#64748B', maxRotation: 45 },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#64748B',
          precision: 0,
          stepSize: chartMetricMode === 'referrals' ? 1 : undefined,
        },
        grid: { color: 'rgba(241, 245, 249, 1)' },
      },
    };

    if (chartMetricMode === 'both') {
      scalesConfig.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#94A3B8',
          precision: 0,
          stepSize: 1,
        },
        grid: { display: false },
      };
    }

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
          align: 'end',
          labels: {
            font: { family: 'Inter', size: 11, weight: '600' },
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#0F1A4E',
          padding: 10,
          cornerRadius: 6,
          titleFont: { family: 'Inter', size: 12, weight: '700' },
          bodyFont: { family: 'Inter', size: 11 },
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (label.includes('PrimePoints')) {
                return ` ${label}: ${value} Pts`;
              }
              return ` ${label}: ${value} Case${value !== 1 ? 's' : ''}`;
            },
          },
        },
      },
      scales: scalesConfig,
    };
  }, [chartMetricMode]);

  // Chronologically sorted transaction ledger for IN / OUT activity
  const passbookLedger = useMemo(() => {
    // If real point_transactions exist in DB, map directly from database table (Single Source of Truth)
    if (pointTransactions.length > 0) {
      return pointTransactions.map((tx) => {
        const d = tx.created_at ? new Date(tx.created_at) : new Date();
        const categoryMap: Record<string, 'earned_referral' | 'earned_enrolled' | 'submitted' | 'redeemed_voucher'> = {
          signup_bonus: 'earned_referral',
          referral_earned: 'earned_referral',
          enrolled_earned: 'earned_enrolled',
          voucher_redeemed: 'redeemed_voucher',
        };

        return {
          id: tx.id,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: categoryMap[tx.transaction_type] || 'submitted',
          title: tx.title,
          referenceId: tx.reference_id || tx.id,
          amount: tx.points_change,
          runningBalance: tx.balance_after,
        };
      });
    }

    // Fallback: Compute dynamically via mathematical accumulator formula (Previous Balance + Added Points)
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

    // 1. Sign-Up Bonus Entry (if verified or bonus credited)
    if (partner?.status === 'kyc_approved' || (partner?.primePoints && partner.primePoints >= 100)) {
      const d = partner?.joinedAt ? new Date(partner.joinedAt) : new Date(Date.now() - 86400000);
      transactions.push({
        id: `tx-signup-bonus-${partner?.id || 'partner'}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: d,
        category: 'earned_referral',
        title: '🎁 Welcome Sign-up Bonus (KYC Approved)',
        referenceId: 'BONUS-100',
        amount: 100,
        runningBalance: 0,
      });
    }

    // 2. Referral Activity Entries
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

    // 3. Voucher Redemption Entries
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

    // Sort chronologically ascending to compute accurate running balance accumulator
    transactions.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    let currBalance = 0;
    transactions.forEach((tx) => {
      currBalance += tx.amount;
      tx.runningBalance = Math.max(0, currBalance);
    });

    // Return in reverse chronological order (newest activity first)
    return transactions.reverse();
  }, [referrals, redemptions, partner, pointTransactions]);

  // Recent 5 referrals
  const recentReferrals = useMemo(() => referrals.slice(0, 5), [referrals]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner Header */}
      <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
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
          {partner?.status === 'kyc_approved' ? (
            <Link
              href="/refer"
              className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <UserPlus size={18} weight="bold" />
              <span>Submit Referral</span>
            </Link>
          ) : (
            <button
              onClick={() => setKycModalOpen(true)}
              className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <UserPlus size={18} weight="bold" />
              <span>Submit Referral</span>
            </button>
          )}
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
        <Card variant="elevated" className="lg:col-span-8 p-6 space-y-5">
          {/* Header & Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Referral & Performance Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Track referral volume and earned reward points over selected period.
              </p>
            </div>

            {/* Date Range Pill Buttons (Equal 4-col grid on mobile for perfect symmetry) */}
            <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
              {(
                [
                  { id: '15d', label: '15D' },
                  { id: '30d', label: '30D' },
                  { id: '6m', label: '6M', fullLabel: '6 Months' },
                  { id: '1y', label: '1Y', fullLabel: '1 Year' },
                ] as const
              ).map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setTimeRange(range.id)}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
                    timeRange === range.id
                      ? 'bg-[#1B2A72] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="sm:hidden">{range.label}</span>
                  <span className="hidden sm:inline">{range.fullLabel || range.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metric View Mode Toggles & Summary Metrics Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* View Mode Toggle Segmented Control */}
            <div className="flex items-center gap-1 text-xs bg-slate-100/70 p-1 rounded-lg w-full sm:w-auto">
              <span className="text-slate-400 font-semibold text-[10px] uppercase px-1 hidden sm:inline">View:</span>
              {(
                [
                  { id: 'both', label: 'Overview' },
                  { id: 'referrals', label: 'Referrals' },
                  { id: 'points', label: 'Points' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setChartMetricMode(mode.id)}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-colors text-center ${
                    chartMetricMode === mode.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Concise Period Stat Callout Strip */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono font-semibold bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg w-full sm:w-auto">
              <span className="text-slate-600">
                Total Referrals: <strong className="text-slate-900 font-bold">{totalCount}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                Points: <strong className="text-[#1B2A72] font-bold">+{totalPoints}</strong>
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 w-full pt-2">
            <Line data={chartJsData} options={chartJsOptions} />
          </div>
        </Card>

        {/* Right 4 cols: PrimePoints Tier Status & Quick Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F1A4E] text-white p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
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

          {/* Instant Referral URL Card (Exact User Design) */}
          <Card variant="elevated" className="p-6 space-y-4 border border-slate-200 shadow-xs rounded-2xl bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center shrink-0">
                <ShareNetwork size={20} weight="bold" className="text-[#1B2A72]" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Instant Referral URL
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Share your direct client signup link or scan to open referral submission form.
            </p>

            <button
              type="button"
              onClick={() => {
                if (partner?.status !== 'kyc_approved') {
                  setKycModalOpen(true);
                } else {
                  setQrModalOpen(true);
                }
              }}
              className="w-full p-3.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span>Generate Client QR &amp; Link</span>
                {partner?.status !== 'kyc_approved' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1 border border-amber-200">
                    <LockKey size={12} weight="bold" /> Locked
                  </span>
                )}
              </span>
              <CaretRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </Card>
        </div>
      </div>

      {/* Itemized PrimePoints Transaction Passbook & Audit Ledger Table */}
      <Card variant="elevated" className="p-6 space-y-4 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h2 className="font-display text-[13px] sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
              <Receipt size={20} className="text-[#1B2A72] shrink-0" />
              <span className="truncate">Itemized PrimePoints Transaction Passbook</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete chronological ledger of all points earned from client referrals, team overrides, and redeemed gift vouchers.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
            Total Transactions: {passbookLedger.length}
          </span>
        </div>

        {/* ── Mobile Card Stack (shown below md) ── */}
        <div className="md:hidden space-y-2.5">
          {passbookLedger.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400 font-medium">
              No points transactions yet. Submit referrals or redeem vouchers to see activity here.
            </p>
          ) : (
            passbookLedger.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-3 shadow-2xs"
              >
                {/* Row 1: Badge + Date */}
                <div className="flex items-center justify-between gap-2">
                  {tx.category === 'earned_referral' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">
                      <ArrowUpRight size={11} /> Earned
                    </span>
                  ) : tx.category === 'earned_enrolled' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase rounded-md border border-blue-200">
                      <ArrowUpRight size={11} /> Enrolled
                    </span>
                  ) : tx.category === 'redeemed_voucher' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-md border border-red-200">
                      <ArrowDownRight size={11} /> Redeemed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                      Submitted
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">{tx.date}</span>
                </div>

                {/* Row 2: Title */}
                <p className="text-xs font-semibold text-slate-900 leading-snug">{tx.title}</p>

                {/* Row 3: Points Change + Running Balance */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Points Change</p>
                    <p className={`font-mono font-bold text-sm ${
                      tx.amount > 0 ? 'text-emerald-600' : tx.amount < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()} Pts` : tx.amount < 0 ? `${tx.amount.toLocaleString()} Pts` : '0 Pts'}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Running Balance</p>
                    <p className="font-mono font-bold text-sm text-slate-900">
                      {tx.runningBalance.toLocaleString()} Pts
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Desktop Table (shown md and above) ── */}
        <div className="hidden md:block overflow-x-auto">
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
                    <td className="py-3.5 px-4 text-slate-500 font-sans whitespace-nowrap">{tx.date}</td>

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

      {/* INSTANT CLIENT QR CODE & LINK MODAL */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={
          <span className="text-[13px] sm:text-base font-bold text-slate-900 whitespace-nowrap block truncate">
            Generate Client QR &amp; Direct Referral Link
          </span>
        }
      >
        <div className="space-y-5 text-center py-2">
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Scan this QR code or copy your direct client signup link to submit new referrals instantly with automatic partner code tracking.
          </p>

          <div className="w-56 p-4 mx-auto bg-white rounded-2xl border-2 border-dashed border-[#1B2A72]/30 flex flex-col items-center justify-center gap-2.5 shadow-sm relative group">
            <QRCodeSVG
              value={`https://primescore.in/refer?ref=${partner?.teamCode || partner?.id?.slice(0, 8) || 'PARTNER'}`}
              size={170}
              bgColor={"#FFFFFF"}
              fgColor={"#0F1A4E"}
              level={"H"}
              includeMargin={false}
              imageSettings={{
                src: "/qr-logo.png",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <span className="text-[10px] font-bold text-[#1B2A72] bg-indigo-50 px-2.5 py-1 rounded-md mt-1 border border-indigo-200 font-mono-num uppercase">
              Code: {partner?.teamCode || partner?.id?.slice(0, 8) || 'REF-ACTIVE'}
            </span>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Direct Referral Web Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://primescore.in/refer?ref=${partner?.teamCode || partner?.id?.slice(0, 8) || 'PARTNER'}`}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://primescore.in/refer?ref=${partner?.teamCode || partner?.id?.slice(0, 8) || 'PARTNER'}`);
                  alert('Referral link copied to clipboard!');
                }}
                className="px-4 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy size={15} weight="bold" /> Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* KYC Under Review Alert Modal */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.joinedAt}
      />
    </div>
  );
}
