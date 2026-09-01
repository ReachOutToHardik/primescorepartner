'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ListChecks,
  Clock,
  DownloadSimple,
  Trash,
  MagnifyingGlass,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Coins,
  Megaphone,
  UserGear
} from '@phosphor-icons/react';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useAdminStore();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.actionType === filterAction;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action Type', 'Target Entity', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.actionType}"`,
      `"${l.targetEntity}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primescore_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'kyc_approval':
        return <Badge variant="green" className="text-[10px] uppercase font-mono">KYC Approved</Badge>;
      case 'kyc_rejection':
        return <Badge variant="red" className="text-[10px] uppercase font-mono">KYC Rejected</Badge>;
      case 'lead_status_update':
        return <Badge variant="blue" className="text-[10px] uppercase font-mono">Lead Update</Badge>;
      case 'partner_deleted':
        return <Badge variant="red" className="text-[10px] uppercase font-mono">Partner Deleted</Badge>;
      case 'payout_settlement':
        return <Badge variant="amber" className="text-[10px] uppercase font-mono">Payout Settled</Badge>;
      case 'broadcast_publish':
        return <Badge variant="blue" className="text-[10px] uppercase font-mono">Broadcast</Badge>;
      default:
        return <Badge variant="neutral" className="text-[10px] uppercase font-mono">{type.replace('_', ' ')}</Badge>;
    }
  };

  const kycApprovalsCount = auditLogs.filter((l) => l.actionType === 'kyc_approval').length;
  const leadUpdatesCount = auditLogs.filter((l) => l.actionType === 'lead_status_update').length;
  const payoutCount = auditLogs.filter((l) => l.actionType === 'payout_settlement').length;

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A4E] text-white flex items-center justify-center shadow-xs">
              <ListChecks size={24} weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                System Audit Logs
              </h1>
              <p className="text-xs text-[var(--ink-muted)]">
                Immutable chronological ledger of administrative operations, partner approvals, payouts, and lifecycle events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 border-[var(--border)] text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-2xs text-xs font-semibold"
          >
            <DownloadSimple size={15} weight="bold" />
            <span>Export CSV ({filteredLogs.length})</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 rounded-xl shadow-2xs text-xs font-semibold"
          >
            <Trash size={15} weight="bold" />
            <span>Clear Logs</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Events</span>
          <p className="text-2xl font-display font-bold text-[var(--navy)] mt-1">{auditLogs.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">Logged in Audit Trail</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">KYC Approvals</span>
          <p className="text-2xl font-display font-bold text-emerald-600 mt-1">{kycApprovalsCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Verified partners</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lead Transitions</span>
          <p className="text-2xl font-display font-bold text-blue-600 mt-1">{leadUpdatesCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Lifecycle updates</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Payout Actions</span>
          <p className="text-2xl font-display font-bold text-amber-600 mt-1">{payoutCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Commission settlements</span>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-3 bg-white border border-[var(--border)] rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Action Type Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Actions' },
            { id: 'kyc_approval', label: 'KYC Approved' },
            { id: 'kyc_rejection', label: 'KYC Rejected' },
            { id: 'lead_status_update', label: 'Lead Updates' },
            { id: 'payout_settlement', label: 'Payouts' },
            { id: 'broadcast_publish', label: 'Broadcasts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterAction(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterAction === tab.id
                  ? 'bg-[#1B2A72] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            placeholder="Search logs by actor, entity, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1B2A72] text-[var(--ink)]"
          />
          <MagnifyingGlass size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden border border-[var(--border)] rounded-2xl bg-white shadow-xs">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-[var(--navy-deep)] font-mono">
            Showing {filteredLogs.length} of {auditLogs.length} logged events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-slate-50/70 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--ink-muted)] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ListChecks size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs text-slate-600">No audit events match your filters.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try resetting the action filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--navy-deep)]">{log.actorName}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {log.actorRole}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.actionType)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-[11px] text-slate-700">
                      {log.targetEntity}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      <p className="text-xs line-clamp-2 leading-relaxed">{log.details}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Clear Logs Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Audit Trail"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            Are you sure you want to clear the local system audit history? All {auditLogs.length} activity records will be purged from the browser storage.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <Button size="sm" variant="outline" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                useAdminStore.setState({ auditLogs: [] });
                setClearModalOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
