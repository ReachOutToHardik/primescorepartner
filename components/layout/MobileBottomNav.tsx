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
} from '@phosphor-icons/react';

export const mobileNavItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: SquaresFour,
  },
  {
    name: 'Refer',
    href: '/refer',
    icon: UserPlus,
  },
  {
    name: 'Referrals',
    href: '/referrals',
    icon: ClipboardText,
  },
  {
    name: 'Rewards',
    href: '/rewards',
    icon: Coins,
  },
  {
    name: 'Redeem',
    href: '/redeem',
    icon: Gift,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F1A4E] border-t border-white/10 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xs transition-colors min-w-[56px] ${
              isActive
                ? 'text-white bg-[#1B2A72] border-t-2 border-[#E63329]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Icon
              weight={isActive ? 'fill' : 'bold'}
              className={`w-5 h-5 mb-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`}
            />
            <span className="text-[10px] font-semibold tracking-tight leading-none">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
