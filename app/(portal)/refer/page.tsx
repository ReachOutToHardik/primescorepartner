'use client';

import React, { useState } from 'react';
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
} from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';

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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Requested Credit Service *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] focus:ring-2 focus:ring-indigo-100 text-slate-900 cursor-pointer transition-all"
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
            <div className="flex items-center gap-2.5">
              <ShareNetwork size={24} className="text-[#F5C518]" weight="bold" />
              <h3 className="font-display font-bold text-lg text-white">
                Instant Client Link Generator
              </h3>
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
            <div className="pt-4 border-t border-white/10 space-y-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Client Scan QR Code
              </span>

              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#F5C518] shadow-lg">
                <QRCodeSVG
                  value={referralUrl}
                  size={160}
                  bgColor={"#FFFFFF"}
                  fgColor={"#0F1A4E"}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={{
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-300 font-medium">
                Display this QR code in your office or present it on your smartphone for instant scan onboarding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
