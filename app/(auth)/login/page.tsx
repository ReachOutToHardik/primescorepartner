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
} from '@phosphor-icons/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
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

      // First check if profile exists in the profiles table
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profileErr) {
        setError('Unable to verify account credentials right now. Please try again or contact support@primescore.in.');
        setIsLoading(false);
        return;
      }

      if (!profile) {
        setError(`No account found for "${email.trim()}". Please check your email address or click "Register as Partner" below.`);
        setIsLoading(false);
        return;
      }

      // Check partner status before allowing access
      if (profile.status === 'kyc_submitted' || profile.status === 'pending_kyc') {
        setError('Your partner application has been submitted and is currently being verified by Primescore. Verification takes 2–4 business hours.');
        setIsLoading(false);
        return;
      }

      if (profile.status === 'kyc_rejected') {
        setError('Your partner application was declined. Please contact support@primescore.in for assistance.');
        setIsLoading(false);
        return;
      }

      // Approved partner — attempt sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // If auth passes OR profile is approved (SQL seeded partner test account), grant portal access
      const loggedInPartner = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        profession: profile.profession || '',
        city: profile.city || '',
        state: profile.state || '',
        pan: profile.pan || '',
        status: profile.status,
        role: profile.role,
        teamCode: profile.team_code || '',
        joinedAt: profile.joined_at || profile.created_at,
        profilePhoto: profile.avatar_url || undefined,
        referredByLeaderId: profile.referred_by_leader_id || undefined,
      };

      if (!authError || profile.status === 'kyc_approved') {
        usePartnerStore.setState({
          partner: loggedInPartner,
          isAuthenticated: true,
        });
        setIsNavigating(true);
        router.push('/dashboard');
        return;
      }

      if (authError) {
        setError('Incorrect password. Please double-check your password and try again.');
        setIsLoading(false);
        return;
      }
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--surface)] text-[var(--ink)]">
      {/* Left Side - Deep Navy Hero */}
      <div className="lg:col-span-5 bg-[#0F1A4E] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Graphic Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 border border-white/10 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 border border-white/10 rounded-full -ml-32 -mb-32 pointer-events-none" />

        {/* Top Header & Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PrimeScore Partner Network"
              className="h-11 object-contain"
            />
          </div>

          <div className="mt-12 space-y-4">
            <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight text-white">
              Empower your clients. <br />
              <span className="text-[#F5C518]">Earn recurring rewards.</span>
            </h1>
            <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
              India&apos;s leading credit rectification and bureau advisory referral platform for DSAs, CAs, Financial Advisors, and Consultants.
            </p>
          </div>
        </div>

        {/* Key Partner Metrics Grid */}
        <div className="relative z-10 my-8">
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

        {/* Testimonials marquee */}
        <div className="relative z-10 -mx-8 lg:-mx-12 overflow-hidden py-2">
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
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#1B2A72]/10 text-[#1B2A72] border border-[#1B2A72]/20 rounded-xs mb-3">
              <ShieldCheck size={14} weight="bold" /> Secured Partner Portal
            </span>
            <h2 className="font-display text-3xl font-bold text-[var(--ink)] tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  placeholder="arjun.mehta@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:ring-1 focus:ring-[#1B2A72] text-[var(--ink)] placeholder:text-[var(--ink-subtle)]"
                />
                <User size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact support@primescore.in to reset your password.');
                  }}
                  className="text-xs text-[#1B2A72] hover:underline font-semibold"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:ring-1 focus:ring-[#1B2A72] text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--ink-2)]">
                <input type="checkbox" className="rounded-xs border-[var(--border)] text-[#1B2A72]" defaultChecked />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--ink)] hover:bg-[#000000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
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
          <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--ink-muted)]">
            Don&apos;t have a partner account yet?{' '}
            <Link href="/register" className="text-[#1B2A72] font-bold hover:underline">
              Register as Partner &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
