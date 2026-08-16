'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { usePartnerStore } from '@/lib/store';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSupabaseSync } from '@/lib/useSupabaseSync';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  useSupabaseSync();
  const pathname = usePathname();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const partner = usePartnerStore((state) => state.partner);
  const isAuthenticated = usePartnerStore((state) => state.isAuthenticated);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isHydrated && !isAuthenticated && !partner) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, partner, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (!isHydrated) {
    return <LoadingSpinner message="Loading Primescore Portal..." />;
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated && !partner) {
    return <LoadingSpinner message="Redirecting to login..." />;
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
