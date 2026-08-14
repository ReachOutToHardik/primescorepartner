'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { usePartnerStore } from '@/lib/store';
import { MOCK_PARTNER, MOCK_REFERRALS, MOCK_REDEMPTIONS } from '@/lib/mock-data';

import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const partner = usePartnerStore((state) => state.partner);
  const referrals = usePartnerStore((state) => state.referrals);
  const isAuthenticated = usePartnerStore((state) => state.isAuthenticated);

  // Handle Zustand store hydration and auto-seeding
  useEffect(() => {
    // Wait for store rehydration
    const state = usePartnerStore.getState();

    // Auto-seed mock partner and mock data if state is empty
    if (!state.partner) {
      const initialTotalPoints = MOCK_REFERRALS.reduce(
        (sum, ref) => sum + (ref.status === 'completed' ? 500 : 0),
        0
      );

      usePartnerStore.setState({
        partner: MOCK_PARTNER,
        referrals: MOCK_REFERRALS,
        redemptions: MOCK_REDEMPTIONS,
        totalPoints: initialTotalPoints > 0 ? initialTotalPoints : 1000,
        isAuthenticated: true,
      });
    }

    setIsHydrated(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Loading skeleton while store hydrator completes
  if (!isHydrated) {
    return <LoadingSpinner message="Loading Primescore Portal..." />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--surface)] font-body text-[var(--ink)] antialiased">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar Component */}
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Page Children Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <div className="w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
