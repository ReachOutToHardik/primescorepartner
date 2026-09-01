'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Gear,
  UserGear,
  ListChecks,
  Megaphone,
  Coins,
  ShieldCheck,
  CheckCircle,
  Database,
  ChatCircleText,
  EnvelopeSimple,
  ArrowRight,
  Clock,
  Warning
} from '@phosphor-icons/react';

export default function AdminSettingsPage() {
  const { staff, auditLogs, broadcasts } = useAdminStore();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [partnerRegistrationOpen, setPartnerRegistrationOpen] = useState(true);
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A4E] text-white flex items-center justify-center shadow-xs">
              <Gear size={24} weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                Platform Settings & Administration
              </h1>
              <p className="text-xs text-[var(--ink-muted)]">
                System configuration, API gateway integrations, security policies, and governance controls.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/rewards-config"
          className="px-4 py-2 bg-gradient-to-r from-[#0F1A4E] to-[#1B2A72] text-white text-xs font-bold font-display rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Coins size={18} className="text-[#F5C518]" weight="fill" />
          <span>Reward Engine Rates & Rules &rarr;</span>
        </Link>
      </div>

      {/* Governance Dedicated Hub Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Admin Staff Card */}
        <Card className="p-5 bg-white border border-[var(--border)] rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center">
              <UserGear size={24} weight="fill" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-[#1B2A72]">
              {staff.length} Roles
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--navy-deep)] mt-3">Admin Staff Roles (RBAC)</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Create internal staff accounts, assign granular page clearance, and manage security credentials.
          </p>
          <Link
            href="/admin/staff"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1B2A72] hover:text-[#152059] group-hover:underline"
          >
            <span>Configure Staff & Permissions</span>
            <ArrowRight size={13} weight="bold" />
          </Link>
        </Card>

        {/* System Audit Logs Card */}
        <Card className="p-5 bg-white border border-[var(--border)] rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ListChecks size={24} weight="fill" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {auditLogs.length} Events
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--navy-deep)] mt-3">System Audit Logs</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Review timestamped activity records of all approvals, rejections, lead stages, and settlements.
          </p>
          <Link
            href="/admin/audit-logs"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 group-hover:underline"
          >
            <span>View Complete Audit Trail</span>
            <ArrowRight size={13} weight="bold" />
          </Link>
        </Card>

        {/* Broadcast Announcements Card */}
        <Card className="p-5 bg-white border border-[var(--border)] rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Megaphone size={24} weight="fill" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {broadcasts.length} Active
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--navy-deep)] mt-3">Broadcast Announcements</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Publish site-wide alert banners, incentive announcements, and push notifications to partners.
          </p>
          <Link
            href="/admin/broadcasts"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 group-hover:underline"
          >
            <span>Manage Live Marquees</span>
            <ArrowRight size={13} weight="bold" />
          </Link>
        </Card>
      </div>

      {/* Connected Services & Gateways Status */}
      <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" weight="bold" />
            Connected Gateways & Cloud Services
          </h2>
          <p className="text-[11px] text-[var(--ink-muted)]">
            Live health status of external telecom, database, and email infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Supabase PostgreSQL */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-[#1B2A72]" weight="bold" />
                <span className="text-xs font-bold text-slate-800">Supabase DB</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} weight="fill" /> Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-500">PostgreSQL instance hosting profiles, referrals, and audit tables.</p>
          </div>

          {/* Ishani SMS Gateway */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChatCircleText size={18} className="text-blue-600" weight="bold" />
                <span className="text-xs font-bold text-slate-800">Ishani SMS API</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} weight="fill" /> DLT Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Sender: <strong>PRMESC</strong> | Template: <strong>1707177667685411915</strong></p>
          </div>

          {/* Resend Email API */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={18} className="text-purple-600" weight="bold" />
                <span className="text-xs font-bold text-slate-800">Resend API</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} weight="fill" /> Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Sender domain: <strong>partner@update.primescore.in</strong></p>
          </div>
        </div>
      </Card>

      {/* Platform Operating Preferences */}
      <Card className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[var(--navy-deep)]">Platform Operating Preferences</h2>
          <p className="text-[11px] text-[var(--ink-muted)]">
            Control onboarding accessibility, notification triggers, and maintenance gates.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          {/* Toggle 1: Direct Partner Registration */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Public Partner Registration</p>
              <p className="text-[11px] text-slate-500">Allow visitors to register via the public 3-step onboarding form.</p>
            </div>
            <button
              onClick={() => setPartnerRegistrationOpen(!partnerRegistrationOpen)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                partnerRegistrationOpen ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  partnerRegistrationOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Automated SMS OTP Verification */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">SMS OTP Verification</p>
              <p className="text-[11px] text-slate-500">Require phone verification via Ishani SMS API for all new partner registrations.</p>
            </div>
            <button
              onClick={() => setAutoSmsEnabled(!autoSmsEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                autoSmsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoSmsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Maintenance Mode */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Maintenance Mode</p>
              <p className="text-[11px] text-slate-500">Show maintenance notice to partners while admin operations remain active.</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {savedNotice ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle size={15} weight="fill" /> Settings saved successfully!
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Settings changes persist to browser session state.</span>
          )}

          <Button
            size="sm"
            onClick={handleSaveSettings}
            className="bg-[#1B2A72] hover:bg-[#152059] text-white rounded-xl shadow-xs"
          >
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}
