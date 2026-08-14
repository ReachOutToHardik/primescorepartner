'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquaresFour,
  UserPlus,
  ClipboardText,
  Coins,
  Gift,
  ShieldCheck,
  CaretLeft,
  CaretRight,
  X,
  Sparkle,
  SignOut,
  CheckCircle,
  Hourglass,
  WarningCircle,
} from '@phosphor-icons/react';
import { usePartnerStore } from '@/lib/store';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: SquaresFour,
  },
  {
    name: 'Refer Customer',
    href: '/refer',
    icon: UserPlus,
  },
  {
    name: 'My Referrals',
    href: '/referrals',
    icon: ClipboardText,
  },
  {
    name: 'PrimePoints Rewards',
    href: '/rewards',
    icon: Coins,
  },
  {
    name: 'Redeem Gifts',
    href: '/redeem',
    icon: Gift,
  },
  {
    name: 'KYC Status',
    href: '/kyc',
    icon: ShieldCheck,
  },
];

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const partner = usePartnerStore((state) => state.partner);
  const totalPoints = usePartnerStore((state) => state.totalPoints);
  const logout = usePartnerStore((state) => state.logout);

  const kycStatus = partner?.status || 'pending_kyc';
  const statusColors = getStatusColor(kycStatus);
  const statusLabel = getStatusLabel(kycStatus);

  const getKycIcon = () => {
    switch (kycStatus) {
      case 'kyc_approved':
        return <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-400" />;
      case 'kyc_submitted':
        return <Hourglass weight="fill" className="w-3.5 h-3.5 text-amber-400" />;
      case 'kyc_rejected':
        return <WarningCircle weight="fill" className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Hourglass weight="fill" className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F1A4E] text-white select-none transition-all duration-200 relative border-r border-white/10">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-[68px]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden py-1">
          {isCollapsed ? (
            <img
              src="/logo.png"
              alt="PrimeScore Logo"
              className="w-9 h-9 object-contain shrink-0"
            />
          ) : (
            <img
              src="/logo.png"
              alt="PrimeScore Partner Network"
              className="h-9 object-contain max-w-[170px]"
            />
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <CaretRight className="w-4 h-4" /> : <CaretLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* CTA Button Header Section - Modern Red Button */}
      <div className="p-3">
        <Link
          href="/refer"
          onClick={onClose}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#E63329] hover:bg-[#C9251C] text-white font-display font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:shadow-md ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Refer Customer"
        >
          <UserPlus weight="bold" className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Refer Customer</span>}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-3 pt-2 pb-1 font-mono-num">
          {!isCollapsed ? 'Navigation' : '•••'}
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#1B2A72] text-white font-bold border border-white/10 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E63329] shrink-0" />
              )}
              <Icon
                weight={isActive ? 'fill' : 'bold'}
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />

              {!isCollapsed && (
                <span className="text-xs truncate tracking-wide">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Partner Status & Footer Card */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#091136]">
        {!isCollapsed ? (
          <Link
            href="/kyc"
            onClick={onClose}
            className="block p-3 rounded-xl bg-[#121E5C] hover:bg-[#1A2870] border border-white/10 space-y-2.5 shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Partner KYC</span>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F1A4E] border border-white/10 text-[10px] font-semibold text-slate-200">
                {getKycIcon()}
                <span className="capitalize">{statusLabel}</span>
              </div>
            </div>

            {partner && (
              <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
                <Avatar name={partner.name} size="sm" status="kyc_approved" />
                <div className="overflow-hidden leading-tight flex-1">
                  <div className="text-xs font-bold text-white truncate font-display group-hover:text-indigo-200 transition-colors flex items-center justify-between">
                    <span>{partner.name}</span>
                    <CaretRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-300 truncate font-mono-num">{partner.profession || 'Partner'}</div>
                </div>
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/kyc"
            onClick={onClose}
            className="flex justify-center"
            title={`View Profile (${statusLabel})`}
          >
            <div className="w-8 h-8 rounded-full bg-[#121E5C] hover:bg-[#1A2870] flex items-center justify-center border border-white/10 shadow-sm transition-colors">
              {getKycIcon()}
            </div>
          </Link>
        )}

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs text-slate-400 hover:text-[#E63329] hover:bg-white/10 transition-colors ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Log Out"
        >
          <SignOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="font-semibold uppercase tracking-wider text-[11px]">Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={onClose}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
