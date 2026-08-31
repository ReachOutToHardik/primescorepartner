'use client';

import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  WarningCircle,
  FileText,
  Bank,
  User,
  Envelope,
  WhatsappLogo,
  Headset,
  IdentificationCard,
  DownloadSimple,
  ArrowRight,
  Sparkle,
  HourglassHigh,
  LockKey,
  Shield,
  Check,
  Scales,
  Article,
  QrCode,
  CaretDown,
} from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { formatMobile, formatAadhaar, formatPan } from '@/lib/utils';

export default function KYCPage() {
  const { partner } = usePartnerStore();
  const qrCardRef = useRef<HTMLDivElement>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const userRefCode = partner?.userReferralCode || partner?.teamCode || 'PSMKMVLN';
  const clientReferralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/apply?ref=${userRefCode}`
    : `https://partners.primescore.in/apply?ref=${userRefCode}`;

  const handleDownloadQR = async (format: 'png' | 'jpg' | 'pdf' = 'pdf') => {
    setDownloadOpen(false);
    setIsExporting(true);

    try {
      const qrSvg = qrCardRef.current?.querySelector('svg');
      if (!qrSvg) throw new Error('QR SVG element not found');

      // Convert SVG element to serialized string
      const svgData = new XMLSerializer().serializeToString(qrSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = blobURL;
      });

      // Load logo image for center overlay
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => resolve(); // Proceed even if logo fails
        logoImg.src = '/qr-logo.png';
      });

      // Render high-res 1000x1160 canvas badge
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 1000;
      const padding = 80;
      canvas.width = size;
      canvas.height = size + 160;

      if (ctx) {
        // White rounded background card
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
        ctx.fill();

        // Border ring
        ctx.strokeStyle = '#F5C518';
        ctx.lineWidth = 12;
        ctx.stroke();

        // Draw QR SVG Image
        ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

        // Draw Centered Logo Image Overlay
        if (logoImg.complete && logoImg.width > 0) {
          const logoSize = 180;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = padding + (size - padding * 2 - logoSize) / 2;

          // White background cutout circle for logo center
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, padding + (size - padding * 2) / 2, logoSize / 2 + 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        }

        // Partner footer text
        ctx.fillStyle = '#0F1A4E';
        ctx.font = 'bold 36px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`PRIMESCORE PARTNER • ${userRefCode}`, size / 2, size + 80);
      }

      const filename = `primescore-referral-qr-${userRefCode.toLowerCase()}`;

      if (format === 'png') {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${filename}.png`;
        link.click();
      } else if (format === 'jpg') {
        const image = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.href = image;
        link.download = `${filename}.jpg`;
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const imgWidth = 140;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', (210 - imgWidth) / 2, 40, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
      }

      URL.revokeObjectURL(blobURL);
    } catch (err) {
      console.error('Failed to export Referral QR code:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isApproved = partner?.status === 'kyc_approved';
  const isSubmitted = partner?.status === 'kyc_submitted' || (!isApproved && Boolean(partner?.name));

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CLEAN & HUMAN "APPLICATION UNDER REVIEW" SCREEN (when status is kyc_submitted)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isSubmitted && !isApproved) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up py-4">
        {/* Status Header Banner */}
        <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>KYC Under Review</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Application Under Review
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Thank you for registering with Primescore, <strong className="text-white">{partner?.name}</strong>. We are verifying your identity documents and bank details.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                Partner Code: <strong className="text-amber-300 font-mono">{partner?.teamCode || 'PENDING'}</strong>
              </span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                Profession: <strong className="text-white">{partner?.profession}</strong>
              </span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                Estimated Time: <strong className="text-emerald-400">2–4 Hours</strong>
              </span>
            </div>
          </div>

          {/* Clean Status Badge */}
          <div className="relative z-10 shrink-0 self-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border border-white/15 p-3 flex flex-col items-center justify-center text-center shadow-lg">
              <Clock size={28} className="text-amber-400 mb-1" weight="bold" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Reviewing</span>
            </div>
          </div>
        </div>

        {/* 3-Step Verification Progress */}
        <Card variant="elevated" className="p-6 space-y-6">
          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Verification Progress</span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
              Step 2 of 3 In Progress
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  <Check size={16} weight="bold" />
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Completed</span>
              </div>
              <div>
                <p className="font-display font-bold text-xs text-slate-900">Application Submitted</p>
                <p className="text-[10px] text-slate-500">Form & documents recorded</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  <Clock size={16} weight="bold" />
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase">In Review</span>
              </div>
              <div>
                <p className="font-display font-bold text-xs text-slate-900">Identity & Bank Verification</p>
                <p className="text-[10px] text-slate-600">PAN, Aadhaar & bank check</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 opacity-70">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center">
                  <LockKey size={16} weight="bold" />
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Access Locked</span>
              </div>
              <div>
                <p className="font-display font-bold text-xs text-slate-900">Portal Activation</p>
                <p className="text-[10px] text-slate-500">Unlocks after approval</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <User size={18} className="text-[#1B2A72]" /> Partner Profile Details
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Legal Name</span>
                <span className="font-bold text-slate-900">{partner?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-mono text-slate-800">{partner?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mobile Number</span>
                <span className="font-mono text-slate-800">{partner?.phone ? formatMobile(partner.phone) : '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">City & State</span>
                <span className="font-semibold text-slate-900">{partner?.city}, {partner?.state}</span>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#1B2A72]" /> Submitted KYC Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={20} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900">PAN Card Number</p>
                    <p className="text-[11px] font-mono font-bold text-slate-700">{partner?.pan ? formatPan(partner.pan) : 'Submitted'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md">Reviewing</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-900">Aadhaar Identification</p>
                    <p className="text-[11px] font-mono font-bold text-slate-700">
                      {partner?.aadhaar ? formatAadhaar(partner.aadhaar) : 'Government Identity Proof'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md">Reviewing</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Legal Policies & Security Compliance Strip */}
        <div className="p-4 bg-white border border-[var(--border)] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <Scales size={20} className="text-[#1B2A72] shrink-0" weight="fill" />
            <div>
              <span className="font-bold text-slate-900">Official Platform Policies</span>
              <p className="text-[11px] text-slate-500">Review our regulatory, data security, and partner compensation terms.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/privacy"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>

        {/* Support Help & Contact Box */}
        <div className="bg-[#0F1A4E] text-white p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Headset size={28} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-display font-bold text-sm text-white">Need Help with Verification?</p>
              <p className="text-xs text-slate-300">Reach out to our support team if you have any questions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:partner@primescore.in"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
            >
              <Envelope size={16} /> Support Email
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <WhatsappLogo size={16} /> WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. VERIFIED & APPROVED PARTNER KYC DASHBOARD (when status is kyc_approved)
  // ─────────────────────────────────────────────────────────────────────────────
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBF7ED] border border-[#3DAA4B] text-[#3DAA4B] font-display font-bold text-xs uppercase tracking-wider rounded-xs">
            <CheckCircle size={18} weight="fill" />
            <span>KYC Verified & Active</span>
          </div>
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
              <span className="text-xs font-mono-num font-bold text-[#1B2A72] bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 shadow-2xs">
                Partner Code: {partner?.teamCode || `PS-${(partner?.id || '884').substring(0, 6).toUpperCase()}`}
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

          {/* OFFICIAL PRIMESCORE PARTNER REFERRAL QR DOWNLOAD ACTION */}
          <div className="space-y-3 bg-white border border-[var(--border)] p-6 rounded-xs shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <QrCode size={20} className="text-[#1B2A72]" weight="bold" />
                  Official PrimeScore Partner Referral QR Code
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Your identity is verified. Download your official high-definition Partner Referral QR Code as a formatted PDF or image.
                </p>
              </div>

              <div className="relative inline-block text-left shrink-0">
                <button
                  type="button"
                  onClick={() => setDownloadOpen(!downloadOpen)}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <DownloadSimple size={18} weight="bold" />
                  <span>{isExporting ? 'Exporting QR...' : 'Download Referral QR Code'}</span>
                  <CaretDown size={12} weight="bold" className={`transition-transform ${downloadOpen ? 'rotate-180' : ''}`} />
                </button>

                {downloadOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-2 divide-y divide-slate-100 animate-fade-in text-left">
                    <button
                      onClick={() => handleDownloadQR('pdf')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>PDF Document</span>
                      <span className="text-[10px] text-indigo-600 font-mono-num font-bold">.pdf</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQR('png')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>PNG Image</span>
                      <span className="text-[10px] text-slate-400 font-mono-num">.png</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQR('jpg')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>JPG Image</span>
                      <span className="text-[10px] text-slate-400 font-mono-num">.jpg</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* OFF-SCREEN HIGH-RES QR BADGE RENDERER FOR EXPORT */}
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
              <div
                ref={qrCardRef}
                className="p-5 bg-white rounded-2xl border-2 border-[#F5C518] shadow-lg flex flex-col items-center gap-2.5 w-[240px]"
              >
                <QRCodeSVG
                  value={clientReferralUrl}
                  size={180}
                  bgColor={"#FFFFFF"}
                  fgColor={"#0F1A4E"}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={{
                    src: "/qr-logo.png",
                    x: undefined,
                    y: undefined,
                    height: 42,
                    width: 42,
                    excavate: true,
                  }}
                />
                <div className="text-[10px] font-bold text-[#0F1A4E] uppercase tracking-wider font-mono-num border-t border-slate-100 pt-1.5 w-full text-center">
                  Primescore Partner &bull; {userRefCode}
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
                href="mailto:partner@primescore.in"
                className="flex items-center gap-3 p-3 bg-[#1B2A72] hover:bg-[#253390] border border-white/15 rounded-xs transition-colors text-xs text-white"
              >
                <Envelope size={18} className="text-[#F5C518]" />
                <div>
                  <span className="block font-semibold text-slate-200">Email Support</span>
                  <span className="font-mono-num text-white">partner@primescore.in</span>
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
            </div>
          </div>

          {/* Legal & Platform Policies Card */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
              <Scales size={22} className="text-[#1B2A72]" weight="fill" />
              <div>
                <h3 className="font-display text-base font-bold text-[var(--navy-deep)]">
                  Platform Policies & Legal
                </h3>
                <p className="text-[11px] text-slate-500">
                  PrimeScore Partner Network regulatory & compliance documentation.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <Link
                href="/privacy"
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" weight="fill" />
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-[#1B2A72]">Privacy Policy</span>
                    <span className="text-[10px] text-slate-500 block">DPDP Act & partner data protection</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1B2A72]" />
              </Link>

              <Link
                href="/terms"
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Article size={18} className="text-indigo-600 shrink-0" weight="fill" />
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-[#1B2A72]">Terms & Conditions</span>
                    <span className="text-[10px] text-slate-500 block">Partner network code of conduct & agreement</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1B2A72]" />
              </Link>

              <Link
                href="/refund"
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Bank size={18} className="text-amber-600 shrink-0" weight="fill" />
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-[#1B2A72]">Refund & Payout Policy</span>
                    <span className="text-[10px] text-slate-500 block">Commission calculations, points & claims</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1B2A72]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
