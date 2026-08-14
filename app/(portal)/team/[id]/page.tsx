'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePartnerStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  User,
  Envelope,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  Coins,
  ClipboardText,
  Gift,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const { teamMembers } = usePartnerStore();

  const member = teamMembers.find((m) => m.id === memberId) || teamMembers[0];

  if (!member) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">Team Member Not Found</h2>
        <Button onClick={() => router.push('/team')} className="bg-[#1B2A72] text-white">
          Back to Team Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up font-body">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1B2A72] transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs"
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Back to Team Hub</span>
        </Link>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-num text-xs font-bold rounded-full uppercase">
          KYC Approved
        </span>
      </div>

      {/* 2. Member Hero Profile Header */}
      <Card variant="elevated" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-md">
              {member.name.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                  {member.name}
                </h1>
                <Sparkle size={18} className="text-amber-500" weight="fill" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {member.profession} &bull; {member.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
                Total Overriding Cut (10%)
              </span>
              <p className="font-mono-num font-extrabold text-2xl text-[#1B2A72] mt-0.5">
                +{member.overridePointsEarned.toLocaleString()} Pts
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Envelope size={16} className="text-slate-400" />
            <span className="font-mono-num text-slate-800 font-semibold truncate">{member.email}</span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Phone size={16} className="text-slate-400" />
            <span className="font-mono-num text-slate-800 font-semibold">{member.phone}</span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <MapPin size={16} className="text-slate-400" />
            <span className="text-slate-800 font-semibold">{member.city}</span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Clock size={16} className="text-slate-400" />
            <span className="font-mono-num text-slate-800 font-semibold">
              Joined {new Date(member.joinedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Performance Metrics Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="elevated" className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
            Submitted Referrals Count
          </span>
          <p className="font-mono-num font-extrabold text-3xl text-slate-900 mt-2">
            {member.casesCount} Cases
          </p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Total client cases generated by advisor
          </span>
        </Card>

        <Card variant="elevated" className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
            Member Point Balance
          </span>
          <p className="font-mono-num font-extrabold text-3xl text-amber-600 mt-2">
            {member.totalMemberPoints.toLocaleString()} Pts
          </p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Direct referral points earned by member
          </span>
        </Card>

        <Card variant="elevated" className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono-num block">
            Your Passive 10% Cut
          </span>
          <p className="font-mono-num font-extrabold text-3xl text-[#1B2A72] mt-2">
            +{member.overridePointsEarned.toLocaleString()} Pts
          </p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Automatically credited to your balance
          </span>
        </Card>
      </div>

      {/* 4. Submitted Referrals Activity Breakdown */}
      <Card variant="elevated" className="p-6 rounded-2xl space-y-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <ClipboardText size={20} className="text-[#1B2A72]" weight="bold" />
              <span>Customer Referrals Activity History</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Detailed breakdown of client referral cases submitted by {member.name}.
            </p>
          </div>

          <span className="text-xs font-mono-num font-bold text-slate-400">
            {member.referralsLog?.length || 0} Records
          </span>
        </div>

        {member.referralsLog && member.referralsLog.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-num bg-slate-50">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Requested Service</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Your 10% Cut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {member.referralsLog.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-slate-900">{ref.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ref.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{ref.service}</td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-500">
                      {new Date(ref.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase font-mono-num rounded-full ${
                        ref.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[#1B2A72]">
                      +{ref.overrideEarned} Pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
            No active client referrals logged yet for this member.
          </div>
        )}
      </Card>

      {/* 5. Redeemed Gift Vouchers History */}
      <Card variant="elevated" className="p-6 rounded-2xl space-y-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Gift size={20} className="text-amber-500" weight="bold" />
              <span>Redeemed Gift Cards & Rewards History</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Vouchers redeemed by {member.name} using their earned referral points.
            </p>
          </div>

          <span className="text-xs font-mono-num font-bold text-slate-400">
            {member.redemptionsLog?.length || 0} Vouchers
          </span>
        </div>

        {member.redemptionsLog && member.redemptionsLog.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-num bg-slate-50">
                  <th className="py-3 px-4">Voucher Brand</th>
                  <th className="py-3 px-4">Denomination</th>
                  <th className="py-3 px-4">Redeemed Date</th>
                  <th className="py-3 px-4 text-right">Voucher Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {member.redemptionsLog.map((rdm) => (
                  <tr key={rdm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rdm.brand}</td>
                    <td className="py-3.5 px-4 font-mono-num font-bold text-slate-900">₹{rdm.denomination}</td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-500">
                      {new Date(rdm.redeemedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-800">
                      {rdm.voucherCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
            No gift card redemptions logged yet for this member.
          </div>
        )}
      </Card>
    </div>
  );
}
