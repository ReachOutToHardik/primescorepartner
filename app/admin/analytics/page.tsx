'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Trophy, 
  Coins, 
  TrendUp, 
  ChartLine, 
  ShieldCheck, 
  UsersThree, 
  ArrowRight,
  MagnifyingGlass,
  Funnel,
  Vault,
  PlusCircle,
  Clock,
  ListNumbers,
  CheckCircle,
  Receipt,
  Gift
} from '@phosphor-icons/react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  Filler
);

interface DBTransaction {
  id: string;
  partner_id: string;
  transaction_type: string;
  points_change: number;
  balance_after: number;
  title: string;
  reference_id: string | null;
  created_at: string;
  partner_name?: string;
  partner_email?: string;
  partner_code?: string;
}

export default function AdminAnalyticsPage() {
  const { partners, referrals, issueAdminPoints } = useAdminStore();
  const { totalPoints } = usePartnerStore();
  
  // Page Tab state: 'transactions' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'transactions' | 'leaderboard'>('transactions');
  
  // Filters for Leaderboard
  const [professionFilter, setProfessionFilter] = useState('all');

  // Filters for Point Transactions
  const [txCategoryFilter, setTxCategoryFilter] = useState<'all' | 'signup_bonus' | 'referral_earned' | 'admin_adjustment' | 'voucher_redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Chart Date Range & Metric Toggle
  const [chartRange, setChartRange] = useState<'15d' | '30d' | '6m' | '1y'>('6m');

  // Real DB Transactions State
  const [dbTransactions, setDbTransactions] = useState<DBTransaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  // Admin Manual Points Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [pointsAmount, setPointsAmount] = useState<number>(100);
  const [pointsReason, setPointsReason] = useState('');
  const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(false);

  // Fetch all point_transactions from Supabase (with auto-seeding from DB profiles if empty)
  const fetchAllTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 1. Fetch point_transactions
      const { data: txData } = await supabase
        .from('point_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      // 2. Fetch profiles to map partner names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, partner_team_code, status, created_at');

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      // 3. If DB transactions table is empty, auto-seed with initial records for existing DB profiles
      if ((!txData || txData.length === 0) && profiles && profiles.length > 0) {
        const seedRows: any[] = [];
        profiles.forEach((p) => {
          if (p.status === 'kyc_approved') {
            seedRows.push({
              partner_id: p.id,
              transaction_type: 'signup_bonus',
              points_change: 100,
              balance_after: 100,
              title: '🎁 Welcome Sign-Up Bonus (KYC Verified)',
              reference_id: `BONUS-${p.partner_team_code || p.id.slice(0, 6)}`,
              created_at: p.created_at || new Date().toISOString(),
            });
          }
        });

        if (seedRows.length > 0) {
          try {
            await supabase.from('point_transactions').insert(seedRows);
            // Re-fetch after seed
            const { data: reFetchedTx } = await supabase
              .from('point_transactions')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(200);
            
            if (reFetchedTx) {
              const enriched = reFetchedTx.map((tx) => {
                const prof = profileMap.get(tx.partner_id);
                return {
                  ...tx,
                  partner_name: prof?.full_name || 'Partner User',
                  partner_email: prof?.email || 'N/A',
                  partner_code: prof?.partner_team_code || tx.partner_id?.slice(0, 8),
                };
              });
              setDbTransactions(enriched);
              return;
            }
          } catch (seedErr) {
            console.warn('Auto seed point_transactions warning:', seedErr);
          }
        }
      }

      if (txData && txData.length > 0) {
        const enriched = txData.map((tx) => {
          const prof = profileMap.get(tx.partner_id);
          return {
            ...tx,
            partner_name: prof?.full_name || 'Partner User',
            partner_email: prof?.email || 'N/A',
            partner_code: prof?.partner_team_code || tx.partner_id?.slice(0, 8),
          };
        });
        setDbTransactions(enriched);
      }
    } catch (err) {
      console.error('Fetch all transactions error:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [issueSuccess]);

  // Derive master list with fallback from store partners & referrals if DB transactions array is currently empty
  const masterTransactionsList = useMemo(() => {
    if (dbTransactions.length > 0) return dbTransactions;

    const fallback: DBTransaction[] = [];
    partners.forEach((p) => {
      if (p.status === 'kyc_approved') {
        fallback.push({
          id: `TX-SB-${p.id}`,
          partner_id: p.id,
          transaction_type: 'signup_bonus',
          points_change: 100,
          balance_after: 100,
          title: '🎁 Welcome Sign-up Bonus (KYC Verified)',
          reference_id: `BONUS-${p.teamCode || p.id.slice(0, 6)}`,
          created_at: p.kycSubmittedAt || p.joinedAt || new Date().toISOString(),
          partner_name: p.name,
          partner_email: p.email,
          partner_code: p.teamCode || p.id.slice(0, 8),
        });
      }
    });

    referrals.forEach((r) => {
      const partnerObj = partners.find((p) => p.id === r.partnerId);
      if (r.status === 'completed') {
        fallback.push({
          id: `TX-REF-${r.id}`,
          partner_id: r.partnerId,
          transaction_type: 'referral_earned',
          points_change: r.pointsEarned || 500,
          balance_after: 600,
          title: `Direct Referral Resolved: ${r.customerName} (${r.service})`,
          reference_id: r.id,
          created_at: r.updatedAt || r.createdAt || new Date().toISOString(),
          partner_name: partnerObj?.name || r.partnerId,
          partner_email: partnerObj?.email || 'N/A',
          partner_code: partnerObj?.teamCode || r.partnerId.slice(0, 8),
        });
      }
    });

    return fallback.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [dbTransactions, partners, referrals]);

  // Handle Admin Manual Points Issue
  const handleExecutePointsIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !pointsReason.trim()) return;

    setIsSubmittingPoints(true);
    try {
      await issueAdminPoints(selectedPartnerId, pointsAmount, pointsReason.trim());
      setIssueSuccess(true);
      setTimeout(() => {
        setIssueSuccess(false);
        setIssueModalOpen(false);
        setSelectedPartnerId('');
        setPointsReason('');
        setPointsAmount(100);
      }, 1500);
    } catch (err) {
      console.error('Points issue error:', err);
    } finally {
      setIsSubmittingPoints(false);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return masterTransactionsList.filter((tx) => {
      const matchesCategory = txCategoryFilter === 'all' || tx.transaction_type === txCategoryFilter || (txCategoryFilter === 'admin_adjustment' && tx.transaction_type.includes('admin'));
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.partner_name?.toLowerCase().includes(q) ||
        tx.partner_email?.toLowerCase().includes(q) ||
        tx.partner_code?.toLowerCase().includes(q) ||
        tx.title?.toLowerCase().includes(q) ||
        tx.reference_id?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [masterTransactionsList, txCategoryFilter, searchQuery]);

  // Aggregate Chart Analytics Data (Points Issued vs Redeemed over time)
  const chartAnalyticsData = useMemo(() => {
    const now = new Date();

    if (chartRange === '15d') {
      const days: { label: string; key: string; issued: number; redeemed: number }[] = [];
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        days.push({ key, label, issued: 0, redeemed: 0 });
      }

      masterTransactionsList.forEach((tx) => {
        const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
        const match = days.find((day) => day.key === dateKey);
        if (match) {
          if (tx.points_change > 0) match.issued += tx.points_change;
          else match.redeemed += Math.abs(tx.points_change);
        }
      });

      return days;
    }

    if (chartRange === '30d') {
      const days: { label: string; key: string; issued: number; redeemed: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        days.push({ key, label, issued: 0, redeemed: 0 });
      }

      masterTransactionsList.forEach((tx) => {
        const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
        const match = days.find((day) => day.key === dateKey);
        if (match) {
          if (tx.points_change > 0) match.issued += tx.points_change;
          else match.redeemed += Math.abs(tx.points_change);
        }
      });

      return days;
    }

    if (chartRange === '6m') {
      const months: { label: string; key: string; issued: number; redeemed: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleString('en-US', { month: 'short' });
        months.push({ key, label, issued: 0, redeemed: 0 });
      }

      masterTransactionsList.forEach((tx) => {
        const d = new Date(tx.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const match = months.find((m) => m.key === key);
        if (match) {
          if (tx.points_change > 0) match.issued += tx.points_change;
          else match.redeemed += Math.abs(tx.points_change);
        }
      });

      return months;
    }

    // 1 Year (12 Months)
    const months12: { label: string; key: string; issued: number; redeemed: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      months12.push({ key, label, issued: 0, redeemed: 0 });
    }

    masterTransactionsList.forEach((tx) => {
      const d = new Date(tx.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const match = months12.find((m) => m.key === key);
      if (match) {
        if (tx.points_change > 0) match.issued += tx.points_change;
        else match.redeemed += Math.abs(tx.points_change);
      }
    });

    return months12;
  }, [masterTransactionsList, chartRange]);

  const chartJsData = useMemo(() => {
    return {
      labels: chartAnalyticsData.map((d) => d.label),
      datasets: [
        {
          fill: true,
          label: 'Points Credited (Issued)',
          data: chartAnalyticsData.map((d) => d.issued),
          borderColor: '#1B2A72',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 220);
            gradient.addColorStop(0, 'rgba(27, 42, 114, 0.15)');
            gradient.addColorStop(1, 'rgba(27, 42, 114, 0.0)');
            return gradient;
          },
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: '#1B2A72',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: chartAnalyticsData.length > 20 ? 2 : 4,
          pointHoverRadius: 6,
        },
        {
          fill: false,
          label: 'Points Redeemed (Spent)',
          data: chartAnalyticsData.map((d) => d.redeemed),
          borderColor: '#E63329',
          backgroundColor: 'rgba(230, 51, 41, 0.1)',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.3,
          pointBackgroundColor: '#E63329',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: chartAnalyticsData.length > 20 ? 2 : 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [chartAnalyticsData]);

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
              return ` ${label}: ${value.toLocaleString()} Pts`;
            },
          },
        },
      },
      scales: {
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
          },
          grid: { color: 'rgba(241, 245, 249, 1)' },
        },
      },
    };
  }, []);

  // Compute Leaderboard metrics
  const allAgents = partners.map((p) => {
    const completedCount = referrals.filter((r) => r.partnerId === p.id && r.status === 'completed').length;
    return {
      id: p.id,
      name: p.name,
      profession: p.profession || 'DSA Agent',
      city: p.city || 'N/A',
      cases: completedCount,
      points: completedCount * 500,
      role: p.role === 'team_leader' ? 'Team Leader' : 'DSA Agent',
    };
  });

  const leaderboard = allAgents
    .filter((a) => professionFilter === 'all' || a.profession.toLowerCase().includes(professionFilter.toLowerCase()))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10);

  const completedReferralsCount = referrals.filter((r) => r.status === 'completed').length;
  const totalSystemPointsOutstanding = completedReferralsCount * 500;
  const inrCashLiability = totalSystemPointsOutstanding / 4; // 4 Pts = ₹1

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <ChartLine className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            PrimePoints Analytics & Master Audit Ledger
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Track system-wide point issuances, redemptions, partner leaderboards, and issue manual point credits/adjustments.
          </p>
        </div>

        <Button
          onClick={() => setIssueModalOpen(true)}
          className="bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
        >
          <PlusCircle size={18} weight="bold" />
          <span>Issue Admin Points</span>
        </Button>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-[#1B2A72] text-white shadow-xs font-bold'
              : 'text-[var(--ink-2)] hover:bg-white hover:text-[var(--ink)]'
          }`}
        >
          <Receipt size={18} weight="bold" />
          <span>Point Transactions & Growth Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-[#1B2A72] text-white shadow-xs font-bold'
              : 'text-[var(--ink-2)] hover:bg-white hover:text-[var(--ink)]'
          }`}
        >
          <Trophy size={18} weight="bold" />
          <span>Leaderboards & Financial Liabilities</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: POINT TRANSACTIONS & GROWTH ANALYTICS GRAPH */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-amber-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Coins size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Total Points Outstanding</p>
                  <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">{totalSystemPointsOutstanding.toLocaleString()} Pts</h3>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">Circulating Balance</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-emerald-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Vault size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Cash Liability (4 Pts = ₹1)</p>
                  <h3 className="text-2xl font-bold font-mono-num text-emerald-600">₹{inrCashLiability.toLocaleString()}</h3>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">Payout Liability</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-blue-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <ListNumbers size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Transaction Logs</p>
                  <h3 className="text-2xl font-bold font-mono-num text-blue-600">{dbTransactions.length} Logs</h3>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">Recorded in Supabase</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-purple-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Gift size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Sign-Up Bonuses Paid</p>
                  <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">
                    {(dbTransactions.filter((t) => t.transaction_type === 'signup_bonus').length * 100).toLocaleString()} Pts
                  </h3>
                  <p className="text-xs text-purple-700 font-medium mt-0.5">+100 Pts / Verified Partner</p>
                </div>
              </div>
            </Card>
          </div>

          {/* PrimePoints Analytics Chart (Non-AI, Clean Axis) */}
          <Card className="p-6 space-y-5 bg-white rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  PrimePoints Growth & Settlement Analytics
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Compare total points credited versus redeemed across all registered partner accounts.
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                {(
                  [
                    { id: '15d', label: '15D' },
                    { id: '30d', label: '30D' },
                    { id: '6m', label: '6 Months' },
                    { id: '1y', label: '1 Year' },
                  ] as const
                ).map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setChartRange(range.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chartRange === range.id
                        ? 'bg-[#1B2A72] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <Line data={chartJsData} options={chartJsOptions} />
            </div>
          </Card>

          {/* Master Point Transactions Audit Ledger Table */}
          <Card className="p-6 space-y-5 bg-white rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Master Point Transactions Audit Ledger
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Complete system log of sign-up bonuses, referral rewards, admin adjustments, and gift voucher redemptions.
                </p>
              </div>

              {/* Live Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative shrink-0 w-full sm:w-64">
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search partner, code, Ref ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {[
                    { id: 'all', label: 'All Logs' },
                    { id: 'signup_bonus', label: 'Sign-Up Bonus' },
                    { id: 'referral_earned', label: 'Referrals' },
                    { id: 'admin_adjustment', label: 'Admin Adjust' },
                    { id: 'voucher_redeemed', label: 'Redemptions' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTxCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        txCategoryFilter === cat.id
                          ? 'bg-[#1B2A72] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Partner Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Transaction Details</th>
                    <th className="py-3 px-3 text-right">Points</th>
                    <th className="py-3 px-3 text-right">Balance After</th>
                    <th className="py-3 px-3 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingTx ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        Loading Supabase point transactions log...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                        No transactions found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className={`hover:bg-slate-50/60 transition-colors ${tx.points_change > 0 ? 'bg-emerald-50/20' : 'bg-slate-50/30'}`}>
                        <td className="py-3.5 px-3 font-mono text-slate-500">
                          {new Date(tx.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>

                        <td className="py-3.5 px-3">
                          <div>
                            <p className="font-bold text-slate-900">{tx.partner_name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{tx.partner_code}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 font-bold text-[10px] uppercase rounded-md ${
                            tx.transaction_type === 'signup_bonus' ? 'bg-amber-100 text-amber-900' :
                            tx.transaction_type === 'voucher_redeemed' ? 'bg-slate-100 text-slate-700' :
                            tx.transaction_type.includes('admin') ? 'bg-blue-100 text-blue-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {tx.transaction_type === 'signup_bonus' ? 'Sign-Up Bonus' :
                             tx.transaction_type === 'voucher_redeemed' ? 'Redemption' :
                             tx.transaction_type === 'referral_earned' ? 'Referral' :
                             tx.transaction_type.includes('admin') ? 'Admin Adjust' :
                             tx.transaction_type}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-medium text-slate-900">{tx.title}</td>

                        <td className={`py-3.5 px-3 text-right font-mono font-bold text-sm ${
                          tx.points_change > 0 ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {tx.points_change > 0 ? '+' : ''}{tx.points_change} Pts
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700">
                          {tx.balance_after.toLocaleString()} Pts
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-[11px] text-slate-400">
                          {tx.reference_id || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: LEADERBOARDS & FINANCIAL LIABILITIES */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top 10 Partner Leaderboard Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy size={22} className="text-amber-500" weight="fill" />
                <h2 className="font-display font-bold text-lg text-[var(--navy-deep)]">
                  Top 10 Performing Partners Leaderboard
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[var(--border)] text-xs">
                <Funnel size={14} className="text-[var(--ink-muted)]" />
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value)}
                  className="outline-none bg-transparent font-medium text-[var(--ink)]"
                >
                  <option value="all">Filter All Professions</option>
                  <option value="Agent">DSA Agents</option>
                  <option value="Accountant">Chartered Accountants (CA)</option>
                  <option value="Consultant">Loan Consultants</option>
                  <option value="Advisor">Financial Advisors</option>
                </select>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                    <tr>
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Partner Name</th>
                      <th className="px-6 py-3.5">Profession</th>
                      <th className="px-6 py-3.5">City</th>
                      <th className="px-6 py-3.5">Monthly Conversions</th>
                      <th className="px-6 py-3.5">Total Points Earned</th>
                      <th className="px-6 py-3.5 text-right">Inspect Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-mono-num">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Trophy size={36} className="text-slate-400" />
                            <p className="font-display font-bold text-slate-800 text-base">No Leaderboard Data Available</p>
                            <p className="text-xs text-slate-500 max-w-sm">
                              Leaderboard metrics will populate dynamically as partners complete referral cases in your database.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((agent, idx) => (
                        <tr key={`${agent.id || agent.name}-${idx}`} className="hover:bg-[var(--surface-2)] transition-colors">
                          <td className="px-6 py-4 font-bold">
                            {idx === 0 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-xs">
                                1
                              </span>
                            ) : idx === 1 ? (
                              <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-xs shadow-xs">
                                2
                              </span>
                            ) : idx === 2 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-[var(--ink-muted)] font-mono pl-2">#{idx + 1}</span>
                            )}
                          </td>

                          <td className="px-6 py-4 font-sans font-bold text-[var(--ink)]">
                            <div className="flex items-center gap-2">
                              {agent.name}
                              {agent.role === 'Team Leader' && (
                                <Badge variant="amber">Team Leader</Badge>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 font-sans text-xs text-[var(--ink-2)]">{agent.profession}</td>
                          <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">{agent.city}</td>

                          <td className="px-6 py-4 font-bold text-emerald-600 font-mono text-base">
                            {agent.cases} Cases Solved
                          </td>

                          <td className="px-6 py-4 font-bold text-[var(--navy)] font-mono">
                            {agent.points.toLocaleString()} pts
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link href={`/admin/kyc/${agent.id === 'demo' ? 'demo' : agent.id}`}>
                              <Button variant="secondary" size="sm">
                                View Performance <ArrowRight size={14} className="ml-1 text-[var(--navy)]" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* ADMIN MANUAL POINTS CREDIT / ADJUSTMENT MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Manual Points Credit or Adjustment"
      >
        <form onSubmit={handleExecutePointsIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Target Partner *
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
            >
              <option value="">-- Choose Partner Account --</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone || p.email}) - Code: {p.teamCode || p.id.slice(0, 6)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Points Amount * (Positive to credit, Negative to deduct)
            </label>
            <input
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(Number(e.target.value))}
              required
              placeholder="e.g. 500 or -200"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Equivalent Value: ₹{((pointsAmount || 0) / 4).toLocaleString('en-IN')} INR
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reason / Transaction Title *
            </label>
            <input
              type="text"
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              required
              placeholder="e.g. Top Performer Monthly Bonus / Manual Corrections"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
            />
          </div>

          {issueSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>Points transaction issued & credited to partner wallet successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPoints || !selectedPartnerId || !pointsReason.trim()}
              className="px-5 py-2 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmittingPoints ? 'Executing...' : 'Confirm & Credit Points'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
