'use client';

import React, { useState, useRef } from 'react';
import { usePartnerStore, Referral } from '@/lib/store';
import { SERVICE_OPTIONS } from '@/lib/mock-data';
import {
  UserPlus,
  CheckCircle,
  Copy,
  ShareNetwork,
  User,
  Phone,
  Envelope,
  MapPin,
  FileText,
  DownloadSimple,
  CaretDown,
} from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReferPage() {
  const { partner, setReferrals, referrals } = usePartnerStore();
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

  // Generated Referral Link (use team code if available, else partner id)
  const referralCode = partner?.teamCode || partner?.id?.toUpperCase() || 'PARTNER';
  const referralUrl = `https://app.primescore.in/register?ref=${referralCode}`;

  const handleCopyLink = () => {
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
            Submit customer details directly or share your unique referral link to earn 500 PrimePoints per completed case.
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
    </div>
  );
}
