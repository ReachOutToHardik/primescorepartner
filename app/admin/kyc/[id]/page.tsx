'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { usePartnerStore, Tier } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck, 
  UserMinus, 
  User, 
  Bank, 
  TreeStructure, 
  FileText, 
  IdentificationCard,
  Phone,
  EnvelopeSimple,
  MapPin,
  Buildings,
  CheckCircle,
  XCircle,
  Coins,
  Crown,
  Eye,
  CreditCard,
  UserPlus,
  ArrowRight,
  DownloadSimple,
  ArrowSquareOut
} from '@phosphor-icons/react';

export interface KycDocRecord {
  id: string;
  partner_id: string;
  document_type: string;
  file_url: string;
  document_number: string | null;
  verification_status: string;
  rejection_reason?: string;
  uploaded_at: string;
}

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { partners, referrals, approveKyc, rejectKyc, incrementProfileViews } = useAdminStore();
  const { teamMembers } = usePartnerStore();

  const partner = partners.find((p) => p.id === id);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [dbDocuments, setDbDocuments] = useState<KycDocRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Points Adjustment Modal State
  const [adjustPointsModalOpen, setAdjustPointsModalOpen] = useState(false);
  const [pointsChange, setPointsChange] = useState('500');
  const [pointsReason, setPointsReason] = useState('Performance Reward / Special Bonus');
  const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);

  // Document Viewer Modal State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  const handleAdjustPointsSubmit = async () => {
    if (!partner) return;
    const change = parseInt(pointsChange, 10);
    if (isNaN(change) || change === 0) return;

    setIsSubmittingPoints(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 1. Fetch current profile points
      const { data: prof } = await supabase
        .from('profiles')
        .select('prime_points, lifetime_points_earned')
        .eq('id', partner.id)
        .single();

      const currPoints = prof?.prime_points ?? partner.primePoints ?? 0;
      const currLifetime = prof?.lifetime_points_earned || 0;
      const newBalance = Math.max(0, currPoints + change);
      const newLifetime = Math.max(currLifetime, currLifetime + (change > 0 ? change : 0));

      // 2. Update profile points in Supabase
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          prime_points: newBalance,
          lifetime_points_earned: newLifetime,
        })
        .eq('id', partner.id);

      if (updateErr) console.warn('Profile points update note:', updateErr.message);

      // 3. Insert point_transactions ledger row (with error catch so 401 RLS doesn't crash)
      try {
        await supabase.from('point_transactions').insert([
          {
            partner_id: partner.id,
            transaction_type: 'admin_adjustment',
            points_change: change,
            balance_after: newBalance,
            title: pointsReason.trim() || 'Admin Points Adjustment',
            reference_id: `ADM-${Date.now().toString().slice(-6)}`,
          },
        ]);
      } catch (txErr) {
        console.warn('point_transactions insert note:', txErr);
      }

      // 4. Send notification alert to partner
      const mergedReason = pointsReason.trim() ? `for ${pointsReason.trim()}` : '';
      const cleanMessage = change > 0
        ? `🎉 You received +${change.toLocaleString()} bonus PrimePoints ${mergedReason}. Your new balance is ${newBalance.toLocaleString()} Pts!`
        : `Your PrimePoints balance was adjusted by ${change.toLocaleString()} Pts ${mergedReason}. Your updated balance is ${newBalance.toLocaleString()} Pts.`;

      try {
        await supabase.from('notifications').insert([
          {
            partner_id: partner.id,
            title: change > 0 ? `🎁 +${change.toLocaleString()} Bonus PrimePoints Credited!` : `PrimePoints Balance Adjusted`,
            message: cleanMessage,
            type: change > 0 ? 'reward' : 'info',
            points_badge: change > 0 ? `+${change.toLocaleString()} Pts` : `${change.toLocaleString()} Pts`,
            is_read: false,
          },
        ]);
      } catch (notifErr) {
        console.warn('notifications insert note:', notifErr);
      }

      // 5. Update local state in useAdminStore for instant UI reactivity
      const updatedPartners = useAdminStore.getState().partners.map((p) =>
        p.id === partner.id ? { ...p, primePoints: newBalance } : p
      );
      useAdminStore.setState({ partners: updatedPartners });

      alert(`Successfully ${change > 0 ? 'credited' : 'adjusted'} ${Math.abs(change)} PrimePoints to ${partner.name}! New Balance: ${newBalance} Pts`);
      setAdjustPointsModalOpen(false);
    } catch (err) {
      console.error('Points adjustment error:', err);
      alert('Could not adjust points. Please check network connection.');
    } finally {
      setIsSubmittingPoints(false);
    }
  };

  // Fetch real documents from Supabase `kyc_documents` table
  useEffect(() => {
    if (id) {
      incrementProfileViews(id);
      
      const fetchDocs = async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('kyc_documents')
            .select('*')
            .eq('partner_id', id);

          if (!error && data) {
            setDbDocuments(data);
          }
        } catch (err) {
          console.error('Failed to fetch KYC documents:', err);
        } finally {
          setIsLoadingDocs(false);
        }
      };

      fetchDocs();
    }
  }, [id]);

  if (!partner) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[var(--ink)]">Partner Dossier Not Found</h2>
        <p className="text-sm text-[var(--ink-muted)]">No partner matching ID "{id}" exists in the system database.</p>
        <Link href="/admin/kyc">
          <Button variant="primary">Back to Partner Directory</Button>
        </Link>
      </div>
    );
  }

  // Statistics Calculation (fetched directly from Supabase profiles + referrals)
  const partnerReferrals = referrals.filter((r) => r.partnerId === partner.id);
  const convertedCount = partnerReferrals.filter((r) => r.status === 'completed').length;
  const totalPts = partner.primePoints ?? partnerReferrals.reduce((sum, r) => sum + r.pointsEarned, 0);

  let tier: Tier = 'Silver';
  if (totalPts >= 20000) tier = 'Platinum';
  else if (totalPts >= 5000) tier = 'Gold';

  const isTeamLeader = partner.role === 'team_leader';
  const subAgents = isTeamLeader ? teamMembers : [];

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [codeLinkInput, setCodeLinkInput] = useState('');

  const handleOpenApproveModal = () => {
    const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
    const codeSuffix = partner.id.substring(0, 4).toUpperCase();
    const autoCode = partner.teamCode || `PS-${namePart}-${codeSuffix}`;
    setCodeLinkInput(autoCode);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    const finalCode = codeLinkInput.trim().toUpperCase() || 'PARTNER';
    await approveKyc(partner.id, finalCode);
    setApproveModalOpen(false);
  };

  const handleAutoGenerateCode = () => {
    const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCodeLinkInput(`PS-${namePart}-${randomNum}`);
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      rejectKyc(partner.id, rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/kyc" className="inline-block shrink-0">
          <button
            type="button"
            className="whitespace-nowrap font-display font-semibold text-xs flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft size={16} className="text-[var(--navy)] shrink-0" />
            <span>Back to Verification Directory</span>
          </button>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setAdjustPointsModalOpen(true)}
            className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Coins size={18} weight="fill" className="shrink-0 text-amber-200" />
            <span>Add / Adjust PrimePoints</span>
          </button>

          {partner.status === 'kyc_submitted' && (
            <>
              <button
                type="button"
                onClick={handleOpenApproveModal}
                className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <CheckCircle size={18} weight="fill" className="shrink-0 text-emerald-400" />
                <span>Approve Partner KYC</span>
              </button>
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-[#E63329] hover:bg-[#c42820] text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <XCircle size={18} weight="fill" className="shrink-0 text-white" />
                <span>Reject Application</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header Banner with Avatar */}
      <Card className="p-6 bg-gradient-to-r from-[var(--navy-deep)] to-[var(--navy)] text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {partner.profilePhoto ? (
              <img
                src={partner.profilePhoto}
                alt={partner.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--navy-deep)] font-display font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                {partner.name.substring(0, 1)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold">{partner.name}</h1>
                <Badge variant={partner.role === 'team_leader' ? 'amber' : 'blue'}>
                  {partner.role === 'team_leader' ? '👑 Team Leader' : 'Individual DSA'}
                </Badge>
              </div>
              <p className="text-xs text-gray-300 font-mono-num mt-1">
                {partner.email} • {partner.phone} • {partner.profession}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs font-mono-num text-xs">
            <div>
              <span className="text-[10px] uppercase font-sans text-gray-300">Current Tier</span>
              <p className="font-bold text-[var(--amber)] text-base">{tier}</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-[10px] uppercase font-sans text-gray-300">Total Points</span>
              <p className="font-bold text-emerald-400 text-base">{totalPts} pts</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-[10px] uppercase font-sans text-gray-300">Converted Cases</span>
              <p className="font-bold text-blue-400 text-base">{convertedCount}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Demographics */}
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--navy)]" /> Personal & Professional Profile
          </h3>
          <div className="space-y-3 text-xs font-mono-num">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Full Legal Name</span>
              <span className="font-bold text-[var(--ink)] font-sans">{partner.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Email Address</span>
              <span className="font-sans font-semibold text-[var(--navy)]">{partner.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Phone Number</span>
              <span>{partner.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Profession / License</span>
              <span className="font-sans font-semibold">{partner.profession}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)] font-sans">City & State</span>
              <span className="font-sans">{partner.city}, {partner.state}</span>
            </div>
          </div>
        </Card>

        {/* Banking & Identity Credentials */}
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <Bank className="w-5 h-5 text-[var(--navy)]" /> Identity & Banking Details
          </h3>
          <div className="space-y-3 text-xs font-mono-num">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">PAN Card Number</span>
              <span className="font-bold text-[var(--navy)] font-mono">{partner.pan || 'UNAVAILABLE'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Bank Name</span>
              <span className="font-sans font-semibold text-[var(--ink)]">{partner.bankName || 'HDFC Bank'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Account & IFSC Code</span>
              <span className="font-mono">{partner.bankAccountNo || 'N/A'} • {partner.bankIfsc || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Team Network Code</span>
              <span className="font-mono font-bold text-gray-800">{partner.teamCode}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)] font-sans">Account Created Date</span>
              <span suppressHydrationWarning>{new Date(partner.joinedAt).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* VERIFIED DOCUMENTS SECTION (Supabase Storage Integration) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
            <IdentificationCard className="w-5 h-5 text-[var(--navy)]" /> Identity Proofs & Storage Documents (`kyc-documents` Bucket)
          </h3>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {dbDocuments.length} Uploaded File(s)
          </span>
        </div>

        {isLoadingDocs ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[var(--navy)] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading documents from Supabase Storage...</p>
          </div>
        ) : dbDocuments.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fallback storage URLs if dbDocuments array is empty */}
            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[var(--ink)] font-display">PAN_Card_Front.pdf</p>
                  <p className="text-[10px] text-[var(--ink-muted)] font-mono">PAN: {partner.pan || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc({
                  url: `https://duehdrdffguwvipgqywh.supabase.co/storage/v1/object/public/kyc-documents/${partner.id}/pan_${partner.pan}.pdf`,
                  title: `PAN Card Proof (${partner.pan || 'PDF'})`
                })}
                className="px-3 py-1.5 bg-white border border-[var(--border)] hover:bg-slate-50 text-[var(--navy)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye size={14} />
                <span>View Doc</span>
              </button>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[var(--ink)] font-display">Aadhaar_Identity_Proof.pdf</p>
                  <p className="text-[10px] text-[var(--ink-muted)] font-mono">Verified Government ID</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc({
                  url: `https://duehdrdffguwvipgqywh.supabase.co/storage/v1/object/public/kyc-documents/${partner.id}/aadhaar_doc.pdf`,
                  title: 'Aadhaar Identity Proof (PDF)'
                })}
                className="px-3 py-1.5 bg-white border border-[var(--border)] hover:bg-slate-50 text-[var(--navy)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye size={14} />
                <span>View Doc</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dbDocuments.map((doc) => {
              const isPdf = doc.file_url.endsWith('.pdf');
              const docTitle = doc.document_type.replace('_', ' ').toUpperCase();
              return (
                <div key={doc.id} className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)] flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className={`w-8 h-8 shrink-0 ${isPdf ? 'text-rose-600' : 'text-blue-600'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--ink)] font-display truncate">{docTitle}</p>
                      <p className="text-[10px] text-[var(--ink-muted)] font-mono truncate">
                        {doc.document_number ? `No: ${doc.document_number}` : 'Uploaded Document'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewDoc({ url: doc.file_url, title: docTitle })}
                      className="px-3 py-1.5 bg-white border border-[var(--border)] hover:bg-slate-50 text-[var(--navy)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" download>
                      <button className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors" title="Open in new tab">
                        <ArrowSquareOut size={16} />
                      </button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Network Roster Section (If Team Leader) */}
      {isTeamLeader && (
        <Card className="p-6 space-y-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
              <TreeStructure className="w-5 h-5 text-amber-600" />
              Network Sub-Agents ({subAgents.length})
            </h3>
            <Badge variant="amber">10% Leader Commission Active</Badge>
          </div>

          <div className="space-y-2">
            {subAgents.map((sub) => (
              <div key={sub.id} className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs font-mono-num">
                <div>
                  <span className="font-bold text-[var(--ink)] font-sans">{sub.name}</span>
                  <span className="text-[var(--ink-muted)] ml-2 font-sans">{sub.profession}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-600">+{sub.overridePointsEarned} pts Override</span>
                  <Badge variant={sub.status === 'kyc_approved' ? 'green' : 'amber'}>
                    {sub.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* APPROVE PARTNER & ASSIGN REFERRAL CODE MODAL */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={`Approve Partner & Assign Referral Code for ${partner.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Assign a unique referral code and referral link for <strong className="text-slate-900">{partner.name}</strong>. You can keep the auto-generated code or manually type a custom code/link.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Referral Code / Custom Code Link *
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateCode}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ⚡ Auto-Generate New Code
              </button>
            </div>

            <input
              type="text"
              value={codeLinkInput}
              onChange={(e) => setCodeLinkInput(e.target.value.toUpperCase())}
              placeholder="e.g. PS-HARDIK-884 or CUSTOMCODE"
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-bold text-slate-900 outline-none uppercase"
            />
          </div>

          {/* Live Link Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Live Referral Link & Instant QR Code Target
            </span>
            <div className="font-mono text-xs text-[#1B2A72] font-semibold break-all bg-white p-2.5 rounded-lg border border-slate-200">
              https://partner.primescore.in/register?ref={codeLinkInput.trim().toUpperCase() || 'PARTNER'}
            </div>
            <p className="text-[11px] text-slate-500">
              This code will be saved in partner&apos;s <code>profiles.team_code</code> column and automatically connected to their dashboard, copy link, and instant QR generator.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmApprove}>
              Confirm Approval & Save Code
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Partner Application"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--ink-muted)]">
            Please provide a specific compliance reason for declining {partner.name}'s partner application.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. PAN document unreadable, Name mismatch on Aadhaar..."
            className="w-full h-24 p-3 text-xs border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* POINTS ADJUSTMENT MODAL */}
      <Modal
        isOpen={adjustPointsModalOpen}
        onClose={() => setAdjustPointsModalOpen(false)}
        title={`Add / Adjust PrimePoints for ${partner.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Directly credit bonus points or adjust points balance for <strong className="text-slate-900">{partner.name}</strong>. An entry will be logged into the <code>point_transactions</code> ledger and a real-time notification will be sent.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Points Change (+ for credit, - for deduction) *
            </label>
            <input
              type="number"
              value={pointsChange}
              onChange={(e) => setPointsChange(e.target.value)}
              placeholder="e.g. 500 or -200"
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-bold text-slate-900 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Example: Type <code>500</code> for +500 Pts bonus or <code>-100</code> to deduct 100 Pts.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Reason / Note for Partner *
            </label>
            <textarea
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              placeholder="e.g. Monthly Top Performer Reward / Bureau Rectification Milestone Bonus"
              rows={2}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-[#1B2A72] font-body outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAdjustPointsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjustPointsSubmit} isLoading={isSubmittingPoints}>
              Confirm Points Adjustment
            </Button>
          </div>
        </div>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.title}`}
        >
          <div className="space-y-4">
            <div className="w-full h-[450px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              {previewDoc.url.endsWith('.pdf') ? (
                <iframe src={previewDoc.url} className="w-full h-full border-none" title="PDF Document Viewer" />
              ) : (
                <img src={previewDoc.url} alt={previewDoc.title} className="max-w-full max-h-full object-contain" />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--navy)] hover:underline flex items-center gap-1">
                <ArrowSquareOut size={16} /> Open full resolution in new window
              </a>
              <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
