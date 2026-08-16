'use client';

import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
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
  Headset,
  QrCode,
  UsersThree,
  Crown,
  IdentificationCard,
  Building,
  Check,
  DownloadSimple
} from '@phosphor-icons/react';

export default function KYCPage() {
  const { partner } = usePartnerStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      // Load template and QR code into clean canvas to completely bypass html2canvas lab() CSS errors
      const canvas = document.createElement('canvas');
      canvas.width = 1011;
      canvas.height = 637;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // 1. Draw Template Background Image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
        bgImg.src = '/id-card-bg.png';
      });
      ctx.drawImage(bgImg, 0, 0, 1011, 637);

      // 2. Draw Dynamic Partner Details (Large Prominent Typography)
      ctx.fillStyle = '#0F1A4E';
      ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
      const nameText = (partner?.name || 'RAHUL JOSHI').toUpperCase();
      ctx.fillText(nameText, 66, 292);

      ctx.fillStyle = '#1A1917';
      ctx.font = '800 21px "Inter", sans-serif';
      const refCodeText = `REF CODE : ${(partner?.teamCode || partner?.id?.toUpperCase() || 'EFWFFEW')}`;
      ctx.fillText(refCodeText, 66, 350);

      const phoneText = `MOBILE :- +91 ${partner?.phone || '9811223344'}`;
      ctx.fillText(phoneText, 66, 388);

      // 3. Draw Dynamic QR Code & Center Logo
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PRIMESCORE-PARTNER-${partner?.teamCode || partner?.id || 'demo'}&color=0F1A4E`;
      
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrUrl;
      });

      // Position: Top 28.5% (181px), Right 6.5% (X: 555px), Width: 390px, Height: 385px
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(555, 181, 390, 385);
      ctx.drawImage(qrImg, 560, 186, 380, 375);

      // Draw Center Brand Badge inside QR
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
        logoImg.src = '/qr-logo.png';
      });

      if (logoImg.complete && logoImg.naturalWidth !== 0) {
        ctx.fillStyle = '#0F1A4E';
        ctx.fillRect(725, 348, 50, 50);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(725, 348, 50, 50);
        ctx.drawImage(logoImg, 728, 351, 44, 44);
      }

      // Export to jsPDF CR80 Format
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
      pdf.save(`PrimeScore_Partner_ID_${partner?.teamCode || partner?.id || 'card'}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isApproved = partner?.status === 'kyc_approved' || !partner?.status;
  const isSubmitted = partner?.status === 'kyc_submitted';

  const role = partner?.role || 'team_leader';

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
            Review your partner profile details, official ID card badge, identity verification status, and bank payout records.
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
        {/* Left 7 cols: Account Status Summary & ID Card Badge */}
        <div className="lg:col-span-7 space-y-6">
          {/* Account Status Summary */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center justify-between border-b border-gray-100 pb-3">
              <span>Account Status Summary</span>
              <span className="text-xs font-mono-num font-bold text-[var(--navy)] bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
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
                  {partner?.profession || 'Chartered Accountant (CA)'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[var(--ink-subtle)]">
                  Registered On
                </span>
                <span className="font-mono-num font-semibold text-xs text-[var(--ink)]">
                  {partner?.joinedAt ? new Date(partner.joinedAt).toLocaleDateString() : '10/1/2024'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-2)] leading-relaxed bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60 text-emerald-900 font-medium">
              Your partner account is fully compliant with RBI and bureau referral regulations. You are eligible for 100% instant referral payouts and reward point redemptions.
            </p>
          </div>

          {/* OFFICIAL PRIMESCORE PARTNER ID CARD DOWNLOAD ACTION */}
          <div className="space-y-3 bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <IdentificationCard size={20} className="text-[#1B2A72]" weight="fill" />
                  Official PrimeScore Partner Digital ID Card
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Your identity is verified. Download your official high-definition Partner ID Card as a formatted PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download ID Card (PDF)'}</span>
              </button>
            </div>

            {/* OFF-SCREEN HIGH-RES CARD RENDERER FOR JSPDF */}
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
              <div
                id="pdf-id-card-renderer"
                ref={cardRef}
                className="relative w-[1011px] h-[637px] rounded-none overflow-hidden bg-white select-none shadow-none"
              >
                {/* Background Image Template */}
                <img
                  src="/id-card-bg.png"
                  alt="PrimeScore ID Card Background"
                  className="absolute inset-0 w-full h-full object-fill"
                />

                {/* OVERLAY CONTENT FOR PDF */}
                <div className="absolute top-[41%] left-[6.5%] max-w-[46%] z-10 flex flex-col justify-start">
                  <h4 className="font-display font-extrabold text-slate-950 text-3xl leading-none uppercase tracking-tight truncate">
                    {partner?.name || 'RAHUL JOSHI'}
                  </h4>

                  <div className="mt-5 space-y-2 font-body font-bold text-slate-900 text-lg tracking-wide">
                    <p className="flex items-center gap-2 truncate">
                      <span className="text-slate-900 font-bold">REF CODE :</span>
                      <span className="font-display text-slate-950 font-extrabold uppercase">{partner?.teamCode || partner?.id?.toUpperCase() || 'EFWFFEW'}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <span className="text-slate-900 font-bold">MOBILE :-</span>
                      <span className="font-display text-slate-950 font-extrabold">+91 {partner?.phone || '9811223344'}</span>
                    </p>
                  </div>
                </div>

                <div className="absolute top-[28.5%] right-[6.5%] w-[38.5%] h-[60.5%] flex items-center justify-center p-2 z-10">
                  <div className="w-full h-full relative bg-white p-2 rounded-none flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PRIMESCORE-PARTNER-${partner?.teamCode || partner?.id || 'demo'}&color=0F1A4E`}
                      alt="Partner Verification QR Code"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-[#0F1A4E] rounded-none p-1 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                        <img src="/qr-logo.png" alt="PrimeScore Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
