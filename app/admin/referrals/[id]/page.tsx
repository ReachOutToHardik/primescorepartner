'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import { ReferralStatus } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  ClipboardText, 
  User, 
  Phone, 
  EnvelopeSimple, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Wrench, 
  ChatText,
  Coins,
  ShieldCheck
} from '@phosphor-icons/react';

const ALL_STATUSES: { key: ReferralStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted (New Lead Received)' },
  { key: 'received', label: 'Received & Assigned to Operations Advisor' },
  { key: 'enrolled', label: 'Enrolled in Bureau Rectification Plan' },
  { key: 'in_progress', label: 'In Progress (Disputes Filed with Bureaus)' },
  { key: 'completed', label: 'Completed (+500 Reward Points Credited)' },
  { key: 'rejected', label: 'Rejected Case' },
];

export default function LeadCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { referrals, updateReferralStatus, partners } = useAdminStore();

  const refCase = referrals.find((r) => r.id === id);

  const [newStatus, setNewStatus] = useState<ReferralStatus>(refCase?.status || 'completed');
  const [statusNote, setStatusNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!refCase) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[var(--ink)]">Lead Case Not Found</h2>
        <p className="text-sm text-[var(--ink-muted)]">No referral lead matching ID "{id}" exists in the system database.</p>
        <Link href="/admin/referrals">
          <Button variant="primary">Back to Leads Directory</Button>
        </Link>
      </div>
    );
  }

  const referringPartner = partners.find((p) => p.id === refCase.partnerId);

  const handleSaveStatus = () => {
    updateReferralStatus(refCase.id, newStatus, statusNote);
    setStatusNote('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/referrals')}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--navy)]" /> Back to Leads Directory
        </button>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold animate-fade-in border border-emerald-200">
            <CheckCircle size={16} weight="fill" /> Case Pipeline Updated Successfully!
          </div>
        )}
      </div>

      {/* Main Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-[var(--navy-deep)] to-[var(--navy)] text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] text-[var(--amber)] uppercase font-mono font-bold tracking-widest">
              Lead Case Reference #{refCase.id}
            </span>
            <h1 className="text-2xl font-display font-bold mt-0.5">{refCase.customerName}</h1>
            <p className="text-xs text-gray-300 font-mono-num mt-1">
              Service: <span className="font-semibold text-white">{refCase.service}</span> • City: {refCase.city}
            </p>
          </div>

          <div className="flex items-center gap-5 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs font-mono-num text-xs">
            <div>
              <span className="text-[10px] uppercase font-sans text-gray-300">Pipeline Status</span>
              <div className="mt-0.5">
                <Badge variant={refCase.status === 'completed' ? 'green' : refCase.status === 'rejected' ? 'red' : 'blue'}>
                  {refCase.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-[10px] uppercase font-sans text-gray-300">Points Credited</span>
              <p className="font-bold text-emerald-400 text-base">+{refCase.pointsEarned} Pts</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--navy)]" /> Customer Lead Information
          </h3>
          <div className="space-y-3 text-xs font-mono-num">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Customer Name</span>
              <span className="font-bold text-[var(--ink)] font-sans">{refCase.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Phone Number</span>
              <span>{refCase.customerPhone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Email Address</span>
              <span className="font-sans text-[var(--navy)]">{refCase.customerEmail || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Requested Service</span>
              <span className="font-sans font-semibold text-[var(--navy)]">{refCase.service}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)] font-sans">City / Location</span>
              <span className="font-sans">{refCase.city}</span>
            </div>
          </div>
        </Card>

        {/* Referring Partner Linkage */}
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--navy)]" /> Referring Partner Info
          </h3>
          <div className="space-y-3 text-xs font-mono-num">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Partner Name</span>
              <span className="font-bold font-sans text-[var(--navy)]">
                {referringPartner?.name || 'Partner'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Partner Phone</span>
              <span className="font-mono text-slate-900 font-semibold">{referringPartner?.phone || '9876543210'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Partner Profession</span>
              <span className="font-sans">{referringPartner?.profession || 'Financial Agent'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Partner Team Code</span>
              <span className="font-mono font-bold">{referringPartner?.teamCode || 'TL-HAR-542'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)] font-sans">Initial Lead Notes</span>
              <span className="font-sans text-[var(--ink-2)]">{refCase.notes || 'None provided'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit & Status Trail Timeline */}
      <Card className="p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--navy)]" /> Audit & Case Progress History Trail
        </h3>
        <div className="space-y-3 bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border)]">
          {refCase.statusHistory.map((h, i) => (
            <div key={i} className="text-xs flex items-start gap-3 border-l-2 border-[var(--navy)] pl-4 py-1.5">
              <div>
                <div className="font-bold text-[var(--ink)] font-sans capitalize text-sm">{h.status.replace('_', ' ')}</div>
                <div className="text-[11px] text-[var(--ink-muted)] font-mono">{new Date(h.date).toLocaleString()}</div>
                {h.note && <div className="text-xs text-[var(--ink-2)] font-sans mt-1 bg-white p-2 rounded-lg border border-[var(--border)]">{h.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Full Page Case Update Form */}
      <Card className="p-6 space-y-4 border-l-4 border-[var(--navy)]">
        <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[var(--navy)]" /> Transition Pipeline & Add Fulfillment Note
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wide">
              Select Pipeline Stage
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ReferralStatus)}
              className="w-full p-3 border border-[var(--border-strong)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--navy)] outline-none bg-white mt-1 font-body"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wide">
              Fulfillment Note / Dispute Settlement Update
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Filed dispute with CIBIL and Experian. Removed late payment default mark."
              className="w-full h-32 p-3 border border-[var(--border-strong)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--navy)] mt-1 font-body"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="lg" onClick={handleSaveStatus}>
              Save & Update Pipeline Status
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
