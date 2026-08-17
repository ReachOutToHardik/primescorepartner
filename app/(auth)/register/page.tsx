'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Camera,
  LockKey,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { LogoLight } from '@/components/ui/LogoLight';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function RegisterPage() {
  const router = useRouter();

  // Multi-step form step control
  const [currentStep, setCurrentStep] = useState(1);

  // Form State Step 1
  const [accountRole, setAccountRole] = useState<'individual' | 'team_leader'>('individual');
  const [teamLeaderCode, setTeamLeaderCode] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profession, setProfession] = useState('Direct Selling Agent (DSA)');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');

  // Read ref URL param on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        setTeamLeaderCode(refCode);
      }
    }
  }, []);

  // Form State Step 2
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFileName, setPanFileName] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState<string | null>(null);
  const [dragOverPan, setDragOverPan] = useState(false);
  const [dragOverAadhaar, setDragOverAadhaar] = useState(false);
  const panInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  // Form State Step 3
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Async duplicate email and phone check against Supabase
  const validateStep1 = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid 10-digit phone is required';
    if (!password.trim() || password.length < 6) errs.password = 'Password must be at least 6 characters long';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!city.trim()) errs.city = 'City is required';

    if (Object.keys(errs).length === 0) {
      try {
        const { supabase } = await import('@/lib/supabase');
        // Check duplicate email
        const { data: existingEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (existingEmail) {
          errs.email = 'This email is already registered. Please sign in instead.';
        }

        // Check duplicate phone
        const { data: existingPhone } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', phone.trim())
          .maybeSingle();

        if (existingPhone) {
          errs.phone = 'This mobile number is already registered.';
        }
      } catch (err) {
        console.warn('Duplicate check warning:', err);
      }
    }

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

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setIsSubmitting(true);

    const generatedTeamCode = accountRole === 'team_leader'
      ? `TL-${name.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`
      : `IND-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    try {
      const { supabase } = await import('@/lib/supabase');

      // 1. Attempt Supabase Auth user signup or fallback to direct UUID
      let userId = '';
      const { data: authData } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: { name, role: accountRole },
        },
      });

      if (authData?.user?.id) {
        userId = authData.user.id;
      } else {
        userId = crypto.randomUUID();
      }

      // 2. Upload PAN file to Supabase Storage
      let panFileUrl = '';
      if (panFile && userId) {
        const { data: panUpload } = await supabase.storage
          .from('kyc-documents')
          .upload(`${userId}/pan_${pan}.${panFile.name.split('.').pop()}`, panFile, { upsert: true });
        if (panUpload) {
          const { data: panUrlData } = supabase.storage.from('kyc-documents').getPublicUrl(panUpload.path);
          panFileUrl = panUrlData?.publicUrl || '';
        }
      }

      // 3. Upload Aadhaar file to Supabase Storage
      let aadhaarFileUrl = '';
      if (aadhaarFile && userId) {
        const { data: aadhaarUpload } = await supabase.storage
          .from('kyc-documents')
          .upload(`${userId}/aadhaar_${aadhaar}.${aadhaarFile.name.split('.').pop()}`, aadhaarFile, { upsert: true });
        if (aadhaarUpload) {
          const { data: aadhaarUrlData } = supabase.storage.from('kyc-documents').getPublicUrl(aadhaarUpload.path);
          aadhaarFileUrl = aadhaarUrlData?.publicUrl || '';
        }
      }

      // 4. Upload profile photo to Supabase Storage (avatars bucket)
      let avatarUrl = '';
      if (profilePhoto && userId && profilePhoto.startsWith('blob:')) {
        const blob = await fetch(profilePhoto).then((r) => r.blob());
        const { data: avatarUpload } = await supabase.storage
          .from('avatars')
          .upload(`${userId}/avatar.jpg`, blob, { upsert: true, contentType: 'image/jpeg' });
        if (avatarUpload) {
          const { data: avatarUrlData } = supabase.storage.from('avatars').getPublicUrl(avatarUpload.path);
          avatarUrl = avatarUrlData?.publicUrl || '';
        }
      }

      // 5. Insert profile row (id = auth user id)
      const { data: createdProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            profession,
            city: city.trim(),
            state: stateName.trim(),
            pan: pan.trim().toUpperCase(),
            role: teamLeaderCode ? 'team_member' : accountRole,
            status: 'kyc_submitted',
            team_code: generatedTeamCode,
            referred_by_leader_id: teamLeaderCode || null,
            avatar_url: avatarUrl || null,
            prime_points: 0,
          },
        ])
        .select('id')
        .single();

      if (profileError) {
        console.error('Profile insert error:', profileError);
        setErrors({ submit: 'Registration failed. Please try again.' });
        setIsSubmitting(false);
        return;
      }

      // 6. Insert KYC documents
      if (createdProfile?.id) {
        await supabase.from('kyc_documents').insert([
          {
            partner_id: createdProfile.id,
            document_type: 'pan_card',
            file_url: panFileUrl,
            document_number: pan.trim().toUpperCase(),
            verification_status: 'kyc_submitted',
          },
          {
            partner_id: createdProfile.id,
            document_type: 'aadhaar_front',
            file_url: aadhaarFileUrl,
            document_number: aadhaar.trim(),
            verification_status: 'kyc_submitted',
          },
        ]);

        // 7. Insert bank details
        await supabase.from('bank_accounts').insert([
          {
            partner_id: createdProfile.id,
            account_holder_name: accountHolder.trim(),
            bank_name: bankName.trim(),
            account_number: bankAccount.trim(),
            ifsc_code: ifsc.trim().toUpperCase(),
            is_verified: false,
          },
        ]);
      }

      router.push('/kyc');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real file upload handlers
  const handleFilePick = (type: 'pan' | 'aadhaar', file: File) => {
    if (type === 'pan') {
      setPanFile(file);
      setPanFileName(file.name);
    } else {
      setAadhaarFile(file);
      setAadhaarFileName(file.name);
    }
  };

  const handleDrop = (type: 'pan' | 'aadhaar', e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFilePick(type, file);
    if (type === 'pan') setDragOverPan(false);
    else setDragOverAadhaar(false);
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

            {/* Account Role Selector (Only shown if NOT invited via Team Leader link) */}
            {!teamLeaderCode ? (
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
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                      Onboard advisors under your roster & earn override points.
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Clean Referral Banner without 10% cut mention */
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <span>Attached Team Leader Code:</span>
                  <span className="font-mono text-[#1B2A72] bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs font-extrabold">
                    {teamLeaderCode}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct Partner Registration
                </span>
              </div>
            )}

            {/* Profile Photo Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#1B2A72] text-white flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white shadow-md">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name.substring(0, 1).toUpperCase() : <User size={32} />}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full cursor-pointer shadow-md transition-all">
                  <Camera size={14} weight="bold" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProfilePhoto(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">Partner Profile Picture</h4>
                <p className="text-xs text-slate-500 font-medium">Upload a clear passport-style headshot (JPG/PNG). Used on your official digital ID card.</p>
                <div className="pt-1 flex justify-center sm:justify-start gap-2">
                  <label className="text-[11px] font-bold text-[#1B2A72] hover:underline cursor-pointer">
                    Browse File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfilePhoto(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setProfilePhoto(null)}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.confirmPassword}</p>}
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

            {/* Real File Upload: PAN Card */}
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
                onClick={() => panInputRef.current?.click()}
              >
                <input
                  ref={panInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilePick('pan', f); }}
                />
                {panFileName ? (
                  <div className="flex items-center justify-center gap-3 text-[#3DAA4B]">
                    <FileText size={28} weight="fill" />
                    <div className="text-left">
                      <p className="font-semibold text-xs text-[var(--ink)]">{panFileName}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">File selected (Click to change)</p>
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

            {/* Real File Upload: Aadhaar Card */}
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
                onClick={() => aadhaarInputRef.current?.click()}
              >
                <input
                  ref={aadhaarInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilePick('aadhaar', f); }}
                />
                {aadhaarFileName ? (
                  <div className="flex items-center justify-center gap-3 text-[#3DAA4B]">
                    <FileText size={28} weight="fill" />
                    <div className="text-left">
                      <p className="font-semibold text-xs text-[var(--ink)]">{aadhaarFileName}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">File selected (Click to change)</p>
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
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-[#3DAA4B] hover:bg-[#2e883a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-semibold text-xs rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="fill" />
                  <span>Complete Partner Registration</span>
                </>
              )}
            </button>
          )}
          {errors.submit && (
            <p className="text-[11px] text-[#E63329] font-semibold text-right mt-2">{errors.submit}</p>
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
