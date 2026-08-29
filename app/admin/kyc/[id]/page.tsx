'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { usePartnerStore, Tier } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ResetPartnerPasswordModal } from '@/components/admin/ResetPartnerPasswordModal';
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
  ArrowSquareOut,
  Key,
  Pencil,
  Trash
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

import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { TransferTeamModal } from '@/components/admin/TransferTeamModal';

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { partners, referrals, approveKyc, rejectKyc, deletePartner, incrementProfileViews } = useAdminStore();
  const { teamMembers } = usePartnerStore();

  const partner = partners.find((p) => p.id === id);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
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
  const subAgents = isTeamLeader
    ? partners.filter((p) => p.id !== partner.id && (p.referredByLeaderId === partner.id || (partner.teamCode && p.referredByLeaderId === partner.teamCode)))
    : [];

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [codeLinkInput, setCodeLinkInput] = useState('');
  const [userRefCodeModalInput, setUserRefCodeModalInput] = useState('');

  // Inline Code Editing States
  const [isEditingUserCode, setIsEditingUserCode] = useState(false);
  const [userCodeInput, setUserCodeInput] = useState((partner as any)?.userReferralCode || 'PSMKMVLN');

  const [isEditingTeamCode, setIsEditingTeamCode] = useState(false);
  const [teamCodeInput, setTeamCodeInput] = useState(partner?.teamCode || '');

  const handleOpenApproveModal = () => {
    const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
    const codeSuffix = partner.id.substring(0, 4).toUpperCase();
    const autoCode = partner.teamCode || `IND-${namePart}-${codeSuffix}`;
    setCodeLinkInput(autoCode);
    setUserRefCodeModalInput((partner as any)?.userReferralCode || 'PSMKMVLN');
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    const finalTeamCode = codeLinkInput.trim().toUpperCase() || 'IND-HAR-509';
    const finalUserRefCode = userRefCodeModalInput.trim().toUpperCase() || 'PSMKMVLN';
    await approveKyc(partner.id, finalTeamCode, finalUserRefCode);
    setApproveModalOpen(false);
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      rejectKyc(partner.id, rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
    }
  };

  const handleMoveToPending = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('profiles').update({ status: 'kyc_submitted' }).eq('id', partner.id);
      const updated = useAdminStore.getState().partners.map(p => p.id === partner.id ? { ...p, status: 'kyc_submitted' as any } : p);
      useAdminStore.setState({ partners: updated });
      alert(`Moved partner "${partner.name}" back to Pending Review!`);
    } catch (err) {
      console.error('Move to pending error:', err);
    }
  };

  const handleSaveUserCode = async () => {
    const code = userCodeInput.trim().toUpperCase() || 'PSMKMVLN';
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('profiles').update({ user_referral_code: code }).eq('id', partner.id);
      const updated = useAdminStore.getState().partners.map(p => p.id === partner.id ? { ...p, userReferralCode: code } : p);
      useAdminStore.setState({ partners: updated });
      setIsEditingUserCode(false);
      alert(`Updated User Referral Code to ${code}!`);
    } catch (err) {
      console.error('User code save error:', err);
    }
  };

  const handleSaveTeamCode = async () => {
    const code = teamCodeInput.trim().toUpperCase() || partner.teamCode;
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('profiles').update({ team_code: code }).eq('id', partner.id);
      const updated = useAdminStore.getState().partners.map(p => p.id === partner.id ? { ...p, teamCode: code } : p);
      useAdminStore.setState({ partners: updated });
      setIsEditingTeamCode(false);
      alert(`Updated Team Network Code to ${code}!`);
    } catch (err) {
      console.error('Team code save error:', err);
    }
  };

  const handlePromoteToTeamLeader = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
      const codeSuffix = partner.id.substring(0, 4).toUpperCase();
      const newTeamCode = partner.teamCode || `TL-${namePart}-${codeSuffix}`;

      await supabase
        .from('profiles')
        .update({ role: 'team_leader', team_code: newTeamCode })
        .eq('id', partner.id);

      const updated = useAdminStore.getState().partners.map((p) =>
        p.id === partner.id ? { ...p, role: 'team_leader' as any, teamCode: newTeamCode } : p
      );
      useAdminStore.setState({ partners: updated });
      alert(`Successfully promoted "${partner.name}" to Team Leader! Team Code: ${newTeamCode}`);
    } catch (err) {
      console.error('Promotion error:', err);
      alert('Could not promote partner to Team Leader.');
    }
  };

  const handleDemoteToIndividual = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase
        .from('profiles')
        .update({ role: 'individual' })
        .eq('id', partner.id);

      const updated = useAdminStore.getState().partners.map((p) =>
        p.id === partner.id ? { ...p, role: 'individual' as any } : p
      );
      useAdminStore.setState({ partners: updated });
      alert(`Demoted "${partner.name}" to Individual DSA.`);
    } catch (err) {
      console.error('Demotion error:', err);
      alert('Could not demote partner.');
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
            onClick={() => setResetPassModalOpen(true)}
            className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Key size={18} weight="fill" className="shrink-0 text-amber-400" />
            <span>Reset Password</span>
          </button>

          {partner.status !== 'kyc_rejected' && (
            <button
              type="button"
              onClick={() => setAdjustPointsModalOpen(true)}
              className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <Coins size={18} weight="fill" className="shrink-0 text-amber-200" />
              <span>Add / Adjust PrimePoints</span>
            </button>
          )}

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

          {partner.status === 'kyc_rejected' && (
            <>
              <button
                type="button"
                onClick={handleOpenApproveModal}
                className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <CheckCircle size={18} weight="fill" className="shrink-0 text-white" />
                <span>Approve Partner</span>
              </button>
              <button
                type="button"
                onClick={handleMoveToPending}
                className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <UserCheck size={18} weight="bold" className="shrink-0 text-white" />
                <span>Move to Pending Review</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="whitespace-nowrap font-display font-bold text-xs flex items-center gap-2 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-all cursor-pointer shrink-0"
            title="Delete Partner Account"
          >
            <Trash size={16} weight="bold" className="shrink-0 text-red-600" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* REJECTION REASON BANNER (Rendered only if partner.status === 'kyc_rejected') */}
      {partner.status === 'kyc_rejected' && (
        <Card className="p-5 bg-red-50 border-2 border-red-200 text-red-950 space-y-3 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <XCircle size={28} className="text-red-600 shrink-0 mt-0.5" weight="fill" />
              <div>
                <h3 className="font-display font-bold text-base text-red-900">
                  Partner Application Rejected
                </h3>
                <p className="text-xs text-red-800 mt-1 font-medium leading-relaxed">
                  <strong>Reason:</strong> {partner.rejectionReason || 'Identity details or verification credentials did not meet system criteria.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenApproveModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Approve Now
              </button>
              <button
                type="button"
                onClick={handleMoveToPending}
                className="px-3.5 py-2 bg-white border border-red-300 text-red-800 hover:bg-red-100 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Move to Pending Review
              </button>
            </div>
          </div>
        </Card>
      )}

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
              <span className="text-[var(--ink-muted)] font-sans">Aadhaar Card Number</span>
              <span className="font-mono font-bold text-slate-900">
                {partner.aadhaar || (partner as any).aadhaar || 'XXXX XXXX XXXX'}
              </span>
            </div>
            {/* User Referral Code (Client Link Code) */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans flex items-center gap-1">
                <span>User Referral Code (Client Link)</span>
              </span>
              {isEditingUserCode ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={userCodeInput}
                    onChange={(e) => setUserCodeInput(e.target.value.toUpperCase())}
                    className="px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded bg-white text-[#1B2A72] uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUserCode}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUserCode(false)}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#1B2A72] text-sm">
                    {(partner as any).userReferralCode || 'PSMKMVLN'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingUserCode(true)}
                    className="p-1 text-slate-400 hover:text-[#1B2A72] transition-colors cursor-pointer"
                    title="Edit User Referral Code"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Team Network Code */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Team Network Code</span>
              {isEditingTeamCode ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={teamCodeInput}
                    onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
                    className="px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded bg-white text-slate-900 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTeamCode}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTeamCode(false)}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-gray-800">{partner.teamCode || 'IND-HAR-509'}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingTeamCode(true)}
                    className="p-1 text-slate-400 hover:text-gray-800 transition-colors cursor-pointer"
                    title="Edit Team Code"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Bank Name</span>
              <span className="font-sans font-semibold text-[var(--ink)]">{partner.bankName || 'HDFC Bank'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-[var(--ink-muted)] font-sans">Account & IFSC Code</span>
              <span className="font-mono">{partner.bankAccountNo || 'N/A'} • {partner.bankIfsc || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)] font-sans">Account Created Date</span>
              <span suppressHydrationWarning>{new Date(partner.joinedAt).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Team & Role Management Card */}
      {(() => {
        const assignedLeader = partners.find(
          (p) => p.id === partner.referredByLeaderId || (p.teamCode && p.teamCode === partner.referredByLeaderId)
        );
        const currentLeaderName = partner.referredByLeaderName || assignedLeader?.name;

        return (
          <Card className="p-6 space-y-5 border border-slate-200/80 shadow-xs bg-white rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Team &amp; Role Management
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage account classification, team leader privileges, and network assignments.
                </p>
              </div>

              <Badge variant={partner.role === 'team_leader' ? 'amber' : 'blue'}>
                {partner.role === 'team_leader' ? 'Team Leader' : 'Individual DSA'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Account Role & Promotion */}
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Classification
                  </span>
                  <div className="font-display font-bold text-sm text-slate-900">
                    {partner.role === 'team_leader' ? 'Team Leader Account' : 'Individual DSA Partner'}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                    {partner.role === 'team_leader'
                      ? 'Authorized to recruit sub-agents under their network and earn 10% override points.'
                      : 'Direct referral partner. Can be promoted to Team Leader at any time.'}
                  </p>
                </div>

                <div className="pt-2">
                  {partner.role === 'individual' ? (
                    <button
                      type="button"
                      onClick={handlePromoteToTeamLeader}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                    >
                      Promote to Team Leader
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDemoteToIndividual}
                      className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                    >
                      Demote to Individual DSA
                    </button>
                  )}
                </div>
              </div>

              {/* Box 2: Assigned Team Network */}
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assigned Team Network
                  </span>
                  {currentLeaderName ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-8 h-8 rounded-full bg-[#1B2A72] text-white font-bold text-xs flex items-center justify-center font-display shrink-0 shadow-2xs">
                        {currentLeaderName.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900">
                          {currentLeaderName}
                        </div>
                        {assignedLeader?.teamCode && (
                          <div className="text-[11px] font-mono text-slate-500">
                            Code: {assignedLeader.teamCode}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-display font-bold text-sm text-slate-700 pt-1">
                        Standalone Partner
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                        Not currently assigned under any Team Leader network.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                  >
                    {currentLeaderName ? 'Transfer to Another Team Leader' : 'Assign to Team Leader'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        );
      })()}
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
                  <span className="font-bold text-emerald-600">+{sub.primePoints || 0} Pts Total</span>
                  <Badge variant={sub.status === 'kyc_approved' ? 'green' : 'amber'}>
                    {sub.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* REFERRALS & LEADS SUBMITTED BY PARTNER */}
      {(() => {
        const partnerReferrals = referrals.filter(
          (r) => r.partnerId === partner.id
        );

        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--navy-deep)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B2A72]" weight="bold" />
                  Client Referral Leads Submitted ({partnerReferrals.length})
                </h3>
                <p className="text-xs text-[var(--ink-muted)]">
                  Live database of client dispute and credit rectification referrals registered by {partner.name}.
                </p>
              </div>
              <Badge variant={partnerReferrals.length > 0 ? 'green' : 'gray'}>
                {partnerReferrals.length > 0 ? `${partnerReferrals.length} Cases Submitted` : 'No Cases Yet'}
              </Badge>
            </div>

            {partnerReferrals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2 bg-slate-50 rounded-xl border border-slate-200/80">
                <FileText size={32} className="mx-auto text-slate-300" />
                <p className="font-bold text-xs text-slate-700">No Referrals Registered Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When this partner submits client lead referrals through their dashboard, all lead cases will display here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-display">
                    <tr>
                      <th className="px-4 py-3 font-bold">Case Ref ID</th>
                      <th className="px-4 py-3 font-bold">Customer Name & Phone</th>
                      <th className="px-4 py-3 font-bold">Requested Service</th>
                      <th className="px-4 py-3 font-bold">Location</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-mono-num bg-white text-xs">
                    {partnerReferrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1B2A72]">{ref.id}</td>
                        <td className="px-4 py-3 font-sans font-bold text-slate-900">
                          <div>{ref.customerName}</div>
                          <div className="text-[11px] font-mono font-normal text-slate-500">{ref.customerPhone}</div>
                        </td>
                        <td className="px-4 py-3 font-sans font-semibold text-slate-700">{ref.service}</td>
                        <td className="px-4 py-3 font-sans text-slate-600">{ref.city}</td>
                        <td className="px-4 py-3">
                          <Badge variant={ref.status === 'completed' ? 'green' : ref.status === 'rejected' ? 'red' : 'blue'}>
                            {ref.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/referrals/${ref.id}`}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#1B2A72] font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Case</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })()}

      {/* APPROVE PARTNER MODAL */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={`Approve Partner: ${partner.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provide or auto-generate referral codes for <strong>{partner.name}</strong>.
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
                  setUserRefCodeModalInput(c);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                ⚡ Auto-Generate
              </button>
            </div>

            <input
              type="text"
              value={userRefCodeModalInput}
              onChange={(e) => setUserRefCodeModalInput(e.target.value.toUpperCase())}
              placeholder="e.g. PSMKMVLN"
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-bold text-slate-950 outline-none uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Client Referral Target: <strong className="text-[#1B2A72] font-mono">https://dashboard.primescore.in/ref/{userRefCodeModalInput.trim().toUpperCase() || 'PSMKMVLN'}</strong>
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
                  const namePart = (partner.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
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
            <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmApprove}>
              Approve Partner & Save Credentials
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
      {/* RESET PARTNER PASSWORD MODAL */}
      <ResetPartnerPasswordModal
        isOpen={resetPassModalOpen}
        onClose={() => setResetPassModalOpen(false)}
        partner={partner}
      />

      {/* DELETE PARTNER CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await deletePartner(partner.id);
          window.location.href = '/admin/kyc';
        }}
        title="Delete Partner Account"
        itemName={partner.name}
        description="Permanently delete this partner account, their referral records, and points passbook data."
      />

      {/* TRANSFER TEAM MODAL */}
      <TransferTeamModal
        partner={partner}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />
    </div>
  );
}
