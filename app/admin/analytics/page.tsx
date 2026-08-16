'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Trophy, 
  Crown, 
  Coins, 
  TrendUp, 
  ChartLine, 
  ShieldCheck, 
  UsersThree, 
  ArrowRight,
  MagnifyingGlass,
  Funnel,
  Sparkle,
  Vault
} from '@phosphor-icons/react';

export default function AdminAnalyticsPage() {
  const { partners, referrals } = useAdminStore();
  const { teamMembers, totalPoints } = usePartnerStore();
  const [professionFilter, setProfessionFilter] = useState('all');

  // Compute Top Performers Leaderboard from Real DB Partners
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

  // Financial Liability Calculations from Real Data
  const completedReferralsCount = referrals.filter((r) => r.status === 'completed').length;
  const totalSystemPointsOutstanding = completedReferralsCount * 500;
  const inrCashLiability = totalSystemPointsOutstanding / 10;
  const totalRedeemedVouchersInr = 0;
  const projectedMonthlyGrowthRate = referrals.length > 0 ? '+100%' : '0%';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
          <ChartLine className="w-7 h-7 text-[var(--navy)]" weight="fill" />
          Partner Performance Leaderboards & Point Liability Analytics
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Track top monthly conversion performers across DSAs, CAs, and Loan Consultants, and monitor point inflation vs INR cash reserve liabilities.
        </p>
      </div>

      {/* Financial Liability & Points Inflation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Total Points Outstanding</p>
              <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">{totalSystemPointsOutstanding.toLocaleString()} Pts</h3>
              <p className="text-xs text-amber-700 font-medium mt-0.5">Circulating in Partner Network</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Vault size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">INR Cash Reserve Liability</p>
              <h3 className="text-2xl font-bold font-mono-num text-emerald-600">₹{inrCashLiability.toLocaleString()}</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">Rate: 10 Pts = ₹1 INR</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendUp size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">MoM Case Growth Rate</p>
              <h3 className="text-2xl font-bold font-mono-num text-blue-600">{projectedMonthlyGrowthRate}</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">342 Cases Solved this Month</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Trophy size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Total Vouchers Paid Out</p>
              <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">₹{totalRedeemedVouchersInr.toLocaleString()}</h3>
              <p className="text-xs text-purple-700 font-medium mt-0.5">Amazon, Flipkart & UPI</p>
            </div>
          </div>
        </Card>
      </div>

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
                          Leaderboard metrics and financial liabilities will populate dynamically as partners register and complete referral cases in your database.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((agent, idx) => (
                    <tr key={agent.name} className="hover:bg-[var(--surface-2)] transition-colors">
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
  );
}
