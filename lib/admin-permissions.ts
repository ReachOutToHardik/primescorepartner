import { AdminStaffUser, ALL_ADMIN_PAGES } from './admin-store';

export const SUPER_ADMIN_EMAILS = [
  'admin@primescore.in',
  'sawai@primescore.in',
  'hardik@primescore.in',
];

export function getAuthorizedPagesForUser(
  adminEmail: string | null,
  staffList: AdminStaffUser[]
): string[] {
  if (!adminEmail) return [];
  const cleanEmail = adminEmail.toLowerCase().trim();

  // Super Admin emails always have 100% full access to all pages
  if (SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    return ALL_ADMIN_PAGES;
  }

  const staffUser = staffList.find((s) => s.email.toLowerCase() === cleanEmail);
  if (staffUser) {
    // Deactivated staff accounts have zero access
    if (staffUser.isActive === false) {
      return [];
    }

    if (staffUser.role === 'super_admin') {
      return ALL_ADMIN_PAGES;
    }

    return staffUser.allowedPages || [];
  }

  // Fallback for internal primescore master logins
  if (cleanEmail.endsWith('@primescore.in')) {
    return ALL_ADMIN_PAGES;
  }

  return [];
}

export function isPathAuthorized(
  pathname: string,
  adminEmail: string | null,
  staffList: AdminStaffUser[]
): boolean {
  const allowed = getAuthorizedPagesForUser(adminEmail, staffList);

  // Super Admins have universal bypass
  if (allowed.length === ALL_ADMIN_PAGES.length && ALL_ADMIN_PAGES.every((p) => allowed.includes(p))) {
    return true;
  }

  let pageKey = '';
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/dashboard') {
    pageKey = 'dashboard';
  } else if (pathname.startsWith('/admin/kyc')) {
    pageKey = 'kyc';
  } else if (pathname.startsWith('/admin/referrals')) {
    pageKey = 'referrals';
  } else if (pathname.startsWith('/admin/teams')) {
    pageKey = 'teams';
  } else if (pathname.startsWith('/admin/analytics')) {
    pageKey = 'analytics';
  } else if (pathname.startsWith('/admin/gift-cards')) {
    pageKey = 'gift-cards';
  } else if (pathname.startsWith('/admin/services')) {
    pageKey = 'services';
  } else if (pathname.startsWith('/admin/rewards-config')) {
    pageKey = 'rewards-config';
  } else if (pathname.startsWith('/admin/notifications')) {
    pageKey = 'notifications';
  } else if (pathname.startsWith('/admin/broadcasts')) {
    pageKey = 'broadcasts';
  } else if (pathname.startsWith('/admin/staff')) {
    pageKey = 'staff';
  } else if (pathname.startsWith('/admin/audit-logs')) {
    pageKey = 'audit-logs';
  } else if (pathname.startsWith('/admin/settings')) {
    pageKey = 'settings';
  }

  if (!pageKey) {
    return false;
  }

  return allowed.includes(pageKey);
}
