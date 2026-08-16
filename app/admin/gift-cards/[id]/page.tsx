'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Gift, 
  ArrowLeft, 
  Coins, 
  TrendUp, 
  ChartLine, 
  Barcode, 
  CheckCircle,
  Clock,
  ArrowRight
} from '@phosphor-icons/react';

export default function AdminGiftCardDetailPage({ params }: { params: { id: string } }) {
  const { giftCards } = useAdminStore();
  const card = giftCards.find((c) => c.id === params.id) || giftCards[0];

  // Financial Analytics for Brand Gift Card
  const totalPointsRedeemed = 125000; // Total PrimePoints converted for this brand
  const totalRupeesExpense = totalPointsRedeemed / 10; // 10 Pts = ₹1 INR (₹12,500 INR)
  const totalVouchersIssued = 48;
  const activeStockCount = 14;

  // Monthly Expense Graph Bar Data
  const monthlyExpenseData = [
    { month: 'Jul', points: 15000, inr: 1500, count: 6 },
    { month: 'Aug', points: 22000, inr: 2200, count: 9 },
    { month: 'Sep', points: 18000, inr: 1800, count: 7 },
    { month: 'Oct', points: 28000, inr: 2800, count: 11 },
    { month: 'Nov', points: 42000, inr: 4200, count: 15 },
  ];

  // Redemption Log History
  const redemptionLogs = [
    { id: 'RED-801', partnerName: 'Suresh Raina', code: 'AMZN-500-9988-7766', pts: 5000, inr: 500, date: '12/10/2024, 4:30 PM' },
    { id: 'RED-802', partnerName: 'Arjun Mehta', code: 'AMZN-1000-5566-7788', pts: 10000, inr: 1000, date: '12/11/2024, 2:15 PM' },
    { id: 'RED-803', partnerName: 'Rahul Joshi', code: 'AMZN-500-1122-3344', pts: 5000, inr: 500, date: '12/12/2024, 6:45 PM' },
    { id: 'RED-804', partnerName: 'Meera Deshmukh', code: 'AMZN-1000-2233-4455', pts: 10000, inr: 1000, date: '12/14/2024, 11:00 AM' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/gift-cards" className="inline-flex items-center text-xs font-semibold text-[var(--navy)] hover:underline">
        <ArrowLeft size={16} className="mr-1" /> Back to Gift Cards Inventory
      </Link>

      {/* Brand Header Dossier */}
      <div className="bg-[var(--navy-deep)] text-white p-6 rounded-2xl border border-white/10 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-[var(--navy-deep)] flex items-center justify-center font-display font-black text-xl shadow-md" style={{ color: card.color }}>
              {card.brand.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold">{card.brand} Voucher Analytics</h1>
                <Badge variant={card.isActive ? 'green' : 'gray'}>
                  {card.isActive ? 'Active Catalog Brand' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5">
                Conversion Rate: 10 PrimePoints = ₹1 INR Cash Value
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              Card ID: {card.id}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards: PrimePoints Spent, INR Expense, Vouchers Redeemed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] font-sans uppercase">Total PrimePoints Redeemed</p>
              <h3 className="text-2xl font-bold text-[var(--ink)]">{totalPointsRedeemed.toLocaleString()} Pts</h3>
              <p className="text-xs text-amber-700 font-medium font-sans mt-0.5">Spent by Partners</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendUp size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] font-sans uppercase">Total INR Cash Expense</p>
              <h3 className="text-2xl font-bold text-emerald-600">₹{totalRupeesExpense.toLocaleString()}</h3>
              <p className="text-xs text-[var(--ink-muted)] font-sans mt-0.5">Cash Liability Paid Out</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Barcode size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] font-sans uppercase">Vouchers Claimed</p>
              <h3 className="text-2xl font-bold text-blue-600">{totalVouchersIssued} Vouchers</h3>
              <p className="text-xs text-[var(--ink-muted)] font-sans mt-0.5">Delivered to Partners</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] font-sans uppercase">Unused Stock In Vault</p>
              <h3 className="text-2xl font-bold text-purple-600">{activeStockCount} Codes</h3>
              <p className="text-xs text-purple-700 font-medium font-sans mt-0.5">Available Immediately</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expense Graph Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
              <ChartLine size={20} className="text-[var(--navy)]" weight="fill" />
              Monthly Expense & PrimePoints Burn Graph ({card.brand})
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">Visual breakdown of total rupees spent vs PrimePoints burned each month.</p>
          </div>
          <Badge variant="blue">Historical Burn Trajectory</Badge>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 space-y-4 font-mono-num">
          <div className="grid grid-cols-5 items-end gap-4 h-48 px-4 border-b border-[var(--border)] pb-2">
            {monthlyExpenseData.map((d) => {
              const maxInr = 5000;
              const heightPercent = Math.min(100, Math.max(15, (d.inr / maxInr) * 100));

              return (
                <div key={d.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{d.inr}
                  </div>
                  <div 
                    style={{ height: `${heightPercent}%` }} 
                    className="w-full max-w-[48px] bg-[var(--navy)] group-hover:bg-[#E63329] rounded-t-lg transition-all shadow-xs relative"
                  />
                  <span className="text-xs font-bold text-[var(--ink)] font-sans">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] px-2">
            <span>Chart Scale: Up to ₹5,000 INR Monthly Liability</span>
            <span className="font-bold text-[var(--navy)]">Highest Month: Nov (₹4,200 INR / 42,000 Pts)</span>
          </div>
        </div>
      </Card>

      {/* Redemption Log History Table */}
      <Card className="overflow-hidden space-y-3">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-[var(--ink)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--navy)]" /> Audit Log of Recent {card.brand} Redemptions
          </h3>
          <Badge variant="green">Verified Audit Logs</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
              <tr>
                <th className="px-6 py-3.5">Redemption Ref</th>
                <th className="px-6 py-3.5">Partner Name</th>
                <th className="px-6 py-3.5">Voucher Code</th>
                <th className="px-6 py-3.5">PrimePoints Spent</th>
                <th className="px-6 py-3.5">INR Value</th>
                <th className="px-6 py-3.5">Redeemed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono-num">
              {redemptionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--navy)] text-xs font-mono">{log.id}</td>
                  <td className="px-6 py-4 font-sans font-bold text-[var(--ink)]">{log.partnerName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--navy)] font-bold">{log.code}</td>
                  <td className="px-6 py-4 font-bold text-amber-600 font-mono">{log.pts.toLocaleString()} Pts</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 font-mono">₹{log.inr}</td>
                  <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
