'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import { getAuthorizedPagesForUser } from '@/lib/admin-permissions';
import {
  SquaresFour,
  ShieldCheck,
  ClipboardText,
  UsersThree,
  Gift,
  Wrench,
  ChartLine,
  Gear,
  SignOut,
  List,
  X,
  CaretLeft,
  CaretRight,
  User,
  CheckCircle,
  Coins,
  ArrowSquareOut,
  Megaphone,
  LockKey
} from '@phosphor-icons/react';

const ADMIN_NAV = [
  { id: 'dashboard', name: 'HQ Overview', href: '/admin', icon: SquaresFour },
  { id: 'kyc', name: 'Partner Verifications (KYC)', href: '/admin/kyc', icon: ShieldCheck },
  { id: 'referrals', name: 'Referral Cases & Leads', href: '/admin/referrals', icon: ClipboardText },
  { id: 'teams', name: 'Team Leaders & DSAs', href: '/admin/teams', icon: UsersThree },
  { id: 'analytics', name: 'Payouts & Reports', href: '/admin/analytics', icon: ChartLine },
  { id: 'gift-cards', name: 'Gift Voucher Claims', href: '/admin/gift-cards', icon: Gift },
  { id: 'services', name: 'Services Catalog', href: '/admin/services', icon: Wrench },
  { id: 'rewards-config', name: 'Points & Reward Rates', href: '/admin/rewards-config', icon: Coins },
  { id: 'notifications', name: 'Send Announcements', href: '/admin/notifications', icon: Megaphone },
  { id: 'settings', name: 'Staff Accounts & Settings', href: '/admin/settings', icon: Gear },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminEmail, staff, adminLogout } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allowedPages = getAuthorizedPagesForUser(adminEmail, staff);

  // Find currently logged-in admin user / staff profile
  const currentStaff = staff.find(
    (s) => s.email.toLowerCase() === (adminEmail || 'sawai@primescore.in').toLowerCase()
  );

  const isSuperAdmin = !currentStaff || currentStaff.role === 'super_admin';

  // Filter sidebar navigation to ONLY show pages allowed for this staff user
  const navItems = ADMIN_NAV.filter((item) => allowedPages.includes(item.id));

  const handleLogout = () => {
    adminLogout();
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#0F1A4E] text-white shadow-md focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Persistent Desktop & Mobile Drawer Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0F1A4E] text-white select-none transition-all duration-300 ease-in-out border-r border-white/10 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0 w-72 max-w-[80vw]' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-[68px]">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden py-1">
            {isCollapsed ? (
              <img
                src="/logo-light.png"
                alt="Primescore Admin"
                className="w-9 h-9 object-contain shrink-0"
              />
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src="/logo-light.png"
                  alt="Primescore Admin"
                  className="h-8 object-contain max-w-[150px]"
                />
                <span className="text-[10px] bg-[#E63329] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          </button>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono-num">
          {!isCollapsed ? 'Main Menu' : '•••'}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#1B2A72] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E63329] shrink-0" />
                )}
                <Icon
                  weight={isActive ? 'fill' : 'bold'}
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                {!isCollapsed && (
                  <span className="text-xs truncate tracking-wide">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin User Identity & Action Panel */}
        <div className="p-3 border-t border-white/10 bg-[#091136] space-y-2">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-[#121E5C] border border-white/10 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  {currentStaff?.role ? currentStaff.role.replace('_', ' ') : 'Super Admin'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold text-xs font-display shrink-0 border border-white/20 uppercase">
                  {(currentStaff?.name || adminEmail || 'S')[0]}
                </div>
                <div className="overflow-hidden leading-tight flex-1">
                  <div className="text-xs font-bold text-white truncate font-display">
                    {currentStaff?.name || 'Sawai (CEO)'}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate font-mono-num">
                    {currentStaff?.email || adminEmail || 'sawai@primescore.in'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Logged in as Sawai (CEO)">
              <div className="w-8 h-8 rounded-full bg-[#121E5C] border border-white/10 flex items-center justify-center font-bold text-xs">
                S
              </div>
            </div>
          )}



          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs text-slate-400 hover:text-[#E63329] hover:bg-white/10 transition-colors ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Log Out"
          >
            <SignOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="font-semibold uppercase tracking-wider text-[11px]">Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
