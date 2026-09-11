'use client';

import React, { useState, useMemo } from 'react';
import { useAdminStore, DeletedAccountRecord } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UserMinus,
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  Calendar,
  User,
  Coins,
  ClipboardText,
  X,
  CheckCircle,
  Clock,
  Warning,
  Globe,
  DeviceMobile,
  ShieldSlash,
  ArrowsClockwise,
} from '@phosphor-icons/react';

const DELETION_REASONS = [
  'All',
  'Found another alternative',
  'No longer active in finance industry',
  'Privacy concerns',
  'Too complex to use',
  'Insufficient earnings',
  'Other',
];

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return <span className="text-slate-400 italic text-xs">—</span>;
  const isLeader = role === 'team_leader';
  return (
    <Badge variant={isLeader ? 'amber' : 'gray'}>
      {isLeader ? 'Team Leader' : 'Individual DSA'}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate-400 italic text-xs">—</span>;
  if (status === 'kyc_approved') return <Badge variant="green">KYC Approved</Badge>;
  if (status === 'kyc_rejected') return <Badge variant="red">KYC Rejected</Badge>;
  return <Badge variant="amber">Under Review</Badge>;
}

function DetailDrawer({
  record,
  onClose,
}: {
  record: DeletedAccountRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-sm shrink-0 font-display">
              {(record.name || record.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 text-sm">
                {record.name || '(Name not available)'}
              </p>
              <p className="text-xs text-slate-500 font-mono">{record.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Deletion event */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Deletion Event</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-slate-500">Deleted At</span>
                <p className="font-semibold text-slate-800 font-mono text-[11px]">
                  {new Date(record.deletedAt).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Deleted By</span>
                <p className="font-semibold text-slate-800">
                  {record.deletedBy === 'self' ? '👤 Self' : `🛡 Admin (${record.deletedBy})`}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Reason</span>
                <p className="font-semibold text-slate-800">{record.deletionReason || '—'}</p>
              </div>
            </div>
          </div>

          {/* Partner snapshot */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Partner Snapshot (at time of deletion)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                { label: 'Former Role', value: <RoleBadge role={record.role} /> },
                { label: 'KYC Status', value: <StatusBadge status={record.statusAtDeletion} /> },
                { label: 'Phone', value: record.phone || '—' },
                { label: 'City / State', value: [record.city, record.state].filter(Boolean).join(', ') || '—' },
                { label: 'PAN (masked)', value: record.pan ? `${record.pan.slice(0, 3)}XXX${record.pan.slice(-2)}` : '—' },
                { label: 'Joined At', value: record.joinedAt ? new Date(record.joinedAt).toLocaleDateString('en-IN') : '—' },
                { label: 'Lifetime Points Forfeited', value: <span className="font-bold text-orange-600">{record.lifetimePointsEarned.toLocaleString()} pts</span> },
                { label: 'Referrals Submitted', value: `${record.referralCount} leads` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-slate-500 block">{label}</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical */}
          {(record.ipAddress || record.userAgent) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Technical / Compliance</p>
              {record.ipAddress && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Globe size={13} className="text-slate-400 shrink-0" />
                  <span className="font-mono">{record.ipAddress}</span>
                </div>
              )}
              {record.userAgent && (
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <DeviceMobile size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-mono break-all text-[10px]">{record.userAgent}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-mono text-[10px]">Original UID: {record.originalId}</span>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
              <Warning size={14} weight="fill" />
              Deletion is permanent. This record cannot be restored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDeletedAccountsPage() {
  const { deletedAccounts, isLoadingData } = useAdminStore();

  const [search, setSearch] = useState('');
  const [filterReason, setFilterReason] = useState('All');
  const [filterBy, setFilterBy] = useState<'all' | 'self' | 'admin'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DeletedAccountRecord | null>(null);

  const filtered = useMemo(() => {
    return deletedAccounts.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (d.name || '').toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.pan || '').toLowerCase().includes(q) ||
        (d.city || '').toLowerCase().includes(q);

      const matchesReason =
        filterReason === 'All' ||
        (d.deletionReason || '').toLowerCase().includes(filterReason.toLowerCase());

      const matchesBy =
        filterBy === 'all' ||
        (filterBy === 'self' && d.deletedBy === 'self') ||
        (filterBy === 'admin' && d.deletedBy !== 'self');

      const deletedDate = new Date(d.deletedAt);
      const matchesFrom = !dateFrom || deletedDate >= new Date(dateFrom);
      const matchesTo = !dateTo || deletedDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesReason && matchesBy && matchesFrom && matchesTo;
    });
  }, [deletedAccounts, search, filterReason, filterBy, dateFrom, dateTo]);

  // KPI calculations
  const totalDeleted = deletedAccounts.length;
  const selfDeleted = deletedAccounts.filter((d) => d.deletedBy === 'self').length;
  const adminDeleted = deletedAccounts.filter((d) => d.deletedBy !== 'self').length;
  const thisMonth = deletedAccounts.filter((d) => {
    const d2 = new Date(d.deletedAt);
    const now = new Date();
    return d2.getMonth() === now.getMonth() && d2.getFullYear() === now.getFullYear();
  }).length;

  const totalPointsForfeited = deletedAccounts.reduce((sum, d) => sum + d.lifetimePointsEarned, 0);

  const handleExportCSV = () => {
    const headers = ['Deleted At', 'Name', 'Email', 'PAN', 'Role', 'Status at Deletion', 'City', 'Lifetime Points', 'Referrals', 'Reason', 'Deleted By'];
    const rows = filtered.map((d) => [
      `"${new Date(d.deletedAt).toLocaleString()}"`,
      `"${d.name || ''}"`,
      `"${d.email}"`,
      `"${d.pan || ''}"`,
      `"${d.role || ''}"`,
      `"${d.statusAtDeletion || ''}"`,
      `"${d.city || ''}"`,
      d.lifetimePointsEarned,
      d.referralCount,
      `"${(d.deletionReason || '').replace(/"/g, '""')}"`,
      `"${d.deletedBy}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `primescore_deleted_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterReason('All');
    setFilterBy('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = search || filterReason !== 'All' || filterBy !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <UserMinus size={22} weight="fill" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)]">
              Deleted Accounts
            </h1>
            <p className="text-xs text-[var(--ink-muted)]">
              Permanent record of all partner account deletions. Data is preserved from the moment of deletion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoadingData && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowsClockwise size={13} className="animate-spin" />
              Syncing…
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 border-[var(--border)] text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-2xs text-xs font-semibold"
          >
            <DownloadSimple size={15} weight="bold" />
            Export CSV ({filtered.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Deleted</span>
          <p className="text-2xl font-display font-bold text-red-600 mt-1">{totalDeleted}</p>
          <span className="text-[10px] text-slate-500">All time</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Self-Deleted</span>
          <p className="text-2xl font-display font-bold text-slate-700 mt-1">{selfDeleted}</p>
          <span className="text-[10px] text-slate-500">Partner requested</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Admin Deleted</span>
          <p className="text-2xl font-display font-bold text-[#1B2A72] mt-1">{adminDeleted}</p>
          <span className="text-[10px] text-slate-500">Admin-initiated</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">This Month</span>
          <p className="text-2xl font-display font-bold text-amber-600 mt-1">{thisMonth}</p>
          <span className="text-[10px] text-slate-500">Current calendar month</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pts Forfeited</span>
          <p className="text-2xl font-display font-bold text-orange-600 mt-1">
            {totalPointsForfeited.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Lifetime points total</span>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or PAN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1B2A72] text-[var(--ink)] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Reason filter */}
            <div className="flex items-center gap-1.5">
              <Funnel size={13} className="text-slate-400 shrink-0" />
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-white text-[var(--ink)] font-body"
              >
                {DELETION_REASONS.map((r) => (
                  <option key={r} value={r}>{r === 'All' ? 'All Reasons' : r}</option>
                ))}
              </select>
            </div>

            {/* Deleted by filter */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg font-medium text-xs border border-slate-200">
              {(['all', 'self', 'admin'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setFilterBy(val)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer capitalize ${
                    filterBy === val
                      ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {val === 'all' ? 'All' : val === 'self' ? 'Self' : 'Admin'}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-white text-[var(--ink)] font-body"
                title="From date"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-white text-[var(--ink)] font-body"
                title="To date"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X size={12} weight="bold" />
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border border-[var(--border)] rounded-2xl bg-white shadow-xs">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--navy-deep)] font-mono">
            Showing {filtered.length} of {totalDeleted} records
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-slate-500 italic">Filters active</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-slate-50/70 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--ink-muted)] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">KYC at Deletion</th>
                <th className="py-3 px-4 text-right">Pts Forfeited</th>
                <th className="py-3 px-4 text-right">Referrals</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Deleted By</th>
                <th className="py-3 px-4">Deleted At</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <ShieldSlash size={24} className="text-slate-400" weight="light" />
                      </div>
                      <p className="font-semibold text-xs text-slate-600">
                        {hasActiveFilters ? 'No records match your filters' : 'No deleted accounts yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs text-center leading-relaxed">
                        {hasActiveFilters
                          ? 'Try adjusting your search, reason filter, or date range.'
                          : 'When a partner deletes their account, a permanent record will appear here.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-semibold text-[#1B2A72] hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Partner name + email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                          {(record.name || record.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 font-display text-xs">
                            {record.name || <span className="italic text-slate-400">No name</span>}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{record.email}</p>
                          {record.pan && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              PAN: {record.pan.slice(0, 3)}XXX{record.pan.slice(-2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <RoleBadge role={record.role} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={record.statusAtDeletion} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-bold text-xs ${record.lifetimePointsEarned > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                        {record.lifetimePointsEarned.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-xs text-slate-600">{record.referralCount}</span>
                    </td>

                    <td className="py-3 px-4 max-w-[180px]">
                      <p className="text-xs text-slate-600 truncate" title={record.deletionReason || ''}>
                        {record.deletionReason || <span className="italic text-slate-400">—</span>}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {record.deletedBy === 'self' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <User size={12} className="text-slate-400" /> Self
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#1B2A72] font-semibold">
                          <CheckCircle size={12} weight="fill" className="text-[#1B2A72]" />
                          Admin
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} className="shrink-0" />
                        <span className="font-mono text-[11px]">
                          {new Date(record.deletedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono ml-[18px]">
                        {new Date(record.deletedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-[11px] font-semibold text-[#1B2A72] hover:text-[#0F1A4E] hover:underline cursor-pointer"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SQL Migration Block — shown only in development or if 0 records */}
      {totalDeleted === 0 && (
        <Card className="p-5 border border-amber-200 bg-amber-50 rounded-2xl">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-3">
            <Warning size={14} weight="fill" />
            Supabase Table Setup Required
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Run the following SQL in your <strong>Supabase SQL Editor</strong> to create the{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">deleted_accounts</code> table:
          </p>
          <pre className="text-[10px] font-mono bg-white border border-amber-200 rounded-xl p-4 overflow-x-auto text-slate-800 leading-relaxed whitespace-pre-wrap">
{`-- ── Create deleted_accounts table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id           UUID NOT NULL,
  name                  TEXT,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  city                  TEXT,
  state                 TEXT,
  pan                   TEXT,
  role                  TEXT,
  status_at_deletion    TEXT,
  joined_at             TIMESTAMPTZ,
  lifetime_points_earned INT DEFAULT 0,
  referral_count        INT DEFAULT 0,
  deletion_reason       TEXT,
  deleted_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_by            TEXT NOT NULL DEFAULT 'self',
  ip_address            TEXT,
  user_agent            TEXT
);

-- ── Row-Level Security: partners cannot access this table ──────────
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_partner_access_deleted_accounts"
  ON public.deleted_accounts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Service Role Key bypasses RLS (used only in server API routes).`}
          </pre>
        </Card>
      )}

      {/* Detail Drawer */}
      {selectedRecord && (
        <DetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
