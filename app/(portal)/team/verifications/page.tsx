'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Hourglass, 
  User, 
  MagnifyingGlass,
  ArrowRight,
  UserCheck,
  UserMinus,
  FileText
} from '@phosphor-icons/react';

export default function SubAgentVerificationsPage() {
  const { teamMembers, updateTeamMemberStatus } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingList = teamMembers.filter((m) => m.status === 'kyc_submitted');
  const approvedList = teamMembers.filter((m) => m.status === 'kyc_approved');
  const rejectedList = teamMembers.filter((m) => m.status === 'kyc_rejected');

  const rawList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'approved'
      ? approvedList
      : rejectedList;

  const filteredList = rawList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-up font-body">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <ShieldCheck size={26} className="text-[#1B2A72] shrink-0" weight="fill" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              Sub-Agent Application Verification Workflow
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review new sub-agent applications submitted under your unique team code. Approve and forward valid applications to Primescore Admin for final verification.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl font-medium text-xs border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-[#1B2A72] font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Hourglass className="w-4 h-4 text-amber-500" weight="fill" />
            Pending Verification ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-white text-[#1B2A72] font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500" weight="fill" />
            Approved ({approvedList.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-white text-[#1B2A72] font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserMinus className="w-4 h-4 text-red-500" weight="fill" />
            Rejected ({rejectedList.length})
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <MagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sub-agents by Name, Email, Profession, or City..."
          className="w-full text-sm outline-none bg-transparent font-body"
        />
      </div>

      {/* Verification Directory Table */}
      <Card variant="elevated" className="p-6 rounded-2xl space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No sub-agent applications found in this queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono-num bg-slate-50/50">
                  <th className="py-3.5 px-4">Applicant Agent</th>
                  <th className="py-3.5 px-4">Profession</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4 text-right">Team Leader Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 font-mono-num">
                {filteredList.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-4 px-4 font-sans font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B2A72] text-white flex items-center justify-center font-bold text-xs font-display shrink-0 shadow-2xs">
                        {member.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-display text-sm text-slate-900">{member.name}</div>
                        <div className="text-xs font-normal text-slate-400 font-mono-num">{member.email} • {member.phone}</div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-sans font-semibold text-slate-800">{member.profession}</td>
                    <td className="py-4 px-4 font-sans text-slate-600">{member.city}</td>
                    <td className="py-4 px-4 font-sans text-slate-500 text-[11px]">{new Date(member.joinedAt).toLocaleDateString()}</td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 font-mono-num text-[10px] font-bold rounded-full uppercase border ${
                        member.status === 'kyc_approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : member.status === 'kyc_rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {member.status === 'kyc_approved' ? 'Forwarded & Approved' : member.status === 'kyc_rejected' ? 'Rejected' : 'Pending TL Review'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-sans">
                      {member.status === 'kyc_submitted' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateTeamMemberStatus(member.id, 'kyc_approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle size={14} weight="fill" />
                            <span>Approve & Forward to Admin</span>
                          </button>

                          <button
                            onClick={() => updateTeamMemberStatus(member.id, 'kyc_rejected')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-red-200 flex items-center gap-1"
                          >
                            <XCircle size={14} weight="bold" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No action required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
