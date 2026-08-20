'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { Modal } from '@/components/ui/Modal';

interface TopbarProps {
  onMenuClick?: () => void;
}

const getPageMetaData = (pathname: string) => {
  if (pathname === '/dashboard') {
    return { title: 'Dashboard', subtitle: 'Overview & key referral metrics' };
  }
  if (pathname === '/refer') {
    return { title: 'Refer Client', subtitle: 'Submit a client for credit rectification or reports' };
  }
  if (pathname === '/referrals') {
    return { title: 'My Referrals', subtitle: 'Track client statuses, notes & earned points' };
  }
  if (pathname === '/rewards') {
    return { title: 'Rewards Center', subtitle: 'View points history & tier benefits' };
  }
  if (pathname === '/redeem') {
    return { title: 'Redeem Vouchers', subtitle: 'Exchange PrimePoints for gift cards & rewards' };
  }
  if (pathname === '/kyc') {
    return { title: 'KYC Verification', subtitle: 'Partner verification & identity status' };
  }
  return { title: 'Partner Portal', subtitle: 'Welcome to Primescore Partner' };
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
  const [unreadNotifs, setUnreadNotifs] = useState(1);

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
      router.push(`/referrals?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const [realNotifications, setRealNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    type: string;
    points_badge?: string;
    created_at: string;
    is_read?: boolean;
  }[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        let query = supabase.from('notifications').select('*');
        if (partner?.id) {
          query = query.or(`partner_id.eq.${partner.id},partner_id.is.null`);
        } else {
          query = query.is('partner_id', null);
        }
        const { data } = await query.order('created_at', { ascending: false }).limit(100);
        if (data && data.length > 0) {
          setRealNotifications(data);
          const unreadCount = data.filter((n: any) => n.is_read === false).length;
          setUnreadNotifs(unreadCount > 0 ? unreadCount : 0);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [partner?.id]);

  const displayNotifications = useMemo(() => {
    if (realNotifications.length > 0) {
      return realNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        points: n.points_badge || undefined,
        time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateStr: new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: n.type,
        isRead: n.is_read,
      }));
    }

    return partner?.status === 'kyc_approved'
      ? [
          {
            id: 'welcome-approved',
            title: 'Partner KYC Application Verified!',
            desc: 'Your account has been approved. Direct client sign-up links & referral submission features are unlocked.',
            points: '+100 Pts',
            time: 'Just now',
            dateStr: 'Today',
            type: 'success',
            isRead: true,
          },
        ]
      : [
          {
            id: 'kyc-under-review',
            title: 'Partner Account Verification Pending',
            desc: 'Your partner application is under review by Operations HQ. Features unlock automatically upon approval.',
            points: 'Reviewing',
            time: 'Just now',
            dateStr: 'Today',
            type: 'info',
            isRead: true,
          },
        ];
  }, [realNotifications, partner?.status]);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar"
          >
            <List className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold font-display text-[var(--navy-deep)] truncate tracking-tight">
              {title}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
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
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* PrimePoints Coin Balance Widget */}
          <Link
            href="/rewards"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#FEF9E7] border border-[#F5C518]/60 hover:bg-[#FDF3CE] transition-all text-xs text-[#0F1A4E] font-bold shadow-2xs shrink-0"
            title="View PrimePoints Rewards"
          >
            <Coins size={16} weight="fill" className="text-[#F5C518] shrink-0" />
            <span className="font-mono-num text-[11px] sm:text-xs tracking-tight whitespace-nowrap">{totalPoints.toLocaleString('en-IN')} Pts</span>
          </Link>

          {/* Quick Referral Button */}
          <Link
            href="/refer"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B2A72] hover:bg-[#0F1A4E] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all"
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
                  {displayNotifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          n.type === 'reward' ? 'bg-amber-100 text-amber-600' :
                          n.type === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {n.type === 'success' ? (
                          <CheckCircle weight="fill" className="w-4 h-4" />
                        ) : n.type === 'reward' ? (
                          <Coins weight="fill" className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Sparkle weight="fill" className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                          {n.points && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
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
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      setHistoryModalOpen(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-block py-1 cursor-pointer"
                  >
                    View Notification History →
                  </button>
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
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Full Notification History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Notification History"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-500">
              Total Notifications: <strong className="text-slate-900 font-mono-num">{displayNotifications.length}</strong>
            </span>
            <button
              onClick={() => setUnreadNotifs(0)}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
            {displayNotifications.map((n) => (
              <div key={n.id} className="pt-3 pb-3 first:pt-0 hover:bg-slate-50/60 p-3 rounded-xl transition-colors space-y-1.5 border border-slate-100/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      n.type === 'success' ? 'bg-emerald-500' :
                      n.type === 'reward' ? 'bg-amber-500' :
                      n.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h4>
                  </div>
                  {n.points && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {n.points}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-4">{n.desc}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pl-4 font-mono-num pt-1">
                  <span>{n.dateStr}</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="px-4 py-2 bg-[#1B2A72] text-white text-xs font-bold rounded-xl hover:bg-[#0F1A4E] transition-all cursor-pointer"
            >
              Close History
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
