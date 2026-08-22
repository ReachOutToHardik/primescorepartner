'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Gear, 
  UserGear, 
  ListChecks, 
  Megaphone, 
  Plus, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Broadcast,
  Coins,
  CurrencyInr,
  ArrowRight,
  Sparkle,
  Gift,
  Warning,
  Bell
} from '@phosphor-icons/react';

const PERMISSION_PAGES = [
  { id: 'dashboard', label: 'HQ Overview & Stats' },
  { id: 'kyc', label: 'Partner Verification & KYC' },
  { id: 'referrals', label: 'Referral Leads & Cases' },
  { id: 'teams', label: 'Team Leaders & DSAs' },
  { id: 'analytics', label: 'Payouts & Reports' },
  { id: 'gift-cards', label: 'Gift Vouchers & Rewards' },
  { id: 'services', label: 'Services & Products Catalog' },
  { id: 'rewards-config', label: 'Points & Commission Rates' },
  { id: 'notifications', label: 'Send Announcements' },
  { id: 'settings', label: 'Staff Accounts & Settings' },
];

export default function AdminSettingsPage() {
  const { staff, auditLogs, broadcasts, addStaffUser, updateStaffUser, toggleStaffStatus, deleteStaffUser, createBroadcast, toggleBroadcast } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'staff' | 'logs' | 'broadcasts'>('staff');

  // Add Staff Modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('Staff@2026');
  const [staffRole, setStaffRole] = useState<'operations_admin' | 'compliance_officer' | 'support_agent' | 'custom_staff'>('operations_admin');
  const [staffDept, setStaffDept] = useState('Lead Operations');
  const [staffPages, setStaffPages] = useState<string[]>([
    'dashboard', 'kyc', 'referrals', 'teams', 'analytics', 'gift-cards', 'services', 'rewards-config', 'notifications', 'settings'
  ]);

  // Edit Staff Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editStaffRole, setEditStaffRole] = useState<'operations_admin' | 'compliance_officer' | 'support_agent' | 'custom_staff'>('operations_admin');
  const [editStaffDept, setEditStaffDept] = useState('');
  const [editStaffPages, setEditStaffPages] = useState<string[]>([]);

  // Delete Staff Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);
  const [deleteStaffName, setDeleteStaffName] = useState('');

  // Broadcast Modal
  const [bcModalOpen, setBcModalOpen] = useState(false);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<'info' | 'warning' | 'promotion' | 'reward'>('promotion');
  const [bcIcon, setBcIcon] = useState<'megaphone' | 'sparkle' | 'gift' | 'warning' | 'check' | 'bell'>('megaphone');
  const [bcColor, setBcColor] = useState<'yellow' | 'red' | 'green' | 'white'>('yellow');

  const handleAddStaff = async () => {
    if (staffName.trim() && staffEmail.trim()) {
      await addStaffUser({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        department: staffDept,
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
    setEditStaffDept(user.department || 'Lead Operations');
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
        department: editStaffDept,
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

  const handlePublishBroadcast = () => {
    if (bcTitle.trim() && bcMessage.trim()) {
      createBroadcast({
        title: bcTitle,
        message: bcMessage,
        type: bcType,
        icon: bcIcon,
        color: bcColor,
        isActive: true,
      });
      setBcTitle('');
      setBcMessage('');
      setBcModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <Gear className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            System Control, RBAC Staff & Audit Center
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Manage admin staff roles, track timestamped operational audit logs, and publish live announcement banners.
          </p>
        </div>

        <Link
          href="/admin/rewards-config"
          className="px-4 py-2.5 bg-gradient-to-r from-[#0F1A4E] to-[#1B2A72] text-white text-xs font-bold font-display rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <Coins size={20} className="text-[#F5C518]" weight="fill" />
          <span>Reward Engine Rates & Rules &rarr;</span>
        </Link>
      </div>
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl font-medium text-xs border border-[var(--border)]">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <UserGear size={16} /> Admin Staff Roles ({staff.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <ListChecks size={16} /> System Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'broadcasts'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Megaphone size={16} /> Broadcast Announcements ({broadcasts.length})
          </button>
        </div>

      {/* TAB 1: Admin Staff RBAC Roles */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">Admin User Permissions & Access Control</h2>
            <Button variant="primary" size="sm" onClick={() => setStaffModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Staff Member
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                  <tr>
                    <th className="px-6 py-3.5">Staff Name & ID</th>
                    <th className="px-6 py-3.5">Assigned Role</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Last Login</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono-num">
                  {staff.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4 font-sans font-bold text-[var(--ink)]">
                        <div>{u.name}</div>
                        <div className="text-xs font-mono font-normal text-[var(--ink-muted)]">{u.email} • {u.id}</div>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs">
                        <Badge variant={u.role === 'super_admin' ? 'amber' : 'blue'}>
                          {u.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-[var(--ink-2)]">
                        <div>{u.department}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {u.role === 'super_admin' ? 'All 10 Pages Allowed' : `${u.allowedPages?.length || 0} Pages Allowed`}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">
                        {new Date(u.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? 'green' : 'gray'}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(u)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer"
                            title="Edit Staff Permissions"
                          >
                            ✏️ Edit
                          </button>

                          <Button
                            variant={u.isActive ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => toggleStaffStatus(u.id)}
                            disabled={u.role === 'super_admin'}
                          >
                            {u.isActive ? 'Revoke' : 'Restore'}
                          </Button>

                          {u.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteStaffId(u.id);
                                setDeleteStaffName(u.name);
                                setDeleteModalOpen(true);
                              }}
                              className="px-2 py-1 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                              title="Delete Staff Account"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: System Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">System Operational Audit Log Trail</h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                  <tr>
                    <th className="px-6 py-3.5">Log ID & Date</th>
                    <th className="px-6 py-3.5">Admin Operator</th>
                    <th className="px-6 py-3.5">Action Category</th>
                    <th className="px-6 py-3.5">Target Entity</th>
                    <th className="px-6 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono-num">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          <div className="font-bold text-[var(--navy)]">{log.id}</div>
                          <div className="text-[10px] text-[var(--ink-muted)]">{new Date(log.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 font-sans font-medium text-[var(--ink)]">
                          <div>{log.actorName}</div>
                          <div className="text-[11px] text-[var(--ink-muted)] capitalize">{log.actorRole.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 font-sans text-xs">
                          <Badge variant={log.actionType === 'kyc_approval' ? 'green' : log.actionType === 'kyc_rejection' ? 'red' : 'blue'}>
                            {log.actionType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-sans text-xs font-semibold text-[var(--ink-2)]">{log.targetEntity}</td>
                        <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)] max-w-xs">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ListChecks size={36} className="text-slate-400" />
                          <p className="font-display font-bold text-slate-800 text-sm">No System Audit Logs Recorded Yet</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Audit log entries are automatically created when staff members approve KYC, update referral stages, or change platform settings.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Broadcast Banners */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">Partner Dashboard Announcement Banners</h2>
            <Button variant="primary" size="sm" onClick={() => setBcModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Create New Broadcast
            </Button>
          </div>

          {broadcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {broadcasts.map((b) => (
                <Card key={b.id} className="p-5 space-y-3 border-l-4 border-[var(--navy)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--ink-muted)]">
                        Published {new Date(b.publishedAt).toLocaleDateString()}
                      </span>
                      <h3 className="font-display font-bold text-base text-[var(--ink)] mt-0.5">{b.title}</h3>
                    </div>
                    <Badge variant={b.isActive ? 'green' : 'gray'}>
                      {b.isActive ? 'Live' : 'Archived'}
                    </Badge>
                  </div>

                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">{b.message}</p>

                  <div className="pt-2 flex justify-end border-t border-gray-100">
                    <Button variant={b.isActive ? 'danger' : 'secondary'} size="sm" onClick={() => toggleBroadcast(b.id)}>
                      {b.isActive ? 'Deactivate Banner' : 'Publish Banner'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-slate-500 space-y-3">
              <Megaphone size={36} className="mx-auto text-slate-400" />
              <p className="font-display font-bold text-slate-800 text-sm">No Broadcast Banners Published</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Create New Broadcast" above to publish live announcement banners to all partner dashboards.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Add Admin Staff Member">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Full Name</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Email Address</label>
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="ananya.s@primescore.in"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Login Password</label>
              <input
                type="text"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Staff@2026"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Assigned Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="operations_admin">Operations Admin</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="support_agent">Support Agent</option>
                <option value="custom_staff">Custom Staff Access</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Department</label>
              <input
                type="text"
                value={staffDept}
                onChange={(e) => setStaffDept(e.target.value)}
                placeholder="KYC Verification Team"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
          </div>

          {/* Plain English Page Permission Checkboxes */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              Allowed Pages Permission List
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {PERMISSION_PAGES.map((page) => {
                const checked = staffPages.includes(page.id);
                return (
                  <label
                    key={page.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      checked ? 'bg-white border-[#1B2A72] text-[#1B2A72] font-bold shadow-xs' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStaffPages([...staffPages, page.id]);
                        } else {
                          setStaffPages(staffPages.filter((p) => p !== page.id));
                        }
                      }}
                      className="rounded-xs accent-[#1B2A72]"
                    />
                    <span>{page.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStaff} disabled={!staffName.trim() || !staffEmail.trim()}>Add Staff Member</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Staff Member Permissions">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Full Name</label>
              <input
                type="text"
                value={editStaffName}
                onChange={(e) => setEditStaffName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Email Address</label>
              <input
                type="email"
                value={editStaffEmail}
                onChange={(e) => setEditStaffEmail(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Login Password</label>
              <input
                type="text"
                value={editStaffPassword}
                onChange={(e) => setEditStaffPassword(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Assigned Role</label>
              <select
                value={editStaffRole}
                onChange={(e) => setEditStaffRole(e.target.value as any)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="operations_admin">Operations Admin</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="support_agent">Support Agent</option>
                <option value="custom_staff">Custom Staff Access</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Department</label>
              <input
                type="text"
                value={editStaffDept}
                onChange={(e) => setEditStaffDept(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
          </div>

          {/* Plain English Page Permission Checkboxes for Edit */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              Allowed Pages Permission List
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {PERMISSION_PAGES.map((page) => {
                const checked = editStaffPages.includes(page.id);
                return (
                  <label
                    key={page.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      checked ? 'bg-white border-[#1B2A72] text-[#1B2A72] font-bold shadow-xs' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditStaffPages([...editStaffPages, page.id]);
                        } else {
                          setEditStaffPages(editStaffPages.filter((p) => p !== page.id));
                        }
                      }}
                      className="rounded-xs accent-[#1B2A72]"
                    />
                    <span>{page.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEditStaff} disabled={!editStaffName.trim() || !editStaffEmail.trim()}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Staff Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Remove Staff Member">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to permanently remove staff account <strong className="text-slate-900 font-bold">{deleteStaffName}</strong>?
          </p>
          <p className="text-xs text-slate-500 bg-rose-50 p-3 rounded-lg border border-rose-200">
            ⚠️ This will revoke their access to Primescore Admin HQ immediately.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDeleteStaff}>Delete Staff Member</Button>
          </div>
        </div>
      </Modal>

      {/* Broadcast Modal */}
      <Modal isOpen={bcModalOpen} onClose={() => setBcModalOpen(false)} title="Create Announcement Banner">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={bcTitle}
              onChange={(e) => setBcTitle(e.target.value)}
              placeholder="e.g. Special Commission Bonus Active!"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-body focus:border-[#1B2A72]"
            />
          </div>

          {/* Visual Icon Grid (6 Options with SVG Icons) */}
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider block mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBcIcon('megaphone')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'megaphone'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Megaphone size={16} weight="fill" className={bcIcon === 'megaphone' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Megaphone</span>
              </button>

              <button
                type="button"
                onClick={() => setBcIcon('sparkle')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'sparkle'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkle size={16} weight="fill" className={bcIcon === 'sparkle' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Sparkle</span>
              </button>

              <button
                type="button"
                onClick={() => setBcIcon('gift')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'gift'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Gift size={16} weight="fill" className={bcIcon === 'gift' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Gift Box</span>
              </button>

              <button
                type="button"
                onClick={() => setBcIcon('warning')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'warning'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Warning size={16} weight="fill" className={bcIcon === 'warning' ? 'text-red-400' : 'text-slate-500'} />
                <span>Warning</span>
              </button>

              <button
                type="button"
                onClick={() => setBcIcon('check')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'check'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle size={16} weight="fill" className={bcIcon === 'check' ? 'text-emerald-400' : 'text-slate-500'} />
                <span>Success</span>
              </button>

              <button
                type="button"
                onClick={() => setBcIcon('bell')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcIcon === 'bell'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bell size={16} weight="fill" className={bcIcon === 'bell' ? 'text-sky-400' : 'text-slate-500'} />
                <span>Bell</span>
              </button>
            </div>
          </div>

          {/* Visual Title Color Selector */}
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider block mb-1.5">
              Title Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBcColor('yellow')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcColor === 'yellow'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                <span>Yellow</span>
              </button>

              <button
                type="button"
                onClick={() => setBcColor('red')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcColor === 'red'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-600 shrink-0" />
                <span>Red</span>
              </button>

              <button
                type="button"
                onClick={() => setBcColor('green')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcColor === 'green'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 shrink-0" />
                <span>Green</span>
              </button>

              <button
                type="button"
                onClick={() => setBcColor('white')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bcColor === 'white'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shrink-0" />
                <span>White</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Message</label>
            <textarea
              value={bcMessage}
              onChange={(e) => setBcMessage(e.target.value)}
              placeholder="Type announcement details visible to all partners..."
              className="w-full h-24 p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-body focus:border-[#1B2A72]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBcModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePublishBroadcast} disabled={!bcTitle.trim() || !bcMessage.trim()}>Publish Banner</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
