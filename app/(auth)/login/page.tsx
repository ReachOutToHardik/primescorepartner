'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePartnerStore } from '@/lib/store';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  User,
  LockKey,
  Coins,
  Users,
  Eye,
  EyeSlash,
  Phone,
  ArrowLeft,
  LockKeyOpen,
  SealCheck,
} from '@phosphor-icons/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ForgotStep = 'phone' | 'otp' | 'newpass' | 'done';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // ── Forgot Password Flow State ─────────────────────────────────────────────
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('phone');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  // Stateless HMAC token returned by server — stored client-side for subsequent steps
  const [resetToken, setResetToken] = useState('');
  const [resetExpiresAt, setResetExpiresAt] = useState<number>(0);
  const [maskedEmail, setMaskedEmail] = useState('');

  const enterForgotMode = () => {
    setForgotMode(true);
    setForgotStep('phone');
    setForgotError('');
    setResetPhone('');
    setResetOtp('');
    setResetNewPass('');
    setResetConfirmPass('');
    setResetToken('');
    setResetExpiresAt(0);
    setMaskedEmail('');
  };

  const exitForgotMode = () => {
    setForgotMode(false);
    setForgotStep('phone');
    setForgotError('');
  };

  // Step 1 — Send OTP to phone
  const handleForgotSendOtp = async () => {
    const cleanDigits = resetPhone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setForgotError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phone: cleanDigits }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Failed to send OTP.');
        return;
      }
      setResetToken(data.token);
      setResetExpiresAt(data.expiresAt);
      setMaskedEmail(data.maskedEmail || '');
      setForgotStep('otp');
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleForgotVerifyOtp = async () => {
    if (resetOtp.length !== 6) {
      setForgotError('Please enter the 6-digit OTP sent to your mobile.');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const cleanDigits = resetPhone.replace(/\D/g, '');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', phone: cleanDigits, otp: resetOtp, token: resetToken, expiresAt: resetExpiresAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'OTP verification failed.');
        return;
      }
      setForgotStep('newpass');
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3 — Reset password
  const handleForgotResetPassword = async () => {
    if (resetNewPass.length < 8) {
      setForgotError('Password must be at least 8 characters long.');
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const cleanDigits = resetPhone.replace(/\D/g, '');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          phone: cleanDigits,
          otp: resetOtp,
          token: resetToken,
          expiresAt: resetExpiresAt,
          newPassword: resetNewPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Failed to reset password.');
        return;
      }
      setForgotStep('done');
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const { supabase } = await import('@/lib/supabase');

      const rawIdentifier = email.trim();
      const cleanDigits = rawIdentifier.replace(/\D/g, '');
      const isMobile = cleanDigits.length === 10 && !rawIdentifier.includes('@');
      const identifier = isMobile ? cleanDigits : rawIdentifier.toLowerCase();

      // ─── Step 1: Resolve email from mobile if needed ────────────────────────
      let resolvedEmail = identifier;
      if (isMobile) {
        const formattedPhone = `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;
        const { data: phoneRow, error: phoneErr } = await supabase
          .from('profiles')
          .select('email')
          .or(`phone.eq.${cleanDigits},phone.eq.${formattedPhone}`)
          .maybeSingle();

        if (phoneErr || !phoneRow?.email) {
          setError('No account found for this mobile number. Please check your details or register below.');
          setIsLoading(false);
          return;
        }
        resolvedEmail = phoneRow.email;
      }

      // ─── Step 2: Authenticate with Supabase Auth or Profile table fallback ──
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password.trim(),
      });

      let userId = authData?.user?.id;

      if (authError || !userId) {
        setError('Incorrect email/mobile or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // ─── Step 3: Auth passed — fetch or auto-create partner profile ────────
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      let profile = profileData;

      if (!profile) {
        const targetEmail = (authData.user.email || resolvedEmail).toLowerCase().trim();
        
        // First check if profile already exists by email
        const { data: profByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', targetEmail)
          .maybeSingle();

        if (profByEmail) {
          profile = profByEmail;
        } else {
          // Profile row missing in public.profiles table -> Auto-create profile row seamlessly with onConflict: 'email'
          const defaultName =
            authData.user.user_metadata?.name ||
            authData.user.user_metadata?.full_name ||
            targetEmail.split('@')[0] ||
            'Partner User';

          const newProfileRow = {
            id: authData.user.id,
            name: defaultName,
            email: targetEmail,
            phone: authData.user.user_metadata?.phone || '',
            profession: authData.user.user_metadata?.profession || 'Financial Consultant',
            city: authData.user.user_metadata?.city || 'Mumbai',
            state: authData.user.user_metadata?.state || 'Maharashtra',
            status: 'kyc_approved',
            role: 'individual',
            team_code: 'PS-' + authData.user.id.substring(0, 6).toUpperCase(),
            created_at: new Date().toISOString(),
            joined_at: new Date().toISOString(),
            prime_points: 100,
          };

          try {
            const { data: upsertedProf } = await supabase
              .from('profiles')
              .upsert(newProfileRow, { onConflict: 'email' })
              .select('*')
              .maybeSingle();

            profile = upsertedProf || (newProfileRow as any);
          } catch (err) {
            console.warn('Profile auto-create fallback note:', err);
            profile = newProfileRow as any;
          }
        }
      }

      // Enforce status checks after auth
      if (profile.status === 'kyc_rejected') {
        await supabase.auth.signOut();
        setError('Your partner application was declined. Please contact partner@primescore.in for assistance.');
        setIsLoading(false);
        return;
      }

      // Write Remember Me preference before session is stored
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          window.localStorage.setItem('primescore-remember-me', 'true');
        } else {
          window.localStorage.removeItem('primescore-remember-me');
        }
      }

      usePartnerStore.setState({
        partner: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          profession: profile.profession || '',
          city: profile.city || '',
          state: profile.state || '',
          pan: profile.pan || '',
          aadhaar: profile.aadhaar || '',
          status: profile.status,
          role: profile.role,
          teamCode: profile.team_code || '',
          userReferralCode: profile.user_referral_code || profile.team_code || '',
          joinedAt: profile.joined_at || profile.created_at,
          kycSubmittedAt: profile.kyc_submitted_at || profile.created_at,
          isEmailVerified: profile.is_email_verified !== false,
          profilePhoto: profile.avatar_url || undefined,
          referredByLeaderId: profile.referred_by_leader_id || undefined,
        },
        isAuthenticated: true,
      });

      setIsNavigating(true);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isNavigating) {
    return <LoadingSpinner message="Opening Primescore Partner Dashboard..." />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0F1A4E] lg:bg-[var(--surface)] text-[var(--ink)]">
      {/* Left Side - Deep Navy Hero */}
      <div className="lg:col-span-5 bg-[#0F1A4E] text-white p-6 pb-0 lg:p-12 flex flex-col justify-start lg:justify-between relative overflow-hidden">
        {/* Background Graphic Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 border border-white/10 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 border border-white/10 rounded-full -ml-32 -mb-32 pointer-events-none" />

        {/* Top Header & Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo-light.png"
              alt="PrimeScore Partner Network"
              className="h-9 lg:h-11 object-contain"
            />
          </div>

          <div className="mt-4 lg:mt-12 space-y-2 lg:space-y-4">
            <h1 className="font-display text-xl sm:text-2xl lg:text-4xl font-bold leading-tight text-white">
              Empower your clients. <br />
              <span className="text-[#F5C518]">Earn recurring rewards.</span>
            </h1>
            <p className="text-slate-300 text-xs lg:text-base leading-relaxed">
              India&apos;s leading credit rectification and bureau advisory referral platform for DSAs, CAs, Financial Advisors, and Consultants.
            </p>
          </div>
        </div>

        {/* Key Partner Metrics Grid (Hidden on Mobile) */}
        <div className="relative z-10 my-8 hidden lg:block">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1B2A72] border border-white/15 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-[#F5C518] mb-1">
                <Coins size={20} weight="fill" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Resolved Cases
                </span>
              </div>
              <p className="font-mono-num font-bold text-2xl text-white">4,800+</p>
              <p className="text-xs text-slate-300 mt-1">Credit reports & rectifications</p>
            </div>

            <div className="bg-[#1B2A72] border border-white/15 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-[#3DAA4B] mb-1">
                <Users size={20} weight="fill" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Active Network
                </span>
              </div>
              <p className="font-mono-num font-bold text-2xl text-white">1,200+</p>
              <p className="text-xs text-slate-300 mt-1">DSAs, CAs & Consultants</p>
            </div>
          </div>

          {/* Value Props */}
          <div className="mt-6 space-y-2.5 text-xs lg:text-sm text-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-[#3DAA4B]" weight="fill" />
              <span>Up to ₹5,000 commission or 500 PrimePoints per referral</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-[#3DAA4B]" weight="fill" />
              <span>Live 5-stage referral tracking dashboard</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-[#3DAA4B]" weight="fill" />
              <span>Instant gift card redemptions (Amazon, Flipkart, Swiggy)</span>
            </div>
          </div>
        </div>

        {/* Testimonials marquee (Hidden on Mobile) */}
        <div className="relative z-10 -mx-8 lg:-mx-12 overflow-hidden py-2 hidden lg:block">
          <div className="flex gap-4 animate-marquee w-max px-4">
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img src="/partner1.jpg" alt="Sandip Sharma" className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] text-slate-200 italic leading-snug line-clamp-3">
                  &ldquo;PrimeScore helped my home loan clients fix bureau errors fast. Plus, I earned great referral points!&rdquo;
                </p>
                <div>
                  <p className="font-display font-bold text-xs text-white">Sandip Sharma</p>
                  <p className="text-[10px] text-slate-300 font-mono-num">Senior DSA Consultant, Delhi</p>
                </div>
              </div>
            </div>
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img src="/partner2.jpg" alt="Sachin Verma" className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] text-slate-200 italic leading-snug line-clamp-3">
                  &ldquo;Seamless 5-stage tracking for my CIBIL rectification clients. Instant voucher redemptions are top notch.&rdquo;
                </p>
                <div>
                  <p className="font-display font-bold text-xs text-white">Sachin Verma</p>
                  <p className="text-[10px] text-slate-300 font-mono-num">Chartered Accountant (CA), Mumbai</p>
                </div>
              </div>
            </div>
            {/* Duplicated for infinite scroll */}
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img src="/partner1.jpg" alt="Sandip Sharma" className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] text-slate-200 italic leading-snug line-clamp-3">
                  &ldquo;PrimeScore helped my home loan clients fix bureau errors fast. Plus, I earned great referral points!&rdquo;
                </p>
                <div>
                  <p className="font-display font-bold text-xs text-white">Sandip Sharma</p>
                  <p className="text-[10px] text-slate-300 font-mono-num">Senior DSA Consultant, Delhi</p>
                </div>
              </div>
            </div>
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img src="/partner2.jpg" alt="Sachin Verma" className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] text-slate-200 italic leading-snug line-clamp-3">
                  &ldquo;Seamless 5-stage tracking for my CIBIL rectification clients. Instant voucher redemptions are top notch.&rdquo;
                </p>
                <div>
                  <p className="font-display font-bold text-xs text-white">Sachin Verma</p>
                  <p className="text-[10px] text-slate-300 font-mono-num">Chartered Accountant (CA), Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Left Hero Bottom Corner Footer */}
        <div className="relative z-10 pt-4 hidden lg:block text-[11px] text-slate-300 font-medium whitespace-nowrap overflow-x-auto no-scrollbar">
          <p className="inline-flex items-center gap-1.5">
            <span>&copy; 2026 Primescore. All rights reserved.</span>
            <a href="mailto:partner@primescore.in" className="text-slate-300 hover:text-white font-normal hover:underline">
              partner@primescore.in
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Login Form / Forgot Password (Seamless Deep Navy Background on Mobile) */}
      <div className="lg:col-span-7 flex flex-col justify-start lg:justify-between items-center px-6 py-4 lg:p-12 bg-[#0F1A4E] lg:bg-[var(--surface)] min-h-0 lg:min-h-screen">
        <div className="w-full max-w-md lg:my-auto space-y-4 sm:space-y-6">

          {/* ── FORGOT PASSWORD FLOW ── */}
          {forgotMode ? (
            <>
              {/* Back button + header */}
              <div>
                <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-white/10 lg:border-slate-200">
                  <button
                    type="button"
                    onClick={exitForgotMode}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 lg:text-slate-600 hover:text-white lg:hover:text-slate-900 font-semibold transition-colors py-1"
                  >
                    <ArrowLeft size={14} weight="bold" />
                    Back to Sign In
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/10 text-white lg:bg-[#1B2A72]/10 lg:text-[#1B2A72] border border-white/20 lg:border-[#1B2A72]/20 rounded-xs">
                    <LockKeyOpen size={14} weight="bold" />
                    {forgotStep === 'phone' && 'Reset Password'}
                    {forgotStep === 'otp' && 'Verify OTP'}
                    {forgotStep === 'newpass' && 'Set New Password'}
                    {forgotStep === 'done' && 'Password Updated'}
                  </span>
                </div>

                {forgotStep !== 'done' && (
                  <div className="space-y-1 mb-6">
                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-white lg:text-[var(--ink)] tracking-tight">
                      {forgotStep === 'phone' && 'Enter your mobile number'}
                      {forgotStep === 'otp' && 'Check your messages'}
                      {forgotStep === 'newpass' && 'Create a new password'}
                    </h2>
                    <p className="text-sm text-slate-300 lg:text-[var(--ink-muted)] mt-1">
                      {forgotStep === 'phone' && 'We will send a one-time verification code to your registered mobile number.'}
                      {forgotStep === 'otp' && `Enter the 6-digit OTP sent to ${resetPhone.replace(/\D/g,'').replace(/(\d{5})(\d{5})/, '$1 $2')}${maskedEmail ? `. Your account is linked to ${maskedEmail}` : ''}.`}
                      {forgotStep === 'newpass' && 'OTP verified. Enter and confirm your new password.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {forgotError && (
                <div className="p-3.5 text-xs bg-[#FDECEA] border border-[#E63329] text-[#E63329] rounded-xl font-semibold leading-relaxed">
                  {forgotError}
                </div>
              )}

              {/* Step 1: Phone number */}
              {forgotStep === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)] mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        id="reset-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={(e) => e.key === 'Enter' && handleForgotSendOtp()}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 placeholder:text-slate-400 font-medium pr-10 tracking-widest"
                      />
                      <Phone size={18} className="absolute right-3 top-3 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 lg:text-slate-500 mt-1.5">Use the same number you registered with on this portal.</p>
                  </div>
                  <button
                    id="reset-send-otp-btn"
                    onClick={handleForgotSendOtp}
                    disabled={forgotLoading || resetPhone.replace(/\D/g,'').length !== 10}
                    className="w-full py-3 bg-[#1B2A72] lg:bg-[var(--ink)] hover:bg-[#152059] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Sending OTP...</span></>
                    ) : (
                      <><span>Send OTP via SMS</span><ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: OTP */}
              {forgotStep === 'otp' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)] mb-1.5">
                      6-Digit OTP
                    </label>
                    <input
                      id="reset-otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotVerifyOtp()}
                      className="w-full px-3.5 py-3 text-xl tracking-[0.5em] text-center bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 font-mono font-bold"
                    />
                    <p className="text-[11px] text-slate-400 lg:text-slate-500 mt-1.5">This OTP expires in 10 minutes. Do not share it with anyone.</p>
                  </div>
                  <button
                    id="reset-verify-otp-btn"
                    onClick={handleForgotVerifyOtp}
                    disabled={forgotLoading || resetOtp.length !== 6}
                    className="w-full py-3 bg-[#1B2A72] lg:bg-[var(--ink)] hover:bg-[#152059] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Verifying...</span></>
                    ) : (
                      <><span>Verify OTP</span><ArrowRight size={16} /></>
                    )}
                  </button>
                  <button
                    onClick={() => { setForgotStep('phone'); setForgotError(''); setResetOtp(''); }}
                    className="w-full text-xs text-slate-400 hover:text-white lg:hover:text-slate-700 text-center py-1 transition-colors"
                  >
                    Didn&apos;t receive the OTP? Go back and resend
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 'newpass' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-new-password"
                        type={showResetPass ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        value={resetNewPass}
                        onChange={(e) => setResetNewPass(e.target.value)}
                        autoComplete="new-password"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 font-medium"
                      />
                      <button type="button" onClick={() => setShowResetPass(!showResetPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showResetPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)] mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-confirm-password"
                        type={showResetConfirm ? 'text' : 'password'}
                        placeholder="Re-enter your new password"
                        value={resetConfirmPass}
                        onChange={(e) => setResetConfirmPass(e.target.value)}
                        autoComplete="new-password"
                        onKeyDown={(e) => e.key === 'Enter' && handleForgotResetPassword()}
                        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 font-medium"
                      />
                      <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showResetConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {resetNewPass.length > 0 && resetConfirmPass.length > 0 && resetNewPass === resetConfirmPass && (
                    <p className="text-xs text-emerald-400 lg:text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={13} weight="fill" /> Passwords match
                    </p>
                  )}
                  <button
                    id="reset-submit-btn"
                    onClick={handleForgotResetPassword}
                    disabled={forgotLoading || resetNewPass.length < 8 || resetNewPass !== resetConfirmPass}
                    className="w-full py-3 bg-[#1B2A72] lg:bg-[var(--ink)] hover:bg-[#152059] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Updating password...</span></>
                    ) : (
                      <><span>Set New Password</span><ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              )}

              {/* Step 4: Done */}
              {forgotStep === 'done' && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 lg:bg-emerald-50 flex items-center justify-center mx-auto">
                    <SealCheck size={36} weight="fill" className="text-emerald-400 lg:text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white lg:text-[var(--ink)] mb-2">
                      Password Updated!
                    </h3>
                    <p className="text-sm text-slate-300 lg:text-[var(--ink-muted)] leading-relaxed">
                      Your Primescore Partner account password has been successfully changed. Sign in with your new password.
                    </p>
                  </div>
                  <button
                    id="reset-done-back-btn"
                    onClick={exitForgotMode}
                    className="w-full py-3 bg-[#1B2A72] lg:bg-[var(--ink)] hover:bg-[#152059] text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Sign In with New Password</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ── NORMAL LOGIN FORM ── */}
              {/* Header */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/10 text-white lg:bg-[#1B2A72]/10 lg:text-[#1B2A72] border border-white/20 lg:border-[#1B2A72]/20 rounded-xs mb-3">
                  <ShieldCheck size={14} weight="bold" /> Secured Partner Portal
                </span>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-white lg:text-[var(--ink)] tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-sm text-slate-300 lg:text-[var(--ink-muted)] mt-1">
                  Access your referral dashboard, track payouts, and redeem PrimePoints.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 text-xs bg-[#FDECEA] border border-[#E63329] text-[#E63329] rounded-xl font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)] mb-1.5">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="login-email"
                      placeholder="Email Address or Mobile Number"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                    <User size={18} className="absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 lg:text-[var(--ink-2)]">
                      Password
                    </label>
                    <button
                      type="button"
                      id="forgot-password-btn"
                      onClick={enterForgotMode}
                      className="text-xs text-[#F5C518] lg:text-[#1B2A72] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#F5C518] lg:focus:border-[#1B2A72] focus:ring-1 text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 lg:text-[var(--ink-2)]">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-xs border-slate-400 text-[#1B2A72] cursor-pointer"
                    />
                    <span>Remember me for 7 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1B2A72] lg:bg-[var(--ink)] hover:bg-[#152059] lg:hover:bg-[#000000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Register Link */}
              <div className="pt-3 border-t border-white/15 lg:border-[var(--border)] text-center text-xs text-slate-300 lg:text-[var(--ink-muted)]">
                Don&apos;t have a partner account yet?{' '}
                <Link href="/register" className="text-[#F5C518] lg:text-[#1B2A72] font-bold hover:underline">
                  Register as Partner &rarr;
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Desktop & Mobile Footer Links */}
        <div className="w-full pt-4 text-center text-[10px] sm:text-xs text-slate-400 font-medium space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-slate-300 lg:text-slate-500">
            <Link href="/privacy" className="hover:text-amber-400 lg:hover:text-[#1B2A72] transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-amber-400 lg:hover:text-[#1B2A72] transition">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-amber-400 lg:hover:text-[#1B2A72] transition">Payout Policy</Link>
          </div>
          <p className="inline-flex items-center justify-center gap-1.5 text-slate-400 lg:text-[var(--ink-muted)]">
            <span>&copy; {new Date().getFullYear()} Primescore. All rights reserved.</span>
            <a href="mailto:partner@primescore.in" className="text-slate-300 lg:text-[var(--ink)] font-semibold hover:underline">
              partner@primescore.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
