'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TablePagination } from '@/components/ui/TablePagination';
import { Modal } from '@/components/ui/Modal';
import { ResetPartnerPasswordModal } from '@/components/admin/ResetPartnerPasswordModal';
import { AddPartnerModal } from '@/components/admin/AddPartnerModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { 
  ShieldCheck, 
  MagnifyingGlass, 
  Funnel, 
  FileText, 
  UserCheck, 
  UserMinus, 
  Hourglass,
  ArrowRight,
  User,
  Crown,
  Trash,
  CheckCircle,
  Key,
  UserPlus
} from '@phosphor-icons/react';

export default function AdminKycListPage() {
  const { partners, deletePartner, approveKyc } = useAdminStore();
  const [approvePartner, setApprovePartner] = useState<any | null>(null);
  const [resetPassPartner, setResetPassPartner] = useState<any | null>(null);
  const [deleteTargetPartner, setDeleteTargetPartner] = useState<any | null>(null);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [codeLinkInput, setCodeLinkInput] = useState('');
  const [userRefCodeInput, setUserRefCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'individual' | 'team_leader'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filter List by Status Tab
  const pendingList = partners.filter((p) => p.status === 'kyc_submitted');
  const approvedList = partners.filter((p) => p.status === 'kyc_approved');
  const rejectedList = partners.filter((p) => p.status === 'kyc_rejected');

  const currentTabList = (activeTab === 'pending' ? pendingList : activeTab === 'approved' ? approvedList : rejectedList).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.teamCode && p.teamCode.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate Paginated Slice
  const totalRecords = currentTabList.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedList = currentTabList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            Partner KYC Verification & Roster
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Check PAN card, Aadhaar, bank details, referred leader, and onboarded partner accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddPartnerOpen(true)}
            className="bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} weight="bold" />
            <span>➕ Onboard New Partner</span>
          </Button>

          {/* Tab Navigation */}
          <div className="flex bg-[var(--surface-2)] p-1 rounded-xl font-medium text-xs border border-[var(--border)]">
            <button
              onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Hourglass className="w-4 h-4 text-amber-500" weight="fill" />
              Pending ({pendingList.length})
            </button>
            <button
              onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" weight="fill" />
              Approved ({approvedList.length})
            </button>
            <button
              onClick={() => { setActiveTab('rejected'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              <UserMinus className="w-4 h-4 text-red-500" weight="fill" />
              Rejected ({rejectedList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border)] shadow-2xs">
        <div className="flex-1 flex items-center gap-2 w-full">
          <MagnifyingGlass className="w-5 h-5 text-[var(--ink-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Name, Email, Phone, City, PAN, or Referred Leader..."
            className="w-full text-sm outline-none bg-transparent font-body"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-3">
          <Funnel className="w-4 h-4 text-[var(--ink-muted)]" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
            className="text-xs p-1.5 border border-[var(--border)] rounded-lg outline-none bg-[var(--surface)] text-[var(--ink)] font-body"
          >
            <option value="all">All Partner Types</option>
            <option value="individual">Individual DSA</option>
            <option value="team_leader">Team Leader</option>
          </select>
        </div>
      </div>

      {/* Directory Table with Pagination */}
      <Card className="overflow-hidden">
        {currentTabList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center mx-auto mb-1">
              <User size={24} weight="bold" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              {searchQuery || roleFilter !== 'all' ? 'No Matching Partners Found' : 'No Partner Accounts Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery || roleFilter !== 'all'
                ? `No partner dossiers match your search "${searchQuery || roleFilter}". Try clearing your filters.`
                : 'When new users register in the portal, their account dossiers will appear here live.'}
            </p>

            {(searchQuery || roleFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1B2A72] font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 border border-slate-200"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                    <tr>
                      <th className="px-6 py-3.5">Partner Profile</th>
                      <th className="px-6 py-3.5">Role & Team Linkage</th>
                      <th className="px-6 py-3.5">Referred By (Leader)</th>
                      <th className="px-6 py-3.5">Email Verified</th>
                      <th className="px-6 py-3.5">PAN & Bank Status</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5 text-right">Inspect Full Page</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-mono-num">
                    {paginatedList.map((partner) => (
                      <tr 
                        key={partner.id} 
                        onClick={() => window.location.href = `/admin/kyc/${partner.id}`}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-sans font-bold text-[var(--ink)] flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold text-xs font-display shrink-0 shadow-2xs">
                            {partner.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="group-hover:text-[var(--navy)] transition-colors font-display text-sm">{partner.name}</div>
                            <div className="text-xs font-normal text-[var(--ink-muted)] font-mono-num">{partner.email} • {partner.phone}</div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-sans text-xs">
                          <Badge variant={partner.role === 'team_leader' ? 'amber' : 'gray'}>
                            {partner.role === 'team_leader' ? 'Team Leader' : 'Individual DSA'}
                          </Badge>
                          <div className="text-[11px] font-mono text-[var(--ink-muted)] mt-1">{partner.teamCode}</div>
                        </td>

                        <td className="px-6 py-4 font-sans text-xs" onClick={(e) => e.stopPropagation()}>
                          {partner.role === 'team_leader' ? (
                            <span className="text-amber-600 font-semibold flex items-center gap-1">
                              <Crown size={14} weight="fill" /> Head Team Leader
                            </span>
                          ) : partner.referredByLeaderName ? (
                            <Link href={`/admin/kyc/${partner.referredByLeaderId || 'demo'}`}>
                              <span className="text-[var(--navy)] font-semibold hover:underline flex items-center gap-1">
                                <User size={14} /> {partner.referredByLeaderName}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-[var(--ink-subtle)] italic">Direct Platform Signup</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-sans text-xs">
                          <Badge variant={partner.isEmailVerified !== false ? 'green' : 'red'}>
                            {partner.isEmailVerified !== false ? 'VERIFIED ✓' : 'UNVERIFIED ✖'}
                          </Badge>
                        </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="font-bold text-[var(--navy)]">{partner.pan || 'PAN-PENDING'}</div>
                        <div className="text-[11px] font-sans text-[var(--ink-muted)]">
                          {partner.bankName ? `${partner.bankName}` : 'Bank Pending'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={partner.status === 'kyc_approved' ? 'green' : partner.status === 'kyc_rejected' ? 'red' : 'amber'}>
                          {partner.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {partner.status === 'kyc_submitted' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
                                const codeSuffix = partner.id.substring(0, 4).toUpperCase();
                                setCodeLinkInput(partner.teamCode || `IND-${namePart}-${codeSuffix}`);
                                setUserRefCodeInput((partner as any).userReferralCode || 'PSMKMVLN');
                                setApprovePartner(partner);
                              }}
                              className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                          )}

                          <Link href={`/admin/kyc/${partner.id}`}>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-700" />}
                              className="whitespace-nowrap"
                            >
                              View
                            </Button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setResetPassPartner(partner)}
                            className="p-2 text-[#1B2A72] hover:bg-indigo-50 hover:border-indigo-300 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Reset Partner Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetPartner(partner)}
                            className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 transition-colors cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* RESET PARTNER PASSWORD MODAL */}
      <ResetPartnerPasswordModal
        isOpen={Boolean(resetPassPartner)}
        onClose={() => setResetPassPartner(null)}
        partner={resetPassPartner}
      />

      {/* APPROVE PARTNER MODAL WITH CODE / LINK GENERATOR */}
      {approvePartner && (
        <Modal
          isOpen={Boolean(approvePartner)}
          onClose={() => setApprovePartner(null)}
          title={`Approve Partner: ${approvePartner.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide or auto-generate referral codes for <strong>{approvePartner.name}</strong>.
            </p>

            {/* 1. Client Referral Code (dashboard.primescore.in) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  User Referral Code (Client Link Code) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    let c = 'PS';
                    for (let i = 0; i < 6; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
                    setUserRefCodeInput(c);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ⚡ Auto-Generate
                </button>
              </div>

              <input
                type="text"
                value={userRefCodeInput}
                onChange={(e) => setUserRefCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. PSMKMVLN"
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-bold text-slate-950 outline-none uppercase"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Client Referral Target: <strong className="text-[#1B2A72] font-mono">https://dashboard.primescore.in/ref/{userRefCodeInput.trim().toUpperCase() || 'PSMKMVLN'}</strong>
              </p>
            </div>

            {/* 2. Team Code / Partner Referral Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Partner Network Team Code (Sub-Agent Code)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const namePart = (approvePartner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
                    const randomNum = Math.floor(100 + Math.random() * 900);
                    setCodeLinkInput(`IND-${namePart}-${randomNum}`);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ⚡ Auto-Generate
                </button>
              </div>

              <input
                type="text"
                value={codeLinkInput}
                onChange={(e) => setCodeLinkInput(e.target.value.toUpperCase())}
                placeholder="e.g. IND-HAR-509"
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-semibold text-slate-950 outline-none uppercase"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setApprovePartner(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  const finalTeamCode = codeLinkInput.trim() || 'IND-HAR-509';
                  const finalUserRefCode = userRefCodeInput.trim() || 'PSMKMVLN';
                  await approveKyc(approvePartner.id, finalTeamCode, finalUserRefCode);
                  setApprovePartner(null);
                }}
              >
                Approve Partner & Save Credentials
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboard New Partner Modal */}
      <AddPartnerModal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
      />

      {/* Delete Partner Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetPartner}
        onClose={() => setDeleteTargetPartner(null)}
        onConfirm={async () => {
          if (deleteTargetPartner) {
            await deletePartner(deleteTargetPartner.id);
            setDeleteTargetPartner(null);
          }
        }}
        title="Delete Partner Dossier"
        itemName={deleteTargetPartner?.name}
        description="Deleting this partner account will permanently remove their profile, referral records, and points transaction history."
      />
    </div>
  );
}
