'use client';

import React, { useState } from 'react';
import { usePartnerStore, Referral } from '@/lib/store';
import { SERVICE_OPTIONS } from '@/lib/mock-data';
import {
  UserPlus,
  CheckCircle,
  Copy,
  QrCode,
  ShareNetwork,
  User,
  Phone,
  Envelope,
  MapPin,
  FileText,
  Sparkle,
  ArrowRight,
  Download,
} from '@phosphor-icons/react';

export default function ReferPage() {
  const { partner, addReferral } = usePartnerStore();

  // Referral Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  // UI state
  const [copiedLink, setCopiedLink] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generated Referral Link
  const referralCode = partner?.id ? partner.id.toUpperCase() : 'DEMO123';
  const referralUrl = `https://primescore.in/ref/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!customerName.trim()) errs.name = 'Customer name is required';
    if (!customerPhone.trim() || customerPhone.length < 10) errs.phone = 'Valid 10-digit phone number is required';
    if (!city.trim()) errs.city = 'City is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newRefId = `REF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newReferral: Referral = {
      id: newRefId,
      partnerId: partner?.id || 'demo',
      customerName,
      customerPhone,
      customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city,
      service,
      notes,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pointsEarned: 0,
      statusHistory: [
        {
          status: 'submitted',
          date: new Date().toISOString(),
          note: 'Referral submitted by partner via portal form',
        },
      ],
    };

    addReferral(newReferral);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCity('');
    setNotes('');
    setErrors({});

    setSuccessToast(`Referral ${newRefId} submitted successfully! Our advisors will contact the client within 2 hours.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={26} className="text-[#1B2A72]" weight="bold" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            Submit New Client Referral
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
          Submit customer details directly or share your unique referral link to earn 500 PrimePoints per completed case.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 bg-[#EBF7ED] border border-[#3DAA4B] text-[#3DAA4B] rounded-xs font-semibold text-xs flex items-center justify-between shadow-xs">
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
        <div className="lg:col-span-7 bg-white border border-[var(--border)] p-6 sm:p-8 rounded-xs shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              Direct Client Referral Form
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Fill in your client&apos;s contact information. Our credit resolution advisors will reach out immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Customer Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suresh Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <User size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.name && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                  />
                  <Phone size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.phone && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.phone}</p>}
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="suresh@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <Envelope size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  City / Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mumbai / Pune / Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <MapPin size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.city && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.city}</p>}
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                Requested Credit Service *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-semibold"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                Client Case Notes / Details (Optional)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="e.g. Loan rejected due to incorrect DPD default on CIBIL report."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                />
                <FileText size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-sm rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <UserPlus size={18} weight="bold" />
              <span>Submit Referral Lead & Earn 500 Pts</span>
            </button>
          </form>
        </div>

        {/* Right 5 cols: Instant Link & QR Code Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Link Card */}
          <div className="bg-[#0F1A4E] text-white p-6 rounded-xs border border-white/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShareNetwork size={22} className="text-[#F5C518]" weight="bold" />
              <h3 className="font-display font-bold text-lg text-white">
                Instant Client Link Generator
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Share this link directly on WhatsApp or Email. Clients can register themselves, automatically tagging you as their referral partner.
            </p>

            {/* Referral URL Box */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300 block">
                Your Unique Partner Referral URL
              </span>
              <div className="flex items-center gap-2 bg-[#1B2A72] p-2 border border-white/20 rounded-xs">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="w-full bg-transparent text-xs font-mono-num font-semibold text-[#F5C518] focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-[#E63329] hover:bg-[#c9241b] text-white font-display font-semibold text-xs rounded-xs shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={14} weight="bold" />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Visual Preview Component */}
            <div className="pt-4 border-t border-white/10 space-y-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Client Scan QR Code
              </span>

              <div className="inline-block p-4 bg-white rounded-xs border-2 border-[#F5C518] shadow-md">
                {/* SVG Simulated QR Matrix */}
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                  <rect width="140" height="140" fill="white" />
                  {/* Outer position detection squares */}
                  <rect x="10" y="10" width="40" height="40" fill="#0F1A4E" />
                  <rect x="16" y="16" width="28" height="28" fill="white" />
                  <rect x="22" y="22" width="16" height="16" fill="#0F1A4E" />

                  <rect x="90" y="10" width="40" height="40" fill="#0F1A4E" />
                  <rect x="96" y="16" width="28" height="28" fill="white" />
                  <rect x="102" y="22" width="16" height="16" fill="#0F1A4E" />

                  <rect x="10" y="90" width="40" height="40" fill="#0F1A4E" />
                  <rect x="16" y="96" width="28" height="28" fill="white" />
                  <rect x="22" y="102" width="16" height="16" fill="#0F1A4E" />

                  {/* QR Pattern Data Blocks */}
                  <rect x="60" y="15" width="10" height="10" fill="#0F1A4E" />
                  <rect x="75" y="25" width="10" height="10" fill="#E63329" />
                  <rect x="60" y="40" width="15" height="15" fill="#0F1A4E" />
                  <rect x="15" y="60" width="10" height="20" fill="#0F1A4E" />
                  <rect x="35" y="65" width="15" height="15" fill="#0F1A4E" />
                  <rect x="60" y="60" width="20" height="20" fill="#1B2A72" />
                  <rect x="90" y="60" width="15" height="10" fill="#0F1A4E" />
                  <rect x="115" y="60" width="15" height="15" fill="#0F1A4E" />
                  <rect x="60" y="90" width="10" height="20" fill="#0F1A4E" />
                  <rect x="80" y="100" width="15" height="15" fill="#E63329" />
                  <rect x="105" y="95" width="20" height="20" fill="#0F1A4E" />
                  <rect x="75" y="115" width="15" height="15" fill="#0F1A4E" />

                  {/* Logo Center Badge */}
                  <rect x="56" y="56" width="28" height="28" fill="white" rx="4" />
                  <text x="60" y="75" fill="#E63329" fontSize="13" fontWeight="bold" fontFamily="Space Grotesk">
                    PS
                  </text>
                </svg>
              </div>

              <p className="text-[11px] text-slate-300">
                Display this QR code in your office or present it on your smartphone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
