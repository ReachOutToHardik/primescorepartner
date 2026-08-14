'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  List,
  MagnifyingGlass,
  Bell,
  UserPlus,
  CaretDown,
  User,
  ShieldCheck,
  Coins,
  SignOut,
  CheckCircle,
  Clock,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import { usePartnerStore } from '@/lib/store';
import { getTierInfo } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

interface TopbarProps {
  onMenuClick?: () => void;
}

const getPageMetaData = (pathname: string) => {
  if (pathname === '/dashboard') {
    return { title: 'Dashboard', subtitle: 'Overview & key referral metrics' };
  }
  if (pathname === '/refer') {
    return { title: 'Refer Customer', subtitle: 'Submit a client for credit rectification or reports' };
  }
  if (pathname === '/referrals') {
    return { title: 'My Referrals', subtitle: 'Track client statuses, notes & earned points' };
  }
  if (pathname === '/rewards') {
    return { title: 'PrimePoints Rewards', subtitle: 'View points history & tier benefits' };
  }
  if (pathname === '/redeem') {
    return { title: 'Redeem Gifts', subtitle: 'Exchange PrimePoints for gift cards & rewards' };
  }
  if (pathname === '/kyc') {
    return { title: 'KYC Verification', subtitle: 'Partner verification & identity status' };
  }
  return { title: 'Partner Portal', subtitle: 'Welcome to PrimeScore Partner Network' };
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const partner = usePartnerStore((state) => state.partner);
  const totalPoints = usePartnerStore((state) => state.totalPoints);
  const logout = usePartnerStore((state) => state.logout);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(2);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { title, subtitle } = getPageMetaData(pathname);
  const tierInfo = getTierInfo(totalPoints);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/my-referrals?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sampleNotifications = [
    {
      id: 1,
      title: 'Referral Completed!',
      desc: 'Rajesh Kumar (REF-2024-001) completed successfully.',
      points: '+500 pts',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'KYC Verified',
      desc: 'Your partner KYC documents have been approved.',
      time: '1 day ago',
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-[72px] bg-white border-b border-[var(--border)] px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <List className="w-6 h-6" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold font-display text-[var(--ink)] leading-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-[var(--ink-muted)] leading-tight">{subtitle}</p>
        </div>
      </div>

      {/* Center: Global Search Input */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearch} className="w-full relative">
          <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search referrals by customer name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[var(--ink)] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* PrimePoints Coin Balance Widget */}
        <Link
          href="/rewards"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#FEF9E7] border border-[#F5C518]/60 hover:bg-[#FDF3CE] transition-colors text-xs text-[#0F1A4E] font-bold"
          title="View PrimePoints Rewards"
        >
          <Coins size={18} weight="fill" className="text-[#F5C518] shrink-0" />
          <span className="font-mono-num text-xs tracking-tight">{totalPoints.toLocaleString('en-IN')} Pts</span>
        </Link>

        {/* Quick Referral Button */}
        <Link
          href="/refer"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xs bg-[#1B2A72] hover:bg-[#0F1A4E] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <UserPlus weight="bold" className="w-4 h-4" />
          <span>New Referral</span>
        </Link>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-90 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-up">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm font-display text-slate-900">Notifications</span>
                {unreadNotifs > 0 && (
                  <button
                    onClick={() => setUnreadNotifs(0)}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {n.type === 'success' ? (
                        <CheckCircle weight="fill" className="w-4 h-4" />
                      ) : (
                        <Sparkle weight="fill" className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                        {n.points && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {n.points}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  href="/rewards"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-block py-1"
                >
                  View PrimePoints Activity →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-[1px] bg-slate-200 mx-1" />

        {/* Partner Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-2xs"
          >
            <Avatar name={partner?.name || 'Arjun Mehta'} size="sm" status="kyc_approved" />

            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                {partner?.name || 'Arjun Mehta'}
              </span>
              <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 font-mono-num">
                <Sparkle weight="fill" className="w-2.5 h-2.5 text-amber-500" />
                {tierInfo.tier} Partner
              </span>
            </div>

            <CaretDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-up">
              {/* Header inside dropdown */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{partner?.name || 'Arjun Mehta'}</p>
                <p className="text-xs text-slate-500 truncate">{partner?.email || 'arjun.mehta@example.com'}</p>
                <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-xs">
                  <span className="text-amber-800 font-semibold">Tier: {tierInfo.tier}</span>
                  <span className="font-mono-num font-bold text-amber-900">
                    {totalPoints.toLocaleString('en-IN')} Pts
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  href="/kyc"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>KYC & Profile Details</span>
                </Link>

                <Link
                  href="/rewards"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>PrimePoints & Rewards</span>
                </Link>
              </div>

              {/* Footer logout */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <SignOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
