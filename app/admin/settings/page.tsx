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
  ArrowRight
} from '@phosphor-icons/react';

export default function AdminSettingsPage() {
  const { staff, auditLogs, broadcasts, addStaffUser, toggleStaffStatus, createBroadcast, toggleBroadcast } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'staff' | 'logs' | 'broadcasts'>('staff');

  // Staff Modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'operations_admin' | 'compliance_officer' | 'support_agent'>('operations_admin');
  const [staffDept, setStaffDept] = useState('Lead Operations');

  // Broadcast Modal
  const [bcModalOpen, setBcModalOpen] = useState(false);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<'info' | 'warning' | 'promotion' | 'reward'>('promotion');
  const [bcIcon, setBcIcon] = useState<'megaphone' | 'sparkle' | 'gift' | 'warning' | 'check' | 'bell'>('megaphone');
  const [bcColor, setBcColor] = useState<'yellow' | 'red' | 'green' | 'blue'>('yellow');

  const handleAddStaff = () => {
    if (staffName.trim() && staffEmail.trim()) {
      addStaffUser({
        name: staffName,
        email: staffEmail,
        role: staffRole,
        department: staffDept,
        isActive: true,
      });
      setStaffName('');
      setStaffEmail('');
      setStaffModalOpen(false);
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
                      <td className="px-6 py-4 font-sans text-xs text-[var(--ink-2)]">{u.department}</td>
                      <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">
                        {new Date(u.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? 'green' : 'gray'}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={u.isActive ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => toggleStaffStatus(u.id)}
                          disabled={u.role === 'super_admin'}
                        >
                          {u.isActive ? 'Revoke Access' : 'Restore Access'}
                        </Button>
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
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Full Name</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Email Address</label>
            <input
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="ananya.s@primescore.in"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Assigned Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="operations_admin">Operations Admin</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="support_agent">Support Agent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Department</label>
              <input
                type="text"
                value={staffDept}
                onChange={(e) => setStaffDept(e.target.value)}
                placeholder="KYC Verification Team"
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStaff} disabled={!staffName.trim() || !staffEmail.trim()}>Add Staff</Button>
          </div>
        </div>
      </Modal>

      {/* Broadcast Modal */}
      <Modal isOpen={bcModalOpen} onClose={() => setBcModalOpen(false)} title="Publish Broadcast Announcement Banner">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Announcement Title</label>
            <input
              type="text"
              value={bcTitle}
              onChange={(e) => setBcTitle(e.target.value)}
              placeholder="e.g. Diwali Multiplier Offer!"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Icon Style</label>
              <select
                value={bcIcon}
                onChange={(e) => setBcIcon(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="megaphone">📢 Megaphone</option>
                <option value="sparkle">✨ Sparkle</option>
                <option value="gift">🎁 Gift Box</option>
                <option value="warning">⚠️ Alert Warning</option>
                <option value="check">✅ Success Check</option>
                <option value="bell">🔔 Bell Alert</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Title Text Color</label>
              <select
                value={bcColor}
                onChange={(e) => setBcColor(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="yellow">🟡 Gold / Yellow</option>
                <option value="red">🔴 Crimson Red</option>
                <option value="green">🟢 Emerald Green</option>
                <option value="blue">🔵 Sky Blue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Message Content</label>
            <textarea
              value={bcMessage}
              onChange={(e) => setBcMessage(e.target.value)}
              placeholder="Detailed announcement text visible to all active partners..."
              className="w-full h-24 p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-body"
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
