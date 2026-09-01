'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  UserGear,
  Plus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Pencil,
  Trash,
  LockKey,
  UsersThree,
  ArrowRight
} from '@phosphor-icons/react';

export const PERMISSION_PAGES = [
  { id: 'dashboard', label: 'HQ Overview (Full Access)' },
  { id: 'overview_kpis', label: 'Overview: Top Metric Cards' },
  { id: 'overview_chart', label: 'Overview: Revenue & Growth Charts' },
  { id: 'overview_distribution', label: 'Overview: Pipeline Funnel' },
  { id: 'overview_actions', label: 'Overview: Quick Action Buttons' },
  { id: 'kyc', label: 'Partner Verifications & KYC' },
  { id: 'referrals', label: 'Referral Cases & Leads Pipeline' },
  { id: 'teams', label: 'Team Leaders & DSAs Directory' },
  { id: 'analytics', label: 'Payouts & Financial Reports' },
  { id: 'gift-cards', label: 'Gift Voucher Claims Fulfillment' },
  { id: 'services', label: 'Services & Products Catalog' },
  { id: 'rewards-config', label: 'Points & Commission Rates' },
  { id: 'notifications', label: 'Send Messages (Targeted Alerts)' },
  { id: 'broadcasts', label: 'Broadcast Announcements (Marquee)' },
  { id: 'staff', label: 'Admin Staff Roles & RBAC' },
  { id: 'audit-logs', label: 'System Audit Logs' },
  { id: 'settings', label: 'Platform Settings' },
];

export default function AdminStaffPage() {
  const { staff, addStaffUser, updateStaffUser, toggleStaffStatus, deleteStaffUser } = useAdminStore();

  // Add Staff Modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('Staff@2026');
  const [staffRole, setStaffRole] = useState<'operations_admin' | 'compliance_officer' | 'support_agent' | 'custom_staff'>('operations_admin');
  const [staffPages, setStaffPages] = useState<string[]>([
    'dashboard', 'kyc', 'referrals', 'teams', 'analytics', 'gift-cards', 'services', 'rewards-config', 'notifications', 'broadcasts', 'staff', 'audit-logs', 'settings'
  ]);

  // Edit Staff Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editStaffRole, setEditStaffRole] = useState<'operations_admin' | 'compliance_officer' | 'support_agent' | 'custom_staff'>('operations_admin');
  const [editStaffPages, setEditStaffPages] = useState<string[]>([]);

  // Delete Staff Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);
  const [deleteStaffName, setDeleteStaffName] = useState('');

  const handleAddStaff = async () => {
    if (staffName.trim() && staffEmail.trim()) {
      await addStaffUser({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        allowedPages: staffPages,
        isActive: true,
      });
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('Staff@2026');
      setStaffModalOpen(false);
    }
  };

  const handleOpenEditStaff = (user: any) => {
    setEditStaffId(user.id);
    setEditStaffName(user.name);
    setEditStaffEmail(user.email);
    setEditStaffPassword(user.password || '');
    setEditStaffRole(user.role || 'operations_admin');
    setEditStaffPages(user.allowedPages || PERMISSION_PAGES.map((p) => p.id));
    setEditModalOpen(true);
  };

  const handleSaveEditStaff = async () => {
    if (editStaffId && editStaffName.trim() && editStaffEmail.trim()) {
      await updateStaffUser(editStaffId, {
        name: editStaffName,
        email: editStaffEmail,
        password: editStaffPassword || undefined,
        role: editStaffRole,
        allowedPages: editStaffPages,
      });
      setEditModalOpen(false);
      setEditStaffId(null);
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (deleteStaffId) {
      await deleteStaffUser(deleteStaffId);
      setDeleteModalOpen(false);
      setDeleteStaffId(null);
    }
  };

  const superAdminCount = staff.filter((s) => s.role === 'super_admin').length;
  const activeStaffCount = staff.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A4E] text-white flex items-center justify-center shadow-xs">
              <UserGear size={24} weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                Admin Staff Roles & RBAC
              </h1>
              <p className="text-xs text-[var(--ink-muted)]">
                Manage internal operations team, configure role-based access permissions, and monitor staff login activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/audit-logs"
            className="px-3.5 py-2 bg-white border border-[var(--border)] text-[var(--ink)] hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>View Audit Logs</span>
            <ArrowRight size={14} />
          </Link>

          <Button
            size="sm"
            onClick={() => setStaffModalOpen(true)}
            className="flex items-center gap-2 bg-[#1B2A72] hover:bg-[#152059] text-white shadow-xs rounded-xl"
          >
            <Plus size={16} weight="bold" />
            <span>Add Staff User</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
          <p className="text-2xl font-display font-bold text-[var(--navy)] mt-1">{staff.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Configured in System</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Super Admins</span>
          <p className="text-2xl font-display font-bold text-amber-600 mt-1">{superAdminCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Unrestricted HQ access</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Staff</span>
          <p className="text-2xl font-display font-bold text-emerald-600 mt-1">{activeStaffCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Can sign in right now</span>
        </Card>

        <Card className="p-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">RBAC Rules</span>
          <p className="text-2xl font-display font-bold text-indigo-600 mt-1">{PERMISSION_PAGES.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">Granular Page Gates</span>
        </Card>
      </div>

      {/* Staff User Table */}
      <Card className="overflow-hidden border border-[var(--border)] rounded-2xl bg-white shadow-xs">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-[var(--navy-deep)] flex items-center gap-2">
              <UsersThree size={18} className="text-[#1B2A72]" weight="bold" />
              Registered Staff Members ({staff.length})
            </h2>
            <p className="text-[11px] text-[var(--ink-muted)]">
              Authorized admin team members with role-level page gates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-slate-50/70 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--ink-muted)] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Role & Clearance</th>
                <th className="py-3.5 px-4">Allowed Pages / Gates</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {staff.map((user) => {
                const isSuper = user.role === 'super_admin';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[var(--navy)] uppercase">
                          {user.name[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--navy-deep)]">{user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isSuper ? 'amber' : 'blue'}
                        className="text-[10px] font-bold uppercase tracking-wider font-mono"
                      >
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {isSuper ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Full Access to All Pages
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(user.allowedPages || []).slice(0, 4).map((pId) => {
                            const pObj = PERMISSION_PAGES.find((x) => x.id === pId);
                            return (
                              <span
                                key={pId}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                              >
                                {pObj?.label.split(' ')[0] || pId}
                              </span>
                            );
                          })}
                          {(user.allowedPages || []).length > 4 && (
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">
                              +{(user.allowedPages || []).length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStaffStatus(user.id)}
                        disabled={isSuper}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        } ${isSuper ? 'cursor-not-allowed opacity-80' : 'hover:opacity-90'}`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle size={13} weight="fill" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={13} weight="fill" /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditStaff(user)}
                          title="Edit Staff & Permissions"
                          className="p-1.5 text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={15} weight="bold" />
                        </button>
                        {!isSuper && (
                          <button
                            onClick={() => {
                              setDeleteStaffId(user.id);
                              setDeleteStaffName(user.name);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Staff"
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Create New Staff Member"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Chandra"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Work Email Address *
            </label>
            <input
              type="email"
              placeholder="ramesh@primescore.in"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Temporary Login Password *
            </label>
            <input
              type="text"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Assign Staff Role
            </label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)] cursor-pointer"
            >
              <option value="operations_admin">Operations Admin (Lead & Payout Specialist)</option>
              <option value="compliance_officer">Compliance Officer (KYC & Documents)</option>
              <option value="support_agent">Support Agent (Partner Helpdesk)</option>
              <option value="custom_staff">Custom Staff Role</option>
            </select>
          </div>

          {/* Granular Page-Level Access Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-2">
              Allowed Pages & Permissions ({staffPages.length}/{PERMISSION_PAGES.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {PERMISSION_PAGES.map((page) => {
                const isChecked = staffPages.includes(page.id);
                return (
                  <label
                    key={page.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-xs select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setStaffPages(staffPages.filter((p) => p !== page.id));
                        } else {
                          setStaffPages([...staffPages, page.id]);
                        }
                      }}
                      className="rounded border-slate-300 text-[#1B2A72] focus:ring-[#1B2A72]"
                    />
                    <span className="text-[11px] text-slate-700 font-medium">{page.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Button size="sm" variant="outline" onClick={() => setStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddStaff} className="bg-[#1B2A72] hover:bg-[#152059] text-white">
              Create Staff Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Staff Member & Permissions"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editStaffName}
              onChange={(e) => setEditStaffName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              value={editStaffEmail}
              onChange={(e) => setEditStaffEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Reset Password (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty to keep current password"
              value={editStaffPassword}
              onChange={(e) => setEditStaffPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Role
            </label>
            <select
              value={editStaffRole}
              onChange={(e) => setEditStaffRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[#1B2A72] text-[var(--ink)]"
            >
              <option value="operations_admin">Operations Admin</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="support_agent">Support Agent</option>
              <option value="custom_staff">Custom Staff Role</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-2">
              Allowed Pages & Permissions ({editStaffPages.length}/{PERMISSION_PAGES.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {PERMISSION_PAGES.map((page) => {
                const isChecked = editStaffPages.includes(page.id);
                return (
                  <label
                    key={page.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-xs select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setEditStaffPages(editStaffPages.filter((p) => p !== page.id));
                        } else {
                          setEditStaffPages([...editStaffPages, page.id]);
                        }
                      }}
                      className="rounded border-slate-300 text-[#1B2A72] focus:ring-[#1B2A72]"
                    />
                    <span className="text-[11px] text-slate-700 font-medium">{page.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Button size="sm" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEditStaff} className="bg-[#1B2A72] hover:bg-[#152059] text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Staff Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Revoke Staff Access"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove <strong className="text-red-600">{deleteStaffName}</strong> from the administrative team? They will immediately lose access to all PrimeScore admin pages.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <Button size="sm" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmDeleteStaff} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Staff
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
