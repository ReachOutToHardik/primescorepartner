'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminLoginPage from '@/components/admin/AdminLoginPage';
import { useAdminStore } from '@/lib/admin-store';
import { useSupabaseSync } from '@/lib/useSupabaseSync';
import { SignOut } from '@phosphor-icons/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useSupabaseSync();
  const { isAuthenticated, adminLogout, isLoadingData } = useAdminStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Enforce sessionStorage-only admin sessions.
    // If the admin session key is NOT found in sessionStorage, force logout.
    // This means closing the browser tab/window will require re-login.
    const sessionKey = 'primescore-admin-store-v7';
    const hasSession = typeof window !== 'undefined'
      && window.sessionStorage.getItem(sessionKey) !== null;

    if (!hasSession) {
      // Clear any stale localStorage admin session and force logout state
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('primescore-admin-store-v7');
        window.localStorage.removeItem('primescore-admin-store-v6');
      }
      useAdminStore.setState({ isAuthenticated: false });
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0F1A4E] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-white/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--surface)] font-body text-[var(--ink)] antialiased">
      <AdminSidebar />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 overflow-x-hidden">
        {/* Clean Header Bar */}
        <header className="h-16 bg-white border-b border-[var(--border)] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Primescore Logo" className="h-8 object-contain md:hidden" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-display font-bold text-sm text-[var(--navy-deep)] tracking-tight">
              Primescore Operations HQ
            </h2>
            {isLoadingData && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-[#1B2A72] text-[11px] font-bold rounded-full animate-pulse">
                <div className="w-3 h-3 border-2 border-[#1B2A72] border-t-transparent rounded-full animate-spin" />
                <span>Syncing DB...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold bg-[#1B2A72] text-white font-mono px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
              Super Admin Mode
            </span>
            <button
              onClick={() => {
                adminLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Sign out of Admin HQ"
            >
              <SignOut size={14} weight="bold" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <div className="w-full animate-fade-in">
            {(() => {
              const { pathname } = window ? { pathname: window.location.pathname } : { pathname: '' };
              const { adminEmail, staff } = useAdminStore.getState();
              const currentStaff = staff.find(
                (s) => s.email.toLowerCase() === (adminEmail || 'sawai@primescore.in').toLowerCase()
              );

              const isSuperAdmin = !currentStaff || currentStaff.role === 'super_admin';
              const allowedPages = currentStaff?.allowedPages || [
                'dashboard',
                'kyc',
                'referrals',
                'teams',
                'analytics',
                'gift-cards',
                'services',
                'rewards-config',
                'notifications',
                'settings',
              ];

              // Path to Page ID mapping
              let pageId = 'dashboard';
              if (pathname.includes('/admin/kyc')) pageId = 'kyc';
              else if (pathname.includes('/admin/referrals')) pageId = 'referrals';
              else if (pathname.includes('/admin/teams')) pageId = 'teams';
              else if (pathname.includes('/admin/analytics')) pageId = 'analytics';
              else if (pathname.includes('/admin/gift-cards')) pageId = 'gift-cards';
              else if (pathname.includes('/admin/services')) pageId = 'services';
              else if (pathname.includes('/admin/rewards-config')) pageId = 'rewards-config';
              else if (pathname.includes('/admin/notifications')) pageId = 'notifications';
              else if (pathname.includes('/admin/settings')) pageId = 'settings';

              const isAllowed = isSuperAdmin || allowedPages.includes(pageId);

              if (!isAllowed) {
                const firstAllowedPage = allowedPages[0] || 'dashboard';
                const firstAllowedHref = firstAllowedPage === 'dashboard' ? '/admin' : `/admin/${firstAllowedPage}`;

                return (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-red-200 rounded-2xl shadow-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 text-3xl">
                      🔒
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        403 Access Denied
                      </h2>
                      <p className="text-sm text-slate-600 font-body">
                        You do not have permission to view or manage the <strong className="text-slate-900 uppercase font-mono">{pageId}</strong> page.
                      </p>
                      <p className="text-xs text-slate-400 font-body pt-1">
                        Please contact your Super Admin if you need access to this section.
                      </p>
                    </div>
                    <a
                      href={firstAllowedHref}
                      className="px-5 py-2.5 bg-[#1B2A72] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0F1A4E] transition-all"
                    >
                      Return to My Allowed Work Pages &rarr;
                    </a>
                  </div>
                );
              }

              return children;
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
