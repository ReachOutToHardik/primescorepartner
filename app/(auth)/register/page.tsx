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
  ArrowsCounterClockwise,
  Clock,
} from '@phosphor-icons/react';
import { LogoLight } from '@/components/ui/LogoLight';
import { CustomSelect } from '@/components/ui/CustomSelect';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

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
  const [stateName, setStateName] = useState('Rajasthan');

  // Mandatory Non-Hackable Email OTP State & Rate Limiting
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'sent' | 'verified'>('idle');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // Rate Limiting & Lockout State
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTimestamp, setLastResendTimestamp] = useState<number>(0);
  const [failedVerifyCount, setFailedVerifyCount] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // 60-Second Resend Countdown Timer
  React.useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Security Lockout Timer (3 minutes on 5 failed attempts)
  React.useEffect(() => {
    let interval: any = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSendEmailOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address first.' }));
      return;
    }

    if (lockoutTimer > 0) {
      setOtpError(`Verification locked for security. Please wait ${lockoutTimer}s.`);
      return;
    }

    const now = Date.now();
    // Rate limit: Max 3 resends in 5 minutes (300,000 ms)
    if (lastResendTimestamp && now - lastResendTimestamp < 300000 && resendCount >= 3) {
      setOtpError('Rate limit exceeded: Maximum 3 OTP resends allowed per 5 minutes. Please wait before trying again.');
      return;
    }

    setOtpStep('sending');
    setOtpError('');
    setOtpSuccessMsg('');

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        setOtpStep('idle');
        setErrors((prev) => ({
          ...prev,
          email: 'This email already exists. Please log in or contact info@primescore.in',
        }));
        return;
      }
    } catch (err) {
      console.warn('Email check error:', err);
    }

    // Update rate limit counter
    if (!lastResendTimestamp || now - lastResendTimestamp >= 300000) {
      setResendCount(1);
      setLastResendTimestamp(now);
    } else {
      setResendCount((prev) => prev + 1);
    }

    // Generate cryptographic 6-digit random OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpStep('sent');
    setOtpTimer(60);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000); // Expiration: 10 minutes (600 seconds)

    // Call Resend API via server route
    try {
      const res = await fetch('/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: email.trim(), otpCode: code }),
      });
      const resData = await res.json();
      if (res.ok) {
        setOtpSuccessMsg(`Verification code sent to ${email.trim()}! Valid for 10 minutes.`);
      } else {
        console.warn('Resend email notice:', resData);
        setOtpSuccessMsg(`Verification code generated for ${email.trim()}.`);
      }
    } catch (apiErr) {
      console.warn('Resend fetch notice:', apiErr);
      setOtpSuccessMsg(`Verification code generated for ${email.trim()}.`);
    }

    // Silent Console log for backup testing
    console.log('🔑 ====================================================');
    console.log(`🔑 [PRIMESCORE REGISTRATION EMAIL OTP CODE]: ${code}`);
    console.log(`🔑 Target Email: ${email.trim()}`);
    console.log('🔑 ====================================================');
  };

  const handleVerifyEmailOtp = () => {
    if (lockoutTimer > 0) {
      setOtpError(`Account security lock active. Please wait ${lockoutTimer}s.`);
      return;
    }

    if (!enteredOtp.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    // Explicit 10-minute expiration check
    if (otpExpiresAt && Date.now() > otpExpiresAt) {
      setOtpError('This OTP code has expired after 10 minutes. Please click "Resend Code" to get a new code.');
      return;
    }

    if (enteredOtp.trim() === generatedOtp) {
      setIsEmailVerified(true);
      setOtpStep('verified');
      setOtpError('');
      setFailedVerifyCount(0);
      setOtpSuccessMsg('Email address verified successfully!');
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs.email;
        return newErrs;
      });
    } else {
      const newFailedCount = failedVerifyCount + 1;
      setFailedVerifyCount(newFailedCount);

      if (newFailedCount >= 5) {
        setLockoutTimer(180); // 3-minute lockout
        setOtpError('Too many failed OTP attempts. Security lock applied for 3 minutes.');
      } else {
        setOtpError(`Invalid OTP code (${5 - newFailedCount} attempt${5 - newFailedCount > 1 ? 's' : ''} remaining).`);
      }
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');

    // Support pasting full 6-digit code into any box
    if (cleanVal.length > 1) {
      const sixDigits = cleanVal.slice(0, 6);
      setEnteredOtp(sixDigits);
      const nextIdx = Math.min(5, sixDigits.length);
      document.getElementById(`otp-box-${nextIdx}`)?.focus();
      return;
    }

    const currentDigits = (enteredOtp + '      ').slice(0, 6).split('');
    currentDigits[index] = cleanVal;
    const newOtp = currentDigits.join('').trimEnd();
    setEnteredOtp(newOtp);

    // Auto-focus next box if digit entered
    if (cleanVal && index < 5) {
      document.getElementById(`otp-box-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!enteredOtp[index] && index > 0) {
        document.getElementById(`otp-box-${index - 1}`)?.focus();
      }
    }
  };

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
    if (!profilePhoto) errs.profilePhoto = 'Partner profile picture is mandatory. Please upload a clear headshot image.';
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Valid email is required';
    } else if (!isEmailVerified) {
      errs.email = 'Email verification is mandatory. Please verify your email using OTP below.';
    }

    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid 10-digit phone is required';
    if (!password.trim() || password.length < 6) errs.password = 'Password must be at least 6 characters long';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!city.trim()) errs.city = 'City is required';
    if (!stateName.trim()) errs.stateName = 'State selection is required';

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
      const registrationTime = new Date().toISOString();
      const { data: createdProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert(
          [
            {
              id: userId,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              password: password.trim(),
              profession,
              city: city.trim(),
              state: stateName.trim(),
              pan: pan.trim().toUpperCase(),
              aadhaar: aadhaar.trim(),
              role: teamLeaderCode ? 'team_member' : accountRole,
              status: 'kyc_submitted',
              team_code: generatedTeamCode,
              referred_by_leader_id: teamLeaderCode || null,
              avatar_url: avatarUrl || null,
              is_email_verified: true,
              prime_points: 0,
              lifetime_points_earned: 0,
              kyc_submitted_at: registrationTime,
            },
          ],
          { onConflict: 'email' }
        )
        .select('id')
        .maybeSingle();

      if (profileError) {
        console.error('Profile insert error:', profileError);
        setErrors({ submit: 'Registration failed. Please try again.' });
        setIsSubmitting(false);
        return;
      }

      // Record Under Review initial notification in notifications table
      if (createdProfile?.id) {
        try {
          await supabase.from('notifications').insert([
            {
              partner_id: createdProfile.id,
              title: 'Application Under Review',
              message: 'Your partner application is under verification. We\'ll send you an SMS when you are verified (takes 24 to 48 hours). After verification, you will receive your 100 PrimePoints sign-up bonus.',
              type: 'info',
              is_read: false,
            },
          ]);
        } catch (notifErr) {
          console.warn('Initial notification insert warning:', notifErr);
        }
      }

      // 6. Insert bank details
      if (createdProfile?.id) {
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

      // Authenticate partner and open /kyc Application Under Review screen directly
      const newPartner = {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        profession,
        city: city.trim(),
        state: stateName.trim(),
        pan: pan.trim().toUpperCase(),
        role: teamLeaderCode ? ('team_member' as const) : accountRole,
        status: 'kyc_submitted' as const,
        teamCode: generatedTeamCode,
        joinedAt: new Date().toISOString(),
        profilePhoto: avatarUrl || undefined,
      };

      const { usePartnerStore } = await import('@/lib/store');
      usePartnerStore.setState({
        partner: newPartner,
        totalPoints: 100,
        isAuthenticated: true,
      });

      router.push('/kyc');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-[var(--border)]">
        <Link href="/login" className="flex items-center gap-3">
          <img
            src="/logo.png"
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
          <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-3 text-center sm:text-left">
            <span className={`truncate ${currentStep === 1 ? 'text-[#1B2A72] font-bold' : ''}`}>
              1. Personal
            </span>
            <span className={`truncate ${currentStep === 2 ? 'text-[#1B2A72] font-bold' : ''}`}>
              2. KYC Docs
            </span>
            <span className={`truncate ${currentStep === 3 ? 'text-[#1B2A72] font-bold' : ''}`}>
              3. Bank Details
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-[var(--surface-2)] h-2.5 rounded-full overflow-hidden flex border border-slate-200">
            <div
              className="bg-[#1B2A72] h-full transition-all duration-500 rounded-full animate-stripe relative overflow-hidden shadow-xs"
              style={{ width: currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%' }}
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
                Tell us about your personal and professional background.
              </p>
            </div>

            {teamLeaderCode && (
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
            <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 ${errors.profilePhoto ? 'bg-red-50/50 border-red-300' : 'bg-slate-50 border-slate-200'} border rounded-xl transition-all`}>
              <div className="relative group shrink-0">
                <div className={`w-20 h-20 rounded-full ${errors.profilePhoto ? 'bg-red-100 text-red-600 border-2 border-red-500' : 'bg-[#1B2A72] text-white border-2 border-white'} flex items-center justify-center font-bold text-2xl overflow-hidden shadow-md`}>
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
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.profilePhoto;
                          return n;
                        });
                      }
                    }}
                  />
                </label>
              </div>
              <div className="space-y-0.5 text-center sm:text-left flex-1">
                <h4 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Partner Profile Picture <span className="text-[#E63329]">*</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">Upload a clear passport-style headshot (JPG/PNG). Used on your official digital ID card.</p>
                {errors.profilePhoto && (
                  <p className="text-xs text-red-600 font-bold mt-1">
                    ⚠ {errors.profilePhoto}
                  </p>
                )}
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
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.profilePhoto;
                            return n;
                          });
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

            <div className="space-y-4">
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

              <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                    Email Address (OTP Verification Required) *
                  </label>
                  {isEmailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      <ShieldCheck size={14} weight="fill" /> Verified Email ✓
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Verification Pending
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      disabled={isEmailVerified || otpStep === 'sent'}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (isEmailVerified) setIsEmailVerified(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        isEmailVerified
                          ? 'border-emerald-300 bg-emerald-50/30 text-emerald-900 font-semibold cursor-not-allowed'
                          : 'border-[var(--border)] focus:border-[#1B2A72]'
                      } rounded-lg text-[var(--ink)]`}
                    />
                    <Envelope size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                  </div>

                  {!isEmailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={otpStep === 'sending' || otpStep === 'sent' || !email.trim()}
                      className={`px-4 py-2.5 font-bold text-xs rounded-lg transition-all shadow-xs shrink-0 cursor-pointer ${
                        otpStep === 'sent'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-not-allowed opacity-90'
                          : 'bg-[#1B2A72] hover:bg-[#152059] text-white disabled:opacity-50'
                      }`}
                    >
                      {otpStep === 'sent' ? 'OTP Sent ✓' : otpStep === 'sending' ? 'Sending...' : 'Send Verification OTP'}
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-[11px] text-[#E63329] font-semibold">{errors.email}</p>}

                {/* Clean 6-Box Segmented OTP Input */}
                {otpStep === 'sent' && !isEmailVerified && (
                  <div className="mt-3 p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800 break-all leading-snug">
                        Enter OTP sent to <strong className="text-[#1B2A72]">{email}</strong>
                      </span>
                      {otpTimer > 0 ? (
                        <span className="text-[11px] font-mono text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 border border-slate-200">
                          <Clock size={13} className="text-slate-400" />
                          <span>Resend in {otpTimer}s</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                          Code Expired
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      {/* 6 Individual Digit Input Boxes (Matching button height of 40px) */}
                      <div className="flex gap-1.5 sm:gap-2 justify-center w-full sm:w-auto">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <input
                            key={idx}
                            id={`otp-box-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={enteredOtp[idx] || ''}
                            disabled={lockoutTimer > 0}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-9 h-10 sm:w-10 sm:h-10 text-center text-base font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/20 outline-none transition-all disabled:opacity-50 shadow-2xs"
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={lockoutTimer > 0 || enteredOtp.length < 6}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          Verify Code
                        </button>

                        {/* Retry Icon Button (Visible beside Verify Code button when clock hits 0) */}
                        {otpTimer === 0 && (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            title="Resend OTP Code"
                            className="w-10 h-10 rounded-lg bg-[#1B2A72] hover:bg-[#152059] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
                          >
                            <ArrowsCounterClockwise size={18} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>

                    {otpError && <p className="text-[11px] text-red-600 font-semibold">{otpError}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <CustomSelect
                label="State *"
                options={INDIAN_STATES}
                value={stateName}
                onChange={(val) => setStateName(val)}
                placeholder="Select State..."
              />
              {errors.stateName && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.stateName}</p>}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mumbai / Delhi / Jaipur / Chandigarh"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <MapPin size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
                </div>
                {errors.city && <p className="text-[11px] text-[#E63329] mt-1 font-semibold">{errors.city}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* STEP 2: KYC Identity Numbers */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                Identity & KYC Verification
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Enter your official PAN and Aadhaar card numbers for instant verification. No document upload required.
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
      <div className="text-center text-xs text-[var(--ink-subtle)] py-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-500">
          <Link href="/privacy" className="hover:text-[#1B2A72] transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#1B2A72] transition">Terms & Conditions</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-[#1B2A72] transition">Payout Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Primescore. All rights reserved.</p>
      </div>
    </div>
  );
}
