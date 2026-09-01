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
  LockKey,
  UserGear,
  ListChecks,
  PaperPlaneRight
} from '@phosphor-icons/react';

interface AdminNavItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  badgeKey?: 'staff' | 'logs' | 'broadcasts';
}

interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', name: 'HQ Overview', href: '/admin', icon: SquaresFour },
      { id: 'kyc', name: 'Partner Verifications (KYC)', href: '/admin/kyc', icon: ShieldCheck },
      { id: 'referrals', name: 'Referral Cases & Leads', href: '/admin/referrals', icon: ClipboardText },
      { id: 'teams', name: 'Team Leaders & DSAs', href: '/admin/teams', icon: UsersThree },
    ],
  },
  {
    title: 'Reports',
    items: [
      { id: 'analytics', name: 'Payouts & Reports', href: '/admin/analytics', icon: ChartLine },
      { id: 'gift-cards', name: 'Gift Voucher Claims', href: '/admin/gift-cards', icon: Gift },
    ],
  },
  {
    title: 'Settings & Governance',
    items: [
      { id: 'services', name: 'Services Catalog', href: '/admin/services', icon: Wrench },
      { id: 'rewards-config', name: 'Points & Reward Rates', href: '/admin/rewards-config', icon: Coins },
      { id: 'notifications', name: 'Send Messages', href: '/admin/notifications', icon: PaperPlaneRight },
      { id: 'broadcasts', name: 'Broadcast Announcements', href: '/admin/broadcasts', icon: Megaphone, badgeKey: 'broadcasts' },
      { id: 'staff', name: 'Admin Staff Roles', href: '/admin/staff', icon: UserGear, badgeKey: 'staff' },
      { id: 'audit-logs', name: 'System Audit Logs', href: '/admin/audit-logs', icon: ListChecks, badgeKey: 'logs' },
      { id: 'settings', name: 'Platform Settings', href: '/admin/settings', icon: Gear },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminEmail, staff, auditLogs, broadcasts, adminLogout } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allowedPages = getAuthorizedPagesForUser(adminEmail, staff);

  // Find currently logged-in admin user / staff profile
  const currentStaff = staff.find(
    (s) => s.email.toLowerCase() === (adminEmail || 'sawai@primescore.in').toLowerCase()
  );

  const getBadgeValue = (key?: 'staff' | 'logs' | 'broadcasts') => {
    if (key === 'staff') return staff.length || 4;
    if (key === 'logs') return auditLogs.length || 12;
    if (key === 'broadcasts') return broadcasts.length || 1;
    return null;
  };

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
        <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-[64px]">
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

        {/* Categorized Navigation Sections (Slim w-64, no scrollbar) */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 space-y-2.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => allowedPages.includes(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {/* Clean Plain Text Category Header */}
                {!isCollapsed ? (
                  <div className="pt-2 pb-0.5 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-px bg-white/10 my-1.5 mx-2" />
                )}

                {/* Section Items */}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    const badge = getBadgeValue(item.badgeKey);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isActive
                            ? 'bg-[#1B2A72] text-white font-bold shadow-xs'
                            : 'text-slate-200 hover:text-white hover:bg-white/10 font-medium'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E63329] shrink-0" />
                          )}
                          <Icon
                            weight={isActive ? 'fill' : 'bold'}
                            className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`}
                          />
                          {!isCollapsed && (
                            <span className="text-xs font-semibold tracking-wide truncate">{item.name}</span>
                          )}
                        </div>

                        {!isCollapsed && badge !== null && (
                          <span
                            className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Admin User Identity & Action Panel */}
        <div className="p-3 border-t border-white/10 bg-[#091136] space-y-2.5 shrink-0">
          {!isCollapsed ? (
            <>
              <div className="p-3 rounded-2xl bg-[#121E5C] border border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                    {currentStaff?.role ? currentStaff.role.replace('_', ' ') : 'SUPER ADMIN'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#00E599] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00E599]" /> Active
                  </span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#182760] border border-white/20 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase font-display">
                    {(currentStaff?.name || 'Hardik')[0]}
                  </div>
                  <div className="overflow-hidden leading-tight flex-1">
                    <div className="text-sm font-bold text-white truncate font-display">
                      {currentStaff?.name || 'Hardik'}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate font-mono">
                      {adminEmail && adminEmail !== 'admin@primescore.in' ? adminEmail : 'hardik@primescore.in'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <SignOut size={16} weight="bold" />
                <span className="font-bold uppercase tracking-wider text-[11px]">LOG OUT</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-9 h-9 rounded-full bg-[#121E5C] border border-white/10 flex items-center justify-center font-bold text-sm text-white uppercase"
                title={currentStaff?.name || adminEmail || 'Admin'}
              >
                {(currentStaff?.name || adminEmail || 'H')[0]}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <SignOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
