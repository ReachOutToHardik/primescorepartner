'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TablePagination } from '@/components/ui/TablePagination';
import { 
  ClipboardText, 
  MagnifyingGlass, 
  Funnel, 
  ArrowRight,
  FileText
} from '@phosphor-icons/react';

import { PartnerViewModal } from '@/components/admin/PartnerViewModal';
import { Partner } from '@/lib/store';

import { ManualAddLeadModal } from '@/components/admin/ManualAddLeadModal';

const STATUS_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Pipeline States' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'received', label: 'Received' },
  { key: 'enrolled', label: 'Enrolled' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminReferralsPage() {
  const { referrals, partners } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Partner Profile Modal State
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  // Manual Add Lead Modal State
  const [manualAddLeadModalOpen, setManualAddLeadModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRecords = filteredReferrals.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedList = filteredReferrals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <ClipboardText className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            Leads &amp; Service Fulfillment
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            View customer leads, update case statuses, and credit points to partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setManualAddLeadModalOpen(true)}
          className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <span>Manual Register Client for Partner</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border)] shadow-2xs">
        <div className="flex-1 flex items-center gap-2 w-full">
          <MagnifyingGlass className="w-5 h-5 text-[var(--ink-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Customer Name, Phone, Service, Partner, or City..."
            className="w-full text-sm outline-none bg-transparent font-body"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-3">
          <Funnel className="w-4 h-4 text-[var(--ink-muted)]" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs p-1.5 border border-[var(--border)] rounded-lg outline-none bg-[var(--surface)] text-[var(--ink)] font-body"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table with Pagination */}
      <Card className="overflow-hidden">
        {filteredReferrals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <ClipboardText size={36} className="text-slate-400" />
              <p className="font-display font-bold text-slate-800 text-base">No Referral Leads Found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Your database table `referrals` is currently empty. When partners submit client referral leads, they will appear here live.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                  <tr>
                    <th className="px-5 py-3.5 w-14">S.No</th>
                    <th className="px-6 py-3.5">Customer Details</th>
                    <th className="px-6 py-3.5">Referred By</th>
                    <th className="px-6 py-3.5">Requested Service</th>
                    <th className="px-6 py-3.5">City</th>
                    <th className="px-6 py-3.5">Pipeline Status</th>
                    <th className="px-6 py-3.5 text-right">Inspect Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono-num">
                  {paginatedList.map((ref, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1;
                    const referringPartner = partners.find((p) => p.id === ref.partnerId);
                    const partnerName = referringPartner?.name || 'Hardik Joshi';

                    return (
                      <tr
                        key={ref.id}
                        onClick={() => window.location.href = `/admin/referrals/${ref.id}`}
                        className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-slate-500 text-xs">{sNo}</td>
                        <td className="px-6 py-4 font-sans font-medium text-[var(--ink)]">
                          <div className="group-hover:text-[var(--navy)] transition-colors font-display font-bold text-sm text-[var(--navy-deep)]">
                            {ref.customerName}
                          </div>
                          <div className="text-xs text-[var(--ink-muted)] font-mono">{ref.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4 font-sans">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPartner(referringPartner || ({
                                id: ref.partnerId || 'p-1',
                                name: partnerName,
                                email: 'hardik@primescore.in',
                                phone: '1234567899',
                                profession: 'Direct Selling Agent (DSA)',
                                role: 'team_leader',
                                status: 'kyc_approved',
                                city: ref.city || 'Jaipur, Rajasthan',
                                partnerCode: 'PS-HARDIK-884',
                                teamCode: 'IND-HAR-509',
                                points: 500,
                                kycStatus: 'approved',
                                joinedAt: new Date().toISOString()
                              } as any));
                              setPartnerModalOpen(true);
                            }}
                            className="font-bold text-[#1B2A72] hover:text-[#E63329] underline hover:no-underline transition-colors cursor-pointer text-xs flex items-center gap-1"
                            title="Click to view partner profile & credentials"
                          >
                            <span>{partnerName}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 font-sans text-xs font-semibold text-[var(--ink-2)]">{ref.service}</td>
                        <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">{ref.city}</td>
                        <td className="px-6 py-4">
                          <Badge variant={ref.status === 'completed' ? 'green' : ref.status === 'rejected' ? 'red' : 'blue'}>
                            {ref.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
                            className="whitespace-nowrap"
                          >
                            Fulfill Case
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </>
        )}
      </Card>

      {/* Partner View Modal */}
      <PartnerViewModal
        partner={selectedPartner}
        isOpen={partnerModalOpen}
        onClose={() => {
          setPartnerModalOpen(false);
          setSelectedPartner(null);
        }}
      />

      {/* Manual Add Lead Modal */}
      <ManualAddLeadModal
        isOpen={manualAddLeadModalOpen}
        onClose={() => setManualAddLeadModalOpen(false)}
      />
    </div>
  );
}
