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
  ShieldCheck,
  Trash,
  Warning
} from '@phosphor-icons/react';
import { Modal } from '@/components/ui/Modal';

const ALL_STATUSES: { key: ReferralStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted (New Lead Received)' },
  { key: 'received', label: 'Received & Assigned to Operations Advisor' },
  { key: 'enrolled', label: 'Enrolled in Bureau Rectification Plan' },
  { key: 'in_progress', label: 'In Progress (Disputes Filed with Bureaus)' },
  { key: 'completed', label: 'Completed (+500 Reward Points Credited)' },
  { key: 'rejected', label: 'Rejected Case' },
];

const PIPELINE_STAGES: {
  key: ReferralStatus;
  stepNum: number;
  title: string;
  desc: string;
  pointsText?: string;
}[] = [
  {
    key: 'submitted',
    stepNum: 1,
    title: '1. Lead Submitted',
    desc: 'Client referral lead registered into Primescore system.',
  },
  {
    key: 'received',
    stepNum: 2,
    title: '2. Received & Assigned',
    desc: 'Assigned to senior credit rectification advisor.',
  },
  {
    key: 'enrolled',
    stepNum: 3,
    title: '3. Client Enrolled',
    desc: 'Customer onboarded & credit repair package selected.',
  },
  {
    key: 'in_progress',
    stepNum: 4,
    title: '4. Disputes In Progress',
    desc: 'Official disputes filed across credit bureaus (CIBIL, Experian, etc.).',
  },
  {
    key: 'completed',
    stepNum: 5,
    title: '5. Case Completed & Rewarded',
    desc: 'Rectification complete & partner awarded +500 PrimePoints.',
    pointsText: '+500 Pts Credited',
  },
];

export default function LeadCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { referrals, updateReferralStatus, deleteReferral, partners } = useAdminStore();

  const refCase = referrals.find((r) => r.id === id);

  const [newStatus, setNewStatus] = useState<ReferralStatus>(refCase?.status || 'completed');
  const [statusNote, setStatusNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingStepKey, setEditingStepKey] = useState<string | null>(null);
  const [stepCustomNote, setStepCustomNote] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      {/* Case Activity History Log (Only rendered if logs exist) */}
      {refCase.statusHistory && refCase.statusHistory.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--navy)]" /> Activity & Update Log
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
      )}

      {/* Lead Progress Tracker */}
      <Card className="p-6 space-y-6 border-l-4 border-[#1B2A72]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[var(--navy)]" /> Lead Progress Tracker
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Update lead status step-by-step, move back if needed, add notes, or cancel lead.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {refCase.status === 'completed' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
              >
                Delete Lead / Case 🗑
              </Button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset pipeline flow to Step 1 (Submitted)?')) {
                      updateReferralStatus(refCase.id, 'submitted', 'Reset case flow to Step 1.');
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 4000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  ↺ Reset to Step 1
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to mark this case as Rejected/Canceled?')) {
                      updateReferralStatus(refCase.id, 'rejected', statusNote || 'Case rejected by operations team.');
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 4000);
                    }
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
                >
                  Reject / Remove Case ✖
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 5-Stage Interactive Step Flow */}
        <div className="space-y-4">
          {PIPELINE_STAGES.map((stg, index) => {
            const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === refCase.status);
            const isCaseCompleted = refCase.status === 'completed';
            const isCurrent = refCase.status === stg.key;
            const isPassed = isCaseCompleted || (currentStageIndex >= 0 && index < currentStageIndex);
            const nextStageKey = PIPELINE_STAGES[index + 1]?.key || 'completed';
            const prevStageKey = PIPELINE_STAGES[index - 1]?.key || 'submitted';

            const stepHistory = refCase.statusHistory.find((h) => h.status === stg.key);

            return (
              <div
                key={stg.key}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-100 shadow-2xs'
                    : isPassed
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isCurrent
                          ? 'bg-[#1B2A72] text-white shadow-sm ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? <CheckCircle size={20} weight="bold" /> : stg.stepNum}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-sm text-slate-900">{stg.title}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            Current Active Step
                          </span>
                        )}
                        {isPassed && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                            ✓ Done
                          </span>
                        )}
                        {stg.pointsText && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {stg.pointsText}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stg.desc}</p>
                      
                      {stepHistory?.note && (
                        <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-700 font-sans">
                          💡 <strong>Step Note:</strong> {stepHistory.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons & Undo / Revert Controls (Hidden if Case is Fully Completed) */}
                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-center shrink-0">
                    {isCaseCompleted ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle size={14} weight="fill" /> Completed
                      </span>
                    ) : (
                      <>
                        {/* Current Step Controls */}
                        {isCurrent && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                updateReferralStatus(refCase.id, nextStageKey, statusNote || `Completed ${stg.title}`);
                                setStatusNote('');
                                setSavedSuccess(true);
                                setTimeout(() => setSavedSuccess(false), 4000);
                              }}
                              className="text-xs font-bold cursor-pointer"
                            >
                              Mark Step Done ✓
                            </Button>

                            {index > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateReferralStatus(refCase.id, prevStageKey, `Reverted back to Step ${index}`);
                                  setSavedSuccess(true);
                                  setTimeout(() => setSavedSuccess(false), 4000);
                                }}
                                className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
                                title="Undo step and go back to previous stage"
                              >
                                ↩ Undo Step
                              </Button>
                            )}
                          </>
                        )}

                        {/* Passed / Completed Step Controls */}
                        {isPassed && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle size={14} weight="fill" /> Completed
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Move case status back to Step ${stg.stepNum} (${stg.title})?`)) {
                                  updateReferralStatus(refCase.id, stg.key, `Reverted back to ${stg.title}`);
                                  setSavedSuccess(true);
                                  setTimeout(() => setSavedSuccess(false), 4000);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                              title="Revert pipeline status back to this step"
                            >
                              ↩ Move Back to Here
                            </button>
                          </div>
                        )}

                        {/* Future Step Controls */}
                        {!isPassed && !isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateReferralStatus(refCase.id, stg.key, statusNote || `Jumped to ${stg.title}`);
                              setStatusNote('');
                              setSavedSuccess(true);
                              setTimeout(() => setSavedSuccess(false), 4000);
                            }}
                            className="text-xs font-bold cursor-pointer"
                          >
                            Jump to Step {stg.stepNum} ➔
                          </Button>
                        )}

                        {/* Add/Edit Note Toggle for Step */}
                        <button
                          type="button"
                          onClick={() => setEditingStepKey(editingStepKey === stg.key ? null : stg.key)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                          title="Add note to this step"
                        >
                          ✏ Note
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Step Note Editor */}
                {editingStepKey === stg.key && !isCaseCompleted && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-2 animate-fade-in">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Add Custom Note for Step {stg.stepNum} ({stg.title})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stepCustomNote}
                        onChange={(e) => setStepCustomNote(e.target.value)}
                        placeholder={`e.g. Documentation verified for ${stg.title}`}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1B2A72]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (stepCustomNote.trim()) {
                            updateReferralStatus(refCase.id, stg.key, stepCustomNote.trim());
                            setStepCustomNote('');
                            setEditingStepKey(null);
                            setSavedSuccess(true);
                            setTimeout(() => setSavedSuccess(false), 4000);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#1B2A72] text-white text-xs font-bold rounded-lg hover:bg-[#0F1A4E] transition-colors cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Note Log Form (Hidden when completed) */}
        {refCase.status !== 'completed' && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Add Note / Remark
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Filed dispute with CIBIL and Experian. Package selected and client onboarded."
              rows={2}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1B2A72] bg-slate-50 focus:bg-white transition-all font-body"
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  updateReferralStatus(refCase.id, refCase.status, statusNote || 'Audit note updated');
                  setStatusNote('');
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 4000);
                }}
              >
                Add General Audit Note
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Lead Modal with Points Reversal Choice */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Referral Lead"
        maxWidth="md"
      >
        <div className="space-y-5 py-2">
          <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs">
            <Warning size={24} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Delete Lead & Choice on Points</h4>
              <p className="mt-1 leading-relaxed text-amber-800">
                You are about to delete lead <strong>&quot;{refCase.customerName}&quot;</strong>. Since this case was completed, <strong>{refCase.pointsEarned || 500} PrimePoints</strong> were credited to referring partner <strong>{referringPartner?.name || 'Partner'}</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                await deleteReferral(refCase.id, true);
                setShowDeleteModal(false);
                router.push('/admin/referrals');
              }}
              className="w-full p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-left transition-all group cursor-pointer"
            >
              <div className="font-bold text-red-900 text-sm flex items-center justify-between">
                <span>Option 1: Reverse Points (-{refCase.pointsEarned || 500} Pts) & Delete Lead</span>
                <span className="text-xs bg-red-200 px-2 py-0.5 rounded-md text-red-900">Recommended</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Deducts {refCase.pointsEarned || 500} points from partner&apos;s account balance, records a reversal in point_transactions table, and deletes the lead.
              </p>
            </button>

            <button
              type="button"
              onClick={async () => {
                await deleteReferral(refCase.id, false);
                setShowDeleteModal(false);
                router.push('/admin/referrals');
              }}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group cursor-pointer"
            >
              <div className="font-bold text-slate-900 text-sm">
                Option 2: Keep Points (Delete Lead Only)
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Deletes the lead record from database but leaves partner&apos;s earned reward points intact.
              </p>
            </button>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
