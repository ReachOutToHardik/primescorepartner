'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore, Referral, ReferralStatus } from '@/lib/store';
import {
  ListChecks,
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  X,
  CheckCircle,
  Clock,
  CaretRight,
  User,
  Phone,
  Envelope,
  MapPin,
  FileText,
  Coins,
  ArrowRight,
} from '@phosphor-icons/react';

export default function ReferralsPage() {
  const { referrals, updateReferralStatus } = usePartnerStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Referral for 5-Stage Stepper Slide-Over Modal
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // Status Filter options
  const statusOptions = [
    { label: 'All Referrals', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Received', value: 'received' },
    { label: 'Enrolled', value: 'enrolled' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
  ];

  // Filtered List
  const filteredReferrals = useMemo(() => {
    return referrals.filter((ref) => {
      const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        ref.customerName.toLowerCase().includes(q) ||
        ref.customerPhone.toLowerCase().includes(q) ||
        ref.customerEmail.toLowerCase().includes(q) ||
        ref.city.toLowerCase().includes(q) ||
        ref.id.toLowerCase().includes(q) ||
        ref.service.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [referrals, statusFilter, searchQuery]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Referral ID',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'City',
      'Service Required',
      'Status',
      'Submitted Date',
      'Points Earned',
    ];

    const rows = filteredReferrals.map((ref) => [
      ref.id,
      `"${ref.customerName}"`,
      ref.customerPhone,
      ref.customerEmail,
      `"${ref.city}"`,
      `"${ref.service}"`,
      ref.status,
      ref.createdAt,
      ref.pointsEarned,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primescore_referrals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Helper
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

  // 5-Stage Stepper calculation for selected referral
  const stages: { key: ReferralStatus; label: string; desc: string }[] = [
    { key: 'submitted', label: '1. Submitted', desc: 'Referral submitted by partner' },
    { key: 'received', label: '2. Received', desc: 'Assigned to Primescore advisor' },
    { key: 'enrolled', label: '3. Enrolled', desc: 'Client onboarded & package selected' },
    { key: 'in_progress', label: '4. In Progress', desc: 'Disputes filed with credit bureaus' },
    { key: 'completed', label: '5. Completed', desc: 'Rectification complete & 500 Pts awarded' },
  ];

  const getStageState = (stageKey: ReferralStatus, currentStatus: ReferralStatus) => {
    const order: ReferralStatus[] = ['submitted', 'received', 'enrolled', 'in_progress', 'completed'];
    const currentIdx = order.indexOf(currentStatus);
    const stageIdx = order.indexOf(stageKey);

    if (currentStatus === 'rejected') {
      return stageKey === 'submitted' ? 'done' : 'future';
    }

    if (stageIdx < currentIdx) return 'done';
    if (stageIdx === currentIdx) return 'current';
    return 'future';
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListChecks size={26} className="text-[#1B2A72]" weight="bold" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              All Client Referrals
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Search, filter, and track 5-stage bureau progression for all your referred clients.
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-white hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--ink)] font-display font-semibold text-xs rounded-xs transition-colors inline-flex items-center gap-2 shadow-xs"
        >
          <DownloadSimple size={16} weight="bold" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-[var(--border)] p-4 rounded-xs shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by client name, phone, city, or Ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
            />
            <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-[var(--ink-subtle)]" />
          </div>

          {/* Status Filter Pill Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-[#1B2A72] text-white shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)] border border-[var(--border)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Referrals Main Table */}
      <div className="bg-white border border-[var(--border)] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                <th className="p-3.5">Ref ID</th>
                <th className="p-3.5">Client Details</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Service Requested</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submitted Date</th>
                <th className="p-3.5 text-right">Points</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--ink-muted)]">
                    No referrals match your search query or filter selection.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((ref) => (
                  <tr
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
                    className="hover:bg-[#1B2A72]/5 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-mono-num font-bold text-[#1B2A72]">{ref.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[var(--ink)]">{ref.customerName}</div>
                      <div className="text-[11px] font-mono-num text-[var(--ink-subtle)]">
                        {ref.customerPhone} &bull; {ref.customerEmail}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-[var(--ink-2)]">{ref.city}</td>
                    <td className="p-3.5 font-semibold text-[var(--ink)]">{ref.service}</td>
                    <td className="p-3.5">{getStatusBadge(ref.status)}</td>
                    <td className="p-3.5 font-mono-num text-[var(--ink-muted)]">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right font-mono-num font-bold text-[#3DAA4B]">
                      {ref.pointsEarned > 0 ? `+${ref.pointsEarned} Pts` : '0 Pts'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button className="p-1 text-[var(--ink-muted)] hover:text-[#1B2A72]">
                        <CaretRight size={18} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-STAGE STATUS STEPPER MODAL */}
      {selectedReferral && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setSelectedReferral(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[var(--border)] rounded-xs shadow-2xl p-6 sm:p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto animate-fade-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <span className="text-[10px] font-mono-num uppercase tracking-wider font-bold text-[#1B2A72]">
                    {selectedReferral.id}
                  </span>
                  <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                    {selectedReferral.customerName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] rounded-xs hover:bg-[var(--surface-2)]"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              {/* Client Info Grid */}
              <div className="bg-[var(--surface)] p-4 border border-[var(--border)] rounded-xs text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--ink-subtle)] block">Phone</span>
                    <span className="font-mono-num font-semibold text-[var(--ink)]">{selectedReferral.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--ink-subtle)] block">City</span>
                    <span className="font-semibold text-[var(--ink)]">{selectedReferral.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--ink-subtle)] block">Service</span>
                    <span className="font-semibold text-[#1B2A72]">{selectedReferral.service}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--ink-subtle)] block">Points Reward</span>
                    <span className="font-mono-num font-bold text-[#3DAA4B]">
                      {selectedReferral.pointsEarned > 0 ? `+${selectedReferral.pointsEarned} Pts` : 'Pending'}
                    </span>
                  </div>
                </div>
                {selectedReferral.notes && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] uppercase text-[var(--ink-subtle)] block">Partner Note</span>
                    <p className="italic text-[var(--ink-2)] text-[11px]">&ldquo;{selectedReferral.notes}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* 5-Stage Status Stepper Timeline */}
              <div className="pt-4 space-y-4">
                <h3 className="font-display text-sm font-bold text-[var(--ink)] uppercase tracking-wider">
                  5-Stage Referral Timeline
                </h3>

                <div className="space-y-6 relative pl-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border)]">
                  {stages.map((stg) => {
                    const state = getStageState(stg.key, selectedReferral.status);
                    const isDone = state === 'done';
                    const isCurrent = state === 'current';

                    const historyMatch = selectedReferral.statusHistory.find(
                      (h) => h.status === stg.key
                    );

                    return (
                      <div key={stg.key} className="relative space-y-1">
                        {/* Bullet Icon */}
                        <div
                          className={`absolute -left-6 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-[#3DAA4B] border-[#3DAA4B] text-white'
                              : isCurrent
                              ? 'bg-[#1B2A72] border-[#1B2A72] text-white ring-4 ring-[#1B2A72]/20'
                              : 'bg-white border-[var(--border)] text-[var(--ink-subtle)]'
                          }`}
                        >
                          {isDone ? <CheckCircle size={14} weight="fill" /> : ''}
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`font-display font-bold text-sm ${
                              isCurrent
                                ? 'text-[#1B2A72]'
                                : isDone
                                ? 'text-[var(--ink)]'
                                : 'text-[var(--ink-subtle)]'
                            }`}
                          >
                            {stg.label}
                          </p>
                          {historyMatch && (
                            <span className="text-[10px] font-mono-num text-[var(--ink-subtle)]">
                              {new Date(historyMatch.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--ink-muted)]">{stg.desc}</p>
                        {historyMatch?.note && (
                          <p className="text-[11px] bg-[var(--surface-2)] p-2 rounded-xs text-[var(--ink-2)] mt-1 font-mono">
                            Note: {historyMatch.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stage Simulation Test Control */}
            <div className="pt-6 border-t border-[var(--border)] mt-6 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-subtle)] block">
                Simulate Status Stage Transition (Demo Test)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    updateReferralStatus(selectedReferral.id, 'in_progress');
                    setSelectedReferral({ ...selectedReferral, status: 'in_progress' });
                  }}
                  className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold rounded-xs border border-amber-300"
                >
                  Set In Progress
                </button>
                <button
                  onClick={() => {
                    updateReferralStatus(selectedReferral.id, 'completed');
                    setSelectedReferral({ ...selectedReferral, status: 'completed', pointsEarned: 500 });
                  }}
                  className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded-xs border border-emerald-300"
                >
                  Set Completed (+500 Pts)
                </button>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="py-1.5 px-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink)] text-[10px] font-bold rounded-xs border border-[var(--border)]"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
