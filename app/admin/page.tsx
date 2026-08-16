'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ShieldCheck, 
  UsersThree, 
  ClipboardText, 
  Gift, 
  ArrowRight,
  ChartLineUp,
  ChartPie,
  TrendUp,
  Coins,
  Tray
} from '@phosphor-icons/react';

export default function AdminDashboardPage() {
  const { partners, referrals, giftCards, rewardConfig } = useAdminStore();

  const pendingKycCount = partners.filter((p) => p.status === 'kyc_submitted').length;
  const approvedKycCount = partners.filter((p) => p.status === 'kyc_approved').length;
  const activeGiftCards = giftCards.filter((g) => g.isActive).length;

  // Real pipeline stats calculated from Supabase referrals
  const pipelineStats = {
    submitted: referrals.filter((r) => r.status === 'submitted').length,
    enrolled: referrals.filter((r) => r.status === 'enrolled').length,
    inProgress: referrals.filter((r) => r.status === 'in_progress').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
  };
  const totalLeads = referrals.length;

  // Dynamically compute monthly lead conversions from real DB records
  const monthlyConversions = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    
    // Get last 6 calendar months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const idx = (currentMonthIdx - 5 + i + 12) % 12;
      return months[idx];
    });

    const counts: Record<string, number> = {};
    last6Months.forEach((m) => (counts[m] = 0));

    referrals.forEach((r) => {
      if (r.createdAt) {
        const d = new Date(r.createdAt);
        const monthName = months[d.getMonth()];
        if (counts[monthName] !== undefined) {
          counts[monthName] += 1;
        }
      }
    });

    const ptsRate = rewardConfig?.pointsPerInr || 10;
    const ptsPerCase = rewardConfig?.conversionPoints || 500;

    return last6Months.map((month) => {
      const cnt = counts[month] || 0;
      const valInr = (cnt * ptsPerCase) / ptsRate;
      return {
        month,
        count: cnt,
        revenueInr: `₹${valInr.toLocaleString('en-IN')}`,
      };
    });
  }, [referrals, rewardConfig]);

  const maxMonthCount = Math.max(...monthlyConversions.map((m) => m.count), 1);
  const highestMonthObj = monthlyConversions.reduce((max, m) => (m.count > max.count ? m : max), monthlyConversions[0]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--navy-deep)] to-[var(--navy)] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <Badge variant="amber">Admin HQ Portal</Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Primescore Executive Control Center
          </h1>
          <p className="text-gray-300 text-sm max-w-2xl">
            Live database dashboard for partner KYCs, lead stage fulfillment, network performance, and reward settlements.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide font-sans">Pending KYCs</p>
            <h3 className="text-2xl font-bold text-[var(--ink)]">{pendingKycCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UsersThree className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide font-sans">Verified Partners</p>
            <h3 className="text-2xl font-bold text-[var(--ink)]">{approvedKycCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardText className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide font-sans">Total Leads Processed</p>
            <h3 className="text-2xl font-bold text-[var(--ink)]">{totalLeads}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Gift className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide font-sans">Active Reward Cards</p>
            <h3 className="text-2xl font-bold text-[var(--ink)]">{activeGiftCards}</h3>
          </div>
        </Card>
      </div>

      {/* REAL-TIME ANALYTICS: BAR CHART & PIE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 1: Monthly Case Conversion Growth Bar Chart (2 Cols) */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
                <ChartLineUp size={20} className="text-[var(--navy)]" weight="fill" />
                Monthly Lead Conversions & Revenue
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">Completed bureau disputes and credit score fixes from database.</p>
            </div>
            <Badge variant={totalLeads > 0 ? 'green' : 'gray'}>
              {totalLeads > 0 ? `${totalLeads} Total Cases` : 'No Data Yet'}
            </Badge>
          </div>

          <div className="pt-4 font-mono-num">
            {totalLeads === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 border-b border-[var(--border)]">
                <Tray size={36} className="mx-auto text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">No Lead Referrals in Database</p>
                <p className="text-[11px] max-w-sm mx-auto text-slate-400">
                  Data will populate live on this chart as soon as partners submit client referrals through the portal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-6 items-end gap-3 h-44 border-b border-[var(--border)] pb-2 px-2">
                {monthlyConversions.map((m) => {
                  const heightPercent = m.count > 0 ? Math.min(100, Math.max(15, (m.count / maxMonthCount) * 100)) : 4;
                  return (
                    <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.count} Cases
                      </div>
                      <div 
                        style={{ height: `${heightPercent}%` }} 
                        className={`w-full max-w-[40px] rounded-t-lg transition-all shadow-2xs ${
                          m.count > 0 ? 'bg-[var(--navy)] group-hover:bg-[#E63329]' : 'bg-slate-200'
                        }`}
                      />
                      <span className="text-xs font-bold text-[var(--ink)] font-sans">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] pt-3">
              <span>Dynamic Scale: 0 to {maxMonthCount} Cases / Month</span>
              <span className="font-bold text-[var(--navy)]">
                {highestMonthObj.count > 0 
                  ? `Highest Month: ${highestMonthObj.month} (${highestMonthObj.count} Cases / ${highestMonthObj.revenueInr})`
                  : 'Highest Month: N/A (0 Cases)'}
              </span>
            </div>
          </div>
        </Card>

        {/* Visual 2: Referral Pipeline Status Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
              <ChartPie size={20} className="text-[var(--navy)]" weight="fill" />
              Lead Status Distribution
            </h3>
            <span className="text-xs font-mono text-[var(--ink-muted)] font-bold">{totalLeads} Total</span>
          </div>

          <div className="space-y-3 pt-2 font-mono-num">
            {/* Completed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-600 font-sans">Completed Cases</span>
                <span className="font-bold">{pipelineStats.completed} ({totalLeads > 0 ? Math.round((pipelineStats.completed / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: `${totalLeads > 0 ? (pipelineStats.completed / totalLeads) * 100 : 0}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-blue-600 font-sans">In Progress</span>
                <span className="font-bold">{pipelineStats.inProgress} ({totalLeads > 0 ? Math.round((pipelineStats.inProgress / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: `${totalLeads > 0 ? (pipelineStats.inProgress / totalLeads) * 100 : 0}%` }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>

            {/* Enrolled */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-amber-600 font-sans">Enrolled / Onboarded</span>
                <span className="font-bold">{pipelineStats.enrolled} ({totalLeads > 0 ? Math.round((pipelineStats.enrolled / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: `${totalLeads > 0 ? (pipelineStats.enrolled / totalLeads) * 100 : 0}%` }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>

            {/* Submitted */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-600 font-sans">Submitted / Pending Review</span>
                <span className="font-bold">{pipelineStats.submitted} ({totalLeads > 0 ? Math.round((pipelineStats.submitted / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: `${totalLeads > 0 ? (pipelineStats.submitted / totalLeads) * 100 : 0}%` }} className="h-full bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/kyc">
          <Card className="p-6 hover:shadow-md transition-all border border-transparent hover:border-[var(--navy)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[var(--surface-2)] text-[var(--navy)] rounded-xl group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" weight="bold" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-[var(--navy)]">
              Verify Partner KYCs
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Review PAN, Aadhaar, and bank documents submitted by new DSA & partner applicants.
            </p>
          </Card>
        </Link>

        <Link href="/admin/referrals">
          <Card className="p-6 hover:shadow-md transition-all border border-transparent hover:border-[var(--navy)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[var(--surface-2)] text-[var(--navy)] rounded-xl group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
                <ClipboardText className="w-6 h-6" weight="bold" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-[var(--navy)]">
              Enroll & Fulfill Services
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Update referral statuses for Credit Rectifications, Bureau Reports, and credit score fixes.
            </p>
          </Card>
        </Link>

        <Link href="/admin/teams">
          <Card className="p-6 hover:shadow-md transition-all border border-transparent hover:border-[var(--navy)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[var(--surface-2)] text-[var(--navy)] rounded-xl group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
                <UsersThree className="w-6 h-6" weight="bold" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-[var(--navy)]">
              Team Leaders & Sub-Agents
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Inspect multi-tier team networks, override point allocations, and agent earnings.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
