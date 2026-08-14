'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePartnerStore } from '@/lib/store';
import {
  ShieldCheck,
  Lightning,
  CheckCircle,
  ArrowRight,
  User,
  LockKey,
  Quotes,
  TrendUp,
  Coins,
  Users,
} from '@phosphor-icons/react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { loginDemo } = usePartnerStore();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setError('Please enter your email/phone and password');
      return;
    }
    setIsNavigating(true);
    loginDemo();
    router.push('/dashboard');
  };

  const handleDemoSignIn = () => {
    setIsNavigating(true);
    loginDemo();
    router.push('/dashboard');
  };

  if (isNavigating) {
    return <LoadingSpinner message="Opening Primescore Partner Dashboard..." />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--surface)] text-[var(--ink)]">
      {/* Left Side - Deep Navy Hero */}
      <div className="lg:col-span-5 bg-[#0F1A4E] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Graphic Accents (Crisp/Sharp, No Glow) */}
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

          {/* Value Props Bullet Points */}
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

        {/* Partner Testimonials Infinite Edge-to-Edge Marquee */}
        <div className="relative z-10 -mx-8 lg:-mx-12 overflow-hidden py-2">
          <div className="flex gap-4 animate-marquee w-max px-4">
            {/* Review 1 - Sandip Sharma */}
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img
                src="/partner1.jpg"
                alt="Sandip Sharma"
                className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0"
              />
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

            {/* Review 2 - Sachin Verma */}
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img
                src="/partner2.jpg"
                alt="Sachin Verma"
                className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0"
              />
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

            {/* Duplicate Duplicate Set for Smooth Infinite Loop */}
            <div className="w-[310px] bg-[#1B2A72] border border-white/10 p-3.5 rounded-xs flex gap-3 shrink-0 items-center">
              <img
                src="/partner1.jpg"
                alt="Sandip Sharma"
                className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0"
              />
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
              <img
                src="/partner2.jpg"
                alt="Sachin Verma"
                className="w-14 h-14 rounded-xs object-cover border border-white/20 shrink-0"
              />
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

          {/* Quick Instant Demo Access Box */}
          <div className="bg-[#FEF9E7] border border-[#F5C518] p-4 rounded-xs shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1A1917]">
              <Lightning size={20} className="text-[#E63329]" weight="fill" />
              <h3 className="font-display font-bold text-sm">Instant Demo Access</h3>
            </div>
            <p className="text-xs text-[var(--ink-2)]">
              Click below to jump directly into the full partner dashboard with pre-loaded mock referrals, rewards, and KYC metrics.
            </p>
            <button
              onClick={handleDemoSignIn}
              className="w-full mt-2 py-2.5 px-4 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-sm rounded-xs transition-colors flex items-center justify-center gap-2 border border-transparent shadow-xs"
            >
              <span>Explore Portal as Partner (Demo)</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[var(--border)]"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-[var(--ink-subtle)]">
              Or sign in manually
            </span>
            <div className="flex-grow border-t border-[var(--border)]"></div>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-[#FDECEA] border border-[#E63329] text-[#E63329] rounded-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1.5">
                Email Address or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="arjun.mehta@example.com / 9876543210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
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
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Demo password is reset upon instant access!'); }} className="text-xs text-[#1B2A72] hover:underline font-semibold">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:ring-1 focus:ring-[#1B2A72] text-[var(--ink)]"
                />
                <LockKey size={18} className="absolute right-3 top-3 text-[var(--ink-subtle)]" />
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
              className="w-full py-3 bg-[var(--ink)] hover:bg-[#000000] text-white font-display font-semibold text-sm rounded-xs transition-colors shadow-xs"
            >
              Sign In to Account
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
