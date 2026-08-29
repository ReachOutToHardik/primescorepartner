'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Partner } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { 
  Phone, 
  EnvelopeSimple, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  IdentificationCard, 
  Coins,
  FileText
} from '@phosphor-icons/react';

interface PartnerViewModalProps {
  partner: Partner | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerViewModal({ partner, isOpen, onClose }: PartnerViewModalProps) {
  if (!partner) return null;

  const partnerCode = (partner as any).partnerCode || `PS-${(partner.name || 'PARTNER').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}-${partner.id.slice(0, 4).toUpperCase()}`;
  const totalPoints = (partner as any).points || partner.primePoints || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Partner Profile & Credentials" maxWidth="lg">
      <div className="space-y-5 animate-fade-up">
        {/* Header Profile Card */}
        <div className="p-5 bg-gradient-to-r from-[#0F1A4E] to-[#1B2A72] rounded-2xl text-white space-y-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-amber-300 border border-white/15">
              Code: {partnerCode}
            </span>
            <Badge variant={partner.status === 'kyc_approved' ? 'green' : 'amber'}>
              {partner.status === 'kyc_approved' ? 'KYC Verified Partner' : 'Pending Verification'}
            </Badge>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-extrabold text-xl font-display shrink-0 border border-white/20 uppercase">
              {partner.name[0]}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white leading-snug">
                {partner.name}
              </h3>
              <p className="text-xs text-blue-200 capitalize font-medium">
                {partner.role ? partner.role.replace('_', ' ') : 'Individual Partner / DSA'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <Phone size={14} className="text-[#1B2A72]" /> Phone Number:
            </span>
            <span className="font-mono font-bold text-slate-900">{partner.phone || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <EnvelopeSimple size={14} className="text-[#1B2A72]" /> Email Address:
            </span>
            <span className="font-mono text-slate-900 font-semibold">{partner.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#1B2A72]" /> Profession:
            </span>
            <span className="font-medium text-slate-900">{partner.profession || 'Direct Selling Agent (DSA)'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#1B2A72]" /> City / Location:
            </span>
            <span className="font-medium text-slate-900">{partner.city || 'India'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <IdentificationCard size={14} className="text-[#1B2A72]" /> User Referral Code (Client):
            </span>
            <span className="font-mono font-bold text-[#1B2A72] bg-blue-50 px-2 py-0.5 rounded">
              {(partner as any).userReferralCode || 'PSMKMVLN'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <IdentificationCard size={14} className="text-[#1B2A72]" /> Partner Team Code:
            </span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {partner.teamCode || 'TL-DEFAULT'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <Coins size={14} className="text-amber-500" /> PrimePoints Earned:
            </span>
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {totalPoints.toLocaleString()} Pts
            </span>
          </div>
        </div>

        {/* Partner Submitted Referral Leads List */}
        {(() => {
          const { referrals } = useAdminStore.getState();
          const partnerReferrals = referrals.filter((r) => r.partnerId === partner.id);

          return (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <FileText size={14} className="text-[#1B2A72]" /> Submitted Client Referrals ({partnerReferrals.length})
                </span>
                <Badge variant={partnerReferrals.length > 0 ? 'green' : 'gray'}>
                  {partnerReferrals.length > 0 ? `${partnerReferrals.length} Cases` : 'No Cases'}
                </Badge>
              </div>

              {partnerReferrals.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">No client lead referrals submitted by this partner yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {partnerReferrals.map((ref) => (
                    <div key={ref.id} className="p-2.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs font-mono-num">
                      <div>
                        <div className="font-bold text-slate-900 font-sans">{ref.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{ref.service} • {ref.city}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ref.status === 'completed' ? 'green' : ref.status === 'rejected' ? 'red' : 'blue'}>
                          {ref.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Link
                          href={`/admin/referrals/${ref.id}`}
                          onClick={onClose}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-[#1B2A72] rounded-md transition-colors font-sans text-[10px] font-bold"
                        >
                          View ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Profile
          </button>

          <Link
            href={`/admin/kyc/${partner.id}`}
            onClick={onClose}
            className="px-4 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={16} weight="bold" />
            <span>Open Full Partner Profile &rarr;</span>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
