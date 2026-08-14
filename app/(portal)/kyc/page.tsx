'use client';

import React from 'react';
import { usePartnerStore } from '@/lib/store';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  WarningCircle,
  FileText,
  Bank,
  User,
  PhoneCall,
  Envelope,
  WhatsappLogo,
  ArrowRight,
  Headset,
} from '@phosphor-icons/react';

export default function KYCPage() {
  const { partner } = usePartnerStore();

  const isApproved = partner?.status === 'kyc_approved' || !partner?.status;
  const isSubmitted = partner?.status === 'kyc_submitted';

  const documentChecklist = [
    {
      title: 'PAN Card Verification',
      subtitle: partner?.pan || 'ABCDE1234F',
      status: 'Approved',
      timestamp: '2024-10-01 10:30 AM',
      icon: FileText,
    },
    {
      title: 'Aadhaar Identification Proof',
      subtitle: '•••• •••• 9012',
      status: 'Approved',
      timestamp: '2024-10-01 10:32 AM',
      icon: ShieldCheck,
    },
    {
      title: 'Payout Bank Account Details',
      subtitle: 'HDFC Bank - A/C ending in 4920',
      status: 'Approved',
      timestamp: '2024-10-01 10:35 AM',
      icon: Bank,
    },
    {
      title: 'Partner Network Agreement',
      subtitle: 'Digitally signed T&C agreement',
      status: 'Verified',
      timestamp: '2024-10-01 10:36 AM',
      icon: User,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={24} className="text-[#1B2A72]" weight="bold" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              Profile & KYC Verification Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Review your partner profile details, identity verification status, and bank payout records.
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="shrink-0">
          {isApproved ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBF7ED] border border-[#3DAA4B] text-[#3DAA4B] font-display font-bold text-xs uppercase tracking-wider rounded-xs">
              <CheckCircle size={18} weight="fill" />
              <span>KYC Verified & Active</span>
            </div>
          ) : isSubmitted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF9E7] border border-[#F5C518] text-[#1A1917] font-display font-bold text-xs uppercase tracking-wider rounded-xs">
              <Clock size={18} weight="fill" className="text-[#F5C518]" />
              <span>Documents Under Review</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FDECEA] border border-[#E63329] text-[#E63329] font-display font-bold text-xs uppercase tracking-wider rounded-xs">
              <WarningCircle size={18} weight="fill" />
              <span>KYC Pending Submission</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Checklist + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Status overview & document checklist */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overview Panel */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center justify-between">
              <span>Account Status Summary</span>
              <span className="text-xs font-mono-num font-normal text-[var(--ink-muted)]">
                ID: {partner?.id || 'demo'}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[var(--surface)] p-4 border border-[var(--border)] rounded-xs">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[var(--ink-subtle)]">
                  Partner Name
                </span>
                <span className="font-display font-bold text-sm text-[var(--ink)]">
                  {partner?.name || 'Arjun Mehta'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[var(--ink-subtle)]">
                  Category
                </span>
                <span className="font-display font-bold text-sm text-[#1B2A72]">
                  {partner?.profession || 'CA'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[var(--ink-subtle)]">
                  Registered On
                </span>
                <span className="font-mono-num font-semibold text-xs text-[var(--ink)]">
                  {partner?.joinedAt ? new Date(partner.joinedAt).toLocaleDateString() : '01 Oct 2024'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Your partner account is fully compliant with RBI and bureau referral regulations. You are eligible for 100% instant referral payouts and reward point redemptions.
            </p>
          </div>

          {/* Document Checklist List */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Document Checklist & Logs
            </h2>

            <div className="divide-y divide-[var(--border)]">
              {documentChecklist.map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xs bg-[#1B2A72]/10 text-[#1B2A72] flex items-center justify-center shrink-0">
                        <Icon size={20} weight="bold" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-[var(--ink)]">
                          {doc.title}
                        </p>
                        <p className="text-xs font-mono-num text-[var(--ink-muted)]">
                          {doc.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EBF7ED] text-[#3DAA4B] text-[11px] font-bold uppercase tracking-wider rounded-xs border border-[#3DAA4B]/30">
                        <CheckCircle size={12} weight="fill" /> {doc.status}
                      </span>
                      <p className="text-[10px] font-mono-num text-[var(--ink-subtle)] mt-1">
                        {doc.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Support & Help Desk */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0F1A4E] text-white border border-white/10 p-6 rounded-xs space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <Headset size={28} className="text-[#F5C518]" weight="fill" />
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Need Help with Verification?
                </h3>
                <p className="text-xs text-slate-300">
                  Our Partner Verification Desk is available Mon-Sat, 9:30 AM to 7:00 PM IST.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="mailto:partner.support@primescore.in"
                className="flex items-center gap-3 p-3 bg-[#1B2A72] hover:bg-[#253390] border border-white/15 rounded-xs transition-colors text-xs text-white"
              >
                <Envelope size={18} className="text-[#F5C518]" />
                <div>
                  <span className="block font-semibold text-slate-200">Email Support</span>
                  <span className="font-mono-num text-white">partner.support@primescore.in</span>
                </div>
              </a>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-[#3DAA4B]/20 hover:bg-[#3DAA4B]/30 border border-[#3DAA4B]/40 rounded-xs transition-colors text-xs text-white"
              >
                <WhatsappLogo size={18} className="text-[#3DAA4B]" weight="fill" />
                <div>
                  <span className="block font-semibold text-slate-200">WhatsApp Desk</span>
                  <span className="font-mono-num text-white">+91 98765 43210</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-[#1B2A72] border border-white/15 rounded-xs text-xs text-white">
                <PhoneCall size={18} className="text-[#F5C518]" />
                <div>
                  <span className="block font-semibold text-slate-200">Partner Helpline</span>
                  <span className="font-mono-num text-white">1800-200-PRIME (Toll-Free)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs space-y-3">
            <h4 className="font-display text-sm font-bold text-[var(--ink)] uppercase tracking-wider">
              Verification FAQs
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-[var(--ink)]">How long does KYC verification take?</p>
                <p className="text-[var(--ink-muted)] mt-0.5">
                  Automated PAN & Bank verification takes under 2 minutes. Manual document checks take up to 4 hours.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-semibold text-[var(--ink)]">Can I change my payout bank account?</p>
                <p className="text-[var(--ink-muted)] mt-0.5">
                  Yes, contact support with a cancelled cheque copy to update your payout bank account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
