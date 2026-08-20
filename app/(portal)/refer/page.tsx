'use client';

import React, { useState, useRef } from 'react';
import { usePartnerStore, Referral } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { SERVICE_OPTIONS } from '@/lib/mock-data';
import {
  UserPlus,
  CheckCircle,
  Clock,
  ShieldCheck,
  Copy,
  ShareNetwork,
  User,
  Phone,
  Envelope,
  MapPin,
  FileText,
  DownloadSimple,
  CaretDown,
  HourglassHigh,
} from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

export default function ReferPage() {
  const { partner, setReferrals, referrals } = usePartnerStore();
  const conversionPoints = useAdminStore((s) => s.rewardConfig.conversionPoints);
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Referral Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  // UI state
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [kycModalOpen, setKycModalOpen] = useState(false);

  // Generated Referral Link (use team code if available, else partner id)
  const referralCode = partner?.teamCode || partner?.id?.toUpperCase() || 'PARTNER';
  const referralUrl = `https://app.primescore.in/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    if (partner?.status !== 'kyc_approved') {
      setKycModalOpen(true);
      return;
    }
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQR = async (format: 'png' | 'jpg' | 'pdf') => {
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
        ctx.fillText(`PRIMESCORE PARTNER • ${referralCode}`, size / 2, size + 80);
      }

      const filename = `primescore-qr-${referralCode.toLowerCase()}`;

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
      console.error('Failed to export QR code:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partner?.status !== 'kyc_approved') {
      setKycModalOpen(true);
      return;
    }
    const errs: Record<string, string> = {};

    if (!customerName.trim()) errs.name = 'Customer name is required';
    if (!customerPhone.trim() || customerPhone.length < 10) errs.phone = 'Valid 10-digit phone number is required';
    if (!city.trim()) errs.city = 'City is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!partner?.id) {
      setErrors({ submit: 'You must be logged in to submit a referral.' });
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: insertedReferral, error: refError } = await supabase
        .from('referrals')
        .insert([
          {
            partner_id: partner.id,
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            customer_email: customerEmail.trim() || null,
            city: city.trim(),
            service_name: service,
            notes: notes.trim() || null,
            current_stage: 'submitted',
            partner_points_earned: 0,
          },
        ])
        .select('id')
        .single();

      if (refError) {
        console.error('Referral insert error:', refError);
        setErrors({ submit: 'Failed to submit referral. Please try again.' });
        return;
      }

      const newRefId = insertedReferral?.id || `REF-${Date.now()}`;

      // Also update local Zustand store immediately for instant UI update
      const now = new Date().toISOString();
      setReferrals([
        {
          id: newRefId,
          partnerId: partner.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || '',
          city: city.trim(),
          service,
          notes: notes.trim(),
          status: 'submitted',
          createdAt: now,
          updatedAt: now,
          pointsEarned: 0,
          statusHistory: [
            { status: 'submitted', date: now, note: 'Referral submitted by partner via portal form' },
          ],
        },
        ...referrals,
      ]);

      // Reset Form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCity('');
      setNotes('');
      setErrors({});

      setSuccessToast(`Referral submitted successfully! Our advisors will contact ${customerName.trim()} within 2 business hours.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Referral submission error:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  const isVerified = partner?.status === 'kyc_approved';

  const formattedSubmitDate = partner?.kycSubmittedAt
    ? new Date(partner.kycSubmittedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : partner?.joinedAt
    ? new Date(partner.joinedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // UNVERIFIED PARTNER STATE — Clean White Responsive Page (Desktop & Mobile)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isVerified) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up py-2">
        {/* Top Hero Banner */}
        <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          {/* Top Right Animated Moving Icon */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center justify-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center relative shadow-inner">
              <span className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              <HourglassHigh size={22} className="text-amber-400 animate-spin relative z-10" style={{ animationDuration: '8s' }} weight="bold" />
            </div>
          </div>

          <div className="space-y-2.5 pr-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Referral Portal Locked</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Partner Application Under Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your partner account is being reviewed. The referral submission features will unlock automatically once your account is verified.
            </p>
          </div>
        </div>

        {/* Responsive Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Key Verification Details */}
          <Card variant="elevated" className="md:col-span-7 p-6 space-y-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Verification Status & SLA</span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
                24 – 48 Hours SLA
              </span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {formattedSubmitDate && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Submitted On</span>
                  <span className="font-mono font-bold text-slate-900 text-right">{formattedSubmitDate}</span>
                </div>
              )}
              <div className="py-3 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Notification Method</span>
                <span className="font-semibold text-slate-900 text-right">SMS to registered mobile</span>
              </div>
              <div className="py-3 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Sign-Up Bonus</span>
                <span className="font-bold text-emerald-600 text-right">100 PrimePoints (on approval)</span>
              </div>
            </div>
          </Card>

          {/* Action CTAs & Support */}
          <Card variant="elevated" className="md:col-span-5 p-6 space-y-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-slate-900">
                What happens next?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our verification team is cross-checking your details. Once verified, you will receive an SMS and your 100 PrimePoints welcome bonus will be credited.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/kyc"
                className="w-full py-3 px-4 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs text-center"
              >
                <ShieldCheck size={16} weight="bold" />
                <span>Check Application Status</span>
              </a>
              <a
                href="mailto:info@primescore.in"
                className="w-full py-3 px-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Envelope size={16} />
                <span>Contact Support</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
            <UserPlus size={16} className="text-[#F5C518]" weight="bold" />
            <span>Direct Client Referral</span>

          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Submit New Client Referral
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Submit customer details directly or share your unique referral link to earn {conversionPoints} PrimePoints per completed case.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Copy size={16} weight="bold" />
            <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 bg-[#EBF7ED] border border-[#3DAA4B] text-[#3DAA4B] rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} weight="fill" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-[#3DAA4B] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Form (7 cols) + Instant Generator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Referral Submission Form */}
        <Card variant="elevated" className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Direct Client Referral Form
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Fill in your client&apos;s contact information. Our credit resolution advisors will reach out immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suresh Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 transition-all"
                  />
                  <User size={18} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {errors.name && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 font-mono-num transition-all"
                  />
                  <Phone size={18} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {errors.phone && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="suresh@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 transition-all"
                  />
                  <Envelope size={18} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  City / Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mumbai, Delhi, etc."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 transition-all"
                  />
                  <MapPin size={18} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {errors.city && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.city}</p>}
              </div>
            </div>

            {/* Requested Service Dropdown */}
            <CustomSelect
              label="Requested Credit Service *"
              options={SERVICE_OPTIONS}
              value={service}
              onChange={(val) => setService(val)}
              placeholder="Select service..."
            />

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Client Case Notes / Bureau Issues
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="e.g. Loan rejected due to incorrect DPD default on CIBIL report."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 transition-all"
                />
                <FileText size={18} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={18} weight="bold" />
              <span>Submit Referral Lead & Earn 500 Pts</span>
            </button>
          </form>
        </Card>

        {/* Right 5 cols: Instant Link & QR Code Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Link Card */}
          <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white p-6 rounded-2xl border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <ShareNetwork size={24} className="text-[#F5C518]" weight="bold" />
                <h3 className="font-display font-bold text-lg text-white">
                  Client Link & QR
                </h3>
              </div>

              {/* Header Download Dropdown Button */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setDownloadOpen(!downloadOpen)}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 bg-[#F5C518] hover:bg-[#e0b210] text-[#0F1A4E] font-display font-bold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>{isExporting ? 'Exporting...' : 'Download QR'}</span>
                  <CaretDown size={12} weight="bold" className={`transition-transform ${downloadOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {downloadOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-2 divide-y divide-slate-100 animate-fade-in text-left">
                    <button
                      onClick={() => handleDownloadQR('png')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span>PNG Image</span>
                      <span className="text-[10px] text-slate-400 font-mono-num">.png</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQR('jpg')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span>JPG Image</span>
                      <span className="text-[10px] text-slate-400 font-mono-num">.jpg</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQR('pdf')}
                      className="w-full px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span>PDF Document</span>
                      <span className="text-[10px] text-indigo-600 font-mono-num font-bold">.pdf</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Share this link directly on WhatsApp or Email. Clients can register themselves, automatically tagging you as their referral partner.
            </p>

            {/* Referral URL Box */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 block font-mono-num">
                Your Unique Partner Referral URL
              </span>
              <div className="flex items-center gap-2 bg-[#091136] p-2.5 border border-white/20 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="w-full bg-transparent text-xs font-mono-num font-bold text-[#F5C518] focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-bold text-xs rounded-lg shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Copy size={14} weight="bold" />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Visual Preview Component with Logo embedded in center */}
            <div className="pt-4 border-t border-white/10 space-y-4 text-center flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block font-mono-num">
                Client Scan QR Code
              </span>

              {/* Printable / Downloadable QR Badge Box */}
              <div
                ref={qrCardRef}
                className="p-5 bg-white rounded-2xl border-2 border-[#F5C518] shadow-lg flex flex-col items-center gap-2.5 max-w-[220px]"
              >
                <QRCodeSVG
                  value={referralUrl}
                  size={160}
                  bgColor={"#FFFFFF"}
                  fgColor={"#0F1A4E"}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={{
                    src: "/qr-logo.png",
                    x: undefined,
                    y: undefined,
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
                <div className="text-[10px] font-bold text-[#0F1A4E] uppercase tracking-wider font-mono-num border-t border-slate-100 pt-1.5 w-full text-center">
                  Primescore Partner &bull; {referralCode}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-medium max-w-xs">
                Display this QR code in your office or present it on your smartphone for instant scan onboarding.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* KYC Under Review Alert Modal — keep for programmatic open from buttons */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.kycSubmittedAt || partner?.joinedAt}
      />
    </div>
  );
}
