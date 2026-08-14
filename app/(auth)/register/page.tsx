'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePartnerStore } from '@/lib/store';
import { PROFESSION_OPTIONS } from '@/lib/mock-data';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UploadSimple,
  ShieldCheck,
  FileText,
  Bank,
  User,
  Envelope,
  Phone,
  MapPin,
  Cardholder,
} from '@phosphor-icons/react';
import { LogoLight } from '@/components/ui/LogoLight';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function RegisterPage() {
  const router = useRouter();
  const { setPartner } = usePartnerStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State Step 1
  const [accountRole, setAccountRole] = useState<'individual' | 'team_leader'>('individual');
  const [teamLeaderCode, setTeamLeaderCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('Direct Selling Agent (DSA)');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');

  // Form State Step 2
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [panFile, setPanFile] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [dragOverPan, setDragOverPan] = useState(false);
  const [dragOverAadhaar, setDragOverAadhaar] = useState(false);

  // Form State Step 3
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation per step
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid 10-digit phone is required';
    if (!city.trim()) errs.city = 'City is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!pan.trim() || pan.length < 10) errs.pan = 'Valid 10-character PAN is required';
    if (!aadhaar.trim() || aadhaar.length < 12) errs.aadhaar = 'Valid 12-digit Aadhaar is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!bankAccount.trim()) errs.bankAccount = 'Bank account number is required';
    if (!bankName.trim()) errs.bankName = 'Bank name is required';
    if (!ifsc.trim()) errs.ifsc = 'IFSC code is required';
    if (!accountHolder.trim()) errs.accountHolder = 'Account holder name is required';
    if (!termsAgreed) errs.terms = 'You must agree to the Terms & Conditions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    // Create partner record
    const newPartner = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      email,
      phone,
      profession,
      city,
      state: stateName,
      pan,
      status: 'kyc_submitted' as const,
      role: accountRole,
      teamCode: accountRole === 'team_leader' ? `TL-${name.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}` : '',
      joinedAt: new Date().toISOString(),
    };

    setPartner(newPartner);
    router.push('/kyc');
  };

  // Drag and drop mock handlers
  const handleDrop = (type: 'pan' | 'aadhaar', e: React.DragEvent) => {
    e.preventDefault();
    if (type === 'pan') {
      setDragOverPan(false);
      setPanFile(e.dataTransfer.files[0]?.name || 'pan_card_document.pdf');
    } else {
      setDragOverAadhaar(false);
      setAadhaarFile(e.dataTransfer.files[0]?.name || 'aadhaar_card_document.pdf');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-[var(--border)]">
        <Link href="/login" className="flex items-center gap-3">
          <img
            src="/logo-light.png"
            alt="PrimeScore Partner Network"
            className="h-10 object-contain"
          />
        </Link>

        <div className="text-xs text-[var(--ink-muted)]">
          Already registered?{' '}
          <Link href="/login" className="text-[#1B2A72] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto w-full my-8 bg-white border border-[var(--border)] p-6 sm:p-10 rounded-xs shadow-xs">
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-3">
            <span className={currentStep === 1 ? 'text-[#1B2A72] font-bold' : ''}>
              1. Personal & Profession
            </span>
            <span className={currentStep === 2 ? 'text-[#1B2A72] font-bold' : ''}>
              2. KYC Documents
            </span>
            <span className={currentStep === 3 ? 'text-[#1B2A72] font-bold' : ''}>
              3. Payout Bank Details
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-[var(--surface-2)] h-2 rounded-xs overflow-hidden flex">
            <div
              className="bg-[#1B2A72] h-full transition-all duration-300"
              style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
            />
          </div>
        </div>

        {/* STEP 1: Personal & Profession Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                Personal & Professional Details
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Select your partner account type and tell us about your background.
              </p>
            </div>

            {/* Account Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-2)]">
                Select Partner Account Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountRole('individual')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    accountRole === 'individual'
                      ? 'bg-indigo-50/50 border-[#1B2A72] ring-2 ring-[#1B2A72]/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-display font-bold text-sm text-[#1B2A72] block">Individual Partner</span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    Submit client referrals directly & earn 500 PrimePoints per case.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountRole('team_leader')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    accountRole === 'team_leader'
                      ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-slate-900">Team Leader / Agency Lead</span>
                    <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-mono-num text-[9px] font-extrabold uppercase rounded-full">
                      10% Cut
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    Onboard advisors under your roster & earn an automatic 10% override cut.
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Full Name (as per PAN) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Arjun Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <User size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.name && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="arjun.mehta@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <Envelope size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.email && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Mobile Number (WhatsApp Enabled) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                  />
                  <Phone size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.phone && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.phone}</p>}
              </div>

              <CustomSelect
                label="Primary Profession Category *"
                options={PROFESSION_OPTIONS}
                value={profession}
                onChange={(val) => setProfession(val)}
                placeholder="Select profession..."
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mumbai / Delhi / Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <MapPin size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.city && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: KYC Document Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                KYC Verification Documents
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Enter your identity details and upload proof documents for automated verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  PAN Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-sm uppercase bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                  />
                  <Cardholder size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.pan && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.pan}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Aadhaar Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012"
                    maxLength={14}
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                  />
                  <ShieldCheck size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.aadhaar && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.aadhaar}</p>}
              </div>
            </div>

            {/* Simulated Drag & Drop File Upload area 1: PAN Card */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1.5">
                Upload PAN Card Front Copy (PDF/JPG/PNG)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverPan(true); }}
                onDragLeave={() => setDragOverPan(false)}
                onDrop={(e) => handleDrop('pan', e)}
                className={`border-2 border-dashed p-6 text-center rounded-xs transition-colors cursor-pointer ${
                  dragOverPan ? 'border-[#1B2A72] bg-[#1B2A72]/5' : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
                onClick={() => setPanFile(panFile ? null : 'pan_card_arjun_mehta.pdf')}
              >
                {panFile ? (
                  <div className="flex items-center justify-center gap-3 text-[#3DAA4B]">
                    <FileText size={28} weight="fill" />
                    <div className="text-left">
                      <p className="font-semibold text-xs text-[var(--ink)]">{panFile}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">Uploaded & verified (Click to change)</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadSimple size={24} className="mx-auto text-[var(--ink-muted)]" />
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      Drag & drop your PAN file here or <span className="text-[#1B2A72] underline">browse file</span>
                    </p>
                    <p className="text-[11px] text-[var(--ink-subtle)]">Supports PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Drag & Drop File Upload area 2: Aadhaar Card */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1.5">
                Upload Aadhaar Copy (Front & Back)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverAadhaar(true); }}
                onDragLeave={() => setDragOverAadhaar(false)}
                onDrop={(e) => handleDrop('aadhaar', e)}
                className={`border-2 border-dashed p-6 text-center rounded-xs transition-colors cursor-pointer ${
                  dragOverAadhaar ? 'border-[#1B2A72] bg-[#1B2A72]/5' : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
                onClick={() => setAadhaarFile(aadhaarFile ? null : 'aadhaar_card_arjun_mehta.pdf')}
              >
                {aadhaarFile ? (
                  <div className="flex items-center justify-center gap-3 text-[#3DAA4B]">
                    <FileText size={28} weight="fill" />
                    <div className="text-left">
                      <p className="font-semibold text-xs text-[var(--ink)]">{aadhaarFile}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">Uploaded & verified (Click to change)</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadSimple size={24} className="mx-auto text-[var(--ink-muted)]" />
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      Drag & drop your Aadhaar file here or <span className="text-[#1B2A72] underline">browse file</span>
                    </p>
                    <p className="text-[11px] text-[var(--ink-subtle)]">Supports PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Bank Details & T&C */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                Bank Details for Referral Payouts
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Your commissions & cash payouts will be transferred directly to this bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Arjun Mehta"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <User size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.accountHolder && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.accountHolder}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Bank Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="HDFC Bank / ICICI Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <Bank size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.bankName && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Account Number *
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                />
                {errors.bankAccount && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.bankAccount}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  placeholder="HDFC0001234"
                  maxLength={11}
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm uppercase bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono-num"
                />
                {errors.ifsc && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.ifsc}</p>}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded-xs border-[var(--border)] text-[#1B2A72]"
                />
                <span className="text-xs text-[var(--ink-2)] leading-normal">
                  I hereby certify that all documents and information provided above are accurate and true. I agree to the{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1B2A72] font-semibold underline">
                    PrimeScore Partner Network Agreement
                  </a>{' '}
                  and consent to KYC background verification.
                </span>
              </label>
              {errors.terms && <p className="text-[11px] text-[#E63329] font-semibold">{errors.terms}</p>}
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink)] font-display font-semibold text-xs rounded-xs flex items-center gap-1.5 transition-colors border border-[var(--border)]"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-xs rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Next: {currentStep === 1 ? 'KYC Documents' : 'Bank Details'}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-6 bg-[#3DAA4B] hover:bg-[#2e883a] text-white font-display font-semibold text-xs rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle size={16} weight="fill" />
              <span>Complete Partner Registration</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[var(--ink-subtle)] py-4">
        &copy; {new Date().getFullYear()} PrimeScore Partner Network. All rights reserved.
      </div>
    </div>
  );
}
